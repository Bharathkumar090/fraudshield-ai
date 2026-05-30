import { useMemo, useState } from "react";
import { AlertTriangle, FileUp, ListChecks, WandSparkles } from "lucide-react";

import AuditLogFilters from "../components/AuditLogFilters.jsx";
import AuditLogTable from "../components/AuditLogTable.jsx";
import DashboardLayout from "../components/DashboardLayout.jsx";
import StatCard from "../components/StatCard.jsx";
import { auditLogEvents } from "../data/auditLogsMockData.js";

export default function AuditLogs() {
  const [filters, setFilters] = useState({
    search: "",
    eventType: "All",
    status: "All",
  });

  const filteredEvents = useMemo(() => {
    const normalizedSearch = filters.search.trim().toLowerCase();

    return auditLogEvents.filter((event) => {
      const matchesSearch =
        !normalizedSearch ||
        event.user.toLowerCase().includes(normalizedSearch) ||
        event.action.toLowerCase().includes(normalizedSearch) ||
        event.endpoint.toLowerCase().includes(normalizedSearch);
      const matchesType =
        filters.eventType === "All" || event.eventType === filters.eventType;
      const matchesStatus =
        filters.status === "All" || event.status === filters.status;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [filters]);

  function handleFilterChange(key, value) {
    setFilters((currentFilters) => ({ ...currentFilters, [key]: value }));
  }

  const summaryCards = [
    {
      label: "Total Events",
      value: String(auditLogEvents.length),
      change: "+12%",
      helper: "Today",
      icon: ListChecks,
      tone: "blue",
    },
    {
      label: "Upload Events",
      value: countByEventType("Upload"),
      change: "+3",
      helper: "File actions",
      icon: FileUp,
      tone: "violet",
    },
    {
      label: "Prediction Requests",
      value: countByEventType("Prediction"),
      change: "+8",
      helper: "API activity",
      icon: WandSparkles,
      tone: "slate",
    },
    {
      label: "Security Alerts",
      value: String(
        auditLogEvents.filter((event) => event.status !== "Success").length,
      ),
      change: "Review",
      helper: "Needs attention",
      icon: AlertTriangle,
      tone: "rose",
    },
  ];

  return (
    <DashboardLayout eyebrow="Audit Logs" title="Audit Logs">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-blue-700">Audit Logs</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">
            Track sensitive actions, uploads, predictions, exports, and access events.
          </h1>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </section>

        <AuditLogFilters filters={filters} onFilterChange={handleFilterChange} />
        <AuditLogTable events={filteredEvents} />
      </div>
    </DashboardLayout>
  );
}

function countByEventType(eventType) {
  return String(
    auditLogEvents.filter((event) => event.eventType === eventType).length,
  );
}
