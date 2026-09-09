"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { OnboardingHeader } from "@/components/onboarding/OnboardingHeader";
import {
  Layers,
  Building2,
  CreditCard,
  Rocket,
  Users,
  Zap,
  BarChart3,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

export default function WelcomePage() {
  const router = useRouter();
  const { currentUser, logout } = useAuthStore();

  const userName = currentUser?.name ? currentUser.name.split(" ")[0] : "Rahul";

  // ── ALL ORIGINAL LOGIC PRESERVED ──────────────────────────────────────
  const handleStartSetup = () => {
    router.push("/onboarding/plan");
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };
  // ───────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F5F6F5] flex flex-col font-sans antialiased">
      {/* Top Header */}
      <OnboardingHeader />

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-sm">
          <div className="grid md:grid-cols-2">

            {/* Left Column: Welcome & Steps */}
            <div className="flex flex-col justify-between p-8 sm:p-10 lg:p-12">
              <div>
                {/* Tag */}
                <div className="inline-flex items-center gap-2 rounded-full bg-[#E5EDE7] px-3 py-1 text-xs font-semibold text-[#182E25] mb-5">
                  <Building2 className="h-3.5 w-3.5" />
                  FIRMA Onboarding
                </div>

                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  Welcome to FIRMA,
                  <br />
                  <span className="text-[#182E25]">{userName}! 👋</span>
                </h1>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                  Let&apos;s set up your company in a few simple steps. It only takes a few minutes.
                </p>

                {/* Steps List */}
                <div className="mt-8 space-y-3">
                  {[
                    { icon: Layers, label: "Choose a Plan", step: "01" },
                    { icon: Building2, label: "Company Information", step: "02" },
                    { icon: CreditCard, label: "Billing & Payment", step: "03" },
                    { icon: Rocket, label: "Get Started", step: "04" },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-[#F5F6F5] p-3.5 hover:border-[#C5D5CA] hover:bg-[#E5EDE7]/40 transition"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E5EDE7] text-[#182E25] shrink-0">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-semibold text-slate-800 flex-1">
                          {item.label}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400">{item.step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-4">
                <button
                  type="button"
                  onClick={handleStartSetup}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#182E25] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#12231B] active:scale-[0.99] cursor-pointer"
                >
                  <span>Start Setup</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-3 block w-full text-center text-xs font-medium text-slate-400 transition hover:text-slate-600 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Right Column: FIRMA Visual & Feature Badges */}
            <div className="flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-100 bg-[#EDEAE4] p-8 sm:p-10">
              {/* FIRMA SVG Illustration (green-themed building) */}
              <div className="flex flex-col items-center justify-center pt-2">
                <div className="relative flex h-48 w-48 items-center justify-center">
                  {/* Glow */}
                  <div className="absolute inset-0 rounded-full bg-[#182E25]/10 blur-2xl" />

                  {/* SVG Green Isometric Building */}
                  <svg
                    viewBox="0 0 200 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="relative z-10 h-44 w-44 drop-shadow-md"
                  >
                    {/* Ground shadow */}
                    <ellipse cx="100" cy="170" rx="70" ry="14" fill="#182E25" opacity="0.12" />

                    {/* Main Tower Left Face */}
                    <polygon points="100,55 52,83 52,152 100,124" fill="#4E8F67" />
                    {/* Main Tower Right Face */}
                    <polygon points="100,55 148,83 148,152 100,124" fill="#182E25" />
                    {/* Main Tower Roof */}
                    <polygon points="100,55 148,83 100,111 52,83" fill="#7FA88B" />

                    {/* Windows Left */}
                    <polygon points="63,93 74,87 74,98 63,104" fill="#C5D5CA" opacity="0.8" />
                    <polygon points="79,84 90,78 90,89 79,95" fill="#C5D5CA" opacity="0.8" />
                    <polygon points="63,109 74,103 74,114 63,120" fill="#C5D5CA" opacity="0.8" />
                    <polygon points="79,100 90,94 90,105 79,111" fill="#C5D5CA" opacity="0.8" />
                    <polygon points="63,125 74,119 74,130 63,136" fill="#C5D5CA" opacity="0.8" />
                    <polygon points="79,116 90,110 90,121 79,127" fill="#C5D5CA" opacity="0.8" />

                    {/* Windows Right */}
                    <polygon points="110,78 121,84 121,95 110,89" fill="#4E8F67" opacity="0.7" />
                    <polygon points="126,87 137,93 137,104 126,98" fill="#4E8F67" opacity="0.7" />
                    <polygon points="110,94 121,100 121,111 110,105" fill="#4E8F67" opacity="0.7" />
                    <polygon points="126,103 137,109 137,120 126,114" fill="#4E8F67" opacity="0.7" />
                    <polygon points="110,110 121,116 121,127 110,121" fill="#4E8F67" opacity="0.7" />
                    <polygon points="126,119 137,125 137,136 126,130" fill="#4E8F67" opacity="0.7" />

                    {/* Small green Trees */}
                    <circle cx="42" cy="150" r="11" fill="#2E7D32" />
                    <rect x="40" y="155" width="4" height="12" fill="#1B5E20" />
                    <circle cx="158" cy="152" r="10" fill="#2E7D32" />
                    <rect x="156" y="157" width="4" height="10" fill="#1B5E20" />

                    {/* Flagpole */}
                    <line x1="100" y1="55" x2="100" y2="34" stroke="#182E25" strokeWidth="2" />
                    <polygon points="100,34 115,39 100,44" fill="#EAB340" />
                  </svg>
                </div>

                <h3 className="mt-2 text-center text-sm font-bold text-slate-800">
                  One platform for your growing business
                </h3>
                <p className="mt-1 text-center text-xs text-slate-500">
                  Projects · Teams · Finance · Reports
                </p>
              </div>

              {/* 2x2 Feature Badges */}
              <div className="mt-6 grid grid-cols-2 gap-2 text-left">
                {[
                  { icon: Users, label: "Manage your team" },
                  { icon: Zap, label: "Simplify operations" },
                  { icon: BarChart3, label: "Track projects & sales" },
                  { icon: TrendingUp, label: "Grow faster" },
                ].map((badge) => {
                  const Icon = badge.icon;
                  return (
                    <div
                      key={badge.label}
                      className="flex items-center gap-2 rounded-xl border border-slate-200/60 bg-white/80 px-2.5 py-2 shadow-xs"
                    >
                      <Icon className="h-3.5 w-3.5 text-[#182E25] shrink-0" />
                      <span className="text-[11px] font-medium text-slate-700 truncate">
                        {badge.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Quote Card */}
              <div className="mt-4 rounded-2xl border border-[#C5D5CA]/60 bg-white/70 p-3.5 text-center">
                <p className="text-xs italic text-slate-600">
                  &ldquo;Together we build better businesses.&rdquo;
                </p>
                <p className="mt-1 text-[10px] font-bold tracking-wider text-[#182E25] uppercase">
                  — FIRMA
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}