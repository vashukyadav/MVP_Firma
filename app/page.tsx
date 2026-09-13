"use client";

import { useState } from "react";
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
  ChevronDown,
  Menu,
  X,
  Star,
  Check,
  Clock,
  Smartphone,
  TrendingUp,
  HardHat,
  Activity,
  FileCheck2,
  BadgeCheck,
  ShieldCheck,
  MapPin,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  Play,
  Award,
} from "lucide-react";

// ==========================================
// DATA & CONSTANTS (Firma Design Tokens)
// ==========================================

const partnerLogos = [
  { name: "Apex Infra", subtitle: "National Highway & Bridges" },
  { name: "BuildCraft Ltd", subtitle: "Commercial Towers" },
  { name: "Vertex Construction", subtitle: "Industrial Warehouses" },
  { name: "Horizon EPC", subtitle: "Energy & Infrastructure" },
  { name: "UrbanNest", subtitle: "Luxury Residential" },
  { name: "Deccan Works", subtitle: "Metro & Civil Projects" },
];

const bentoFeatures = [
  {
    title: "Milestone & Gantt Scheduling",
    category: "PROJECT CONTROL",
    desc: "Interactive visual timelines with critical path analysis. Auto-flag delays and keep clients updated with instant WhatsApp and email notifications.",
    icon: FolderKanban,
    iconColor: "text-onyx bg-breath",
    badge: "Smart Automation",
    highlightText: "32% Faster Milestone Completion",
    colSpan: "lg:col-span-2",
  },
  {
    title: "Intelligent Quotation & BOQ Engine",
    category: "ESTIMATION",
    desc: "Generate stamped client quotations from standard BOQ items with real-time margin calculation and automated GST breakdown in under 5 minutes.",
    icon: FileSpreadsheet,
    iconColor: "text-caution-text bg-caution-bg",
    badge: "1-Click PDF Export",
    highlightText: "Zero Calculation Leakages",
    colSpan: "lg:col-span-1",
  },
  {
    title: "Geo-Verified Field Muster Roll",
    category: "FIELD OPERATIONS",
    desc: "Empower site supervisors with GPS-fenced daily attendance, skill classification, and real-time photo-backed Daily Progress Reports (DPR).",
    icon: HardHat,
    iconColor: "text-onyx bg-sunfleck",
    badge: "Mobile GPS Fencing",
    highlightText: "Real-time Labour Visibility",
    colSpan: "lg:col-span-1",
  },
  {
    title: "Cashflow & Retention Money Tracking",
    category: "FINANCIAL INTELLIGENCE",
    desc: "Never lose track of Running Account (RA) bills, client retention deductions, and subcontractor advance payments across multiple concurrent projects.",
    icon: CreditCard,
    iconColor: "text-success-text bg-clear-bg",
    badge: "Cashflow Forecast",
    highlightText: "Accurate Margin Protection",
    colSpan: "lg:col-span-2",
  },
  {
    title: "Multi-Role Granular Governance",
    category: "ACCESS CONTROL",
    desc: "Custom role permissions for Managing Directors, Project Managers, Site Engineers, and Sub-contractors to protect sensitive financial rates.",
    icon: ShieldCheck,
    iconColor: "text-onyx bg-mist",
    badge: "Enterprise Security",
    highlightText: "Role-Specific Dashboards",
    colSpan: "lg:col-span-1",
  },
  {
    title: "Offline-First Remote Sync",
    category: "ZERO-DOWNTIME",
    desc: "No internet at remote sites? No problem. Log tasks, labour attendance, and material receipts offline with instant auto-sync once connectivity resumes.",
    icon: Globe,
    iconColor: "text-onyx bg-breath",
    badge: "IndexedDB Powered",
    highlightText: "100% Remote Site Continuity",
    colSpan: "lg:col-span-2",
  },
];

const lifecycleSteps = [
  {
    number: "01",
    title: "Estimate & Bid with Precision",
    description: "Upload architectural requirements and generate accurate Bill of Quantities (BOQ). Apply customizable labor rates, material indexes, and profit margins to issue winning, professional client bids in minutes.",
    icon: FileText,
    tag: "Estimation",
  },
  {
    number: "02",
    title: "Mobilize Crews & Track Daily Milestones",
    description: "Assign site engineers, log GPS-verified worker attendance, dispatch materials, and capture daily site photos. Track critical path milestones and identify schedule bottlenecks before they cost money.",
    icon: Activity,
    tag: "Field Execution",
  },
  {
    number: "03",
    title: "Generate RA Bills & Collect Payments",
    description: "Transform completed milestone verification into certified Running Account (RA) invoices. Monitor retention deductions, tax compliance, and client payment stages with automated settlement reminders.",
    icon: TrendingUp,
    tag: "Cashflow Realization",
  },
];

const pricingTiers = [
  {
    name: "Starter Builder",
    tagline: "For boutique contractors & specialized trade teams.",
    annualMonthlyPrice: "₹1,599",
    annualBilledNote: "₹19,188 billed annually",
    monthlyPrice: "₹1,999",
    monthlyBilledNote: "Billed monthly, cancel anytime",
    features: [
      "Up to 10 active team members",
      "5 concurrent project workspaces",
      "Unlimited client quotations & PDF export",
      "Basic milestone scheduling & daily logs",
      "Mobile-friendly site worker attendance",
      "Standard email & community support",
    ],
    highlight: false,
    ctaText: "Start 14-Day Free Trial",
  },
  {
    name: "Professional Contractor",
    tagline: "The core operating system for growing construction businesses.",
    annualMonthlyPrice: "₹3,999",
    annualBilledNote: "₹47,988 billed annually (Save 20%)",
    monthlyPrice: "₹4,999",
    monthlyBilledNote: "Billed monthly, cancel anytime",
    features: [
      "Up to 50 active team members & engineers",
      "Unlimited active project sites",
      "Advanced BOQ & quotation margin simulator",
      "GPS geo-fenced muster roll & site DPRs",
      "Automated RA billing & retention tracking",
      "Critical-path Gantt timelines & alerts",
      "Full offline sync with automatic recovery",
      "Priority WhatsApp & phone assistance",
    ],
    highlight: true,
    ctaText: "Claim Free Trial",
  },
  {
    name: "Enterprise Infrastructure",
    tagline: "Custom scale for large EPC firms and multi-city developers.",
    annualMonthlyPrice: "₹7,999",
    annualBilledNote: "₹95,988 billed annually",
    monthlyPrice: "₹9,999",
    monthlyBilledNote: "Billed monthly, cancel anytime",
    features: [
      "Unlimited users & subcontractor accounts",
      "Unlimited projects & centralized master dashboard",
      "Multi-company & branch consolidation",
      "Custom ERP & accounting integrations (Tally/SAP)",
      "Dedicated account manager & SLA guarantee",
      "Custom print quotation templates & branding",
      "On-site team training & data migration",
    ],
    highlight: false,
    ctaText: "Talk to Solutions Architect",
  },
];

const testimonials = [
  {
    quote: "FIRMA eliminated the endless WhatsApp updates and lost spreadsheet files across our 18 commercial build sites. Quotation preparation time was cut by over 60%, giving us an edge in winning competitive tenders.",
    author: "Rajeshwar Sen",
    role: "Director of Infrastructure Operations",
    company: "Apex Infra Projects",
    rating: 5,
    metrics: "₹38Cr+ Projects Delivered",
  },
  {
    quote: "The offline mode is what won us over. Our bridge sites in Uttarakhand have zero cell coverage for days. Our site supervisors log muster rolls and concrete cube tests offline, and everything reconciles effortlessly when they reach base.",
    author: "Ananya Deshmukh",
    role: "Chief Construction Estimator",
    company: "BuildCraft Engineering",
    rating: 5,
    metrics: "14 Sites Active on FIRMA",
  },
  {
    quote: "Running Account (RA) billing and retention money tracking used to take our accounts team 4 to 5 days every month. With FIRMA's milestone verification, invoices are approved in hours, vastly accelerating our cash turnaround.",
    author: "Vikramaditya Rao",
    role: "Managing Partner",
    company: "Horizon EPC Group",
    rating: 5,
    metrics: "Saved 4.8L/yr on Material Waste",
  },
];

const faqs = [
  {
    question: "Does FIRMA work when there is no internet on remote construction sites?",
    answer: "Yes, absolutely! FIRMA is built with an offline-first architecture powered by Dexie IndexedDB. Site engineers can log daily worker attendance, site logs, and milestone status without internet. All data queues safely on the device and synchronizes automatically the moment a mobile or Wi-Fi connection is detected.",
  },
  {
    question: "Can we generate client quotations with custom rates, taxes, and company branding?",
    answer: "Yes. FIRMA features a comprehensive Bill of Quantities (BOQ) quotation engine. You can customize labor rates, apply material markup percentages, include SGST/CGST/IGST breakdowns, attach terms and conditions, and export beautifully formatted, stamped PDFs with your company logo in one click.",
  },
  {
    question: "How does role-based access control protect our confidential financial data?",
    answer: "FIRMA provides granular permission levels. Site supervisors and field engineers only see daily tasks, labor logs, and technical drawings. Only authorized Owners and Account Admins can access project margin percentages, client billing records, profitability metrics, and subcontractor purchase rates.",
  },
  {
    question: "Can we import existing project schedules and material catalogs from Excel?",
    answer: "Yes! FIRMA provides pre-formatted Excel/CSV templates to import your existing material lists, item catalogs, vendor details, and historic worker rolls in bulk within minutes during your onboarding setup.",
  },
  {
    question: "What happens after the 14-day free trial ends?",
    answer: "During your 14-day trial, you get full, unrestricted access to all Professional tier features. No credit card is required to begin. When your trial completes, you can choose the plan that best matches your team size, or contact our support team for a tailored enterprise setup.",
  },
];

// ==========================================
// COMPONENT
// ==========================================

export default function HomePage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"annual" | "monthly">("annual");
  const [activeDemoTab, setActiveDemoTab] = useState<"projects" | "quotations" | "workforce" | "finance">("projects");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-stone font-sans antialiased text-onyx selection:bg-onyx selection:text-white">
      {/* ================================================================ */}
      {/* 1. TOP STICKY NAVBAR                                             */}
      {/* ================================================================ */}
      <header className="sticky top-0 z-50 bg-stone/85 backdrop-blur-xl border-b border-pebble/60 transition-all">
        <div className="container-fluid w-full px-4 sm:px-6 lg:px-8 xl:px-12 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => router.push("/")}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-onyx text-white shadow-xs group-hover:scale-105 transition-transform">
              <Building2 className="h-5 w-5 text-breath" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-onyx block leading-tight">
                  FIRMA
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-[4px] bg-breath text-onyx">
                  ERP
                </span>
              </div>
              <span className="text-[11px] font-medium text-ash block leading-none">
                Build Smarter • Deliver Faster
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-ash">
            <button
              type="button"
              onClick={() => scrollToSection("features")}
              className="hover:text-onyx transition cursor-pointer"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("preview")}
              className="hover:text-onyx transition cursor-pointer flex items-center gap-1.5"
            >
              Live Demo
              <span className="h-1.5 w-1.5 rounded-full bg-complete-status animate-ping" />
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("workflow")}
              className="hover:text-onyx transition cursor-pointer"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("pricing")}
              className="hover:text-onyx transition cursor-pointer"
            >
              Pricing
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("faq")}
              className="hover:text-onyx transition cursor-pointer"
            >
              FAQ
            </button>
          </nav>

          {/* Desktop Right CTA Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="rounded-[10px] border border-pebble bg-white px-4 py-2 text-sm font-semibold text-onyx hover:bg-stone transition shadow-2xs cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => router.push("/signup")}
              className="rounded-[10px] bg-onyx px-4.5 py-2 text-sm font-semibold text-white hover:bg-black active:scale-98 transition shadow-xs cursor-pointer flex items-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4 text-breath" />
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-[10px] text-onyx hover:bg-mist transition cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-b border-pebble bg-white/95 backdrop-blur-xl px-6 py-5 space-y-4 shadow-xl">
            <div className="flex flex-col space-y-3 font-medium text-onyx">
              <button
                type="button"
                onClick={() => scrollToSection("features")}
                className="text-left py-1 hover:text-ash"
              >
                Features
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("preview")}
                className="text-left py-1 hover:text-ash"
              >
                Interactive Preview
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("workflow")}
                className="text-left py-1 hover:text-ash"
              >
                Workflow
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("pricing")}
                className="text-left py-1 hover:text-ash"
              >
                Pricing Plans
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("faq")}
                className="text-left py-1 hover:text-ash"
              >
                Frequently Asked Questions
              </button>
            </div>
            <div className="pt-3 border-t border-pebble flex flex-col gap-2">
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="w-full text-center py-2.5 rounded-[10px] border border-pebble font-semibold text-sm text-onyx"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => router.push("/signup")}
                className="w-full text-center py-2.5 rounded-[10px] bg-onyx font-semibold text-sm text-white"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ================================================================ */}
      {/* 2. HERO SECTION WITH AMBIENT LIGHTING & DYNAMIC DEMO             */}
      {/* ================================================================ */}
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Center Header Content */}
          <div className="text-center max-w-3xl mx-auto">
            {/* Shimmer Announcement Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-pebble bg-breath/70 px-4 py-1.5 text-xs font-semibold text-onyx shadow-2xs backdrop-blur-md mb-6 hover:bg-breath transition">
              <Sparkles className="h-3.5 w-3.5 text-complete-status" />
              <span>FIRMA 2.0 Released • Real-Time Site Sync & Automated BOQs</span>
              <ArrowRight className="h-3.5 w-3.5 text-onyx" />
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-onyx leading-[1.15]">
              Build Smarter. Control Costs.
              <br />
              <span className="font-semibold text-complete-status">
                Deliver Without Delays.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg text-ash leading-relaxed max-w-2xl mx-auto">
              The unified construction operating system for contractors, builders, and EPC teams. Coordinate site crews, auto-generate accurate quotations, track milestones, and protect your margins.
            </p>

            {/* CTA Group */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                type="button"
                onClick={() => router.push("/signup")}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-[10px] bg-onyx px-7 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-black active:scale-[0.99] transition cursor-pointer"
              >
                <span>Start 14-Day Free Trial</span>
                <ArrowRight className="h-4 w-4 text-breath" />
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("preview")}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-[10px] border border-pebble bg-white px-6 py-3.5 text-sm font-semibold text-onyx hover:bg-stone transition shadow-2xs cursor-pointer"
              >
                <Play className="h-4 w-4 text-onyx fill-onyx" />
                <span>Explore Interactive Demo</span>
              </button>
            </div>

            {/* Trust Points */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-ash">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-complete-status" /> No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-complete-status" /> 2-minute instant setup
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-complete-status" /> 100% offline-ready
              </span>
            </div>
          </div>

          {/* ================================================================ */}
          {/* INTERACTIVE PRODUCT SHOWCASE FRAME (HERO DEMO)                  */}
          {/* ================================================================ */}
          <div id="preview" className="mt-14 relative scroll-mt-24">
            {/* Window Container */}
            <div className="rounded-[20px] border border-pebble bg-white shadow-xl overflow-hidden">
              {/* Window Titlebar */}
              <div className="bg-onyx text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-pebble/30">
                {/* Traffic lights + simulated URL */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-hazard/80 inline-block" />
                    <span className="h-3 w-3 rounded-full bg-caution/80 inline-block" />
                    <span className="h-3 w-3 rounded-full bg-complete-status/80 inline-block" />
                  </div>
                  <div className="hidden sm:flex items-center gap-2 rounded-[6px] bg-white/10 px-3 py-1 text-xs text-stone font-mono">
                    <Shield className="h-3 w-3 text-breath" />
                    <span>app.firma.build/dashboard/{activeDemoTab}</span>
                  </div>
                </div>

                {/* Interactive Demo Tabs */}
                <div className="flex items-center gap-1 bg-white/10 p-1 rounded-[10px]">
                  <button
                    type="button"
                    onClick={() => setActiveDemoTab("projects")}
                    className={`px-3 py-1 rounded-[6px] text-xs font-semibold transition cursor-pointer ${
                      activeDemoTab === "projects"
                        ? "bg-breath text-onyx shadow-xs"
                        : "text-stone hover:text-white"
                    }`}
                  >
                    Project Tracker
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveDemoTab("quotations")}
                    className={`px-3 py-1 rounded-[6px] text-xs font-semibold transition cursor-pointer ${
                      activeDemoTab === "quotations"
                        ? "bg-breath text-onyx shadow-xs"
                        : "text-stone hover:text-white"
                    }`}
                  >
                    BOQ Quotation
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveDemoTab("workforce")}
                    className={`px-3 py-1 rounded-[6px] text-xs font-semibold transition cursor-pointer ${
                      activeDemoTab === "workforce"
                        ? "bg-breath text-onyx shadow-xs"
                        : "text-stone hover:text-white"
                    }`}
                  >
                    Site Muster Roll
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveDemoTab("finance")}
                    className={`px-3 py-1 rounded-[6px] text-xs font-semibold transition cursor-pointer ${
                      activeDemoTab === "finance"
                        ? "bg-breath text-onyx shadow-xs"
                        : "text-stone hover:text-white"
                    }`}
                  >
                    Cashflow & RA
                  </button>
                </div>
              </div>

              {/* Window Body - Dynamic Tab Views */}
              <div className="p-6 sm:p-8 bg-stone min-h-[380px]">
                {/* TAB 1: PROJECTS TRACKER */}
                {activeDemoTab === "projects" && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-heading-h2 text-onyx">Active Construction Sites</h3>
                          <span className="text-label-sml px-2 py-0.5 rounded-[4px] bg-clear-bg text-success-text font-bold">
                            Live Sync
                          </span>
                        </div>
                        <p className="text-body-sml text-ash mt-0.5">
                          Tracking 3 active project timelines, critical path milestones, and site material budgets.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-ash font-medium">Site Status:</span>
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-success-text bg-clear-bg px-2.5 py-1 rounded-[6px] border border-clear-bg">
                          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                          All Sites Operational
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Project 1 */}
                      <div className="rounded-[10px] border border-pebble bg-white p-5 shadow-2xs">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-label-sml px-2.5 py-1 rounded-[6px] bg-clear-bg text-success-text">
                            Residential Tower B
                          </span>
                          <span className="text-xs font-bold text-onyx">76%</span>
                        </div>
                        <h4 className="font-bold text-onyx text-sm">Skyline Elegance • Wing 2</h4>
                        <p className="text-xs text-ash mt-1">Current Milestone: 14th Floor Slab Pouring</p>
                        <div className="w-full bg-mist rounded-full h-2 mt-4 overflow-hidden">
                          <div className="bg-complete-status h-2 rounded-full" style={{ width: "76%" }} />
                        </div>
                        <div className="mt-4 pt-3 border-t border-pebble/60 flex items-center justify-between text-xs text-ash">
                          <span>Budget: ₹2.4 Cr</span>
                          <span className="text-success-text font-semibold">On Schedule</span>
                        </div>
                      </div>

                      {/* Project 2 */}
                      <div className="rounded-[10px] border border-pebble bg-white p-5 shadow-2xs">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-label-sml px-2.5 py-1 rounded-[6px] bg-caution-bg text-caution-text">
                            Commercial Hub
                          </span>
                          <span className="text-xs font-bold text-onyx">42%</span>
                        </div>
                        <h4 className="font-bold text-onyx text-sm">Prestige Tech Park • Block C</h4>
                        <p className="text-xs text-ash mt-1">Current Milestone: MEP & HVAC Ducting</p>
                        <div className="w-full bg-mist rounded-full h-2 mt-4 overflow-hidden">
                          <div className="bg-at-risk-status h-2 rounded-full" style={{ width: "42%" }} />
                        </div>
                        <div className="mt-4 pt-3 border-t border-pebble/60 flex items-center justify-between text-xs text-ash">
                          <span>Budget: ₹5.1 Cr</span>
                          <span className="text-caution-text font-semibold">Material Dispatched</span>
                        </div>
                      </div>

                      {/* Project 3 */}
                      <div className="rounded-[10px] border border-pebble bg-white p-5 shadow-2xs">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-label-sml px-2.5 py-1 rounded-[6px] bg-breath text-onyx">
                            Villa Enclave
                          </span>
                          <span className="text-xs font-bold text-onyx">91%</span>
                        </div>
                        <h4 className="font-bold text-onyx text-sm">Palm Grove Luxury Plots</h4>
                        <p className="text-xs text-ash mt-1">Current Milestone: Exterior Landscaping & Paint</p>
                        <div className="w-full bg-mist rounded-full h-2 mt-4 overflow-hidden">
                          <div className="bg-complete-status h-2 rounded-full" style={{ width: "91%" }} />
                        </div>
                        <div className="mt-4 pt-3 border-t border-pebble/60 flex items-center justify-between text-xs text-ash">
                          <span>Budget: ₹1.8 Cr</span>
                          <span className="text-complete-status font-semibold">Handover in 12 Days</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: SMART QUOTATIONS */}
                {activeDemoTab === "quotations" && (
                  <div className="space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-heading-h2 text-onyx">Quotation #QT-2025-084</h3>
                          <span className="text-label-sml px-2.5 py-0.5 rounded-[4px] bg-clear-bg text-success-text font-bold">
                            Ready for Approval
                          </span>
                        </div>
                        <p className="text-body-sml text-ash mt-0.5">Client: Horizon Developers • Scope: Structural RCC & Masonry</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => router.push("/signup")}
                          className="px-3 py-1.5 rounded-[6px] bg-onyx text-white text-xs font-semibold flex items-center gap-1.5"
                        >
                          <FileCheck2 className="h-3.5 w-3.5 text-breath" /> Export Stamped PDF
                        </button>
                      </div>
                    </div>

                    {/* Quotation Table */}
                    <div className="rounded-[10px] border border-pebble bg-white overflow-x-auto shadow-2xs">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-mist/50 border-b border-pebble text-onyx font-semibold uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="px-4 py-3">Item Description</th>
                            <th className="px-4 py-3">Quantity</th>
                            <th className="px-4 py-3">Unit Rate</th>
                            <th className="px-4 py-3">Base Amount</th>
                            <th className="px-4 py-3 text-right">Estimated Margin</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-pebble/40 text-onyx">
                          <tr>
                            <td className="px-4 py-3 font-medium">M25 Grade Ready-Mix Concrete</td>
                            <td className="px-4 py-3 font-mono text-ash">180.0 Cu.m</td>
                            <td className="px-4 py-3 font-mono text-ash">₹4,850</td>
                            <td className="px-4 py-3 font-mono font-semibold text-onyx">₹8,73,000</td>
                            <td className="px-4 py-3 text-right font-semibold text-success-text">+18.5%</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 font-medium">Fe 550D TMT Reinforcement Steel</td>
                            <td className="px-4 py-3 font-mono text-ash">14.5 MT</td>
                            <td className="px-4 py-3 font-mono text-ash">₹62,000</td>
                            <td className="px-4 py-3 font-mono font-semibold text-onyx">₹8,99,000</td>
                            <td className="px-4 py-3 text-right font-semibold text-success-text">+15.0%</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 font-medium">Flyash Brick Masonry (1:6 Mortar)</td>
                            <td className="px-4 py-3 font-mono text-ash">420.0 Sq.m</td>
                            <td className="px-4 py-3 font-mono text-ash">₹920</td>
                            <td className="px-4 py-3 font-mono font-semibold text-onyx">₹3,86,400</td>
                            <td className="px-4 py-3 text-right font-semibold text-success-text">+22.0%</td>
                          </tr>
                        </tbody>
                        <tfoot className="bg-mist/40 font-semibold border-t border-pebble">
                          <tr>
                            <td colSpan={3} className="px-4 py-3 text-right text-ash">Subtotal + 18% GST:</td>
                            <td className="px-4 py-3 font-mono text-sm text-onyx font-bold">₹25,46,872</td>
                            <td className="px-4 py-3 text-right text-success-text font-bold">Total Net Profit: ₹4.32L</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 3: WORKFORCE & MUSTER ROLL */}
                {activeDemoTab === "workforce" && (
                  <div className="space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-heading-h2 text-onyx">Site Attendance & Muster Roll</h3>
                          <span className="text-label-sml px-2.5 py-0.5 rounded-[4px] bg-sunfleck text-onyx font-bold">
                            Geo-Fenced Active
                          </span>
                        </div>
                        <p className="text-body-sml text-ash mt-0.5">Location: Skyline Elegance Site GPS [18.5204° N, 73.8567° E]</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <div className="bg-white border border-pebble rounded-[10px] px-3 py-1.5 shadow-2xs">
                          <span className="text-ash">Present Today: </span>
                          <span className="font-bold text-success-text">48 / 52 Workers</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-white border border-pebble rounded-[10px] p-4 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-ash">Masonry & Civil</span>
                          <span className="text-xs font-bold text-success-text bg-clear-bg px-2 py-0.5 rounded-[4px]">22 Present</span>
                        </div>
                        <p className="text-stat-lg text-onyx mt-2">100%</p>
                        <p className="text-[11px] text-ash mt-1">Lead Supervisor: Manoj K.</p>
                      </div>

                      <div className="bg-white border border-pebble rounded-[10px] p-4 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-ash">Steel Benders</span>
                          <span className="text-xs font-bold text-success-text bg-clear-bg px-2 py-0.5 rounded-[4px]">16 Present</span>
                        </div>
                        <p className="text-stat-lg text-onyx mt-2">88%</p>
                        <p className="text-[11px] text-ash mt-1">Lead Supervisor: Suresh R.</p>
                      </div>

                      <div className="bg-white border border-pebble rounded-[10px] p-4 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-ash">MEP Electrical</span>
                          <span className="text-xs font-bold text-success-text bg-clear-bg px-2 py-0.5 rounded-[4px]">10 Present</span>
                        </div>
                        <p className="text-stat-lg text-onyx mt-2">100%</p>
                        <p className="text-[11px] text-ash mt-1">Lead Engineer: Irfan S.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: FINANCE & RA BILLING */}
                {activeDemoTab === "finance" && (
                  <div className="space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-heading-h2 text-onyx">Financial Performance & Billing</h3>
                          <span className="text-label-sml px-2.5 py-0.5 rounded-[4px] bg-clear-bg text-success-text font-bold">
                            Cashflow Positive
                          </span>
                        </div>
                        <p className="text-body-sml text-ash mt-0.5">Automated RA billing reconciliation and retention tracking</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="bg-white border border-pebble rounded-[10px] p-4 shadow-2xs">
                        <span className="text-xs text-ash font-medium">Total Billed (YTD)</span>
                        <p className="text-stat-lg text-onyx mt-1">₹1.84 Cr</p>
                        <span className="text-[11px] text-complete-status font-semibold">↗ 24% vs Last Quarter</span>
                      </div>
                      <div className="bg-white border border-pebble rounded-[10px] p-4 shadow-2xs">
                        <span className="text-xs text-ash font-medium">Collected Receivables</span>
                        <p className="text-stat-lg text-success-text mt-1">₹1.62 Cr</p>
                        <span className="text-[11px] text-ash font-medium">88% Realized</span>
                      </div>
                      <div className="bg-white border border-pebble rounded-[10px] p-4 shadow-2xs">
                        <span className="text-xs text-ash font-medium">Retention Deposit</span>
                        <p className="text-stat-lg text-caution-text mt-1">₹18.5 L</p>
                        <span className="text-[11px] text-ash font-medium">Release on DLP Handover</span>
                      </div>
                      <div className="bg-white border border-pebble rounded-[10px] p-4 shadow-2xs">
                        <span className="text-xs text-ash font-medium">Material Variance</span>
                        <p className="text-stat-lg text-success-text mt-1">-4.2%</p>
                        <span className="text-[11px] text-complete-status font-semibold">Saved ₹7.4L in Wastage</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 3. TRUSTED CONTRACTORS & CLIENT REPUTATION STRIP                 */}
      {/* ================================================================ */}
      <section className="border-y border-pebble/70 bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-eyebrow text-ash mb-6">
            Trusted by Leading Construction, EPC & Contracting Companies
          </p>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-center text-center">
            {partnerLogos.map((partner) => (
              <div
                key={partner.name}
                className="p-3 rounded-[10px] border border-pebble/60 bg-stone hover:bg-white hover:border-pebble transition"
              >
                <p className="text-sm font-bold text-onyx tracking-tight">{partner.name}</p>
                <p className="text-[10px] text-ash mt-0.5 truncate">{partner.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 4. KEY STATS STRIP                                               */}
      {/* ================================================================ */}
      <section className="bg-onyx py-12 relative overflow-hidden text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
          <div>
            <p className="text-stat-lg text-breath">5,000+</p>
            <p className="text-eyebrow-mobile text-stone/80 mt-1">Active Site Workspaces</p>
          </div>
          <div>
            <p className="text-stat-lg text-white">₹1,200 Cr+</p>
            <p className="text-eyebrow-mobile text-stone/80 mt-1">Project Value Managed</p>
          </div>
          <div>
            <p className="text-stat-lg text-sunfleck">38%</p>
            <p className="text-eyebrow-mobile text-stone/80 mt-1">Faster Quotation Turnaround</p>
          </div>
          <div>
            <p className="text-stat-lg text-breath">99.4%</p>
            <p className="text-eyebrow-mobile text-stone/80 mt-1">On-Time Milestone Rate</p>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 5. BENTO GRID FEATURES SECTION                                   */}
      {/* ================================================================ */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 py-24 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block rounded-full bg-breath px-3.5 py-1 text-xs font-bold text-onyx mb-3">
            The FIRMA Advantage
          </span>
          <h2 className="text-display-h1 text-onyx tracking-tight">
            Engineered for the Field. Built for the Office.
          </h2>
          <p className="mt-3 text-body-lg text-ash">
            Eliminate communication gaps between site engineers, quantity surveyors, and project directors with purpose-built construction workflows.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bentoFeatures.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={`${f.colSpan} rounded-[20px] border border-pebble bg-white p-7 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-eyebrow-mobile text-ash">
                      {f.category}
                    </span>
                    <span className="text-label-sml px-2.5 py-0.5 rounded-full bg-mist text-onyx">
                      {f.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-3.5 mb-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-[10px] ${f.iconColor} group-hover:scale-105 transition-transform`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-heading-h2 text-onyx leading-tight">
                      {f.title}
                    </h3>
                  </div>

                  <p className="text-body text-ash leading-relaxed">
                    {f.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-pebble/60 flex items-center justify-between text-xs">
                  <span className="font-semibold text-onyx flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-complete-status" />
                    {f.highlightText}
                  </span>
                  <span className="text-ash group-hover:text-onyx group-hover:translate-x-1 transition-all">
                    Learn more →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================================================================ */}
      {/* 6. WORKFLOW: 3 SIMPLE STEPS                                     */}
      {/* ================================================================ */}
      <section id="workflow" className="bg-breath/30 border-y border-pebble/60 py-24 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block rounded-full bg-white px-3.5 py-1 text-xs font-bold text-onyx mb-3 border border-pebble shadow-2xs">
              End-to-End Construction Cycle
            </span>
            <h2 className="text-display-h1 text-onyx tracking-tight">
              From Blueprints to Final Handover
            </h2>
            <p className="mt-3 text-body-lg text-ash">
              How FIRMA unifies your estimation, field management, and financial realization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {lifecycleSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="rounded-[20px] bg-white p-8 border border-pebble shadow-2xs relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-4xl font-normal text-pebble font-mono">
                        {step.number}
                      </span>
                      <span className="text-label-sml px-3 py-1 rounded-full bg-breath text-onyx">
                        {step.tag}
                      </span>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-onyx text-breath mb-4">
                      <Icon className="h-5 w-5" />
                    </div>

                    <h3 className="text-heading-h2 text-onyx mb-3">
                      {step.title}
                    </h3>
                    <p className="text-body text-ash leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-pebble/60 flex items-center text-xs font-semibold text-complete-status">
                    <span>Verified Project Milestone</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 7. PRICING SECTION WITH ANNUAL/MONTHLY TOGGLE                    */}
      {/* ================================================================ */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 py-24 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block rounded-full bg-breath px-3.5 py-1 text-xs font-bold text-onyx mb-3">
            Simple, Transparent Plans
          </span>
          <h2 className="text-display-h1 text-onyx tracking-tight">
            Predictable Pricing for Growing Builders
          </h2>
          <p className="mt-3 text-body-lg text-ash">
            No hidden setup charges. Switch plans or cancel anytime with zero lock-in contracts.
          </p>

          {/* Billing Switcher Toggle */}
          <div className="mt-8 inline-flex items-center gap-2 p-1.5 rounded-[10px] bg-mist border border-pebble">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded-[6px] text-xs font-bold transition cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-white text-onyx shadow-2xs"
                  : "text-ash hover:text-onyx"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("annual")}
              className={`px-4 py-2 rounded-[6px] text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                billingCycle === "annual"
                  ? "bg-onyx text-white shadow-2xs"
                  : "text-ash hover:text-onyx"
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] bg-sunfleck text-onyx px-1.5 py-0.5 rounded-[4px] font-black">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-[20px] p-8 border transition flex flex-col justify-between relative ${
                tier.highlight
                  ? "bg-onyx border-onyx text-white shadow-xl scale-[1.02] z-10"
                  : "bg-white border-pebble text-onyx shadow-2xs"
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-sunfleck px-4 py-1 text-xs font-bold text-onyx uppercase tracking-wide shadow-xs">
                  <Sparkles className="h-3 w-3" /> Most Popular Choice
                </div>
              )}

              <div>
                <h3 className={`text-heading-h2 ${tier.highlight ? "text-white" : "text-onyx"}`}>
                  {tier.name}
                </h3>
                <p className={`text-body-sml mt-2 leading-relaxed ${tier.highlight ? "text-stone/80" : "text-ash"}`}>
                  {tier.tagline}
                </p>

                {/* Price block */}
                <div className="mt-6 flex items-baseline gap-1">
                  <span className={`text-stat-lg ${tier.highlight ? "text-white" : "text-onyx"}`}>
                    {billingCycle === "annual" ? tier.annualMonthlyPrice : tier.monthlyPrice}
                  </span>
                  <span className={`text-xs ${tier.highlight ? "text-stone/70" : "text-ash"}`}>
                    / month
                  </span>
                </div>
                <p className={`text-xs mt-1 font-medium ${tier.highlight ? "text-sunfleck" : "text-ash"}`}>
                  {billingCycle === "annual" ? tier.annualBilledNote : tier.monthlyBilledNote}
                </p>

                {/* Features list */}
                <div className="mt-8 space-y-3">
                  <p className={`text-eyebrow-mobile ${tier.highlight ? "text-breath" : "text-ash"}`}>
                    What is included:
                  </p>
                  {tier.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5 text-xs">
                      <CheckCircle2
                        className={`h-4 w-4 shrink-0 mt-0.5 ${
                          tier.highlight ? "text-breath" : "text-complete-status"
                        }`}
                      />
                      <span className={tier.highlight ? "text-stone/90" : "text-onyx/80"}>
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push("/signup")}
                className={`mt-8 w-full rounded-[10px] py-3 text-sm font-semibold transition shadow-2xs cursor-pointer ${
                  tier.highlight
                    ? "bg-white text-onyx hover:bg-stone"
                    : "bg-onyx text-white hover:bg-black"
                }`}
              >
                {tier.ctaText}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================ */}
      {/* 8. CLIENT TESTIMONIALS & CASE STUDIES                           */}
      {/* ================================================================ */}
      <section className="bg-white border-y border-pebble/70 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block rounded-full bg-sunfleck px-3.5 py-1 text-xs font-bold text-onyx mb-3">
              Real Contractor Feedback
            </span>
            <h2 className="text-display-h1 text-onyx tracking-tight">
              Trusted on Ground by Top Builders
            </h2>
            <p className="mt-3 text-body-lg text-ash">
              See how civil engineers and project directors run high-efficiency construction with FIRMA.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.author}
                className="rounded-[20px] bg-stone p-8 border border-pebble shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-caution mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-caution" />
                    ))}
                  </div>
                  <p className="text-body text-onyx leading-relaxed italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-pebble/60">
                  <p className="font-bold text-onyx text-sm">{t.author}</p>
                  <p className="text-xs text-ash">{t.role} • {t.company}</p>
                  <div className="mt-2 inline-block text-label-sml px-2 py-0.5 rounded-[4px] bg-clear-bg text-success-text">
                    {t.metrics}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 9. INTERACTIVE FAQ ACCORDION                                     */}
      {/* ================================================================ */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 py-24 scroll-mt-20">
        <div className="text-center mb-12">
          <span className="inline-block rounded-full bg-breath px-3.5 py-1 text-xs font-bold text-onyx mb-3">
            Frequently Asked Questions
          </span>
          <h2 className="text-display-h1 text-onyx tracking-tight">
            Have Questions? We Have Answers.
          </h2>
          <p className="mt-3 text-body-lg text-ash">
            Everything you need to know about setting up and running FIRMA for your projects.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={faq.question}
                className="rounded-[10px] border border-pebble bg-white overflow-hidden shadow-2xs transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 font-bold text-onyx hover:text-ash transition cursor-pointer"
                >
                  <span className="text-heading-h3">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-ash transition-transform ${
                      isOpen ? "rotate-180 text-onyx" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-body text-ash leading-relaxed border-t border-pebble/60 bg-stone/40">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ================================================================ */}
      {/* 10. FINAL BOTTOM CALL-TO-ACTION                                 */}
      {/* ================================================================ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <div className="rounded-[20px] bg-onyx p-10 sm:p-16 text-center text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold text-stone mb-6 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-sunfleck" /> Start in 2 Minutes • No Credit Card Needed
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-white tracking-tight leading-tight">
              Ready to Upgrade Your Construction Business?
            </h2>
            <p className="mt-4 text-body-lg text-stone/80 leading-relaxed">
              Join 5,000+ contractors who run predictable, profitable, and on-time builds with Mini FIRMA.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                type="button"
                onClick={() => router.push("/signup")}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-[10px] bg-white px-8 py-3.5 text-sm font-bold text-onyx hover:bg-stone transition shadow-md cursor-pointer"
              >
                <span>Create Free Account</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="w-full sm:w-auto rounded-[10px] border border-white/30 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition cursor-pointer"
              >
                Sign In to Existing Workspace
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 11. RICH FOOTER                                                 */}
      {/* ================================================================ */}
      <footer className="border-t border-pebble/70 bg-white py-14 text-ash">
        <div className="container-fluid w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Col 1: Brand Info */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-onyx text-white">
                  <Building2 className="h-5 w-5 text-breath" />
                </div>
                <span className="text-lg font-black tracking-tight text-onyx">FIRMA</span>
              </div>
              <p className="text-xs text-ash max-w-sm leading-relaxed">
                The modern Construction Management ERP platform built to unite office estimators and on-site field engineers for seamless execution.
              </p>
              <div className="flex items-center gap-2 text-xs text-complete-status font-semibold">
                <span className="h-2 w-2 rounded-full bg-complete-status animate-pulse" />
                <span>All Systems Operational • Cloud Sync Active</span>
              </div>
            </div>

            {/* Col 2: Product */}
            <div className="space-y-3 text-xs">
              <p className="font-bold uppercase tracking-wider text-onyx">Product</p>
              <ul className="space-y-2">
                <li><button type="button" onClick={() => scrollToSection("features")} className="hover:text-onyx">Project Timeline</button></li>
                <li><button type="button" onClick={() => scrollToSection("features")} className="hover:text-onyx">Quotation Engine</button></li>
                <li><button type="button" onClick={() => scrollToSection("features")} className="hover:text-onyx">Site Attendance</button></li>
                <li><button type="button" onClick={() => scrollToSection("features")} className="hover:text-onyx">RA Billing Tracker</button></li>
                <li><button type="button" onClick={() => scrollToSection("features")} className="hover:text-onyx">Offline Sync</button></li>
              </ul>
            </div>

            {/* Col 3: Solutions */}
            <div className="space-y-3 text-xs">
              <p className="font-bold uppercase tracking-wider text-onyx">Solutions</p>
              <ul className="space-y-2">
                <li><span className="text-ash">General Contractors</span></li>
                <li><span className="text-ash">EPC Infrastructure</span></li>
                <li><span className="text-ash">Residential Builders</span></li>
                <li><span className="text-ash">MEP Specialists</span></li>
                <li><span className="text-ash">Interior Fitouts</span></li>
              </ul>
            </div>

            {/* Col 4: Company & Legal */}
            <div className="space-y-3 text-xs">
              <p className="font-bold uppercase tracking-wider text-onyx">Company</p>
              <ul className="space-y-2">
                <li><button type="button" onClick={() => router.push("/login")} className="hover:text-onyx">About Us</button></li>
                <li><button type="button" onClick={() => router.push("/login")} className="hover:text-onyx">Customer Stories</button></li>
                <li><button type="button" onClick={() => router.push("/login")} className="hover:text-onyx">Privacy Policy</button></li>
                <li><button type="button" onClick={() => router.push("/login")} className="hover:text-onyx">Terms of Service</button></li>
                <li><button type="button" onClick={() => router.push("/login")} className="hover:text-onyx">Security & Encryption</button></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-pebble/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ash">
            <p>&copy; {new Date().getFullYear()} FIRMA Systems Inc. All rights reserved.</p>
            <p>Built for a stronger, smarter infrastructure tomorrow.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}