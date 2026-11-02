
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  LogOut,
  CircleDollarSign,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Transactions", path: "/transactions", icon: ArrowLeftRight },
  { name: "Budget Summary", path: "/budgets", icon: Wallet },
];

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[76px] flex-col items-center bg-gradient-to-b from-indigo-500 to-blue-900 py-6 text-white shadow-xl md:flex">
        <div className="mb-12 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20">
          <CircleDollarSign size={27} />
        </div>

        <nav className="flex flex-1 flex-col items-center gap-5">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={item.name}
                className={({ isActive }) =>
                  `flex h-11 w-11 items-center justify-center rounded-xl transition-all ${
                    isActive
                      ? "bg-white text-indigo-700 shadow-lg"
                      : "text-white/75 hover:bg-white/15 hover:text-white"
                  }`
                }
              >
                <Icon size={21} />
              </NavLink>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          title="Logout"
          className="flex h-11 w-11 items-center justify-center rounded-xl text-white/75 transition hover:bg-red-500 hover:text-white"
        >
          <LogOut size={21} />
        </button>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 z-50 grid w-full grid-cols-4 border-t border-slate-200 bg-white px-1 py-2 shadow-[0_-4px_15px_rgba(0,0,0,0.06)] md:hidden">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex min-w-0 flex-col items-center justify-center gap-1 px-0.5 py-2 text-center transition ${
                  isActive
                    ? "font-semibold text-indigo-600"
                    : "text-slate-400"
                }`
              }
            >
              <Icon size={21} />
              <span className="w-full break-words text-[10px] leading-tight sm:text-xs">
                {item.name}
              </span>
            </NavLink>
          );
        })}

        <button
          onClick={handleLogout}
          className="flex min-w-0 flex-col items-center justify-center gap-1 px-0.5 py-2 text-slate-400 transition hover:text-red-500"
        >
          <LogOut size={21} />
          <span className="w-full text-center text-[10px] leading-tight sm:text-xs">
            Logout
          </span>
        </button>
      </nav>
    </>
  );
}
