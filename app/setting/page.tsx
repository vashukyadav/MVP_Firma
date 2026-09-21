"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FirmaLayout from "@/components/layout/FirmaLayout";
import { useAuthStore } from "@/store/authStore";
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
  UserCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import AuditLogView from "@/features/users/AuditLogView";
import { toast } from "@/components/ui/toast";

export default function SettingPage() {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.currentUser);

  const [activeTab, setActiveTab] = useState<"general" | "audit">("general");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [currency, setCurrency] = useState("INR");
  const [timezone, setTimezone] = useState("IST");
  const [saved, setSaved] = useState(false);

  // Load persisted settings & check url params
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("tab") === "audit-log") {
          setActiveTab("audit");
        }
      }
      const stored = localStorage.getItem("mini-firma-settings");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed.emailAlerts === "boolean") setEmailAlerts(parsed.emailAlerts);
        if (typeof parsed.smsAlerts === "boolean") setSmsAlerts(parsed.smsAlerts);
        if (typeof parsed.weeklyDigest === "boolean") setWeeklyDigest(parsed.weeklyDigest);
        if (parsed.currency) setCurrency(parsed.currency);
        if (parsed.timezone) setTimezone(parsed.timezone);
      }
    } catch (e) {
      console.error("Failed to load settings from storage:", e);
    }
  }, []);

  const handleSave = () => {
    try {
      const data = {
        emailAlerts,
        smsAlerts,
        weeklyDigest,
        currency,
        timezone,
      };
      localStorage.setItem("mini-firma-settings", JSON.stringify(data));
      setSaved(true);
      toast.success("Settings saved successfully!");
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error("Failed to save settings:", e);
      toast.error("Failed to save settings.");
    }
  };

  return (
    <FirmaLayout activeNav="Settings">
      <div className="space-y-5 mt-2 max-w-6xl mx-auto">
        {/* Banner: Shortcut to Role Profile */}
        <div className="rounded-[14px] bg-white border border-forest/20 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-forest/5 via-white to-transparent">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-forest text-white flex items-center justify-center shrink-0">
              <UserCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-onyx">
                Signed in as {currentUser?.name || "User"} ({currentUser?.role?.replace("_", " ") || "Member"})
              </p>
              <p className="text-[11px] text-ash mt-0.5">
                View your assigned construction sites, projects, supervised contractors, and update your personal details.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="px-3.5 py-1.5 rounded-[8px] bg-forest hover:bg-forest-hover text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <span>Open My Profile</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <span className="text-eyebrow font-semibold tracking-wider text-ash uppercase">
              PREFERENCES &amp; SECURITY
            </span>
            <h1 className="text-display-h1 font-bold text-onyx mt-0.5 tracking-tight flex items-center gap-2">
              System Settings &amp; Security
            </h1>
            <p className="text-body text-ash mt-1">
              Configure enterprise preferences, security protocols, and review access audit records.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {/* Tab switch */}
            <div className="inline-flex rounded-[10px] bg-stone p-1 border border-pebble">
              <button
                type="button"
                onClick={() => setActiveTab("general")}
                className={`px-3 py-1.5 rounded-[8px] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "general"
                    ? "bg-white text-onyx shadow-2xs"
                    : "text-ash hover:text-onyx"
                }`}
              >
                <Settings className="h-3.5 w-3.5" />
                <span>General Preferences</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("audit")}
                className={`px-3 py-1.5 rounded-[8px] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "audit"
                    ? "bg-white text-onyx shadow-2xs"
                    : "text-ash hover:text-onyx"
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Security Audit Log</span>
              </button>
            </div>

            {activeTab === "general" && (
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-2 rounded-[10px] bg-forest hover:bg-forest-hover text-white px-4.5 py-2.5 text-sm font-medium shadow-xs transition cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>{saved ? "Saved Successfully!" : "Save Changes"}</span>
              </button>
            )}
          </div>
        </div>

        {activeTab === "audit" ? (
          <AuditLogView />
        ) : (

        <div className="grid gap-5 lg:grid-cols-12">
          {/* Left (8 cols): Settings Sections */}
          <div className="lg:col-span-8 space-y-5">
            {/* 1. Notification Preferences */}
            <div className="rounded-[12px] bg-white p-6 border border-pebble shadow-2xs">
              <div className="flex items-center gap-2.5 mb-1">
                <Bell className="h-4 w-4 text-forest" />
                <h2 className="text-base font-bold text-onyx">Notifications &amp; Alerts</h2>
              </div>
              <p className="text-xs text-ash">Control how FIRMA communicates system updates to your team.</p>

              <div className="mt-5 space-y-4 text-sm">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-semibold text-onyx text-xs">Email Notifications</p>
                    <p className="text-ash text-[11px] mt-0.5">
                      Receive email alerts for new quotations, work orders, and project delays.
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
                    <p className="font-semibold text-onyx text-xs">SMS / WhatsApp Field Alerts</p>
                    <p className="text-ash text-[11px] mt-0.5">
                      Urgent site safety inspections and immediate work order dispatch notifications.
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
                    <p className="font-semibold text-onyx text-xs">Weekly Executive Digest</p>
                    <p className="text-ash text-[11px] mt-0.5">
                      Weekly summary of on-site milestones and trade package execution.
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
            <div className="rounded-[12px] bg-white p-6 border border-pebble shadow-2xs">
              <div className="flex items-center gap-3 pb-4 border-b border-pebble">
                <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-breath text-forest">
                  <Globe className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-onyx">
                    Regional &amp; Localization
                  </h2>
                  <p className="text-[11px] text-ash">
                    Currency symbol and default time zone formats
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 mt-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-onyx">
                    Primary Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-[10px] border border-pebble bg-stone/40 px-3.5 py-2 text-xs text-onyx outline-none focus:border-forest"
                  >
                    <option value="INR">Indian Rupee (₹ INR)</option>
                    <option value="USD">US Dollar ($ USD)</option>
                    <option value="AED">UAE Dirham (AED)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-onyx">
                    Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full rounded-[10px] border border-pebble bg-stone/40 px-3.5 py-2 text-xs text-onyx outline-none focus:border-forest"
                  >
                    <option value="IST">Asia/Kolkata (IST +5:30)</option>
                    <option value="GST">Asia/Dubai (GST +4:00)</option>
                    <option value="UTC">UTC Universal Time</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right (4 cols): Security status & Shortcuts */}
          <div className="lg:col-span-4 space-y-5">
            <div className="rounded-[12px] bg-white p-6 border border-pebble shadow-2xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-clear-bg text-forest">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-onyx">
                Security &amp; Encryption
              </h3>
              <p className="text-xs text-ash mt-0.5">
                End-to-end encryption active for all project data and financial ledgers.
              </p>

              <div className="mt-4 pt-4 border-t border-pebble space-y-2.5 text-xs">
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

              <div className="mt-5 pt-3 border-t border-pebble/60">
                <button
                  type="button"
                  onClick={() => router.push("/profile")}
                  className="w-full py-2 rounded-[8px] border border-forest/30 bg-forest/5 hover:bg-forest/10 text-forest text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Change Password in Profile</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </FirmaLayout>
);
}