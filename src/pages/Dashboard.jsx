
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  getTransactionSummary,
  getMonthlyTrends,
  getCategorySummary,
  getTransactions,
} from "../services/transactionService";

const summaryCardConfig = [
  {
    title: "Total Balance",
    key: "balance",
    subtitle: "Your available balance",
    icon: Wallet,
    color: "bg-indigo-500",
  },
  {
    title: "Total Income",
    key: "totalIncome",
    subtitle: "Your total earnings",
    icon: TrendingUp,
    color: "bg-emerald-500",
  },
  {
    title: "Total Expenses",
    key: "totalExpenses",
    subtitle: "Your total spending",
    icon: TrendingDown,
    color: "bg-rose-500",
  },
  {
    title: "Net Savings",
    key: "netSavings",
    subtitle: "Income minus expenses",
    icon: PiggyBank,
    color: "bg-blue-500",
  },
];

const categoryColors = [
  "#4f46e5",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#06b6d4",
  "#8b5cf6",
  "#f97316",
  "#64748b",
];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
};

const formatMonth = (month) => {
  if (!month) return "-";

  const [year, monthNumber] = month.split("-").map(Number);

  return new Date(year, monthNumber - 1, 1).toLocaleDateString(
    "en-IN",
    {
      month: "short",
      year: "2-digit",
    }
  );
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
  });

  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [trendLoading, setTrendLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);

  const [error, setError] = useState("");
  const [trendError, setTrendError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [transactionsError, setTransactionsError] = useState("");

  // Fetch financial summary
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await getTransactionSummary();

        setSummary({
          totalIncome: Number(data.totalIncome ?? 0),
          totalExpenses: Number(data.totalExpenses ?? 0),
          balance: Number(data.balance ?? 0),
        });
      } catch (err) {
        console.error("Summary error:", err);
        setError("Unable to load financial summary.");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  // Fetch monthly trends
  useEffect(() => {
    const fetchMonthlyTrends = async () => {
      try {
        const data = await getMonthlyTrends(6);

        if (!Array.isArray(data)) {
          throw new Error("Invalid monthly trends response.");
        }

        setMonthlyTrends(
          data.map((item) => ({
            month: formatMonth(item.month),
            income: Number(item.totalIncome ?? 0),
            expenses: Number(item.totalExpenses ?? 0),
          }))
        );
      } catch (err) {
        console.error("Monthly trends error:", err);
        setTrendError("Unable to load monthly trends.");
      } finally {
        setTrendLoading(false);
      }
    };

    fetchMonthlyTrends();
  }, []);

  // Fetch category summary
  useEffect(() => {
    const fetchCategorySummary = async () => {
      try {
        const data = await getCategorySummary();

        if (!Array.isArray(data)) {
          throw new Error("Invalid category summary response.");
        }

        setCategoryData(
          data
            .map((item) => ({
              category: item.category,
              amount: Number(item.totalAmount ?? 0),
            }))
            .filter((item) => item.amount > 0)
        );
      } catch (err) {
        console.error("Category summary error:", err);
        setCategoryError("Unable to load category summary.");
      } finally {
        setCategoryLoading(false);
      }
    };

    fetchCategorySummary();
  }, []);

  // Fetch recent transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await getTransactions();

        if (!Array.isArray(data)) {
          throw new Error("Invalid transactions response.");
        }

        const sortedTransactions = [...data].sort((a, b) => {
          return (
            new Date(b.createdAt || b.date).getTime() -
            new Date(a.createdAt || a.date).getTime()
          );
        });

        setTransactions(sortedTransactions.slice(0, 5));
      } catch (err) {
        console.error("Transactions error:", err);
        setTransactionsError("Unable to load recent transactions.");
      } finally {
        setTransactionsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const netSavings = summary.totalIncome - summary.totalExpenses;

  const categoryTotal = categoryData.reduce(
    (total, item) => total + item.amount,
    0
  );

  const summaryCards = summaryCardConfig.map((card) => ({
    ...card,
    amount: formatCurrency(
      card.key === "netSavings" ? netSavings : summary[card.key]
    ),
  }));

  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-6">

      {/* Page Heading */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">
            Welcome to your Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track your income, expenses and savings.
          </p>
        </div>

        <span className="w-fit rounded-lg bg-white px-4 py-2 text-xs text-slate-500 shadow-sm sm:text-sm">
          Financial Overview
        </span>
      </div>

      {/* Summary Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <section className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 2xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">
                    {card.title}
                  </p>

                  <h2 className="mt-2 break-words text-xl font-bold text-slate-800 sm:mt-3 sm:text-2xl">
                    {loading ? "Loading..." : card.amount}
                  </h2>
                </div>

                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white sm:h-11 sm:w-11 ${card.color}`}
                >
                  <Icon size={21} />
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-400 sm:mt-4">
                {card.subtitle}
              </p>
            </div>
          );
        })}
      </section>

      {/* Charts Section */}
      <section className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-3 xl:gap-5">

        {/* Monthly Trend */}
        <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-2 sm:mb-5">
            <div className="min-w-0">
              <h3 className="font-bold text-slate-800">
                Monthly Trend
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Income and expenses over the last 6 months
              </p>
            </div>

            <MoreHorizontal
              size={20}
              className="shrink-0 text-slate-400"
            />
          </div>

          {trendError && (
            <p className="mb-3 text-sm text-red-500">{trendError}</p>
          )}

          <div className="h-[240px] w-full min-w-0 sm:h-[280px]">
            {trendLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                Loading monthly trends...
              </div>
            ) : monthlyTrends.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No monthly trend data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyTrends}
                  margin={{ top: 10, right: 8, left: -15, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="incomeGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>

                    <linearGradient
                      id="expenseGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e9edf5"
                  />

                  <XAxis
                    dataKey="month"
                    stroke="#94a3b8"
                    tick={{ fontSize: 11 }}
                    tickMargin={8}
                  />

                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => `₹${value}`}
                    width={55}
                  />

                  <Tooltip
                    formatter={(value, name) => [
                      formatCurrency(value),
                      name,
                    ]}
                  />

                  <Legend
                    verticalAlign="bottom"
                    height={30}
                    wrapperStyle={{ fontSize: "12px" }}
                  />

                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Income"
                    stroke="#10b981"
                    fill="url(#incomeGradient)"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />

                  <Area
                    type="monotone"
                    dataKey="expenses"
                    name="Expenses"
                    stroke="#6366f1"
                    fill="url(#expenseGradient)"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Spending by Category */}
        <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-slate-800">
                Spending by Category
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Expense distribution
              </p>
            </div>

            <MoreHorizontal
              size={20}
              className="shrink-0 text-slate-400"
            />
          </div>

          {categoryError && (
            <p className="mt-3 text-sm text-red-500">
              {categoryError}
            </p>
          )}

          <div className="relative mx-auto mt-3 flex h-[220px] w-full max-w-[320px] items-center justify-center sm:h-[240px]">
            {categoryLoading ? (
              <p className="text-sm text-slate-400">
                Loading categories...
              </p>
            ) : categoryData.length === 0 ? (
              <p className="text-sm text-slate-400">
                No expense categories available.
              </p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {categoryData.map((item, index) => (
                        <Cell
                          key={item.category}
                          fill={
                            categoryColors[
                              index % categoryColors.length
                            ]
                          }
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="pointer-events-none absolute text-center">
                  <p className="text-xs text-slate-400">
                    Total Expenses
                  </p>

                  <p className="mt-1 text-base font-bold text-slate-800 sm:text-lg">
                    {formatCurrency(categoryTotal)}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="mt-3 space-y-3">
            {categoryData.map((item, index) => (
              <div
                key={item.category}
                className="flex min-w-0 items-center justify-between gap-3 text-sm"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        categoryColors[index % categoryColors.length],
                    }}
                  />

                  <span className="truncate text-slate-600">
                    {item.category}
                  </span>
                </div>

                <span className="shrink-0 text-right text-xs font-semibold text-slate-700 sm:text-sm">
                  {formatCurrency(item.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Transactions */}
      <section className="min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 sm:mb-5">
          <div>
            <h3 className="font-bold text-slate-800">
              Recent Transactions
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Your latest income and expenses
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/transactions")}
            className="shrink-0 text-sm font-semibold text-indigo-600 transition hover:text-indigo-800"
          >
            View all
          </button>
        </div>

        <div className="-mx-1 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400">
                <th className="px-2 pb-3 font-medium">Transaction</th>
                <th className="px-2 pb-3 font-medium">Category</th>
                <th className="px-2 pb-3 font-medium">Date</th>
                <th className="px-2 pb-3 text-right font-medium">Amount</th>
              </tr>
            </thead>

            <tbody>
              {transactionsLoading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="py-10 text-center text-sm text-slate-400"
                  >
                    Loading transactions...
                  </td>
                </tr>
              ) : transactionsError ? (
                <tr>
                  <td
                    colSpan="4"
                    className="py-10 text-center text-sm text-red-500"
                  >
                    {transactionsError}
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-10 text-center">
                    <div className="flex flex-col items-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
                        <Wallet size={23} />
                      </div>

                      <p className="font-medium text-slate-600">
                        No transactions yet
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Your recent transactions will appear here.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => {
                  const isIncome =
                    transaction.type?.toUpperCase() === "INCOME";

                  return (
                    <tr
                      key={transaction.id}
                      className="border-b border-slate-50 transition hover:bg-slate-50"
                    >
                      <td className="px-2 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                              isIncome
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-rose-50 text-rose-600"
                            }`}
                          >
                            {isIncome ? (
                              <ArrowUpRight size={19} />
                            ) : (
                              <ArrowDownRight size={19} />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-[180px] truncate font-semibold text-slate-700">
                              {transaction.title || "Untitled"}
                            </p>

                            <p className="max-w-[180px] truncate text-xs text-slate-400">
                              {transaction.description || "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-2 py-4 text-sm text-slate-500">
                        {transaction.category || "-"}
                      </td>

                      <td className="whitespace-nowrap px-2 py-4 text-sm text-slate-500">
                        {formatDate(transaction.date)}
                      </td>

                      <td
                        className={`whitespace-nowrap px-2 py-4 text-right text-sm font-bold ${
                          isIncome
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {isIncome ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
