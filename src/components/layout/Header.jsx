
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";
import { CalendarDays } from "lucide-react";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/transactions": "Transactions",
  "/budgets": "Budget Summary",
};

export default function Header() {
  const { user } = useAuth();
  const location = useLocation();

  const pageTitle = pageTitles[location.pathname] || "Dashboard";

  const displayName =
    user?.name ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "User";

  const avatarLetter = displayName.charAt(0).toUpperCase();

  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="flex min-h-[76px] flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-3 sm:px-6 lg:px-8">
      <div>
        <h2 className="text-lg font-bold text-slate-800 sm:text-xl">
          {pageTitle}
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Your personal financial overview
        </p>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <div className="hidden items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500 sm:flex">
          <CalendarDays size={16} />
          {today}
        </div>

        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700 sm:h-10 sm:w-10">
            {avatarLetter}
          </div>

          <div className="min-w-0">
            <p className="max-w-[120px] truncate text-sm font-semibold capitalize text-slate-800 sm:max-w-none">
              {displayName}
            </p>
            <p className="hidden max-w-[180px] truncate text-xs text-slate-400 sm:block">
              {user?.email || ""}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
