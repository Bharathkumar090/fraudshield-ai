export const profileSettings = {
  name: "Anika Rao",
  email: "anika.rao@fraudshield.ai",
  role: "Admin",
  organization: "FraudShield Operations",
};

export const securitySettings = {
  passwordLastUpdated: "May 12, 2026",
  twoFactorStatus: "Enabled",
  activeSessions: 3,
  securityStatus: "Strong",
};

export const apiKeys = [
  {
    id: "key_1",
    name: "Production Batch API",
    maskedKey: "fs_live_••••••••••42A9",
    createdDate: "May 02, 2026",
    lastUsed: "Today, 12:44",
    status: "Active",
  },
  {
    id: "key_2",
    name: "Analytics Service",
    maskedKey: "fs_live_••••••••••77C1",
    createdDate: "Apr 18, 2026",
    lastUsed: "Yesterday, 18:10",
    status: "Active",
  },
];

export const notificationPreferences = [
  {
    id: "highRiskAlerts",
    label: "High-risk transaction alerts",
    enabled: true,
  },
  {
    id: "failedLoginAlerts",
    label: "Failed login alerts",
    enabled: true,
  },
  {
    id: "uploadCompletionAlerts",
    label: "Upload completion alerts",
    enabled: false,
  },
  {
    id: "weeklyModelReport",
    label: "Weekly model report",
    enabled: true,
  },
];
