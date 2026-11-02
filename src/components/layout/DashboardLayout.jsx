
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-[#f1f3f9]">
      <Sidebar />

      <div className="min-h-screen pb-20 md:ml-[76px] md:pb-0">
        <Header />

        <main className="w-full p-3 sm:p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
