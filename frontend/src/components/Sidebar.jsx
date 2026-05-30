import {
  BarChart3,
  ClipboardList,
  FileSearch,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  UploadCloud,
} from "lucide-react";
import { Link, NavLink } from "react-router-dom";

const navItems = [
  { label: "Overview", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Upload", icon: UploadCloud, to: "/upload" },
  { label: "Transactions", icon: ClipboardList, to: "/transactions" },
  { label: "Analytics", icon: BarChart3, to: "/analytics" },
  { label: "Model Insights", icon: SlidersHorizontal, to: "/model-insights" },
  { label: "Audit Logs", icon: FileSearch, to: "/audit-logs" },
  { label: "Settings", icon: Settings, to: "/settings" },
];

export default function Sidebar() {
  return (
    <aside className="w-full shrink-0 border-b border-slate-200 bg-white px-4 py-4 lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
      <Link to="/" className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-700 text-white">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-base font-semibold text-slate-950">
            FraudShield AI
          </span>
          <span className="block text-sm text-slate-500">Risk operations</span>
        </span>
      </Link>

      <nav
        className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:mt-10 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0"
        aria-label="Dashboard navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`
              }
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
