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
          <span className="text-eyebrow font-semibold tracking-wider text-ash uppercase">
            PREFERENCES
          </span>
          <h1 className="text-display-h1 font-bold text-onyx mt-0.5 tracking-tight flex items-center gap-2">
            System &amp; Account Settings
          </h1>
          <p className="text-body text-ash mt-1">
            Configure enterprise preferences, security protocols, and team notification channels.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 rounded-[10px] bg-forest hover:bg-forest-hover text-white px-4.5 py-2.5 text-sm font-medium shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Save className="h-4 w-4" />
          <span>{saved ? "Saved Successfully!" : "Save Changes"}</span>
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        {/* Left (8 cols): Settings Sections */}
        <div className="lg:col-span-8 space-y-5">
          {/* 1. Notification Preferences */}
          <div className="rounded-[10px] bg-white p-6 border border-pebble shadow-2xs">
            <h2 className="text-base font-bold text-onyx">Notifications &amp; Alerts</h2>
            <p className="text-xs text-ash mt-0.5">Control how FIRMA communicates system updates to your team.</p>

            <div className="mt-5 space-y-4 text-sm">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-semibold text-onyx">Email Notifications</p>
                  <p className="text-ash text-xs mt-0.5">
                    Receive email alerts for new quotations, jobs, and project delays.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailAlerts(!emailAlerts)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${
                    emailAlerts ? "bg-forest" : "bg-stone border border-pebble"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                      emailAlerts ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-pebble/60">
                <div>
                  <p className="font-semibold text-onyx">SMS / WhatsApp Field Alerts</p>
                  <p className="text-ash text-xs mt-0.5">
                    Urgent site safety inspections and immediate dispatch notifications.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSmsAlerts(!smsAlerts)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${
                    smsAlerts ? "bg-forest" : "bg-stone border border-pebble"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                      smsAlerts ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-pebble/60">
                <div>
                  <p className="font-semibold text-onyx">Weekly Executive Digest</p>
                  <p className="text-ash text-xs mt-0.5">
                    Weekly summary of revenue collected and active project milestones.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setWeeklyDigest(!weeklyDigest)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${
                    weeklyDigest ? "bg-forest" : "bg-stone border border-pebble"
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
          <div className="rounded-[10px] bg-white p-6 border border-pebble">
            <div className="flex items-center gap-3 pb-4 border-b border-pebble">
              <div className="flex h-9 w-9 items-center justify-center rounded-[6px] bg-sunfleck text-onyx">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-heading-h3 font-bold text-onyx">
                  Regional &amp; Localization
                </h2>
                <p className="text-eyebrow text-ash">
                  Currency symbol and default time zone formats
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 mt-5">
              <div className="space-y-1.5">
                <label className="text-eyebrow font-medium text-ash">
                  Primary Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-[10px] border border-pebble bg-stone px-3.5 py-2 text-body text-onyx outline-none focus:border-onyx"
                >
                  <option value="INR">Indian Rupee (₹ INR)</option>
                  <option value="USD">US Dollar ($ USD)</option>
                  <option value="AED">UAE Dirham (AED)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-eyebrow font-medium text-ash">
                  Timezone
                </label>
                <select
                  defaultValue="IST"
                  className="w-full rounded-[10px] border border-pebble bg-stone px-3.5 py-2 text-body text-onyx outline-none focus:border-onyx"
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
          <div className="rounded-[10px] bg-white p-6 border border-pebble">
            <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-breath text-onyx">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-heading-h3 font-bold text-onyx">
              Security &amp; Encryption
            </h3>
            <p className="text-eyebrow text-ash mt-0.5">
              End-to-end encryption active for all quotation and financial files.
            </p>

            <div className="mt-4 pt-4 border-t border-pebble space-y-2.5 text-body">
              <div className="flex items-center justify-between">
                <span className="text-ash">Two-Factor Auth:</span>
                <span className="font-semibold text-success-text">Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ash">Session Timeout:</span>
                <span className="font-semibold text-onyx">30 Days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ash">Role Audit Logs:</span>
                <span className="font-semibold text-onyx">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FirmaLayout>
  );
}