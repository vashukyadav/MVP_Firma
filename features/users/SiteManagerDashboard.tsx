"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Layers,
  ArrowRight,
  Plus,
  Camera,
  Eye,
  Users,
  Building2,
  HelpCircle,
  ArrowLeftRight,
  ShieldAlert,
  ShieldCheck,
  ListChecks,
  HardHat,
  ChevronRight,
  FileText,
  Sun,
  CloudSun,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

interface SiteManagerDashboardProps {
  companyName?: string;
}

// Sample recent photos preview matching Screen 6
const recentFieldPhotos = [
  {
    id: "p1",
    title: "Cable tray installation",
    time: "11:32 AM",
    author: "Rahul Kumar",
    url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80",
    stage: "Containment",
  },
  {
    id: "p2",
    title: "DB panel setup",
    time: "02:15 PM",
    author: "Amit Singh",
    url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80",
    stage: "Distribution Panel",
  },
  {
    id: "p3",
    title: "Conduit piping",
    time: "04:15 PM",
    author: "Rahul Kumar",
    url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80",
    stage: "Conduit",
  },
  {
    id: "p4",
    title: "Socket installation",
    time: "05:30 PM",
    author: "Sunil Yadav",
    url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80",
    stage: "Second Fix",
  },
];

export default function SiteManagerDashboard({ companyName }: SiteManagerDashboardProps) {
  return (
    <div className="space-y-6 mt-2">
      {/* ========================================================================= */}
      {/* 1. GREETING & CONTEXT HEADER                                              */}
      {/* ========================================================================= */}
      <div className="rounded-[16px] bg-white border border-pebble/80 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-bold text-emerald-800 mb-2">
              <HardHat className="h-3.5 w-3.5 text-emerald-700" />
              <span>Site Manager Workspace</span>
              <span className="text-emerald-300">•</span>
              <span className="text-emerald-900 font-semibold">{companyName || "Riverside Project"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-onyx tracking-tight flex items-center gap-2">
              Good Morning, Rohit! <span>👷</span>
            </h1>
            <p className="text-xs sm:text-sm text-ash mt-1">
              On-site execution, daily reporting, crew coordination, and site operations overview.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-[10px] bg-stone border border-pebble text-xs text-onyx font-medium">
              <Sun className="h-4 w-4 text-amber-500" />
              <span>Riverside Site: <strong>24°C Sunny</strong></span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-[10px] bg-stone border border-pebble text-xs text-ash">
              <Calendar className="h-4 w-4 text-ash" />
              <span className="font-semibold text-onyx">Tue, 16 Sep 2025</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. 4 PRIMARY KPI CARDS (SCREEN 1)                                         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Jobs */}
        <Link
          href="/jobs"
          className="p-5 rounded-[14px] bg-white border border-pebble/80 shadow-2xs hover:shadow-md hover:border-forest/50 transition group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ash">Today's Jobs</span>
            <span className="h-8 w-8 rounded-[8px] bg-emerald-50 text-forest flex items-center justify-center group-hover:bg-forest group-hover:text-white transition">
              <Briefcase className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-onyx">8</span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                2 In-Progress
              </span>
            </div>
            <p className="text-[11px] text-ash mt-1.5 flex items-center justify-between">
              <span>6 Scheduled for today</span>
              <ArrowRight className="h-3 w-3 text-ash group-hover:text-forest group-hover:translate-x-0.5 transition" />
            </p>
          </div>
        </Link>

        {/* Card 2: Team On Site */}
        <Link
          href="/sites"
          className="p-5 rounded-[14px] bg-white border border-pebble/80 shadow-2xs hover:shadow-md hover:border-forest/50 transition group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ash">Team On Site</span>
            <span className="h-8 w-8 rounded-[8px] bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-onyx">24</span>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                Full Crew
              </span>
            </div>
            <p className="text-[11px] text-ash mt-1.5 flex items-center justify-between">
              <span>14 Internal • 10 Contractors</span>
              <ArrowRight className="h-3 w-3 text-ash group-hover:text-forest group-hover:translate-x-0.5 transition" />
            </p>
          </div>
        </Link>

        {/* Card 3: Open RFIs */}
        <Link
          href="/rfis"
          className="p-5 rounded-[14px] bg-white border border-pebble/80 shadow-2xs hover:shadow-md hover:border-rose-300 transition group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ash">Open RFIs</span>
            <span className="h-8 w-8 rounded-[8px] bg-rose-50 text-rose-700 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition">
              <HelpCircle className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-onyx">3</span>
              <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                1 Pending
              </span>
            </div>
            <p className="text-[11px] text-ash mt-1.5 flex items-center justify-between">
              <span>R-001 Conduit Routing</span>
              <ArrowRight className="h-3 w-3 text-ash group-hover:text-rose-600 group-hover:translate-x-0.5 transition" />
            </p>
          </div>
        </Link>

        {/* Card 4: Open Variations */}
        <Link
          href="/variations"
          className="p-5 rounded-[14px] bg-white border border-pebble/80 shadow-2xs hover:shadow-md hover:border-amber-300 transition group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ash">Open Variations</span>
            <span className="h-8 w-8 rounded-[8px] bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition">
              <ArrowLeftRight className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-onyx">2</span>
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                +$16,700
              </span>
            </div>
            <p className="text-[11px] text-ash mt-1.5 flex items-center justify-between">
              <span>V-001 &amp; V-002 Awaiting Review</span>
              <ArrowRight className="h-3 w-3 text-ash group-hover:text-amber-600 group-hover:translate-x-0.5 transition" />
            </p>
          </div>
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN WORKSPACE GRID: SCHEDULE & RECENT ACTIVITIES (SCREEN 1)            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Today's Schedule + Active Sites */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Today's Schedule Card */}
          <div className="rounded-[16px] bg-white border border-pebble/80 shadow-2xs overflow-hidden">
            <div className="px-6 py-4 border-b border-pebble/60 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-onyx flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-forest" />
                  <span>Today's Schedule</span>
                </h2>
                <p className="text-xs text-ash mt-0.5">Assigned teams, contractors, and planned execution slots.</p>
              </div>
              <Link
                href="/scheduling"
                className="text-xs font-bold text-forest hover:underline flex items-center gap-1"
              >
                <span>Full Timeline</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="p-6 space-y-3">
              {[
                {
                  time: "09:00 AM",
                  title: "Site Prep & Safety Check",
                  site: "Riverside Apartments (Site A)",
                  team: "Internal Team A (4 workers)",
                  status: "In-Progress",
                  badgeColor: "bg-emerald-100 text-emerald-800",
                },
                {
                  time: "10:00 AM",
                  title: "J-004 Electrical Installation",
                  site: "Riverside Apartments (Block B)",
                  team: "Spark Electric Co. (6 workers)",
                  status: "Scheduled",
                  badgeColor: "bg-blue-100 text-blue-800",
                },
                {
                  time: "01:00 PM",
                  title: "Plumbing Rough-In & Drain Inspection",
                  site: "Riverside Apartments (Block A)",
                  team: "Internal Team C (3 workers)",
                  status: "Scheduled",
                  badgeColor: "bg-blue-100 text-blue-800",
                },
                {
                  time: "03:30 PM",
                  title: "Concrete Pouring Inspection",
                  site: "Metro Mall Site (Foundation)",
                  team: "Apex Concrete (8 workers)",
                  status: "Scheduled",
                  badgeColor: "bg-stone text-onyx border border-pebble",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-[12px] bg-stone/40 border border-pebble/60 hover:bg-stone/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="h-10 w-16 rounded-[8px] bg-white border border-pebble/80 flex items-center justify-center font-black text-xs text-onyx shrink-0 shadow-2xs">
                      {item.time}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-onyx">{item.title}</h4>
                      <p className="text-xs text-ash mt-0.5 flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-ash" /> {item.site}
                        </span>
                        <span className="text-pebble">•</span>
                        <span>{item.team}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className={`px-2.5 py-1 rounded-[6px] text-xs font-bold ${item.badgeColor}`}>
                      {item.status}
                    </span>
                    <Link
                      href="/jobs"
                      className="p-1.5 rounded-[6px] hover:bg-white text-ash hover:text-onyx transition"
                      title="View Job"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Sites Overview */}
          <div className="rounded-[16px] bg-white border border-pebble/80 shadow-2xs overflow-hidden">
            <div className="px-6 py-4 border-b border-pebble/60 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-onyx flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-forest" />
                  <span>Active Construction Sites</span>
                </h2>
                <p className="text-xs text-ash mt-0.5">Real-time status across active locations.</p>
              </div>
              <Link
                href="/sites"
                className="text-xs font-bold text-forest hover:underline flex items-center gap-1"
              >
                <span>All Sites</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Site 1 */}
              <div className="p-4 rounded-[12px] bg-stone/40 border border-pebble/70 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded-[4px] bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Main Site • Active
                    </span>
                    <h4 className="text-sm font-bold text-onyx mt-1">Riverside Apartments</h4>
                    <p className="text-xs text-ash flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-ash" /> Sector 45, Gurugram
                    </p>
                  </div>
                  <span className="text-xs font-black text-onyx">65% Done</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-pebble/60 h-2 rounded-full overflow-hidden">
                  <div className="bg-forest h-full rounded-full" style={{ width: "65%" }} />
                </div>

                <div className="pt-2 border-t border-pebble/50 flex items-center justify-between text-xs text-ash">
                  <span>14 Workers on-site</span>
                  <div className="flex items-center gap-2">
                    <Link href="/site-reports" className="text-forest hover:underline font-semibold">
                      Daily Report
                    </Link>
                    <span>•</span>
                    <Link href="/punch-lists" className="text-forest hover:underline font-semibold">
                      Punch List
                    </Link>
                  </div>
                </div>
              </div>

              {/* Site 2 */}
              <div className="p-4 rounded-[12px] bg-stone/40 border border-pebble/70 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded-[4px] bg-blue-100 text-blue-800 text-[10px] font-bold">
                      Sub Site • Active
                    </span>
                    <h4 className="text-sm font-bold text-onyx mt-1">Metro Mall Site</h4>
                    <p className="text-xs text-ash flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-ash" /> MG Road, Gurugram
                    </p>
                  </div>
                  <span className="text-xs font-black text-onyx">40% Done</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-pebble/60 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: "40%" }} />
                </div>

                <div className="pt-2 border-t border-pebble/50 flex items-center justify-between text-xs text-ash">
                  <span>10 Workers on-site</span>
                  <div className="flex items-center gap-2">
                    <Link href="/site-reports" className="text-forest hover:underline font-semibold">
                      Daily Report
                    </Link>
                    <span>•</span>
                    <Link href="/safety" className="text-forest hover:underline font-semibold">
                      Safety Log
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Activity Feed, Quick Actions & Photo Preview */}
        <div className="space-y-6">
          
          {/* Quick Actions Hub */}
          <div className="rounded-[16px] bg-white border border-pebble/80 shadow-2xs p-5 space-y-3">
            <h3 className="text-sm font-bold text-onyx">Site Quick Actions</h3>
            <div className="grid grid-cols-1 gap-2">
              <Link
                href="/site-reports"
                className="p-3 rounded-[10px] bg-stone/50 hover:bg-forest hover:text-white border border-pebble/60 transition group flex items-center justify-between text-xs font-semibold text-onyx"
              >
                <span className="flex items-center gap-2.5">
                  <FileText className="h-4 w-4 text-forest group-hover:text-white transition" />
                  <span>+ New Daily Site Report</span>
                </span>
                <ChevronRight className="h-4 w-4 text-ash group-hover:text-white transition" />
              </Link>

              <Link
                href="/photos"
                className="p-3 rounded-[10px] bg-stone/50 hover:bg-forest hover:text-white border border-pebble/60 transition group flex items-center justify-between text-xs font-semibold text-onyx"
              >
                <span className="flex items-center gap-2.5">
                  <Camera className="h-4 w-4 text-forest group-hover:text-white transition" />
                  <span>📷 Upload Field Photos</span>
                </span>
                <ChevronRight className="h-4 w-4 text-ash group-hover:text-white transition" />
              </Link>

              <Link
                href="/rfis"
                className="p-3 rounded-[10px] bg-stone/50 hover:bg-forest hover:text-white border border-pebble/60 transition group flex items-center justify-between text-xs font-semibold text-onyx"
              >
                <span className="flex items-center gap-2.5">
                  <HelpCircle className="h-4 w-4 text-forest group-hover:text-white transition" />
                  <span>+ Raise New RFI</span>
                </span>
                <ChevronRight className="h-4 w-4 text-ash group-hover:text-white transition" />
              </Link>

              <Link
                href="/safety"
                className="p-3 rounded-[10px] bg-stone/50 hover:bg-rose-600 hover:text-white border border-pebble/60 transition group flex items-center justify-between text-xs font-semibold text-onyx"
              >
                <span className="flex items-center gap-2.5">
                  <ShieldAlert className="h-4 w-4 text-amber-600 group-hover:text-white transition" />
                  <span>⚠️ Log Safety Incident</span>
                </span>
                <ChevronRight className="h-4 w-4 text-ash group-hover:text-white transition" />
              </Link>

              <Link
                href="/punch-lists"
                className="p-3 rounded-[10px] bg-stone/50 hover:bg-forest hover:text-white border border-pebble/60 transition group flex items-center justify-between text-xs font-semibold text-onyx"
              >
                <span className="flex items-center gap-2.5">
                  <ListChecks className="h-4 w-4 text-forest group-hover:text-white transition" />
                  <span>✓ Add Punch List Item</span>
                </span>
                <ChevronRight className="h-4 w-4 text-ash group-hover:text-white transition" />
              </Link>
            </div>
          </div>

          {/* Recent Site Activity (Screen 1) */}
          <div className="rounded-[16px] bg-white border border-pebble/80 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-pebble/60 flex items-center justify-between">
              <h3 className="text-sm font-bold text-onyx">Recent Site Activity</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800">
                Live Feed
              </span>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {[
                {
                  author: "Rahul Kumar",
                  action: "uploaded 3 photos",
                  target: "J-004 Electrical",
                  time: "15m ago",
                  icon: Camera,
                  color: "bg-emerald-100 text-emerald-800",
                },
                {
                  author: "Amit Singh",
                  action: "submitted daily log",
                  target: "Report #SR-104",
                  time: "1h ago",
                  icon: FileText,
                  color: "bg-blue-100 text-blue-800",
                },
                {
                  author: "Rohit Verma",
                  action: "raised RFI R-001",
                  target: "Conduit Routing",
                  time: "2h ago",
                  icon: HelpCircle,
                  color: "bg-rose-100 text-rose-800",
                },
                {
                  author: "Sunil Yadav",
                  action: "reported Near Miss",
                  target: "Scaffold clearance",
                  time: "3h ago",
                  icon: ShieldAlert,
                  color: "bg-amber-100 text-amber-800",
                },
              ].map((act, i) => {
                const Icon = act.icon;
                return (
                  <div key={i} className="flex items-start gap-3">
                    <span className={`h-7 w-7 rounded-full ${act.color} flex items-center justify-center shrink-0`}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-onyx font-medium leading-snug">
                        <strong>{act.author}</strong> {act.action} for{" "}
                        <span className="font-bold text-forest">{act.target}</span>
                      </p>
                      <span className="text-[10px] text-ash block mt-0.5">{act.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Field Photos Mini Widget */}
          <div className="rounded-[16px] bg-white border border-pebble/80 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-pebble/60 flex items-center justify-between">
              <h3 className="text-sm font-bold text-onyx flex items-center gap-1.5">
                <Camera className="h-4 w-4 text-forest" />
                <span>Field Photos</span>
              </h3>
              <Link
                href="/photos"
                className="text-xs font-bold text-forest hover:underline flex items-center gap-1"
              >
                <span>View All (5)</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="p-4 grid grid-cols-2 gap-2.5">
              {recentFieldPhotos.map((photo) => (
                <Link
                  key={photo.id}
                  href="/photos"
                  className="group relative rounded-[10px] overflow-hidden border border-pebble/70 aspect-video bg-stone block"
                >
                  <Image
                    src={photo.url}
                    alt={photo.title}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-2">
                    <span className="text-[10px] font-bold text-white truncate">{photo.title}</span>
                    <span className="text-[8px] text-stone truncate">{photo.author}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
