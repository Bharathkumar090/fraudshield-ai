import { Bell, Home, Search, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function Topbar({
  eyebrow = "Dashboard",
  title = "Fraud operations overview",
}) {
  return (
    <header className="border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur sm:px-8 lg:px-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-700">{eyebrow}</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Back to Home</span>
          </Link>
          <div className="hidden min-w-64 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 md:flex">
            <Search className="h-4 w-4" aria-hidden="true" />
            Search transactions
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:text-blue-700"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="hidden items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 sm:flex">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Live scan
          </div>
        </div>
      </div>
    </header>
  );
}
