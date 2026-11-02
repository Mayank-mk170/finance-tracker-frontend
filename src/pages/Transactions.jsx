
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
} from "lucide-react";
import api from "../services/api";
import { getTransactions } from "../services/transactionService";

// Get today's date using local timezone
const getLocalDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const initialForm = {
  title: "",
  description: "",
  category: "",
  amount: "",
  type: "EXPENSE",
  date: getLocalDate(),
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  // Fetch all transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getTransactions();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch transactions error:", err);
      setError(
        err.response?.data?.message || "Unable to load transactions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Search and filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((transaction) => {
        const matchesType =
          filter === "ALL" || transaction.type === filter;

        const searchText = search.toLowerCase();

        const matchesSearch = [
          transaction.title,
          transaction.description,
          transaction.category,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(searchText)
          );

        return matchesType && matchesSearch;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.date) -
          new Date(a.createdAt || a.date)
      );
  }, [transactions, filter, search]);

  // Open add transaction modal
  const openAddModal = () => {
    setEditingId(null);
    setForm({
      ...initialForm,
      date: getLocalDate(),
    });
    setShowModal(true);
  };

  // Open edit transaction modal
  const openEditModal = (transaction) => {
    setEditingId(transaction.id);

    setForm({
      title: transaction.title || "",
      description: transaction.description || "",
      category: transaction.category || "",
      amount: transaction.amount ?? "",
      type: transaction.type || "EXPENSE",
      date: transaction.date || getLocalDate(),
    });

    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm({
      ...initialForm,
      date: getLocalDate(),
    });
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Add or update transaction
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        amount: Number(form.amount),
        type: form.type,
        date: form.date,
      };

      if (editingId) {
        await api.put(`/transactions/${editingId}`, payload);
      } else {
        await api.post("/transactions", payload);
      }

      closeModal();
      await fetchTransactions();
    } catch (err) {
      console.error("Save transaction error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to save transaction. Please check the details."
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete transaction
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) return;

    try {
      setError("");
      await api.delete(`/transactions/${id}`);
      await fetchTransactions();
    } catch (err) {
      console.error("Delete transaction error:", err);

      setError(
        err.response?.data?.message || "Unable to delete transaction."
      );
    }
  };

  // Calculate totals from filtered transactions
  const totalIncome = filteredTransactions
    .filter((item) => item.type === "INCOME")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const totalExpenses = filteredTransactions
    .filter((item) => item.type === "EXPENSE")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-6">
      <div className="mx-auto w-full max-w-7xl space-y-5 sm:space-y-6">

        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">
              Transactions
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage and track your income and expenses.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
          >
            <Plus size={19} />
            Add Transaction
          </button>
        </div>

        {/* Summary Cards */}
        <section className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-slate-500 sm:text-sm">Income</p>

              <div className="rounded-xl bg-green-100 p-2 text-green-600">
                <TrendingUp size={19} />
              </div>
            </div>

            <h2 className="mt-3 break-words text-lg font-bold text-green-600 sm:text-2xl">
              {formatCurrency(totalIncome)}
            </h2>
          </div>

          <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-slate-500 sm:text-sm">Expenses</p>

              <div className="rounded-xl bg-red-100 p-2 text-red-600">
                <TrendingDown size={19} />
              </div>
            </div>

            <h2 className="mt-3 break-words text-lg font-bold text-red-600 sm:text-2xl">
              {formatCurrency(totalExpenses)}
            </h2>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-4 sm:space-y-0 sm:p-4">
          <div className="relative w-full sm:max-w-sm">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 sm:flex">
            {["ALL", "INCOME", "EXPENSE"].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`rounded-lg px-2 py-2.5 text-xs font-medium transition sm:px-4 sm:text-sm ${
                  filter === type
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {type === "ALL"
                  ? "All"
                  : type === "INCOME"
                  ? "Income"
                  : "Expense"}
              </button>
            ))}
          </div>
        </section>

        {/* Error Message */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Transactions Section */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 p-4 sm:p-5">
            <ArrowUpDown size={18} className="text-blue-600" />

            <h2 className="text-sm font-semibold text-slate-800 sm:text-base">
              All Transactions
            </h2>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
              {filteredTransactions.length}
            </span>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Loading transactions...
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-8 text-center sm:p-10">
              <p className="font-medium text-slate-600">
                No transactions found.
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Add a transaction or change your search filter.
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Transaction Cards */}
              <div className="space-y-3 p-3 md:hidden">
                {filteredTransactions.map((transaction) => {
                  const isIncome = transaction.type === "INCOME";

                  return (
                    <div
                      key={transaction.id}
                      className="rounded-xl border border-slate-100 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                              isIncome
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {isIncome ? (
                              <TrendingUp size={20} />
                            ) : (
                              <TrendingDown size={20} />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="break-words text-sm font-semibold text-slate-800">
                              {transaction.title || "Untitled"}
                            </p>

                            <p className="mt-1 break-words text-xs text-slate-400">
                              {transaction.description || "No description"}
                            </p>

                            <p className="mt-2 text-xs text-slate-500">
                              {transaction.category || "-"} ·{" "}
                              {formatDate(transaction.date)}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <p
                            className={`text-sm font-bold ${
                              isIncome ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {isIncome ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </p>

                          <span
                            className={`mt-2 inline-block rounded-full px-2 py-1 text-[10px] font-medium ${
                              isIncome
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {isIncome ? "INCOME" : "EXPENSE"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-2">
                        <button
                          onClick={() => openEditModal(transaction)}
                          title="Edit transaction"
                          className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(transaction.id)}
                          title="Delete transaction"
                          className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Transactions Table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[750px] text-left">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">
                        Transaction
                      </th>
                      <th className="px-6 py-4 font-semibold">
                        Category
                      </th>
                      <th className="px-6 py-4 font-semibold">
                        Date
                      </th>
                      <th className="px-6 py-4 font-semibold">
                        Type
                      </th>
                      <th className="px-6 py-4 text-right font-semibold">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-center font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredTransactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-800">
                            {transaction.title}
                          </p>

                          <p className="mt-1 max-w-xs truncate text-xs text-slate-400">
                            {transaction.description || "No description"}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {transaction.category}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500">
                          {formatDate(transaction.date)}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              transaction.type === "INCOME"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {transaction.type}
                          </span>
                        </td>

                        <td
                          className={`px-6 py-4 text-right font-semibold ${
                            transaction.type === "INCOME"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type === "INCOME" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => openEditModal(transaction)}
                              title="Edit transaction"
                              className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                            >
                              <Pencil size={17} />
                            </button>

                            <button
                              onClick={() => handleDelete(transaction.id)}
                              title="Delete transaction"
                              className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 p-3 sm:items-center sm:p-5">
          <div className="my-auto w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {editingId ? "Edit Transaction" : "Add Transaction"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Enter your transaction details below.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:p-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Transaction Type
                </label>

                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Title
                </label>

                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Monthly Salary"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Add a note (optional)"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Amount (₹)
                  </label>

                  <input
                    name="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.amount}
                    onChange={handleChange}
                    required
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Category
                  </label>

                  <input
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Food"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Date
                </label>

                <input
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Transaction"
                    : "Save Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
