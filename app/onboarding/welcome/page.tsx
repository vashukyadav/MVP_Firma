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

  const handleStartSetup = () => {
    router.push("/onboarding/plan");
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Top Header */}
      <OnboardingHeader />

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          <div className="grid md:grid-cols-2">
            
            {/* Left Column: Welcome & Steps */}
            <div className="flex flex-col justify-between p-8 sm:p-10 lg:p-12">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  Welcome to FIRMA, {userName}! 👋
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  Let&apos;s set up your company in a few simple steps.
                </p>

                {/* Steps List */}
                <div className="mt-8 space-y-3">
                  <div className="flex items-center gap-3.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3 transition-colors hover:bg-slate-50">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Layers className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-slate-800">
                      Choose a Plan
                    </span>
                  </div>

                  <div className="flex items-center gap-3.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3 transition-colors hover:bg-slate-50">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-slate-800">
                      Company Information
                    </span>
                  </div>

                  <div className="flex items-center gap-3.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3 transition-colors hover:bg-slate-50">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-slate-800">
                      Billing & Payment
                    </span>
                  </div>

                  <div className="flex items-center gap-3.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3 transition-colors hover:bg-slate-50">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Rocket className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-slate-800">
                      Get Started
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-4">
                <button
                  type="button"
                  onClick={handleStartSetup}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700 active:scale-[0.99] cursor-pointer"
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

            {/* Right Column: Illustration & Feature Badges */}
            <div className="flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-100 bg-gradient-to-b from-blue-50/40 via-slate-50/40 to-slate-100/40 p-8 sm:p-10">
              {/* Isometric Building Graphic */}
              <div className="flex flex-col items-center justify-center pt-2">
                <div className="relative flex h-44 w-44 items-center justify-center">
                  {/* Subtle Background Glow */}
                  <div className="absolute inset-0 rounded-full bg-blue-200/30 blur-2xl -z-0" />
                  
                  {/* SVG Isometric Modern Building */}
                  <svg
                    viewBox="0 0 200 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="relative z-10 h-40 w-40 drop-shadow-md"
                  >
                    {/* Clouds */}
                    <path
                      d="M20 70C20 64.477 24.477 60 30 60C31.5 60 32.9 60.3 34.2 60.9C36.3 54.5 42.4 50 49.5 50C58.6 50 66 57.4 66 66.5C66 67.7 65.9 68.9 65.6 70H20Z"
                      fill="#E2E8F0"
                      opacity="0.8"
                    />
                    <path
                      d="M140 45C140 40 144 36 149 36C150.3 36 151.6 36.3 152.7 36.8C154.6 31.2 160 27 166.5 27C174.5 27 181 33.5 181 41.5C181 42.7 180.9 43.9 180.6 45H140Z"
                      fill="#E2E8F0"
                      opacity="0.8"
                    />

                    {/* Ground base shadow */}
                    <ellipse cx="100" cy="170" rx="75" ry="18" fill="#CBD5E1" opacity="0.4" />

                    {/* Main Tower Left Face */}
                    <polygon points="100,60 55,86 55,150 100,124" fill="#3B82F6" />
                    {/* Main Tower Right Face */}
                    <polygon points="100,60 145,86 145,150 100,124" fill="#1D4ED8" />
                    {/* Main Tower Roof Face */}
                    <polygon points="100,60 145,86 100,112 55,86" fill="#60A5FA" />

                    {/* Windows Left */}
                    <polygon points="65,94 75,88 75,98 65,104" fill="#BFDBFE" />
                    <polygon points="80,85 90,79 90,89 80,95" fill="#BFDBFE" />
                    <polygon points="65,110 75,104 75,114 65,120" fill="#BFDBFE" />
                    <polygon points="80,101 90,95 90,105 80,111" fill="#BFDBFE" />
                    <polygon points="65,126 75,120 75,130 65,136" fill="#BFDBFE" />
                    <polygon points="80,117 90,111 90,121 80,127" fill="#BFDBFE" />

                    {/* Windows Right */}
                    <polygon points="110,79 120,85 120,95 110,89" fill="#93C5FD" />
                    <polygon points="125,88 135,94 135,104 125,98" fill="#93C5FD" />
                    <polygon points="110,95 120,101 120,111 110,105" fill="#93C5FD" />
                    <polygon points="125,104 135,110 135,120 125,114" fill="#93C5FD" />
                    <polygon points="110,111 120,117 120,127 110,121" fill="#93C5FD" />
                    <polygon points="125,120 135,126 135,136 125,130" fill="#93C5FD" />

                    {/* Small Tree Left */}
                    <circle cx="45" cy="150" r="10" fill="#10B981" />
                    <rect x="43" y="155" width="4" height="10" fill="#047857" />

                    {/* Small Tree Right */}
                    <circle cx="155" cy="152" r="9" fill="#10B981" />
                    <rect x="153" y="157" width="4" height="9" fill="#047857" />

                    {/* Flagpole on roof */}
                    <line x1="100" y1="60" x2="100" y2="40" stroke="#0F172A" strokeWidth="2" />
                    <polygon points="100,40 114,45 100,50" fill="#EF4444" />
                  </svg>
                </div>

                <h3 className="mt-3 text-center text-sm font-bold text-slate-800">
                  One platform for your growing business
                </h3>
              </div>

              {/* 2x2 Feature Badges */}
              <div className="mt-5 grid grid-cols-2 gap-2 text-left">
                <div className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white/90 px-2.5 py-1.5 shadow-2xs">
                  <Users className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span className="text-[11px] font-medium text-slate-700 truncate">
                    Manage your team
                  </span>
                </div>

                <div className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white/90 px-2.5 py-1.5 shadow-2xs">
                  <Zap className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span className="text-[11px] font-medium text-slate-700 truncate">
                    Simplify operations
                  </span>
                </div>

                <div className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white/90 px-2.5 py-1.5 shadow-2xs">
                  <BarChart3 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span className="text-[11px] font-medium text-slate-700 truncate">
                    Track projects & sales
                  </span>
                </div>

                <div className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white/90 px-2.5 py-1.5 shadow-2xs">
                  <TrendingUp className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span className="text-[11px] font-medium text-slate-700 truncate">
                    Grow faster
                  </span>
                </div>
              </div>

              {/* Quote Card */}
              <div className="mt-5 rounded-xl border border-slate-200/60 bg-white/80 p-3 text-center shadow-2xs">
                <p className="text-xs italic text-slate-600">
                  &ldquo;Together we build better businesses.&rdquo;
                </p>
                <p className="mt-0.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
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