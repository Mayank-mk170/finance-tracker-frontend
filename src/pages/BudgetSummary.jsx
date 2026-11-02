
import { useEffect, useState } from "react";

import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  CalendarDays,
} from "lucide-react";

import {
  getBudgetSummary,
  getMonthlyCategorySummary,
} from "../services/transactionService";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

const getCurrentMonth = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
};

export default function BudgetSummary() {
  const [month, setMonth] = useState(getCurrentMonth);

  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError("");

        const [summaryData, categoryData] = await Promise.all([
          getBudgetSummary(month),
          getMonthlyCategorySummary(month),
        ]);

        setSummary(summaryData);
        setCategories(Array.isArray(categoryData) ? categoryData : []);
      } catch (err) {
        console.error("Budget summary error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load monthly budget summary."
        );

        setSummary(null);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [month]);

  const cards = [
    {
      title: "Monthly Income",
      value: summary?.totalIncome,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Monthly Expenses",
      value: summary?.totalExpenses,
      icon: TrendingDown,
      color: "text-red-600",
      bg: "bg-red-100",
    },
    {
      title: "Remaining Balance",
      value: summary?.balance,
      icon: Wallet,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
  ];

  const categoryTotal = categories.reduce(
    (total, item) => total + Number(item.totalAmount || 0),
    0
  );

  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-6">

      <div className="mx-auto w-full max-w-7xl space-y-5 sm:space-y-6">

        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">
              Budget Summary
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Track your monthly income, expenses and balance.
            </p>
          </div>

          {/* Month Selector */}
          <div className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:w-fit">
            <CalendarDays
              size={19}
              className="shrink-0 text-blue-600"
            />

            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full min-w-0 bg-transparent text-sm font-medium text-slate-700 outline-none sm:w-auto"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <section className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5 lg:p-6"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-slate-500 sm:text-sm">
                    {card.title}
                  </p>

                  <div
                    className={`shrink-0 rounded-xl p-2.5 sm:p-3 ${card.bg} ${card.color}`}
                  >
                    <Icon size={20} />
                  </div>
                </div>

                <h2
                  className={`mt-4 break-words text-xl font-bold sm:mt-5 sm:text-2xl ${card.color}`}
                >
                  {loading ? "Loading..." : formatCurrency(card.value)}
                </h2>
              </div>
            );
          })}
        </section>

        {/* Monthly Financial Overview */}
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
          <div className="flex items-center gap-3">
            <div className="shrink-0 rounded-xl bg-purple-100 p-2.5 text-purple-600 sm:p-3">
              <PiggyBank size={22} />
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-slate-800 sm:text-base">
                Monthly Financial Overview
              </h2>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                {summary?.month || month}
              </p>
            </div>
          </div>

          {loading ? (
            <p className="mt-6 text-sm text-slate-500">
              Loading monthly summary...
            </p>
          ) : summary ? (
            <div className="mt-6 space-y-4 sm:space-y-5">

              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-500">
                  Total Income
                </span>

                <span className="text-right font-semibold text-green-600">
                  {formatCurrency(summary.totalIncome)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-500">
                  Total Expenses
                </span>

                <span className="text-right font-semibold text-red-600">
                  {formatCurrency(summary.totalExpenses)}
                </span>
              </div>

              <div className="h-px bg-slate-100" />

              <div className="flex flex-col gap-2 min-[400px]:flex-row min-[400px]:items-center min-[400px]:justify-between">
                <span className="text-sm font-semibold text-slate-700">
                  Remaining Balance
                </span>

                <span
                  className={`break-words text-lg font-bold sm:text-xl ${
                    Number(summary.balance) >= 0
                      ? "text-blue-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(summary.balance)}
                </span>
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm text-slate-500">
              No summary available for this month.
            </p>
          )}
        </section>

        {/* Category Breakdown */}
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
          <div>
            <h2 className="text-base font-semibold text-slate-800 sm:text-lg">
              Spending by Category
            </h2>

            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Monthly expense distribution for {month}
            </p>
          </div>

          {loading ? (
            <p className="py-12 text-center text-sm text-slate-500">
              Loading categories...
            </p>
          ) : categories.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Wallet size={22} />
              </div>

              <p className="text-sm font-medium text-slate-600">
                No expense categories found.
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Add expenses to see your category breakdown.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid min-w-0 grid-cols-1 items-center gap-5 lg:grid-cols-2 lg:gap-8">

              {/* Donut Chart */}
              <div className="relative mx-auto h-[260px] w-full max-w-[360px] min-w-0 sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      dataKey="totalAmount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={3}
                    >
                      {categories.map((item, index) => (
                        <Cell
                          key={item.category}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <p className="text-xs text-slate-400">
                    Total Expenses
                  </p>

                  <p className="mt-1 max-w-[150px] break-words text-base font-bold text-slate-800 sm:text-lg">
                    {formatCurrency(categoryTotal)}
                  </p>
                </div>
              </div>

              {/* Category List */}
              <div className="min-w-0 space-y-3">
                <h3 className="mb-4 text-sm font-semibold text-slate-700">
                  Category Breakdown
                </h3>

                {categories.map((item, index) => {
                  const percentage =
                    categoryTotal > 0
                      ? (Number(item.totalAmount) / categoryTotal) * 100
                      : 0;

                  return (
                    <div
                      key={item.category}
                      className="min-w-0 rounded-xl bg-slate-50 p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className="h-3 w-3 shrink-0 rounded-full"
                            style={{
                              backgroundColor:
                                COLORS[index % COLORS.length],
                            }}
                          />

                          <span className="truncate text-sm text-slate-600">
                            {item.category}
                          </span>
                        </div>

                        <span className="shrink-0 text-right text-xs font-semibold text-slate-800 sm:text-sm">
                          {formatCurrency(item.totalAmount)}
                        </span>
                      </div>

                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor:
                              COLORS[index % COLORS.length],
                          }}
                        />
                      </div>

                      <p className="mt-1 text-right text-[10px] text-slate-400">
                        {percentage.toFixed(1)}%
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
