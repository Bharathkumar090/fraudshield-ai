import { CheckCircle2, Loader2 } from "lucide-react";

const states = ["Selected", "Uploading", "Validating", "Processing", "Completed"];

export default function UploadProgress({ status, progress }) {
  const hasFailed = status === "Failed";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Upload status</h2>
          <p className="mt-1 text-sm text-slate-500">
            Validation and fraud check progress.
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            hasFailed
              ? "bg-rose-50 text-rose-700"
              : "bg-violet-50 text-violet-700"
          }`}
        >
          {status || "Waiting"}
        </span>
      </div>

      <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            hasFailed ? "bg-rose-600" : "bg-blue-700"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-6 space-y-4">
        {states.map((state) => {
          const isDone = !hasFailed && states.indexOf(state) < states.indexOf(status);
          const isActive = state === status;

          return (
            <div key={state} className="flex items-center gap-3">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  isDone || isActive
                    ? "bg-blue-50 text-blue-700"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {isActive && status !== "Completed" ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                )}
              </span>
              <span
                className={`text-sm font-medium ${
                  isDone || isActive ? "text-slate-950" : "text-slate-400"
                }`}
              >
                {state}
              </span>
            </div>
          );
        })}
      </div>

      {hasFailed ? (
        <div className="mt-5 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          Upload failed. Review the message below and try again.
        </div>
      ) : null}
    </section>
  );
}
