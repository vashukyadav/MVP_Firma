"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Building2,
  FolderKanban,
  Users,
  FileText,
  BarChart3,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  Layers,
  CreditCard,
  Sparkles,
  Shield,
  Zap,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: FolderKanban,
    title: "Project Management",
    desc: "Track every project milestone, assign tasks, and monitor progress in real time.",
    color: "bg-[#FEF7E2] text-[#C98A19]",
  },
  {
    icon: Users,
    title: "Team & Admins",
    desc: "Manage your entire workforce — from field workers to account administrators.",
    color: "bg-[#E6F4EA] text-[#2E7D32]",
  },
  {
    icon: FileText,
    title: "Quotation Engine",
    desc: "Generate professional quotations and track them from draft to approval.",
    color: "bg-[#FCE8E6] text-[#D84A38]",
  },
  {
    icon: Briefcase,
    title: "Job Scheduling",
    desc: "Schedule site visits, jobs, and field assignments all in one place.",
    color: "bg-[#E8F5E9] text-[#2E7D32]",
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    desc: "Get actionable insights with visual dashboards and detailed reports.",
    color: "bg-[#F4ECFF] text-[#8244E3]",
  },
  {
    icon: CreditCard,
    title: "Finance Tracking",
    desc: "Track pending payments, billing, and subscription status with ease.",
    color: "bg-[#FFF0E5] text-[#D46E2A]",
  },
];

const stats = [
  { value: "5,000+", label: "Companies Onboarded" },
  { value: "2L+", label: "Projects Managed" },
  { value: "98%", label: "Customer Satisfaction" },
  { value: "24/7", label: "Support Available" },
];

const plans = [
  {
    name: "Starter",
    price: "₹1,999",
    period: "/ year",
    desc: "Perfect for small teams getting started.",
    features: ["Up to 10 team members", "5 active projects", "Basic reporting", "Email support"],
    highlight: false,
  },
  {
    name: "Professional",
    price: "₹4,999",
    period: "/ year",
    desc: "For growing construction businesses.",
    features: ["Up to 50 team members", "Unlimited projects", "Advanced analytics", "Priority support", "Custom quotations"],
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "₹9,999",
    period: "/ year",
    desc: "Full power for large organizations.",
    features: ["Unlimited team members", "Unlimited projects", "Full analytics suite", "Dedicated support", "API access", "White labeling"],
    highlight: false,
  },
];

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F5F6F5] font-sans antialiased text-slate-800">
      {/* ================================================================ */}
      {/* NAVBAR                                                           */}
      {/* ================================================================ */}
      <header className="sticky top-0 z-50 bg-[#F5F6F5]/90 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#182E25] text-white shadow-sm">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-slate-900 block leading-tight">FIRMA</span>
              <span className="text-[10px] font-medium text-slate-500 block leading-none">Build Smarter. Together.</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button type="button" onClick={() => {}} className="hover:text-slate-900 transition cursor-pointer">Features</button>
            <button type="button" onClick={() => {}} className="hover:text-slate-900 transition cursor-pointer">Pricing</button>
            <button type="button" onClick={() => {}} className="hover:text-slate-900 transition cursor-pointer">About</button>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm cursor-pointer"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => router.push("/signup")}
              className="rounded-xl bg-[#182E25] px-4 py-2 text-sm font-semibold text-white hover:bg-[#12231B] transition shadow-sm cursor-pointer flex items-center gap-2"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ================================================================ */}
      {/* HERO SECTION                                                     */}
      {/* ================================================================ */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-[#E5EDE7] px-3.5 py-1.5 text-xs font-semibold text-[#182E25] mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              All-in-one Construction ERP
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight tracking-tight">
              Build Smarter.
              <br />
              <span className="text-[#182E25]">Manage Better.</span>
              <br />
              Grow Faster.
            </h1>

            <p className="mt-5 text-base text-slate-600 leading-relaxed max-w-lg">
              FIRMA is the complete business management platform built for construction companies — from projects and quotations to team management and finance tracking.
            </p>

            {/* Trust Badges */}
            <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-[#2E7D32]" /> Secure & Encrypted
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-[#C98A19]" /> Instant Setup
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-[#2E7D32]" /> Works Offline
              </span>
            </div>

            {/* CTA Group */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/signup")}
                className="flex items-center gap-2 rounded-2xl bg-[#182E25] px-6 py-3.5 text-sm font-bold text-white hover:bg-[#12231B] active:scale-[0.99] transition shadow-lg cursor-pointer"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm cursor-pointer"
              >
                Login to Dashboard
              </button>
            </div>

            {/* Social Proof */}
            <p className="mt-5 text-xs text-slate-400">
              Trusted by <span className="font-bold text-slate-600">5,000+</span> construction companies across India.
            </p>
          </div>

          {/* Right: Hero Image */}
          <div className="relative">
            <div className="relative h-80 sm:h-96 rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/images/landing_hero.jpg"
                alt="FIRMA Construction Management Platform"
                fill
                className="object-cover"
                priority
              />
              {/* Floating stat card */}
              <div className="absolute bottom-5 left-5 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg border border-white/60">
                <p className="text-xs text-slate-500">Active Projects</p>
                <p className="text-2xl font-black text-slate-900">8 <span className="text-sm font-medium text-emerald-600">↗ +2</span></p>
              </div>
              {/* Floating badge */}
              <div className="absolute top-5 right-5 bg-[#182E25] text-white rounded-xl px-3.5 py-2 text-xs font-bold shadow-lg">
                ✓ 98% Satisfaction
              </div>
            </div>

            {/* Decorative background blob */}
            <div className="absolute -z-10 -top-10 -right-10 h-72 w-72 rounded-full bg-[#E5EDE7] blur-3xl opacity-60" />
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* STATS STRIP                                                      */}
      {/* ================================================================ */}
      <section className="bg-[#182E25] py-10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-black text-white">{s.value}</p>
              <p className="text-xs font-medium text-[#7FA88B] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================ */}
      {/* FEATURES SECTION                                                 */}
      {/* ================================================================ */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <span className="inline-block rounded-full bg-[#E5EDE7] px-3.5 py-1 text-xs font-semibold text-[#182E25] mb-3">
            Everything You Need
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            One Platform. Complete Control.
          </h2>
          <p className="mt-3 text-sm text-slate-500 max-w-xl mx-auto">
            From the first site visit to the final payment — FIRMA handles every step of your construction business.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="rounded-2xl bg-white p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition group cursor-default"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${f.color} mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{f.title}</h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================================================================ */}
      {/* PRICING SECTION                                                  */}
      {/* ================================================================ */}
      <section className="bg-[#EDEAE4] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-block rounded-full bg-white px-3.5 py-1 text-xs font-semibold text-[#182E25] mb-3 shadow-sm">
              Transparent Pricing
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Plans for Every Business
            </h2>
            <p className="mt-3 text-sm text-slate-500 max-w-lg mx-auto">
              Choose the plan that fits your team. Upgrade or downgrade anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 border transition flex flex-col ${
                  plan.highlight
                    ? "bg-[#182E25] border-[#182E25] text-white shadow-2xl scale-[1.02]"
                    : "bg-white border-slate-200/60 shadow-sm"
                }`}
              >
                {plan.highlight && (
                  <div className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold text-white">
                    <Sparkles className="h-3 w-3" /> Most Popular
                  </div>
                )}

                <h3 className={`text-lg font-black ${plan.highlight ? "text-white" : "text-slate-900"}`}>
                  {plan.name}
                </h3>
                <p className={`text-xs mt-1 ${plan.highlight ? "text-[#7FA88B]" : "text-slate-500"}`}>{plan.desc}</p>

                <div className="mt-4 flex items-end gap-1">
                  <span className={`text-3xl font-black ${plan.highlight ? "text-white" : "text-slate-900"}`}>{plan.price}</span>
                  <span className={`text-xs mb-1 ${plan.highlight ? "text-[#7FA88B]" : "text-slate-500"}`}>{plan.period}</span>
                </div>

                <ul className="mt-5 space-y-2.5 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className={`h-4 w-4 shrink-0 ${plan.highlight ? "text-[#7FA88B]" : "text-[#2E7D32]"}`} />
                      <span className={plan.highlight ? "text-white/90" : "text-slate-600"}>{feat}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => router.push("/signup")}
                  className={`mt-6 w-full rounded-xl py-2.5 text-sm font-bold transition cursor-pointer ${
                    plan.highlight
                      ? "bg-white text-[#182E25] hover:bg-slate-100"
                      : "bg-[#182E25] text-white hover:bg-[#12231B]"
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* FINAL CTA SECTION                                                */}
      {/* ================================================================ */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="rounded-3xl bg-[#182E25] p-10 sm:p-16 text-center relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 left-0 h-40 w-40 rounded-full bg-white/5 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-white/5 translate-x-1/3 translate-y-1/3" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-bold text-white mb-5">
              <Layers className="h-3.5 w-3.5" /> Start today — No setup fees
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Ready to Build Smarter?
            </h2>
            <p className="mt-4 text-sm text-[#7FA88B] max-w-lg mx-auto leading-relaxed">
              Join thousands of construction companies already using FIRMA to streamline their operations and drive growth.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/signup")}
                className="flex items-center gap-2 rounded-2xl bg-white px-8 py-3.5 text-sm font-bold text-[#182E25] hover:bg-slate-100 active:scale-[0.99] transition shadow-lg cursor-pointer"
              >
                Create Free Account <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="rounded-2xl border border-white/25 px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition cursor-pointer"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* FOOTER                                                           */}
      {/* ================================================================ */}
      <footer className="border-t border-slate-200/60 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-slate-900" />
            <span className="font-black text-slate-900 tracking-tight">FIRMA</span>
            <span className="text-xs text-slate-400">&copy; 2025. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <button type="button" className="hover:text-slate-800 transition cursor-pointer">Privacy</button>
            <button type="button" className="hover:text-slate-800 transition cursor-pointer">Terms</button>
            <button type="button" className="hover:text-slate-800 transition cursor-pointer">Support</button>
          </div>
          <p className="text-xs text-slate-400 font-medium">&mdash; Built for a better tomorrow.</p>
        </div>
      </footer>
    </div>
  );
}