import { ArrowRight, Eye, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import PrimaryButton from "../components/PrimaryButton.jsx";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f8fbff] text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-12 sm:px-8 lg:px-10">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_360px]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow-sm">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Risk intelligence workspace
            </div>

            <h1 className="text-5xl font-semibold leading-tight text-slate-950 sm:text-6xl">
              FraudShield AI
            </h1>
            <p className="mt-5 max-w-2xl text-xl leading-8 text-slate-600">
              Secure AI-powered fraud detection platform
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <PrimaryButton as={Link} to="/dashboard">
                Get Started
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </PrimaryButton>
              <PrimaryButton as={Link} to="/dashboard" variant="secondary">
                <Eye className="h-4 w-4" aria-hidden="true" />
                View Dashboard
              </PrimaryButton>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.12, ease: "easeOut" }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(37,99,235,0.10)]"
            aria-label="Fraud risk preview"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Risk scan</p>
                <p className="mt-1 text-2xl font-semibold text-slate-950">
                  97.4%
                </p>
              </div>
              <div className="rounded-full bg-blue-50 p-3 text-blue-700">
                <ShieldCheck className="h-6 w-6" aria-hidden="true" />
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <RiskBar label="Legitimate" value="78%" color="bg-blue-500" />
              <RiskBar label="Review" value="16%" color="bg-violet-500" />
              <RiskBar label="High risk" value="6%" color="bg-slate-900" />
            </div>
          </motion.aside>
        </div>
      </section>
    </main>
  );
}

function RiskBar({ label, value, color }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="text-slate-500">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: value }} />
      </div>
    </div>
  );
}
