import DashboardLayout from "../components/DashboardLayout.jsx";

export default function PlaceholderPage({ eyebrow, title, description }) {
  return (
    <DashboardLayout eyebrow={eyebrow} title={title}>
      <div className="mx-auto max-w-7xl">
        <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-blue-700">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
          <p className="mt-2 text-sm font-medium text-slate-600">
            This module will be built in the next phase.
          </p>
        </section>
      </div>
    </DashboardLayout>
  );
}
