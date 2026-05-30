import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

export default function DashboardLayout({
  children,
  eyebrow = "Dashboard",
  title = "Fraud operations overview",
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar eyebrow={eyebrow} title={title} />
          <main className="flex-1 px-5 py-6 sm:px-8 lg:px-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
