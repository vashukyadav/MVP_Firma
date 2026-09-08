"use client";

import { useState } from "react";
import FirmaLayout from "@/components/layout/FirmaLayout";
import {
  Settings,
  Bell,
  Lock,
  Globe,
  Save,
  CheckCircle2,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";

export default function SettingPage() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [currency, setCurrency] = useState("INR");

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <FirmaLayout activeNav="Settings">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 pb-2">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            PREFERENCES
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5 tracking-tight flex items-center gap-2">
            System &amp; Account Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure enterprise preferences, security protocols, and team notification channels.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-[#182E25] hover:bg-[#12231B] text-white px-4 py-2 text-xs font-semibold shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Save className="h-3.5 w-3.5" />
          <span>{saved ? "Saved Successfully!" : "Save Changes"}</span>
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        {/* Left (8 cols): Settings Sections */}
        <div className="lg:col-span-8 space-y-5">
          {/* 1. Notification Preferences */}
          <div className="rounded-2xl bg-white p-6 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E6F4EA] text-[#2E7D32]">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Notification Preferences
                </h2>
                <p className="text-[11px] text-slate-400">
                  Manage how you and your team receive project updates
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4 text-xs">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-bold text-slate-800">Email Notifications</p>
                  <p className="text-slate-400 text-[11px]">
                    Receive email alerts for new quotations, jobs, and project delays.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailAlerts(!emailAlerts)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${
                    emailAlerts ? "bg-[#182E25]" : "bg-slate-200"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                      emailAlerts ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <div>
                  <p className="font-bold text-slate-800">SMS / WhatsApp Field Alerts</p>
                  <p className="text-slate-400 text-[11px]">
                    Urgent site safety inspections and immediate dispatch notifications.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSmsAlerts(!smsAlerts)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${
                    smsAlerts ? "bg-[#182E25]" : "bg-slate-200"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                      smsAlerts ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <div>
                  <p className="font-bold text-slate-800">Weekly Executive Digest</p>
                  <p className="text-slate-400 text-[11px]">
                    Weekly summary of revenue collected and active project milestones.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setWeeklyDigest(!weeklyDigest)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${
                    weeklyDigest ? "bg-[#182E25]" : "bg-slate-200"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                      weeklyDigest ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* 2. Localization & Currency */}
          <div className="rounded-2xl bg-white p-6 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FEF7E2] text-[#C98A19]">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Regional &amp; Localization
                </h2>
                <p className="text-[11px] text-slate-400">
                  Currency symbol and default time zone formats
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 mt-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Primary Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-[#182E25] shadow-2xs"
                >
                  <option value="INR">Indian Rupee (₹ INR)</option>
                  <option value="USD">US Dollar ($ USD)</option>
                  <option value="AED">UAE Dirham (AED)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Timezone
                </label>
                <select
                  defaultValue="IST"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-[#182E25] shadow-2xs"
                >
                  <option value="IST">Asia/Kolkata (IST +5:30)</option>
                  <option value="GST">Asia/Dubai (GST +4:00)</option>
                  <option value="UTC">UTC Universal Time</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right (4 cols): Security status */}
        <div className="lg:col-span-4 space-y-5">
          <div className="rounded-2xl bg-white p-6 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E5EDE7] text-[#182E25]">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-slate-900">
              Security &amp; Encryption
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              End-to-end encryption active for all quotation and financial files.
            </p>

            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Two-Factor Auth:</span>
                <span className="font-semibold text-emerald-600">Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Session Timeout:</span>
                <span className="font-semibold text-slate-700">30 Days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Role Audit Logs:</span>
                <span className="font-semibold text-slate-700">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FirmaLayout>
  );
}