"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Building2,
  FolderKanban,
  Users,
  FileText,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  Check,
  ShieldCheck,
  HardHat,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Play,
  Clock,
  Briefcase,
  Search,
  Bell,
  Sparkles,
  Calendar,
  Layers,
  Wrench,
  Award,
  ExternalLink,
  Quote,
  CheckSquare,
  ClipboardList,
  UserCheck,
  Sliders,
} from "lucide-react";

// ============================================================================
// DATA STRUCTURES & DEFINITIONS
// ============================================================================

// 1. Core Feature Cards (BUILT THE WAY YOU WORK)
const coreFeatures = [
  {
    id: "projects",
    title: "Projects & Sites",
    description: "Create projects, manage sites, track progress and keep everything organized.",
    icon: FolderKanban,
    link: "/projects",
    iconBg: "bg-breath text-forest",
  },
  {
    id: "tenders",
    title: "Tenders & Contractors",
    description: "Invite contractors, manage bids and award tenders with confidence.",
    icon: Briefcase,
    link: "/tenders",
    iconBg: "bg-[#e2f0e8] text-[#0e382b]",
  },
  {
    id: "jobs",
    title: "Jobs & Scheduling",
    description: "Create jobs, assign to crews and schedule work across sites.",
    icon: Calendar,
    link: "/scheduling",
    iconBg: "bg-[#e8ebff] text-[#243bb5]",
  },
  {
    id: "execution",
    title: "Field Execution",
    description: "Enable field teams to update work, log time, upload photos and raise RFIs.",
    icon: ClipboardList,
    link: "/rfis",
    iconBg: "bg-[#e3f2fd] text-[#0d47a1]",
  },
  {
    id: "documents",
    title: "Documents & Reports",
    description: "Store all project documents and generate insightful reports.",
    icon: FileText,
    link: "/documents",
    iconBg: "bg-[#fef3c7] text-[#92400e]",
  },
  {
    id: "people",
    title: "People & Teams",
    description: "Manage contractors, site managers, field workers and track productivity.",
    icon: Users,
    link: "/users",
    iconBg: "bg-[#e0f2fe] text-[#0369a1]",
  },
];

// 2. Horizontal Construction Pipeline (A Smarter Way to Build)
const pipelineSteps = [
  {
    id: "project",
    name: "Project",
    description: "Create and plan projects",
    icon: Building2,
    link: "/projects",
  },
  {
    id: "tender",
    name: "Tender",
    description: "Invite and award contractors",
    icon: FileText,
    link: "/tenders",
  },
  {
    id: "job",
    name: "Job",
    description: "Create jobs and assign crews",
    icon: Wrench,
    link: "/jobs",
  },
  {
    id: "schedule",
    name: "Schedule",
    description: "Plan work across sites",
    icon: Calendar,
    link: "/scheduling",
  },
  {
    id: "field",
    name: "Field Work",
    description: "Track progress in real-time",
    icon: HardHat,
    link: "/contractors",
  },
  {
    id: "handover",
    name: "Handover",
    description: "Complete and deliver successfully",
    icon: Award,
    link: "/reports",
  },
];

// 3. Role-Based Cards (Built for Every Role)
const roleCards = [
  {
    role: "Owner",
    tagline: "Get a complete view of your business.",
    image: "/images/role_owner.jpg",
    link: "/dashboard",
    badge: "Executive",
  },
  {
    role: "Project Manager",
    tagline: "Manage projects, jobs and teams.",
    image: "/images/role_pm.jpg",
    link: "/projects",
    badge: "Planning & Control",
  },
  {
    role: "Site Manager",
    tagline: "Oversee daily site operations.",
    image: "/images/role_site_manager.jpg",
    link: "/sites",
    badge: "Ground Operations",
  },
  {
    role: "Field Worker",
    tagline: "Update work, log time and stay connected.",
    image: "/images/role_field_worker.jpg",
    link: "/contractors",
    badge: "Field Mobile",
  },
];

// 4. Partner Builders / Social Proof
const partnerLogos = [
  {
    name: "L&T Construction",
    subtitle: "Heavy Civil & Buildings",
    icon: (
      <svg className="h-7 w-7 fill-current" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="8" fill="none" />
        <path d="M32 30v40h36M32 50h24" stroke="currentColor" strokeWidth="8" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    name: "TATA PROJECTS",
    subtitle: "Infrastructure Leaders",
    icon: (
      <span className="text-sm font-black tracking-widest uppercase border-b-2 border-current pb-0.5">
        TATA
      </span>
    ),
  },
  {
    name: "Shapoorji Pallonji",
    subtitle: "Engineering & Construction",
    icon: (
      <div className="flex items-center gap-1 font-serif font-black text-base tracking-tighter">
        <span className="border-2 border-current rounded-sm px-1 py-0.2">SP</span>
      </div>
    ),
  },
  {
    name: "Godrej CONSTRUCTION",
    subtitle: "Real Estate & EPC",
    icon: (
      <span className="font-serif italic font-bold text-base tracking-tight">
        Godrej
      </span>
    ),
  },
  {
    name: "DLF",
    subtitle: "Building India",
    icon: (
      <div className="flex items-center gap-1 font-black text-sm tracking-wider">
        <span className="inline-block w-3 h-3 bg-current rotate-45" />
        <span>DLF</span>
      </div>
    ),
  },
  {
    name: "BRIGADE",
    subtitle: "Commercial & Residential",
    icon: (
      <div className="flex items-center gap-1 font-bold text-sm tracking-widest">
        <span className="w-1.5 h-4 bg-current" />
        <span className="w-1.5 h-3 bg-current" />
        <span className="w-1.5 h-5 bg-current" />
        <span className="ml-1">BRIGADE</span>
      </div>
    ),
  },
];

export default function HomePage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [activePartnerIndex, setActivePartnerIndex] = useState(0);

  // Mockup Project Progress Active Tab state
  const [mockupFilter, setMockupFilter] = useState("all");

  const scrollTo = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-stone font-sans text-onyx selection:bg-breath selection:text-forest">
      {/* ==================================================================== */}
      {/* 1. TOP NAVBAR                                                        */}
      {/* ==================================================================== */}
      <header className="sticky top-0 z-50 border-b border-pebble/70 bg-stone/90 backdrop-blur-md transition-all">
        <div className="container-fluid w-full px-4 sm:px-6 lg:px-8 xl:px-12 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <div
            onClick={() => router.push("/")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-onyx text-white shadow-xs group-hover:scale-105 transition-transform">
              <Building2 className="h-5 w-5 text-breath" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-onyx block leading-tight">
                  FIRMA
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-[4px] bg-breath text-forest">
                  ERP
                </span>
              </div>
              <span className="text-[11px] font-medium text-ash block leading-none">
                Build Smarter. Deliver Faster.
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-onyx/80">
            <div className="relative group">
              <button
                type="button"
                onClick={() => scrollTo("features")}
                className="flex items-center gap-1 hover:text-onyx transition cursor-pointer py-2"
              >
                <span>Product</span>
                <ChevronDown className="h-3.5 w-3.5 text-ash group-hover:text-onyx transition-transform group-hover:rotate-180" />
              </button>
            </div>

            <div className="relative group">
              <button
                type="button"
                onClick={() => scrollTo("roles")}
                className="flex items-center gap-1 hover:text-onyx transition cursor-pointer py-2"
              >
                <span>Solutions</span>
                <ChevronDown className="h-3.5 w-3.5 text-ash group-hover:text-onyx transition-transform group-hover:rotate-180" />
              </button>
            </div>

            <div className="relative group">
              <button
                type="button"
                onClick={() => scrollTo("pipeline")}
                className="flex items-center gap-1 hover:text-onyx transition cursor-pointer py-2"
              >
                <span>Resources</span>
                <ChevronDown className="h-3.5 w-3.5 text-ash group-hover:text-onyx transition-transform group-hover:rotate-180" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => scrollTo("pricing-banner")}
              className="hover:text-onyx transition cursor-pointer"
            >
              Pricing
            </button>

            <button
              type="button"
              onClick={() => scrollTo("roles")}
              className="hover:text-onyx transition cursor-pointer"
            >
              About
            </button>
          </nav>

          {/* Right Actions: Sign In & Start Free Trial */}
          <div className="hidden sm:flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-sm font-semibold text-onyx hover:text-forest px-3 py-2 transition cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => router.push("/signup")}
              className="rounded-[10px] bg-onyx px-5 py-2.5 text-sm font-semibold text-white hover:bg-forest transition shadow-xs cursor-pointer flex items-center gap-2 group"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="h-4 w-4 text-breath group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex sm:hidden items-center">
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
          <div className="sm:hidden border-b border-pebble bg-white px-6 py-5 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col space-y-3 font-medium text-onyx">
              <button
                type="button"
                onClick={() => scrollTo("features")}
                className="text-left py-1.5 font-semibold text-onyx hover:text-forest"
              >
                Product Features
              </button>
              <button
                type="button"
                onClick={() => scrollTo("pipeline")}
                className="text-left py-1.5 hover:text-forest"
              >
                How It Works
              </button>
              <button
                type="button"
                onClick={() => scrollTo("roles")}
                className="text-left py-1.5 hover:text-forest"
              >
                Built for Every Role
              </button>
              <button
                type="button"
                onClick={() => scrollTo("pricing-banner")}
                className="text-left py-1.5 hover:text-forest"
              >
                Proven Results
              </button>
            </div>
            <div className="pt-3 border-t border-pebble flex flex-col gap-2.5">
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

      {/* ==================================================================== */}
      {/* 2. HERO SECTION                                                      */}
      {/* ==================================================================== */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column (5 cols): Typography, CTAs & Value Props */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-breath bg-[#f0f6f2] px-3.5 py-1 text-xs font-semibold text-forest mb-6 w-fit shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-[#009300] animate-pulse" />
                <span>All-in-One Construction Management</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight text-onyx leading-[1.08]">
                Plan. Build.
                <br />
                Track. Deliver.
                <br />
                <span className="text-forest underline decoration-breath/60 decoration-wavy decoration-2">
                  Together.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mt-5 text-base sm:text-lg text-ash leading-relaxed max-w-lg">
                FIRMA helps builders and contractors manage projects, tenders, sites, teams and costs — all in one place.
              </p>

              {/* Value Checkmarks */}
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm font-semibold text-onyx">
                <span className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-clear-bg text-forest">
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  </span>
                  <span>Reduce delays</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-clear-bg text-forest">
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  </span>
                  <span>Control costs</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-clear-bg text-forest">
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  </span>
                  <span>Keep teams aligned</span>
                </span>
              </div>

              {/* CTAs */}
              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => router.push("/signup")}
                  className="flex items-center justify-center gap-2 rounded-[10px] bg-onyx px-7 py-3.5 text-sm font-bold text-white shadow-md hover:bg-forest active:scale-[0.99] transition cursor-pointer group"
                >
                  <span>Start Free Trial</span>
                  <ArrowRight className="h-4 w-4 text-breath group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  type="button"
                  onClick={() => setDemoModalOpen(true)}
                  className="flex items-center justify-center gap-2 rounded-[10px] border border-pebble bg-white px-6 py-3.5 text-sm font-bold text-onyx hover:bg-stone transition shadow-2xs cursor-pointer"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-stone border border-pebble">
                    <Play className="h-3 w-3 text-onyx fill-onyx ml-0.5" />
                  </div>
                  <span>Watch Demo</span>
                </button>
              </div>

              {/* Micro Trust Tags */}
              <div className="mt-5 flex items-center gap-6 text-xs text-ash font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-forest" />
                  <span>No credit card required</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-forest" />
                  <span>Setup in 2 minutes</span>
                </span>
              </div>
            </div>

            {/* Right Column (7 cols): High-Fidelity App Mockup */}
            <div className="lg:col-span-7 relative">
              <div className="rounded-[20px] border border-pebble bg-white shadow-2xl overflow-hidden transition-all">
                {/* Mockup Top Window Bar */}
                <div className="border-b border-pebble/60 bg-[#f7f6f3] px-4 py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]/80 inline-block" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]/80 inline-block" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#10b981]/80 inline-block" />
                    </div>
                    <span className="text-[11px] font-bold text-ash tracking-tight ml-2">
                      FIRMA Workspace • Live Project Cloud
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-[6px] border border-pebble text-[11px] text-ash">
                      <Search className="h-3 w-3" />
                      <span>Search projects, sites, RFIs...</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Bell className="h-3.5 w-3.5 text-ash" />
                        <span className="absolute -top-1 -right-1 h-1.5 w-1.5 rounded-full bg-forest" />
                      </div>
                      <div className="h-6 w-6 rounded-full bg-forest text-white text-[10px] font-bold flex items-center justify-center">
                        V
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mockup Workspace Body */}
                <div className="grid grid-cols-12 min-h-[380px] sm:min-h-[420px]">
                  {/* Mini Sidebar */}
                  <div className="col-span-3 border-r border-pebble/60 bg-[#faf9f7] p-3 hidden sm:flex flex-col justify-between text-[11px]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 px-2 py-1 mb-2">
                        <div className="h-4 w-4 rounded bg-forest text-white flex items-center justify-center text-[9px] font-black">
                          F
                        </div>
                        <span className="font-bold text-onyx tracking-tight">FIRMA OS</span>
                      </div>

                      <div className="px-2 py-1 rounded-[6px] bg-breath text-forest font-bold flex items-center gap-2">
                        <FolderKanban className="h-3.5 w-3.5" />
                        <span>Dashboard</span>
                      </div>
                      <div className="px-2 py-1 rounded-[6px] text-ash hover:text-onyx flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5" />
                        <span>Projects</span>
                      </div>
                      <div className="px-2 py-1 rounded-[6px] text-ash hover:text-onyx flex items-center gap-2">
                        <Briefcase className="h-3.5 w-3.5" />
                        <span>Tenders</span>
                      </div>
                      <div className="px-2 py-1 rounded-[6px] text-ash hover:text-onyx flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Scheduling</span>
                      </div>
                      <div className="px-2 py-1 rounded-[6px] text-ash hover:text-onyx flex items-center gap-2">
                        <HardHat className="h-3.5 w-3.5" />
                        <span>Sites & Crew</span>
                      </div>
                      <div className="px-2 py-1 rounded-[6px] text-ash hover:text-onyx flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5" />
                        <span>RFIs & BOQ</span>
                      </div>
                      <div className="px-2 py-1 rounded-[6px] text-ash hover:text-onyx flex items-center gap-2">
                        <CreditCard className="h-3.5 w-3.5" />
                        <span>RA Billing</span>
                      </div>
                    </div>

                    <div className="p-2 rounded-[8px] bg-white border border-pebble text-[10px]">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-onyx">Cloud Sync</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-complete-status" />
                      </div>
                      <p className="text-ash mt-0.5">Online • 14 Sites Live</p>
                    </div>
                  </div>

                  {/* Main Dashboard Panel */}
                  <div className="col-span-12 sm:col-span-9 p-4 sm:p-5 flex flex-col justify-between space-y-4">
                    {/* Welcome Banner */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-onyx flex items-center gap-1.5">
                          <span>Good morning, Vaahul!</span>
                          <span className="text-sm">👋</span>
                        </h3>
                        <p className="text-xs text-ash">
                          Here&apos;s what&apos;s happening with your projects today.
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full border border-pebble bg-stone text-onyx">
                        Last 30 days ▾
                      </span>
                    </div>

                    {/* 4 Stat Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="p-2.5 rounded-[10px] bg-[#f2f7f4] border border-[#d8e8dc]">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-black text-forest">12</span>
                          <span className="h-2 w-2 rounded-full bg-complete-status" />
                        </div>
                        <p className="text-[10px] font-bold text-onyx mt-0.5">Active Projects</p>
                      </div>

                      <div className="p-2.5 rounded-[10px] bg-[#eff6ff] border border-[#bfdbfe]">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-black text-[#1d4ed8]">8</span>
                          <span className="h-2 w-2 rounded-full bg-[#3b82f6]" />
                        </div>
                        <p className="text-[10px] font-bold text-onyx mt-0.5">Action Items</p>
                      </div>

                      <div className="p-2.5 rounded-[10px] bg-[#fef2f2] border border-[#fecaca]">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-black text-[#dc2626]">4</span>
                          <span className="h-2 w-2 rounded-full bg-[#ef4444]" />
                        </div>
                        <p className="text-[10px] font-bold text-onyx mt-0.5">Pending RFIs</p>
                      </div>

                      <div className="p-2.5 rounded-[10px] bg-[#fefce8] border border-[#fef08a]">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-black text-[#a16207]">₹12.4L</span>
                          <span className="h-2 w-2 rounded-full bg-[#eab308]" />
                        </div>
                        <p className="text-[10px] font-bold text-onyx mt-0.5">Total Value</p>
                      </div>
                    </div>

                    {/* Project Progress Table Card */}
                    <div className="rounded-[10px] border border-pebble bg-[#faf9f7] p-3 text-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-onyx">Project Progress</span>
                        <span className="text-[10px] font-semibold text-forest cursor-pointer hover:underline">
                          View All →
                        </span>
                      </div>

                      <div className="space-y-2">
                        {/* Project 1 */}
                        <div className="grid grid-cols-12 items-center gap-2 text-[11px] bg-white p-2 rounded-[6px] border border-pebble/60">
                          <span className="col-span-4 font-semibold text-onyx truncate">
                            Skyline Apartments
                          </span>
                          <div className="col-span-4 flex items-center gap-1.5">
                            <div className="w-full bg-mist rounded-full h-1.5 overflow-hidden">
                              <div className="bg-forest h-1.5 rounded-full" style={{ width: "68%" }} />
                            </div>
                            <span className="text-[10px] text-ash font-medium">68%</span>
                          </div>
                          <div className="col-span-2 text-center">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-clear-bg text-forest">
                              In Progress
                            </span>
                          </div>
                          <span className="col-span-2 text-right text-[10px] text-ash truncate">
                            Main Site
                          </span>
                        </div>

                        {/* Project 2 */}
                        <div className="grid grid-cols-12 items-center gap-2 text-[11px] bg-white p-2 rounded-[6px] border border-pebble/60">
                          <span className="col-span-4 font-semibold text-onyx truncate">
                            Green Valley Villas
                          </span>
                          <div className="col-span-4 flex items-center gap-1.5">
                            <div className="w-full bg-mist rounded-full h-1.5 overflow-hidden">
                              <div className="bg-[#f59e0b] h-1.5 rounded-full" style={{ width: "42%" }} />
                            </div>
                            <span className="text-[10px] text-ash font-medium">42%</span>
                          </div>
                          <div className="col-span-2 text-center">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#fef3c7] text-[#92400e]">
                              In Progress
                            </span>
                          </div>
                          <span className="col-span-2 text-right text-[10px] text-ash truncate">
                            Sector 21
                          </span>
                        </div>

                        {/* Project 3 */}
                        <div className="grid grid-cols-12 items-center gap-2 text-[11px] bg-white p-2 rounded-[6px] border border-pebble/60">
                          <span className="col-span-4 font-semibold text-onyx truncate">
                            City Mall Renovation
                          </span>
                          <div className="col-span-4 flex items-center gap-1.5">
                            <div className="w-full bg-mist rounded-full h-1.5 overflow-hidden">
                              <div className="bg-forest h-1.5 rounded-full" style={{ width: "91%" }} />
                            </div>
                            <span className="text-[10px] text-ash font-medium">91%</span>
                          </div>
                          <div className="col-span-2 text-center">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-breath text-forest">
                              Near Complete
                            </span>
                          </div>
                          <span className="col-span-2 text-right text-[10px] text-ash truncate">
                            Downtown
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Today's Schedule Card */}
                    <div className="rounded-[10px] border border-pebble bg-[#faf9f7] p-3 text-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-onyx">Today&apos;s Schedule</span>
                        <span className="text-[10px] font-semibold text-forest cursor-pointer hover:underline">
                          View All →
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
                        <div className="bg-white p-2 rounded-[6px] border border-pebble/60">
                          <div className="flex items-center gap-1 text-forest font-bold">
                            <Clock className="h-3 w-3" /> 9:00 AM
                          </div>
                          <p className="font-semibold text-onyx mt-1">Electrical Installation</p>
                          <p className="text-ash truncate">Skyline Apartments</p>
                        </div>
                        <div className="bg-white p-2 rounded-[6px] border border-pebble/60">
                          <div className="flex items-center gap-1 text-forest font-bold">
                            <Clock className="h-3 w-3" /> 11:30 AM
                          </div>
                          <p className="font-semibold text-onyx mt-1">Plumbing Milestone</p>
                          <p className="text-ash truncate">Green Valley Villas</p>
                        </div>
                        <div className="bg-white p-2 rounded-[6px] border border-pebble/60">
                          <div className="flex items-center gap-1 text-forest font-bold">
                            <Clock className="h-3 w-3" /> 2:00 PM
                          </div>
                          <p className="font-semibold text-onyx mt-1">Quality Inspection</p>
                          <p className="text-ash truncate">City Mall • Block B</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Handwritten Style Annotation & Arrow */}
              <div className="mt-3 flex justify-end items-center gap-2 pr-6">
                <svg className="w-16 h-8 text-forest/80 stroke-current -rotate-6" viewBox="0 0 100 50" fill="none">
                  <path
                    d="M10 40 Q 50 10 90 25"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="1 0"
                  />
                  <polygon points="85,15 95,25 82,32" fill="currentColor" />
                </svg>
                <span
                  style={{ fontFamily: "'Caveat', cursive, 'Brush Script MT', 'Switzer', sans-serif" }}
                  className="text-forest text-xl sm:text-2xl font-bold tracking-wide transform -rotate-2"
                >
                  Everything you need. In one place.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 3. PARTNER / TRUST LOGO STRIP                                        */}
      {/* ==================================================================== */}
      <section className="border-y border-pebble/70 bg-white py-8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-xs uppercase font-bold tracking-widest text-ash shrink-0">
              TRUSTED BY CONSTRUCTION PROFESSIONALS ACROSS INDIA
            </p>

            {/* Logos Carousel Row */}
            <div className="flex items-center gap-8 sm:gap-12 overflow-x-auto py-1 scrollbar-none opacity-85">
              {partnerLogos.map((partner) => (
                <div
                  key={partner.name}
                  className="flex items-center gap-2 text-onyx/75 hover:text-onyx transition group shrink-0"
                >
                  {partner.icon}
                  <span className="text-xs font-bold tracking-tight">{partner.name}</span>
                </div>
              ))}
            </div>

            {/* Slider arrows */}
            <div className="hidden lg:flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                className="p-1.5 rounded-full border border-pebble text-ash hover:text-onyx hover:bg-stone transition cursor-pointer"
                aria-label="Previous partner"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className="p-1.5 rounded-full border border-pebble text-ash hover:text-onyx hover:bg-stone transition cursor-pointer"
                aria-label="Next partner"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. CORE FEATURES (BUILT THE WAY YOU WORK)                            */}
      {/* ==================================================================== */}
      <section id="features" className="py-20 scroll-mt-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-breath bg-[#f0f6f2] px-3.5 py-1 text-xs font-bold text-forest mb-3">
                BUILT THE WAY YOU WORK
              </div>
              <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-onyx leading-tight">
                Everything You Need to
                <br />
                Manage Construction Projects
              </h2>
              <p className="mt-2 text-sm sm:text-base text-ash max-w-2xl">
                From tendering to handover, FIRMA covers the entire project lifecycle with powerful, easy-to-use tools.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/projects")}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-onyx hover:text-forest transition cursor-pointer self-start md:self-end"
            >
              <span>Explore All Features</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* 6 Feature Cards Grid (3 cols x 2 rows) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreFeatures.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.id}
                  onClick={() => router.push(f.link)}
                  className="rounded-[16px] border border-pebble bg-white p-7 shadow-2xs hover:shadow-md hover:border-forest/40 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    {/* Icon container */}
                    <div className={`h-12 w-12 rounded-[12px] ${f.iconBg} flex items-center justify-center mb-5 group-hover:scale-105 transition-transform`}>
                      <Icon className="h-6 w-6 stroke-[1.8]" />
                    </div>

                    <h3 className="text-lg font-bold text-onyx mb-2 group-hover:text-forest transition-colors">
                      {f.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-ash leading-relaxed">
                      {f.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-pebble/40 flex justify-end">
                    <span className="p-1 rounded-full text-ash group-hover:text-forest group-hover:translate-x-1 transition-all">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 5. WORKFLOW PIPELINE (A SMARTER WAY TO BUILD)                        */}
      {/* ==================================================================== */}
      <section id="pipeline" className="border-t border-pebble/70 bg-[#faf9f7] py-20 scroll-mt-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-breath bg-[#f0f6f2] px-3.5 py-1 text-xs font-bold text-forest mb-3">
              SIMPLE, CONNECTED, POWERFUL
            </div>
            <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-onyx">
              A Smarter Way to Build
            </h2>
            <p className="mt-3 text-sm sm:text-base text-ash leading-relaxed">
              From opportunity to handover — FIRMA connects every stage of your construction project, so nothing falls through the cracks.
            </p>
          </div>

          {/* Connected Horizontal Pipeline */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 relative">
            {pipelineSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="relative flex flex-col items-center text-center">
                  <div
                    onClick={() => router.push(step.link)}
                    className="w-full rounded-[14px] bg-white border border-pebble p-5 shadow-2xs hover:shadow-md hover:border-forest/50 transition-all cursor-pointer group flex flex-col items-center"
                  >
                    <div className="h-12 w-12 rounded-[10px] bg-clear-bg text-forest flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Icon className="h-5 w-5 stroke-[2]" />
                    </div>
                    <h4 className="font-bold text-sm text-onyx group-hover:text-forest transition-colors">
                      {step.name}
                    </h4>
                    <p className="text-[11px] text-ash mt-1 leading-snug">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow Indicator to Next Step (Desktop) */}
                  {idx < pipelineSteps.length - 1 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-pebble">
                      <ArrowRight className="h-5 w-5 stroke-[2.5]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* CTA Link Below */}
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => scrollTo("features")}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-forest hover:text-onyx transition cursor-pointer"
            >
              <span>See How It Works</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 6. ROLE-BASED SECTION (ONE PLATFORM. EVERY TEAM.)                    */}
      {/* ==================================================================== */}
      <section id="roles" className="border-t border-pebble/70 bg-white py-20 scroll-mt-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column (4 cols) */}
            <div className="lg:col-span-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-breath bg-[#f0f6f2] px-3.5 py-1 text-xs font-bold text-forest mb-3">
                BUILT FOR EVERY ROLE
              </div>
              <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-onyx leading-tight">
                One Platform.
                <br />
                Every Team.
              </h2>
              <p className="mt-4 text-sm sm:text-base text-ash leading-relaxed">
                Whether you&apos;re an owner, project manager, site manager or field worker — FIRMA gives you the tools you need to get the job done.
              </p>

              <button
                type="button"
                onClick={() => router.push("/signup")}
                className="mt-8 inline-flex items-center gap-2 rounded-[10px] bg-onyx px-6 py-3.5 text-xs sm:text-sm font-bold text-white hover:bg-forest transition shadow-sm cursor-pointer group"
              >
                <span>Explore Role-Based Features</span>
                <ArrowRight className="h-4 w-4 text-breath group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Right Column (8 cols): 4 Vertical Role Cards */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {roleCards.map((rc) => (
                <div
                  key={rc.role}
                  onClick={() => router.push(rc.link)}
                  className="rounded-[16px] border border-pebble bg-stone/40 overflow-hidden shadow-2xs hover:shadow-lg hover:border-forest/50 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  {/* Photo Container */}
                  <div className="relative h-44 sm:h-52 w-full bg-mist overflow-hidden">
                    <Image
                      src={rc.image}
                      alt={rc.role}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-onyx/40 via-transparent to-transparent" />
                  </div>

                  {/* Role Info */}
                  <div className="p-4 flex flex-col justify-between flex-1 bg-white">
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-onyx group-hover:text-forest transition-colors">
                        {rc.role}
                      </h3>
                      <p className="text-xs text-ash mt-1 leading-snug">
                        {rc.tagline}
                      </p>
                    </div>

                    <div className="mt-4 pt-2 border-t border-pebble/40 flex justify-end">
                      <ArrowRight className="h-3.5 w-3.5 text-ash group-hover:text-forest group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 7. METRICS & TESTIMONIAL BANNER (PROJECTS DELIVERED SMARTER)          */}
      {/* ==================================================================== */}
      <section id="pricing-banner" className="py-8 sm:py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="relative rounded-[24px] bg-onyx text-white p-8 sm:p-14 overflow-hidden shadow-2xl">
            {/* Background Construction Image Overlay */}
            <div className="absolute inset-0 opacity-25">
              <Image
                src="/images/landing_hero.jpg"
                alt="Skyline construction background"
                fill
                className="object-cover object-center"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-onyx via-onyx/90 to-onyx/80" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Side (7 cols): Metrics */}
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-breath mb-4 backdrop-blur-sm">
                  REAL RESULTS
                </div>
                <h2 className="text-3xl sm:text-4xl font-normal text-white tracking-tight">
                  Projects Delivered Smarter
                </h2>
                <p className="mt-2.5 text-sm sm:text-base text-stone/80 max-w-xl">
                  Companies use FIRMA to save time, reduce costs and deliver projects on schedule.
                </p>

                {/* 4 Stats Grid */}
                <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-white/15">
                  <div>
                    <p className="text-3xl sm:text-4xl font-black text-white">40%</p>
                    <p className="text-xs text-stone/70 mt-1">Less project delays</p>
                  </div>
                  <div>
                    <p className="text-3xl sm:text-4xl font-black text-white">25%</p>
                    <p className="text-xs text-stone/70 mt-1">Lower operational costs</p>
                  </div>
                  <div>
                    <p className="text-3xl sm:text-4xl font-black text-breath">3x</p>
                    <p className="text-xs text-stone/70 mt-1">Faster reporting</p>
                  </div>
                  <div>
                    <p className="text-3xl sm:text-4xl font-black text-sunfleck">99%</p>
                    <p className="text-xs text-stone/70 mt-1">Team on-site visibility</p>
                  </div>
                </div>
              </div>

              {/* Right Side (5 cols): Testimonial Quote Card */}
              <div className="lg:col-span-5">
                <div className="rounded-[18px] bg-white/10 backdrop-blur-md border border-white/20 p-7 sm:p-8 text-white relative shadow-xl">
                  {/* Quote Icon */}
                  <span className="text-4xl font-serif text-breath/80 block leading-none mb-3">
                    “
                  </span>
                  <p className="text-sm sm:text-base text-stone/95 leading-relaxed font-normal">
                    FIRMA has completely changed the way we manage our construction projects. It&apos;s simple, powerful and built for the real world.
                  </p>
                  <div className="mt-6 pt-4 border-t border-white/15">
                    <p className="font-bold text-sm text-white">Rohit Mehta</p>
                    <p className="text-xs text-stone/70">Project Director, Skyline Constructions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 8. FINAL BOTTOM CALL TO ACTION                                       */}
      {/* ==================================================================== */}
      <section className="py-16 sm:py-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 text-center relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-breath bg-[#f0f6f2] px-3.5 py-1 text-xs font-bold text-forest mb-4">
            GET STARTED TODAY
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-onyx">
            Ready to Take Control of Your Projects?
          </h2>

          <p className="mt-4 text-sm sm:text-base text-ash max-w-xl mx-auto">
            Join thousands of construction professionals who trust FIRMA.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={() => router.push("/signup")}
              className="flex items-center justify-center gap-2 rounded-[10px] bg-onyx px-8 py-3.5 text-sm font-bold text-white hover:bg-forest transition shadow-md cursor-pointer group"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="h-4 w-4 text-breath group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => setDemoModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-[10px] border border-pebble bg-white px-7 py-3.5 text-sm font-bold text-onyx hover:bg-stone transition shadow-2xs cursor-pointer"
            >
              <Calendar className="h-4 w-4 text-forest" />
              <span>Book a Demo</span>
            </button>
          </div>

          {/* Micro trust tags */}
          <div className="mt-5 flex items-center justify-center gap-6 text-xs text-ash font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-forest" />
              <span>No credit card required</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-forest" />
              <span>Setup in 2 minutes</span>
            </span>
          </div>

          {/* Doodle Script Accent */}
          <div className="hidden sm:flex absolute right-0 sm:-right-4 bottom-2 items-center gap-1 text-forest">
            <svg className="w-14 h-12 text-forest stroke-current rotate-12" viewBox="0 0 100 80" fill="none">
              <path
                d="M80 70 Q 20 40 40 10"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <polygon points="42,5 48,18 34,16" fill="currentColor" />
            </svg>
            <span
              style={{ fontFamily: "'Caveat', cursive, 'Brush Script MT', 'Switzer', sans-serif" }}
              className="text-xl font-bold tracking-wide -rotate-6"
            >
              Build a better
              <br />
              tomorrow
            </span>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 9. FOOTER                                                            */}
      {/* ==================================================================== */}
      <footer className="border-t border-white/10 bg-onyx text-stone/70 text-xs py-14">
        <div className="container-fluid w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-12">
            {/* Left Brand Info (2 cols) */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-white text-forest shadow-xs">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-lg font-black tracking-tight text-white block">FIRMA</span>
                  <span className="text-[10px] text-stone/60">Build Smarter. Deliver Faster.</span>
                </div>
              </div>

              <p className="text-xs text-stone/70 leading-relaxed max-w-sm">
                The all-in-one construction management platform for modern builders and contractors.
              </p>

              {/* Social Icons */}
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-stone transition"
                >
                  <span className="font-bold text-xs">in</span>
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-stone transition"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-stone transition"
                >
                  <span className="font-bold text-xs">X</span>
                </a>
              </div>
            </div>

            {/* Product Column */}
            <div className="space-y-3">
              <p className="font-bold text-white text-xs uppercase tracking-wider">Product</p>
              <ul className="space-y-2 text-stone/70">
                <li><button type="button" onClick={() => router.push("/projects")} className="hover:text-white cursor-pointer">Features</button></li>
                <li><button type="button" onClick={() => scrollTo("pricing-banner")} className="hover:text-white cursor-pointer">Pricing</button></li>
                <li><button type="button" onClick={() => scrollTo("features")} className="hover:text-white cursor-pointer">What&apos;s New</button></li>
                <li><button type="button" onClick={() => router.push("/scheduling")} className="hover:text-white cursor-pointer">Roadmap</button></li>
              </ul>
            </div>

            {/* Solutions Column */}
            <div className="space-y-3">
              <p className="font-bold text-white text-xs uppercase tracking-wider">Solutions</p>
              <ul className="space-y-2 text-stone/70">
                <li><button type="button" onClick={() => router.push("/contractors")} className="hover:text-white cursor-pointer">For Contractors</button></li>
                <li><button type="button" onClick={() => router.push("/projects")} className="hover:text-white cursor-pointer">For Builders</button></li>
                <li><button type="button" onClick={() => router.push("/dashboard")} className="hover:text-white cursor-pointer">For Project Managers</button></li>
                <li><button type="button" onClick={() => router.push("/sites")} className="hover:text-white cursor-pointer">For Field Teams</button></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div className="space-y-3">
              <p className="font-bold text-white text-xs uppercase tracking-wider">Resources</p>
              <ul className="space-y-2 text-stone/70">
                <li><button type="button" onClick={() => router.push("/help")} className="hover:text-white cursor-pointer">Help Center</button></li>
                <li><button type="button" onClick={() => router.push("/reports")} className="hover:text-white cursor-pointer">Blog</button></li>
                <li><button type="button" onClick={() => scrollTo("pricing-banner")} className="hover:text-white cursor-pointer">Case Studies</button></li>
                <li><button type="button" onClick={() => router.push("/documents")} className="hover:text-white cursor-pointer">Documentation</button></li>
              </ul>
            </div>

            {/* Company Column */}
            <div className="space-y-3">
              <p className="font-bold text-white text-xs uppercase tracking-wider">Company</p>
              <ul className="space-y-2 text-stone/70">
                <li><button type="button" onClick={() => scrollTo("roles")} className="hover:text-white cursor-pointer">About Us</button></li>
                <li><button type="button" onClick={() => router.push("/team")} className="hover:text-white cursor-pointer">Careers</button></li>
                <li><button type="button" onClick={() => router.push("/help")} className="hover:text-white cursor-pointer">Contact</button></li>
                <li><button type="button" onClick={() => router.push("/setting")} className="hover:text-white cursor-pointer">Privacy Policy</button></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone/60">
            <p>© {new Date().getFullYear()} FIRMA. All rights reserved.</p>
            <p className="text-breath/80">Built for a better built world.</p>
          </div>
        </div>
      </footer>

      {/* ==================================================================== */}
      {/* 10. INTERACTIVE DEMO / SCHEDULE MODAL                                */}
      {/* ==================================================================== */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-pebble animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-clear-bg text-forest flex items-center justify-center">
                  <Play className="h-4 w-4 fill-current ml-0.5" />
                </div>
                <h3 className="text-lg font-bold text-onyx">FIRMA Product Tour</h3>
              </div>
              <button
                type="button"
                onClick={() => setDemoModalOpen(false)}
                className="p-1 rounded-full text-ash hover:text-onyx cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-ash mb-6 leading-relaxed">
              Experience how leading builders manage projects, tenders, field execution, and daily site muster rolls seamlessly.
            </p>

            <div className="rounded-[12px] bg-stone p-4 border border-pebble mb-6 space-y-2.5 text-xs">
              <div className="flex items-center gap-2 font-semibold text-onyx">
                <CheckCircle2 className="h-4 w-4 text-forest" />
                <span>Live milestone progress & photo DPRs</span>
              </div>
              <div className="flex items-center gap-2 font-semibold text-onyx">
                <CheckCircle2 className="h-4 w-4 text-forest" />
                <span>Instant client BOQ quotation & GST margin calculator</span>
              </div>
              <div className="flex items-center gap-2 font-semibold text-onyx">
                <CheckCircle2 className="h-4 w-4 text-forest" />
                <span>Mobile muster rolls & offline site sync</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  setDemoModalOpen(false);
                  router.push("/dashboard");
                }}
                className="flex-1 py-3 rounded-[10px] bg-onyx text-white text-xs font-bold hover:bg-forest transition"
              >
                Open Interactive Workspace
              </button>
              <button
                type="button"
                onClick={() => setDemoModalOpen(false)}
                className="py-3 px-5 rounded-[10px] border border-pebble text-onyx text-xs font-bold hover:bg-stone transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}