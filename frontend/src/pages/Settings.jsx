import { useState } from "react";

import ApiKeySettings from "../components/ApiKeySettings.jsx";
import DashboardLayout from "../components/DashboardLayout.jsx";
import NotificationSettings from "../components/NotificationSettings.jsx";
import ProfileSettings from "../components/ProfileSettings.jsx";
import SecuritySettings from "../components/SecuritySettings.jsx";
import {
  apiKeys as initialApiKeys,
  notificationPreferences,
  profileSettings,
  securitySettings,
} from "../data/settingsMockData.js";

export default function Settings() {
  const [profile, setProfile] = useState(profileSettings);
  const [apiKeys, setApiKeys] = useState(initialApiKeys);
  const [notifications, setNotifications] = useState(notificationPreferences);
  const [threshold, setThreshold] = useState(0.5);

  function handleProfileChange(key, value) {
    setProfile((currentProfile) => ({ ...currentProfile, [key]: value }));
  }

  function handleCreateKey() {
    const suffix = Math.random().toString(16).slice(2, 6).toUpperCase();
    setApiKeys((currentKeys) => [
      {
        id: `key_${Date.now()}`,
        name: "New API Key",
        maskedKey: `fs_live_••••••••••${suffix}`,
        createdDate: "Today",
        lastUsed: "Never",
        status: "Active",
      },
      ...currentKeys,
    ]);
  }

  function handleRevokeKey(keyId) {
    setApiKeys((currentKeys) =>
      currentKeys.map((apiKey) =>
        apiKey.id === keyId ? { ...apiKey, status: "Revoked" } : apiKey,
      ),
    );
  }

  function handleNotificationToggle(preferenceId) {
    setNotifications((currentPreferences) =>
      currentPreferences.map((preference) =>
        preference.id === preferenceId
          ? { ...preference, enabled: !preference.enabled }
          : preference,
      ),
    );
  }

  return (
    <DashboardLayout eyebrow="Settings" title="Settings">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-blue-700">Settings</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">
            Manage profile, security preferences, API access, and notification rules.
          </h1>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <ProfileSettings profile={profile} onProfileChange={handleProfileChange} />
          <SecuritySettings security={securitySettings} />
        </div>

        <ApiKeySettings
          apiKeys={apiKeys}
          onCreateKey={handleCreateKey}
          onRevokeKey={handleRevokeKey}
        />

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <NotificationSettings
            preferences={notifications}
            onToggle={handleNotificationToggle}
          />
          <ThresholdPreference value={threshold} onChange={setThreshold} />
        </div>
      </div>
    </DashboardLayout>
  );
}

function ThresholdPreference({ value, onChange }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">
            Model Threshold
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Set the default fraud threshold preference.
          </p>
        </div>
        <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
          Current value: {value.toFixed(2)}
        </div>
      </div>

      <div className="mt-7">
        <input
          type="range"
          min="0.1"
          max="0.9"
          step="0.01"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-700"
          aria-label="Fraud threshold preference"
        />
        <div className="mt-3 flex justify-between text-xs font-medium text-slate-400">
          <span>0.10</span>
          <span>0.50</span>
          <span>0.90</span>
        </div>
      </div>

      <p className="mt-6 rounded-xl bg-violet-50 px-4 py-3 text-sm font-medium text-violet-700">
        Lower threshold catches more fraud but increases alerts.
      </p>
    </section>
  );
}
