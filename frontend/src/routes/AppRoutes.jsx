import { BrowserRouter, Route, Routes } from "react-router-dom";

import AuditLogs from "../pages/AuditLogs.jsx";
import Analytics from "../pages/Analytics.jsx";
import DashboardOverview from "../pages/DashboardOverview.jsx";
import HomePage from "../pages/HomePage.jsx";
import ModelInsights from "../pages/ModelInsights.jsx";
import Settings from "../pages/Settings.jsx";
import Transactions from "../pages/Transactions.jsx";
import UploadTransactions from "../pages/UploadTransactions.jsx";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardOverview />} />
        <Route path="/upload" element={<UploadTransactions />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/model-insights" element={<ModelInsights />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}
