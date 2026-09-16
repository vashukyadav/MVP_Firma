"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import FirmaLayout from "@/components/layout/FirmaLayout";
import {
  useSchedulingStore,
  ScheduledJob,
  UnscheduledJob,
  FieldWorker,
} from "@/store/schedulingStore";
import { useTenderFlowStore } from "@/store/tenderFlowStore";
import { useCrewStore } from "@/store/crewStore";
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  User,
  Clock,
  MapPin,
  Building2,
  Filter,
  MoreHorizontal,
  X,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Layers,
  FileText,
  RotateCcw,
  Check,
  ArrowUpRight,
  HardHat,
  Users2,
} from "lucide-react";

type ViewTab = "CALENDAR" | "LIST" | "UNSCHEDULED";

const fallbackWorkers: FieldWorker[] = [
  {
    id: "W-01",
    name: "Amit Verma",
    role: "Field Worker",
    trade: "Electrical",
    phone: "+91 98112 34501",
    avatarBg: "bg-emerald-100 text-emerald-800",
  },
  {
    id: "W-02",
    name: "Ravi Kumar",
    role: "Field Worker",
    trade: "Plumbing",
    phone: "+91 98112 34502",
    avatarBg: "bg-blue-100 text-blue-800",
  },
  {
    id: "W-03",
    name: "Suresh Yadav",
    role: "Field Worker",
    trade: "HVAC",
    phone: "+91 98112 34503",
    avatarBg: "bg-rose-100 text-rose-800",
  },
  {
    id: "W-04",
    name: "Mohit Singh",
    role: "Field Worker",
    trade: "Interior & Carpentry",
    phone: "+91 98112 34504",
    avatarBg: "bg-teal-100 text-teal-800",
  },
  {
    id: "W-05",
    name: "Rajesh Sharma",
    role: "Field Worker",
    trade: "Civil & Masonry",
    phone: "+91 98112 34505",
    avatarBg: "bg-amber-100 text-amber-800",
  },
];

function SchedulingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryJobId = searchParams.get("jobId");
  const autoOpenSchedule = searchParams.get("openSchedule") === "true";

  // Stores
  const {
    scheduledJobs,
    unscheduledJobs: storeUnscheduledJobs,
    workers: storeWorkers,
    sites: storeSites,
    scheduleJob,
    updateScheduledJob,
    deleteScheduledJob,
    unscheduleJob,
    updateJobStatus,
  } = useSchedulingStore();

  const {
    jobs: tenderJobs = [],
    contractors = [],
    updateJobStatus: updateTenderJobStatus,
  } = useTenderFlowStore();

  const { members: crewMembers = [] } = useCrewStore();

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<ViewTab>("CALENDAR");

  // Calendar View Mode: "WORKER" (Crew Dispatch) or "TIME" (Hourly Timeline)
  const [calendarViewMode, setCalendarViewMode] = useState<"WORKER" | "TIME">(
    "WORKER"
  );

  // Filter States
  const [selectedSite, setSelectedSite] = useState<string>("ALL");
  const [selectedWorker, setSelectedWorker] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<string>("ALL");

  // Week Navigator State (Default week of 15 Sep 2026 - 21 Sep 2026)
  const [weekOffset, setWeekOffset] = useState<number>(0);

  // Modal State for "Schedule Job (Assign Worker)"
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [modalJobId, setModalJobId] = useState<string>("");
  const [modalWorker, setModalWorker] = useState<string>("Amit Verma");
  const [modalDate, setModalDate] = useState<string>("15/09/2026");
  const [modalTime, setModalTime] = useState<string>("09:00 AM - 05:00 PM");
  const [modalNotes, setModalNotes] = useState<string>("");

  // Details Modal State
  const [selectedJobDetails, setSelectedJobDetails] =
    useState<ScheduledJob | null>(null);

  // Row Action Menu Open ID
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);

  // Available Workers (CrewStore members + Store workers + fallback workers + any contractors)
  const activeWorkers = useMemo(() => {
    const list: FieldWorker[] = [];

    // 1. Crew members from crewStore
    if (crewMembers && crewMembers.length > 0) {
      crewMembers.forEach((m) => {
        list.push({
          id: m.id,
          name: m.name,
          role: m.role,
          trade:
            m.trade ||
            (m.role === "Field Worker"
              ? "General Construction"
              : "Site Operations"),
          phone: m.contact || "+91 98112 34500",
          avatarBg: m.avatarBg || "bg-emerald-100 text-emerald-800",
        });
      });
    }

    // 2. Store workers
    if (storeWorkers && storeWorkers.length > 0) {
      for (const sw of storeWorkers) {
        if (!list.some((w) => w.name.toLowerCase() === sw.name.toLowerCase())) {
          list.push(sw);
        }
      }
    }

    // 3. Fallbacks if list is still empty
    if (list.length === 0) {
      list.push(...fallbackWorkers);
    }

    // 4. Contractors as selectable assignees
    for (const c of contractors) {
      if (!list.some((w) => w.name.toLowerCase() === c.name.toLowerCase())) {
        list.push({
          id: `CON-${c.id}`,
          name: c.name,
          role: "Contractor Partner",
          trade: c.trade,
          phone: c.phone || "+91 98100 00000",
          avatarBg: "bg-forest/10 text-forest",
        });
      }
    }
    return list;
  }, [crewMembers, storeWorkers, contractors]);

  // Derive all unscheduled jobs:
  // 1. Any job from tenderFlowStore that is not yet in scheduledJobs
  // 2. Any job in schedulingStore.unscheduledJobs
  const allUnscheduledJobs = useMemo(() => {
    const fromTender: UnscheduledJob[] = tenderJobs
      .filter((tj) => !scheduledJobs.some((sj) => sj.id === tj.id))
      .map((tj) => ({
        id: tj.id,
        title: tj.title,
        project: tj.projectName || "Project Site",
        site: tj.location || `${tj.projectName || "Main Site"} Area`,
        trade: tj.trade || "Site Trade",
        priority: tj.priority || "High",
        estimatedHours: "4 hrs",
        description:
          tj.description ||
          `Execute ${tj.title} scope per awarded tender specifications.`,
      }));

    const combined: UnscheduledJob[] = [...fromTender];
    for (const uj of storeUnscheduledJobs) {
      if (
        !combined.some((c) => c.id === uj.id) &&
        !scheduledJobs.some((sj) => sj.id === uj.id)
      ) {
        combined.push(uj);
      }
    }
    return combined;
  }, [tenderJobs, scheduledJobs, storeUnscheduledJobs]);

  // Combined options for Job Select dropdown (Unscheduled first, then already scheduled)
  const availableJobOptions = useMemo(() => {
    const unscheduledOpts = allUnscheduledJobs.map((j) => ({
      id: j.id,
      title: j.title,
      project: j.project,
      site: j.site,
      trade: j.trade,
      description: j.description,
      isScheduled: false,
    }));

    const scheduledOpts = scheduledJobs.map((j) => ({
      id: j.id,
      title: j.title,
      project: j.project,
      site: j.site,
      trade: "General",
      description: j.notes || "",
      isScheduled: true,
    }));

    return [...unscheduledOpts, ...scheduledOpts];
  }, [allUnscheduledJobs, scheduledJobs]);

  // Helper to suggest worker based on trade
  const suggestWorkerForTrade = (trade?: string) => {
    if (!trade) return activeWorkers[0]?.name || "Amit Verma";
    const t = trade.toLowerCase();
    const found = activeWorkers.find((w) =>
      w.trade.toLowerCase().includes(t) || t.includes(w.trade.toLowerCase())
    );
    return found ? found.name : activeWorkers[0]?.name || "Amit Verma";
  };

  // Open Schedule Modal with specific or default job pre-filled
  const handleOpenScheduleModal = (
    preselectedJobId?: string,
    prefilledDate?: string,
    prefilledTime?: string,
    prefilledWorker?: string
  ) => {
    // 1. Pick target job: either requested ID or the first unscheduled job or fallback
    let targetJob = preselectedJobId
      ? availableJobOptions.find((j) => j.id === preselectedJobId)
      : allUnscheduledJobs[0] || availableJobOptions[0];

    // If still no job exists anywhere, fallback to a starter dummy job
    const defaultJobId = targetJob ? targetJob.id : "JOB-401";
    const defaultJobTitle = targetJob
      ? targetJob.title
      : "Site Execution Works";
    const defaultJobProject = targetJob
      ? targetJob.project
      : "Skyline Apartments";
    const defaultJobSite = targetJob ? targetJob.site : "Main Site Area";
    const defaultJobNotes = targetJob
      ? targetJob.description ||
        `Execute ${defaultJobTitle} per specifications. Ensure safety compliance.`
      : "Install per specifications. Carry required tools.";

    setModalJobId(defaultJobId);
    setModalNotes(defaultJobNotes);

    // Auto-select matching worker or use prefilledWorker
    if (prefilledWorker) {
      setModalWorker(prefilledWorker);
    } else {
      const suggested = suggestWorkerForTrade(targetJob?.trade);
      setModalWorker(suggested);
    }

    // Date & Time pre-fill
    setModalDate(prefilledDate || "15/09/2026");
    setModalTime(prefilledTime || "09:00 AM - 05:00 PM");
    setShowScheduleModal(true);
  };

  // Safely close modal and clear URL parameters
  const handleCloseScheduleModal = () => {
    setShowScheduleModal(false);
    if (queryJobId || autoOpenSchedule) {
      router.replace("/scheduling");
    }
  };

  // Handle URL search params on mount (e.g. when redirected from /jobs)
  useEffect(() => {
    if (queryJobId) {
      handleOpenScheduleModal(queryJobId);
    } else if (autoOpenSchedule) {
      handleOpenScheduleModal();
    }
  }, [queryJobId, autoOpenSchedule]);

  // Handle selection change inside modal dropdown
  const handleModalJobChange = (newJobId: string) => {
    setModalJobId(newJobId);
    const job = availableJobOptions.find((j) => j.id === newJobId);
    if (job) {
      if (job.description) {
        setModalNotes(job.description);
      }
      const suggested = suggestWorkerForTrade(job.trade);
      setModalWorker(suggested);
    }
  };

  // Submit Schedule Form
  const handleSubmitSchedule = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedOption = availableJobOptions.find((j) => j.id === modalJobId);
    const title = selectedOption ? selectedOption.title : "Site Work Package";
    const project = selectedOption ? selectedOption.project : "Skyline Apartments";
    const site = selectedOption ? selectedOption.site : "Main Site";

    const workerObj = activeWorkers.find((w) => w.name === modalWorker);
    const workerRole = workerObj ? workerObj.role : "Field Worker";

    scheduleJob({
      jobId: modalJobId,
      title,
      project,
      site,
      worker: modalWorker,
      workerRole,
      date: modalDate,
      timeRange: modalTime,
      notes: modalNotes,
    });

    // Also sync status in tenderFlowStore so jobs page shows it as scheduled
    updateTenderJobStatus(modalJobId, "Scheduled");

    setShowScheduleModal(false);
    setActiveTab("CALENDAR");

    // Clear query param if it was present
    if (queryJobId || autoOpenSchedule) {
      router.replace("/scheduling");
    }
  };

  // Available Sites dynamically gathered from all sources
  const allSites = useMemo(() => {
    const set = new Set<string>();
    scheduledJobs.forEach((j) => {
      if (j.site) set.add(j.site);
    });
    allUnscheduledJobs.forEach((j) => {
      if (j.site) set.add(j.site);
    });
    tenderJobs.forEach((j) => {
      if (j.location) set.add(j.location);
    });
    storeSites.forEach((s) => {
      if (s.name) set.add(s.name);
    });

    if (set.size === 0) {
      set.add("Main Site");
      set.add("Tower B");
      set.add("City Mall");
      set.add("Main Site Area");
    }
    return Array.from(set);
  }, [scheduledJobs, allUnscheduledJobs, tenderJobs, storeSites]);

  // Filtered Scheduled Jobs
  const filteredScheduledJobs = useMemo(() => {
    return scheduledJobs.filter((job) => {
      const matchSite = selectedSite === "ALL" || job.site === selectedSite;
      const matchWorker =
        selectedWorker === "ALL" || job.worker.includes(selectedWorker);
      const matchStatus =
        selectedStatus === "ALL" || job.status === selectedStatus;
      const matchDate =
        dateFilter === "ALL" ||
        job.date === dateFilter ||
        job.dateFormatted === dateFilter;
      return matchSite && matchWorker && matchStatus && matchDate;
    });
  }, [scheduledJobs, selectedSite, selectedWorker, selectedStatus, dateFilter]);

  // Helper to normalize dates for bulletproof comparison
  const normalizeJobDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const trimmed = dateStr.trim();
    if (trimmed.includes("/")) {
      const parts = trimmed.split("/").map((n) => n.trim().padStart(2, "0"));
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD
      }
    }
    if (trimmed.includes("-") && trimmed.length === 10) {
      return trimmed;
    }
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, "0");
      const dayNum = String(parsed.getDate()).padStart(2, "0");
      return `${y}-${m}-${dayNum}`;
    }
    return trimmed;
  };

  // Helper to extract hour in 24-hr format
  const getStartHour24 = (timeStr?: string): number => {
    if (!timeStr) return 9;
    const cleaned = timeStr.trim().toUpperCase();
    const match = cleaned.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/);
    if (!match) return 9;
    let hour = parseInt(match[1], 10);
    const ampm = match[3];
    if (ampm === "PM" && hour < 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;
    return hour;
  };

  const getSlotHour24 = (slotLabel: string): number => {
    const match = slotLabel.trim().toUpperCase().match(/^(\d{1,2})\s*(AM|PM)/);
    if (!match) return 9;
    let hour = parseInt(match[1], 10);
    const ampm = match[2];
    if (ampm === "PM" && hour < 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;
    return hour;
  };

  // Dynamic Monday calculation (14 Sep 2026 is Monday)
  const currentMonday = useMemo(() => {
    const baseMonday = new Date(2026, 8, 14);
    const d = new Date(baseMonday);
    d.setDate(baseMonday.getDate() + weekOffset * 7);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [weekOffset]);

  // Calendar Days definition (Full 7 Days: Monday to Sunday)
  const calendarDays = useMemo(() => {
    const daysName: ("Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun")[] = [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ];
    return daysName.map((day, idx) => {
      const d = new Date(currentMonday);
      d.setDate(currentMonday.getDate() + idx);
      const dateNum = d.getDate();
      const month = d.toLocaleDateString("en-GB", { month: "short" });
      const fullDateIso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(dateNum).padStart(2, "0")}`;
      const fullDateDmy = `${String(dateNum).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
      const dayDateStr = `${dateNum} ${month}`;
      const formattedStr = d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      return {
        day,
        dateNum,
        month,
        fullDateIso,
        fullDateDmy,
        dayDateStr,
        formattedStr,
      };
    });
  }, [currentMonday]);

  // Format date range string for header (Monday to Sunday)
  const dateRangeString = useMemo(() => {
    const monday = new Date(currentMonday);
    const sunday = new Date(currentMonday);
    sunday.setDate(monday.getDate() + 6);
    const startStr = `${monday.getDate()} ${monday.toLocaleDateString("en-GB", { month: "short" })} ${monday.getFullYear()}`;
    const endStr = `${sunday.getDate()} ${sunday.toLocaleDateString("en-GB", { month: "short" })} ${sunday.getFullYear()}`;
    return `${startStr} – ${endStr}`;
  }, [currentMonday]);

  // Time Slots 8 AM to 6 PM (covers standard construction shifts)
  const timeSlots = [
    "8 AM",
    "9 AM",
    "10 AM",
    "11 AM",
    "12 PM",
    "1 PM",
    "2 PM",
    "3 PM",
    "4 PM",
    "5 PM",
    "6 PM",
  ];

  // Helper to extract end hour in 24-hr format
  const getEndHour24 = (timeStr?: string): number => {
    if (!timeStr) return 17;
    const parts = timeStr.split("-");
    if (parts.length > 1) {
      return getStartHour24(parts[1].trim());
    }
    return getStartHour24(timeStr) + 1;
  };

  // Helper to calculate job duration in hours and format label
  const getJobDuration = (timeSlot?: string): { hours: number; label: string } => {
    if (!timeSlot) return { hours: 1, label: "1 hr" };
    const parts = timeSlot.split("-");
    const startHour = getStartHour24(parts[0]?.trim());
    const endHour = parts.length > 1 ? getStartHour24(parts[1]?.trim()) : startHour + 1;
    let diff = endHour - startHour;
    if (diff <= 0) diff = 8;
    return {
      hours: diff,
      label: diff >= 8 ? `${diff}h • Full Day` : `${diff} hrs`,
    };
  };

  // Helper to get card color classes based on card colorScheme
  const getCardClasses = (colorScheme: ScheduledJob["colorScheme"]) => {
    switch (colorScheme) {
      case "emerald":
        return {
          bg: "bg-[#e2f7ea] border-[#b4e7c7] text-[#0d402b]",
          sub: "text-[#16563b]",
        };
      case "indigo":
        return {
          bg: "bg-[#e0e7ff] border-[#c7d2fe] text-[#1e1b4b]",
          sub: "text-[#4338ca]",
        };
      case "rose":
        return {
          bg: "bg-[#fee2e2] border-[#fecaca] text-[#450a0a]",
          sub: "text-[#b91c1c]",
        };
      case "teal":
        return {
          bg: "bg-[#d1fae5] border-[#a7f3d0] text-[#064e3b]",
          sub: "text-[#047857]",
        };
      case "amber":
      default:
        return {
          bg: "bg-[#fef3c7] border-[#fde68a] text-[#78350f]",
          sub: "text-[#b45309]",
        };
    }
  };

  return (
    <FirmaLayout activeNav="Scheduling">
      <div className="space-y-5 mt-2 pb-16">
        {/* ========================================================================= */}
        {/* TOP HEADER                                                                */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-onyx">
              Scheduling
            </h1>
            <p className="text-sm text-ash mt-0.5">
              {activeTab === "CALENDAR" &&
                "Assign and schedule field workers to jobs."}
              {activeTab === "LIST" && "View and manage all scheduled jobs."}
              {activeTab === "UNSCHEDULED" &&
                "Backlog of assigned jobs awaiting field worker scheduling."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleOpenScheduleModal()}
              className="flex items-center gap-2 rounded-[10px] bg-forest hover:bg-forest-hover text-white px-4 py-2.5 text-sm font-semibold shadow-xs transition cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Schedule Job</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* NAVIGATION TABS: Calendar View | List View | Unscheduled Jobs             */}
        {/* ========================================================================= */}
        <div className="border-b border-pebble/70 flex items-center gap-6">
          <button
            type="button"
            onClick={() => setActiveTab("CALENDAR")}
            className={`pb-3 text-sm font-semibold transition relative cursor-pointer ${
              activeTab === "CALENDAR"
                ? "text-forest border-b-2 border-forest"
                : "text-ash hover:text-onyx"
            }`}
          >
            Calendar View
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("LIST")}
            className={`pb-3 text-sm font-semibold transition relative cursor-pointer ${
              activeTab === "LIST"
                ? "text-forest border-b-2 border-forest"
                : "text-ash hover:text-onyx"
            }`}
          >
            List View
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("UNSCHEDULED")}
            className={`pb-3 text-sm font-semibold transition relative cursor-pointer flex items-center gap-2 ${
              activeTab === "UNSCHEDULED"
                ? "text-forest border-b-2 border-forest"
                : "text-ash hover:text-onyx"
            }`}
          >
            <span>Unscheduled Jobs</span>
            {allUnscheduledJobs.length > 0 && (
              <span className="bg-breath text-forest px-2 py-0.5 rounded-full text-[11px] font-bold">
                {allUnscheduledJobs.length}
              </span>
            )}
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 1. CALENDAR VIEW (SCREEN 5)                                              */}
        {/* ========================================================================= */}
        {activeTab === "CALENDAR" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Calendar Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-[12px] border border-pebble/60 shadow-2xs">
              <div className="flex items-center gap-2">
                {/* Date range display */}
                <div className="flex items-center gap-2 rounded-[8px] border border-pebble/80 px-3 py-1.5 text-xs font-semibold text-onyx bg-white">
                  <CalendarIcon className="h-4 w-4 text-ash" />
                  <span>{dateRangeString}</span>
                </div>

                {/* Arrow navigation */}
                <div className="flex items-center border border-pebble/80 rounded-[8px] bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setWeekOffset((prev) => prev - 1)}
                    className="p-1.5 hover:bg-stone transition text-onyx border-r border-pebble/80 cursor-pointer"
                    title="Previous Week"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeekOffset((prev) => prev + 1)}
                    className="p-1.5 hover:bg-stone transition text-onyx cursor-pointer"
                    title="Next Week"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Today button */}
                <button
                  type="button"
                  onClick={() => setWeekOffset(0)}
                  className="rounded-[8px] border border-pebble/80 px-3 py-1.5 text-xs font-semibold text-onyx hover:bg-stone transition cursor-pointer"
                >
                  Today
                </button>
              </div>

              {/* Calendar View Mode Switcher */}
              <div className="flex items-center bg-stone/70 p-1 rounded-[10px] border border-pebble/70 text-xs font-semibold shrink-0">
                <button
                  type="button"
                  onClick={() => setCalendarViewMode("WORKER")}
                  className={`px-3 py-1.5 rounded-[7px] transition flex items-center gap-1.5 cursor-pointer ${
                    calendarViewMode === "WORKER"
                      ? "bg-white text-onyx shadow-2xs font-bold"
                      : "text-ash hover:text-onyx"
                  }`}
                >
                  <Users2 className="h-3.5 w-3.5 text-forest" />
                  <span>By Worker (Dispatch)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCalendarViewMode("TIME")}
                  className={`px-3 py-1.5 rounded-[7px] transition flex items-center gap-1.5 cursor-pointer ${
                    calendarViewMode === "TIME"
                      ? "bg-white text-onyx shadow-2xs font-bold"
                      : "text-ash hover:text-onyx"
                  }`}
                >
                  <Clock className="h-3.5 w-3.5 text-forest" />
                  <span>By Time Slot</span>
                </button>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2.5">
                {/* Site Filter */}
                <div className="relative">
                  <select
                    value={selectedSite}
                    onChange={(e) => setSelectedSite(e.target.value)}
                    className="appearance-none rounded-[8px] border border-pebble/80 bg-white px-3 py-1.5 pr-8 text-xs font-medium text-onyx hover:border-ash focus:outline-none focus:ring-1 focus:ring-forest transition cursor-pointer"
                  >
                    <option value="ALL">All Sites</option>
                    {allSites.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ash" />
                </div>

                {/* Worker Filter */}
                <div className="relative">
                  <select
                    value={selectedWorker}
                    onChange={(e) => setSelectedWorker(e.target.value)}
                    className="appearance-none rounded-[8px] border border-pebble/80 bg-white px-3 py-1.5 pr-8 text-xs font-medium text-onyx hover:border-ash focus:outline-none focus:ring-1 focus:ring-forest transition cursor-pointer"
                  >
                    <option value="ALL">All Workers</option>
                    {activeWorkers.map((w) => (
                      <option key={w.id} value={w.name}>
                        {w.name} ({w.role})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ash" />
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* VIEW 1: CREW DISPATCH (BY WORKER) GRID                                    */}
            {/* ========================================================================= */}
            {calendarViewMode === "WORKER" && (
              <div className="bg-white rounded-[14px] border border-pebble/70 shadow-2xs overflow-x-auto">
                <div className="min-w-[1050px]">
                  {/* Header: Left Worker Info + 7 Days of Week */}
                  <div className="grid grid-cols-[240px_repeat(7,minmax(0,1fr))] border-b border-pebble/70 bg-stone/40">
                    <div className="p-3 border-r border-pebble/60 text-xs font-bold text-onyx uppercase tracking-wider flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users2 className="h-4 w-4 text-forest" />
                        <span>Crew Members ({activeWorkers.length})</span>
                      </div>
                      <span className="text-[10px] text-ash font-medium lowercase">
                        week load
                      </span>
                    </div>

                    {calendarDays.map((d) => {
                      // Total jobs on this specific day
                      const dayJobs = filteredScheduledJobs.filter((j) => {
                        const jobIso =
                          normalizeJobDate(j.date) ||
                          normalizeJobDate(j.dateFormatted);
                        return (
                          jobIso === d.fullDateIso ||
                          j.dayDate === d.dayDateStr ||
                          j.date === d.fullDateDmy ||
                          j.dateFormatted === d.formattedStr
                        );
                      });

                      const totalHours = dayJobs.reduce((acc, curr) => {
                        return acc + getJobDuration(curr.timeSlot).hours;
                      }, 0);

                      return (
                        <div
                          key={d.day}
                          className="p-2.5 text-center border-r last:border-r-0 border-pebble/60 min-w-0"
                        >
                          <div className="text-xs font-bold text-onyx uppercase tracking-wider">
                            {d.day}
                          </div>
                          <div className="text-xs text-ash mt-0.5">
                            {d.dateNum} {d.month}
                          </div>
                          {dayJobs.length > 0 ? (
                            <div className="mt-1 flex items-center justify-center">
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-forest/15 text-forest border border-forest/30">
                                {dayJobs.length} {dayJobs.length === 1 ? "Job" : "Jobs"} ({totalHours}h)
                              </span>
                            </div>
                          ) : (
                            <div className="mt-1 text-[10px] text-ash/60">Free</div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Worker Rows */}
                  <div className="divide-y divide-pebble/40">
                    {activeWorkers
                      .filter(
                        (w) => selectedWorker === "ALL" || w.name === selectedWorker
                      )
                      .map((worker) => {
                        // Calculate total hours booked for this worker in this 7-day window
                        const workerWeekJobs = filteredScheduledJobs.filter((j) => {
                          const matchWorker =
                            j.worker?.trim().toLowerCase() ===
                            worker.name.trim().toLowerCase();
                          if (!matchWorker) return false;
                          return calendarDays.some((d) => {
                            const jobIso =
                              normalizeJobDate(j.date) ||
                              normalizeJobDate(j.dateFormatted);
                            return (
                              jobIso === d.fullDateIso ||
                              j.dayDate === d.dayDateStr ||
                              j.date === d.fullDateDmy ||
                              j.dateFormatted === d.formattedStr
                            );
                          });
                        });

                        const totalWorkerHours = workerWeekJobs.reduce(
                          (acc, curr) => acc + getJobDuration(curr.timeSlot).hours,
                          0
                        );

                        return (
                          <div
                            key={worker.id || worker.name}
                            className="grid grid-cols-[240px_repeat(7,minmax(0,1fr))] min-h-[76px] hover:bg-stone/10 transition"
                          >
                            {/* Worker Info Column */}
                            <div className="p-3 border-r border-pebble/60 flex items-center justify-between gap-2 bg-stone/20">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                    worker.avatarBg || "bg-emerald-100 text-emerald-800"
                                  }`}
                                >
                                  {worker.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .slice(0, 2)
                                    .join("")
                                    .toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-onyx truncate leading-tight">
                                    {worker.name}
                                  </p>
                                  <p className="text-[11px] text-ash truncate mt-0.5">
                                    {worker.trade || worker.role}
                                  </p>
                                </div>
                              </div>

                              {totalWorkerHours > 0 ? (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-forest/15 text-forest shrink-0">
                                  {totalWorkerHours}h
                                </span>
                              ) : (
                                <span className="text-[10px] text-ash/60 shrink-0">
                                  0h
                                </span>
                              )}
                            </div>

                            {/* 7 Day Schedule Cells for this Worker */}
                            {calendarDays.map((d) => {
                              const dayJobs = filteredScheduledJobs.filter((j) => {
                                const matchWorker =
                                  j.worker?.trim().toLowerCase() ===
                                  worker.name.trim().toLowerCase();
                                if (!matchWorker) return false;
                                const jobIso =
                                  normalizeJobDate(j.date) ||
                                  normalizeJobDate(j.dateFormatted);
                                return (
                                  jobIso === d.fullDateIso ||
                                  j.dayDate === d.dayDateStr ||
                                  j.date === d.fullDateDmy ||
                                  j.dateFormatted === d.formattedStr
                                );
                              });

                              return (
                                <div
                                  key={d.day}
                                  onClick={() => {
                                    if (dayJobs.length === 0) {
                                      // Pre-fill worker and exact day
                                      handleOpenScheduleModal(
                                        undefined,
                                        d.fullDateDmy,
                                        "09:00 AM - 05:00 PM",
                                        worker.name
                                      );
                                    }
                                  }}
                                  className={`p-1.5 border-r last:border-r-0 border-pebble/40 relative transition-colors flex flex-col justify-start gap-1.5 min-w-0 ${
                                    dayJobs.length > 0
                                      ? "bg-white"
                                      : "hover:bg-breath/30 cursor-pointer group"
                                  }`}
                                >
                                  {dayJobs.map((job) => {
                                    const duration = getJobDuration(job.timeSlot);
                                    return (
                                      <div
                                        key={job.id}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedJobDetails(job);
                                        }}
                                        className={`rounded-[7px] p-2 border shadow-2xs transition hover:shadow-md hover:scale-[1.01] cursor-pointer min-w-0 overflow-hidden ${
                                          getCardClasses(job.colorScheme).bg
                                        }`}
                                        title={`${job.id}: ${job.title} • ${job.timeSlot} (${job.site})`}
                                      >
                                        <div className="flex items-center justify-between gap-1 min-w-0">
                                          <span className="font-black text-[11px] tracking-tight shrink-0">
                                            {job.id}
                                          </span>
                                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-black/10 shrink-0">
                                            {job.timeSlot.split("-")[0]?.trim()}
                                          </span>
                                        </div>
                                        <div className="text-[11px] font-bold leading-snug mt-1 truncate text-onyx">
                                          {job.title}
                                        </div>
                                        <div
                                          className={`text-[10px] leading-tight mt-1 truncate flex items-center justify-between gap-1 ${
                                            getCardClasses(job.colorScheme).sub
                                          }`}
                                        >
                                          <span className="truncate opacity-80">
                                            {job.site}
                                          </span>
                                          <span className="text-[9px] font-semibold shrink-0">
                                            {duration.hours}h
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}

                                  {dayJobs.length === 0 && (
                                    <div className="hidden group-hover:flex items-center justify-center h-full text-forest/70 py-4 gap-1 text-[11px] font-semibold">
                                      <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                                      <span>Assign</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 2: HOURLY TIME SLOT (TIMELINE) GRID                                  */}
            {/* ========================================================================= */}
            {calendarViewMode === "TIME" && (
              <div className="bg-white rounded-[14px] border border-pebble/70 shadow-2xs overflow-x-auto">
                <div className="min-w-[960px]">
                  {/* Calendar Days Header */}
                  <div className="grid grid-cols-[72px_repeat(7,minmax(0,1fr))] border-b border-pebble/70 bg-stone/40">
                    <div className="p-2.5 border-r border-pebble/60 text-center text-xs font-semibold text-ash flex flex-col justify-center">
                      <span>Time</span>
                    </div>
                    {calendarDays.map((d) => {
                      const dayJobs = filteredScheduledJobs.filter((j) => {
                        const jobIso =
                          normalizeJobDate(j.date) ||
                          normalizeJobDate(j.dateFormatted);
                        return (
                          jobIso === d.fullDateIso ||
                          j.dayDate === d.dayDateStr ||
                          j.date === d.fullDateDmy ||
                          j.dateFormatted === d.formattedStr
                        );
                      });

                      const totalHours = dayJobs.reduce((acc, curr) => {
                        return acc + getJobDuration(curr.timeSlot).hours;
                      }, 0);

                      return (
                        <div
                          key={d.day}
                          className="p-2.5 text-center border-r last:border-r-0 border-pebble/60 min-w-0"
                        >
                          <div className="text-xs font-bold text-onyx uppercase tracking-wider">
                            {d.day}
                          </div>
                          <div className="text-xs text-ash mt-0.5">
                            {d.dateNum} {d.month}
                          </div>
                          {dayJobs.length > 0 ? (
                            <div className="mt-1 flex items-center justify-center gap-1">
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-forest/15 text-forest border border-forest/30">
                                {dayJobs.length} {dayJobs.length === 1 ? "Job" : "Jobs"} ({totalHours}h)
                              </span>
                            </div>
                          ) : (
                            <div className="mt-1 text-[10px] text-ash/60">
                              Free
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Time Slots Rows (Clean rendering without duplicate ongoing bars) */}
                  <div className="relative divide-y divide-pebble/40">
                    {timeSlots.map((time, timeIdx) => (
                      <div
                        key={time}
                        className="grid grid-cols-[72px_repeat(7,minmax(0,1fr))] min-h-[58px]"
                      >
                        {/* Hour Label */}
                        <div className="p-1.5 border-r border-pebble/60 text-[11px] font-semibold text-ash text-center select-none flex items-center justify-center bg-stone/10">
                          {time}
                        </div>

                        {/* Day Grid Cells */}
                        {calendarDays.map((d, dayIdx) => {
                          const slotHour = getSlotHour24(time);

                          // Jobs that START at this specific hour
                          const startingJobs = filteredScheduledJobs.filter((j) => {
                            const jobIso =
                              normalizeJobDate(j.date) ||
                              normalizeJobDate(j.dateFormatted);
                            const matchDay =
                              jobIso === d.fullDateIso ||
                              j.dayDate === d.dayDateStr ||
                              j.date === d.fullDateDmy ||
                              j.dateFormatted === d.formattedStr;

                            if (!matchDay) return false;

                            const jobStartHour = getStartHour24(
                              j.startTime || j.timeSlot?.split("-")[0]
                            );

                            return (
                              (slotHour === 8 && jobStartHour <= 8) ||
                              (slotHour === 18 && jobStartHour >= 18) ||
                              jobStartHour === slotHour
                            );
                          });

                          const hasJobs = startingJobs.length > 0;

                          return (
                            <div
                              key={d.day}
                              onClick={() => {
                                if (!hasJobs) {
                                  handleOpenScheduleModal(
                                    undefined,
                                    d.fullDateDmy,
                                    `${time} - 05:00 PM`
                                  );
                                }
                              }}
                              className={`p-1.5 border-r last:border-r-0 border-pebble/40 relative transition-colors min-w-0 flex flex-col justify-start gap-1.5 ${
                                hasJobs
                                  ? "bg-white"
                                  : "hover:bg-breath/20 cursor-pointer group"
                              }`}
                            >
                              {/* Starting Job Cards (Multiple jobs stack cleanly side-by-side or stacked) */}
                              {startingJobs.map((matchingJob) => {
                                const duration = getJobDuration(matchingJob.timeSlot);
                                return (
                                  <div
                                    key={matchingJob.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedJobDetails(matchingJob);
                                    }}
                                    className={`rounded-[7px] p-2 border shadow-2xs transition hover:shadow-md hover:scale-[1.01] cursor-pointer min-w-0 overflow-hidden ${
                                      getCardClasses(matchingJob.colorScheme).bg
                                    }`}
                                    title={`${matchingJob.id}: ${matchingJob.title} (${matchingJob.worker}) • ${matchingJob.timeSlot}`}
                                  >
                                    <div className="flex items-center justify-between gap-1 min-w-0">
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <span className="font-extrabold text-[11px] tracking-tight shrink-0">
                                          {matchingJob.id}
                                        </span>
                                        {duration.hours > 1 && (
                                          <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-black/10 shrink-0">
                                            {duration.label}
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/10 shrink-0 whitespace-nowrap">
                                        {matchingJob.timeSlot}
                                      </span>
                                    </div>
                                    <div className="text-[11px] font-bold leading-snug mt-1 truncate text-onyx">
                                      {matchingJob.title}
                                    </div>
                                    <div
                                      className={`text-[10px] leading-tight mt-1 truncate flex items-center justify-between gap-1 ${
                                        getCardClasses(matchingJob.colorScheme).sub
                                      }`}
                                    >
                                      <span className="font-semibold truncate flex items-center gap-1">
                                        <User className="h-3 w-3 shrink-0 opacity-70" />
                                        {matchingJob.worker}
                                      </span>
                                      <span className="opacity-75 truncate text-[9px] max-w-[80px]">
                                        {matchingJob.site}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}

                              {/* Hover prompt for empty slot */}
                              {!hasJobs && (
                                <div className="hidden group-hover:flex items-center justify-center h-full text-ash/60 py-2">
                                  <Plus className="h-3.5 w-3.5" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. LIST VIEW (SCREEN 7)                                                  */}
        {/* ========================================================================= */}
        {activeTab === "LIST" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Filter Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-[12px] border border-pebble/60 shadow-2xs">
              <div className="flex items-center gap-2">
                {/* All Dates Filter */}
                <div className="relative">
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="appearance-none rounded-[8px] border border-pebble/80 bg-white pl-8 pr-8 py-1.5 text-xs font-semibold text-onyx hover:border-ash focus:outline-none focus:ring-1 focus:ring-forest transition cursor-pointer"
                  >
                    <option value="ALL">All Dates</option>
                    {calendarDays.map((d) => (
                      <option key={d.fullDateDmy} value={d.formattedStr}>
                        {d.formattedStr}
                      </option>
                    ))}
                    {scheduledJobs.map((j) => {
                      const dVal = j.dateFormatted || j.date;
                      if (
                        !dVal ||
                        calendarDays.some(
                          (cd) =>
                            cd.formattedStr === dVal ||
                            cd.fullDateDmy === dVal
                        )
                      )
                        return null;
                      return (
                        <option key={j.id} value={dVal}>
                          {dVal}
                        </option>
                      );
                    })}
                  </select>
                  <CalendarIcon className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ash" />
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ash" />
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                {/* All Sites Filter */}
                <div className="relative">
                  <select
                    value={selectedSite}
                    onChange={(e) => setSelectedSite(e.target.value)}
                    className="appearance-none rounded-[8px] border border-pebble/80 bg-white px-3 py-1.5 pr-8 text-xs font-medium text-onyx hover:border-ash focus:outline-none focus:ring-1 focus:ring-forest transition cursor-pointer"
                  >
                    <option value="ALL">All Sites</option>
                    {allSites.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ash" />
                </div>

                {/* All Status Filter */}
                <div className="relative">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="appearance-none rounded-[8px] border border-pebble/80 bg-white px-3 py-1.5 pr-8 text-xs font-medium text-onyx hover:border-ash focus:outline-none focus:ring-1 focus:ring-forest transition cursor-pointer"
                  >
                    <option value="ALL">All Status</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ash" />
                </div>
              </div>
            </div>

            {/* List Table */}
            <div className="rounded-[14px] bg-white border border-pebble/70 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone/50 border-b border-pebble/70 text-ash uppercase font-semibold text-[11px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Job ID</th>
                      <th className="py-3 px-4">Job Title</th>
                      <th className="py-3 px-4">Worker</th>
                      <th className="py-3 px-4">Site</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pebble/40 text-onyx font-medium">
                    {filteredScheduledJobs.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-12 text-center text-ash text-sm"
                        >
                          No scheduled jobs found. Switch to &quot;Unscheduled
                          Jobs&quot; to slot field workers onto jobs.
                        </td>
                      </tr>
                    ) : (
                      filteredScheduledJobs.map((job) => (
                        <tr
                          key={job.id}
                          className="hover:bg-stone/40 transition group"
                        >
                          {/* Date */}
                          <td className="py-3.5 px-4 font-normal text-onyx whitespace-nowrap">
                            {job.dateFormatted || job.date}
                          </td>

                          {/* Job ID */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedJobDetails(job)}
                              className="font-bold text-forest hover:underline cursor-pointer"
                            >
                              {job.id}
                            </button>
                          </td>

                          {/* Job Title */}
                          <td className="py-3.5 px-4 font-semibold text-onyx">
                            {job.title}
                          </td>

                          {/* Worker */}
                          <td className="py-3.5 px-4 text-onyx whitespace-nowrap">
                            {job.worker}
                          </td>

                          {/* Site */}
                          <td className="py-3.5 px-4 text-ash whitespace-nowrap">
                            {job.site}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                job.status === "Scheduled"
                                  ? "bg-clear-bg text-forest border border-forest/20"
                                  : job.status === "In Progress"
                                  ? "bg-caution-bg text-caution-text border border-caution/30"
                                  : job.status === "Completed"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-pebble/30 text-ash"
                              }`}
                            >
                              {job.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap relative">
                            <button
                              type="button"
                              onClick={() =>
                                setActionMenuOpenId(
                                  actionMenuOpenId === job.id ? null : job.id
                                )
                              }
                              className="p-1 rounded-[6px] hover:bg-breath text-ash hover:text-onyx transition cursor-pointer"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>

                            {/* Dropdown menu */}
                            {actionMenuOpenId === job.id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-4 top-10 w-44 bg-white border border-pebble/80 rounded-[10px] shadow-lg py-1.5 z-20 text-left animate-in fade-in zoom-in-95 duration-100"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedJobDetails(job);
                                    setActionMenuOpenId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-onyx hover:bg-stone text-left font-medium transition cursor-pointer flex items-center gap-2"
                                >
                                  <FileText className="h-3.5 w-3.5 text-ash" />
                                  <span>View Details</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateJobStatus(
                                      job.id,
                                      job.status === "In Progress"
                                        ? "Completed"
                                        : "In Progress"
                                    );
                                    setActionMenuOpenId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-onyx hover:bg-stone text-left font-medium transition cursor-pointer flex items-center gap-2"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 text-forest" />
                                  <span>
                                    {job.status === "In Progress"
                                      ? "Mark Completed"
                                      : "Start / In Progress"}
                                  </span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    unscheduleJob(job.id);
                                    setActionMenuOpenId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-amber-700 hover:bg-stone text-left font-medium transition cursor-pointer flex items-center gap-2"
                                >
                                  <RotateCcw className="h-3.5 w-3.5 text-amber-600" />
                                  <span>Unschedule Job</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    deleteScheduledJob(job.id);
                                    setActionMenuOpenId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-hazard-text hover:bg-hazard-bg text-left font-medium transition cursor-pointer flex items-center gap-2 border-t border-pebble/40 mt-1 pt-1.5"
                                >
                                  <X className="h-3.5 w-3.5 text-hazard" />
                                  <span>Delete Schedule</span>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. UNSCHEDULED JOBS TAB                                                  */}
        {/* ========================================================================= */}
        {activeTab === "UNSCHEDULED" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="bg-breath/40 border border-pebble/60 rounded-[12px] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-onyx">
                  Backlog Work Packages Ready for Worker Dispatch
                </h3>
                <p className="text-xs text-ash mt-0.5">
                  These jobs have been assigned through tenders and work orders,
                  but not yet scheduled with a field worker on the calendar.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenScheduleModal()}
                className="flex items-center gap-2 rounded-[8px] bg-forest hover:bg-forest-hover text-white px-3 py-1.5 text-xs font-semibold shadow-xs transition cursor-pointer shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Schedule Next Job</span>
              </button>
            </div>

            {allUnscheduledJobs.length === 0 ? (
              <div className="rounded-[14px] bg-white border border-pebble/70 p-12 shadow-2xs text-center">
                <CheckCircle2 className="h-10 w-10 text-forest mx-auto mb-2" />
                <h3 className="text-base font-bold text-onyx">
                  All Assigned Jobs Are Scheduled!
                </h3>
                <p className="text-xs text-ash mt-1 max-w-sm mx-auto">
                  There are no unscheduled work orders in the queue. You can add a
                  new schedule anytime using the button above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allUnscheduledJobs.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-[12px] bg-white border border-pebble/70 p-5 shadow-2xs flex flex-col justify-between hover:border-forest/40 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-bold text-xs text-forest bg-clear-bg px-2.5 py-0.5 rounded-md">
                          {job.id}
                        </span>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            job.priority === "High"
                              ? "bg-hazard-bg text-hazard-text"
                              : job.priority === "Medium"
                              ? "bg-caution-bg text-caution-text"
                              : "bg-stone text-ash"
                          }`}
                        >
                          {job.priority} Priority
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-onyx">
                        {job.title}
                      </h4>
                      <p className="text-xs text-ash mt-1 line-clamp-2">
                        {job.description}
                      </p>

                      <div className="mt-3 pt-3 border-t border-pebble/40 space-y-1 text-xs text-ash">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-ash" />
                          <span className="truncate">{job.project}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-ash" />
                          <span className="truncate">{job.site}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-ash" />
                          <span>Est: {job.estimatedHours}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-pebble/40">
                      <button
                        type="button"
                        onClick={() => handleOpenScheduleModal(job.id)}
                        className="w-full flex items-center justify-center gap-2 rounded-[8px] bg-forest hover:bg-forest-hover text-white py-2 text-xs font-semibold shadow-xs transition cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Schedule Worker</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: SCHEDULE JOB (ASSIGN WORKER) - SCREEN 6                           */}
        {/* ========================================================================= */}
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-onyx/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-150">
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-pebble/80 p-6 animate-in zoom-in-95 duration-150"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-pebble/60">
                <h2 className="text-base font-bold text-onyx">Schedule Job</h2>
                <button
                  type="button"
                  onClick={handleCloseScheduleModal}
                  className="p-1 rounded-full text-ash hover:text-onyx hover:bg-stone transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitSchedule} className="space-y-4 mt-4">
                {/* Job Select */}
                <div>
                  <label className="block text-xs font-bold text-onyx mb-1">
                    Job <span className="text-hazard">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={modalJobId}
                      onChange={(e) => handleModalJobChange(e.target.value)}
                      required
                      className="w-full appearance-none rounded-[10px] border border-pebble/90 bg-white p-3 pr-10 text-xs font-semibold text-onyx focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest transition cursor-pointer"
                    >
                      {availableJobOptions.length === 0 ? (
                        <option value="JOB-401">
                          JOB-401 – Site Execution Works
                        </option>
                      ) : (
                        availableJobOptions.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.id} – {opt.title} {!opt.isScheduled ? "(Ready to Schedule)" : "(Scheduled)"}
                          </option>
                        ))
                      )}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ash" />
                  </div>
                  {/* Secondary info subtitle to match visual design */}
                  {(() => {
                    const currentJob = availableJobOptions.find(
                      (j) => j.id === modalJobId
                    );
                    return (
                      <p className="text-[11px] text-ash mt-1 pl-0.5">
                        Project: {currentJob?.project || "Skyline Apartments"} |
                        Site: {currentJob?.site || "Main Site"}
                      </p>
                    );
                  })()}
                </div>

                {/* Select Field Worker */}
                <div>
                  <label className="block text-xs font-bold text-onyx mb-1">
                    Select Field Worker <span className="text-hazard">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ash">
                      <User className="h-4 w-4" />
                    </div>
                    <select
                      value={modalWorker}
                      onChange={(e) => setModalWorker(e.target.value)}
                      required
                      className="w-full appearance-none rounded-[10px] border border-pebble/90 bg-white py-3 pl-9 pr-10 text-xs font-medium text-onyx focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest transition cursor-pointer"
                    >
                      {activeWorkers.map((w) => (
                        <option key={w.id} value={w.name}>
                          {w.name} ({w.role})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ash" />
                  </div>
                </div>

                {/* Date Input */}
                <div>
                  <label className="block text-xs font-bold text-onyx mb-1">
                    Date <span className="text-hazard">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ash">
                      <CalendarIcon className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={modalDate}
                      onChange={(e) => setModalDate(e.target.value)}
                      placeholder="15/09/2026"
                      required
                      className="w-full rounded-[10px] border border-pebble/90 bg-white py-3 pl-9 pr-3 text-xs font-medium text-onyx focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest transition"
                    />
                  </div>
                </div>

                {/* Time Input */}
                <div>
                  <label className="block text-xs font-bold text-onyx mb-1">
                    Time <span className="text-hazard">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ash">
                      <Clock className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={modalTime}
                      onChange={(e) => setModalTime(e.target.value)}
                      placeholder="09:00 AM - 05:00 PM"
                      required
                      className="w-full rounded-[10px] border border-pebble/90 bg-white py-3 pl-9 pr-3 text-xs font-medium text-onyx focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest transition"
                    />
                  </div>
                </div>

                {/* Notes (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-onyx mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={modalNotes}
                    onChange={(e) => setModalNotes(e.target.value)}
                    placeholder="Install electrical wiring for Block A. Carry required tools."
                    className="w-full rounded-[10px] border border-pebble/90 bg-white p-3 text-xs font-medium text-onyx focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest transition resize-none"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-pebble/60">
                  <button
                    type="button"
                    onClick={handleCloseScheduleModal}
                    className="rounded-[10px] border border-pebble/80 bg-white px-5 py-2.5 text-xs font-semibold text-onyx hover:bg-stone transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-[10px] bg-forest hover:bg-forest-hover text-white px-6 py-2.5 text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    Schedule
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DETAILS MODAL FOR SCHEDULED JOB                                          */}
        {/* ========================================================================= */}
        {selectedJobDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-onyx/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-150">
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-pebble/80 p-6 animate-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between pb-3 border-b border-pebble/60">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-forest bg-clear-bg px-2.5 py-0.5 rounded-md">
                    {selectedJobDetails.id}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      selectedJobDetails.status === "Scheduled"
                        ? "bg-clear-bg text-forest border border-forest/20"
                        : "bg-caution-bg text-caution-text"
                    }`}
                  >
                    {selectedJobDetails.status}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedJobDetails(null)}
                  className="p-1 rounded-full text-ash hover:text-onyx hover:bg-stone transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3.5">
                <div>
                  <h3 className="text-base font-bold text-onyx">
                    {selectedJobDetails.title}
                  </h3>
                  <p className="text-xs text-ash mt-0.5">
                    {selectedJobDetails.project}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-stone/50 p-3 rounded-[10px] text-xs">
                  <div>
                    <span className="text-ash block text-[11px]">
                      Assigned Worker
                    </span>
                    <span className="font-semibold text-onyx flex items-center gap-1.5 mt-0.5">
                      <User className="h-3.5 w-3.5 text-forest" />
                      {selectedJobDetails.worker}
                    </span>
                  </div>
                  <div>
                    <span className="text-ash block text-[11px]">
                      Site Location
                    </span>
                    <span className="font-semibold text-onyx flex items-center gap-1.5 mt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-forest" />
                      {selectedJobDetails.site}
                    </span>
                  </div>
                  <div>
                    <span className="text-ash block text-[11px]">Date</span>
                    <span className="font-semibold text-onyx flex items-center gap-1.5 mt-0.5">
                      <CalendarIcon className="h-3.5 w-3.5 text-forest" />
                      {selectedJobDetails.dateFormatted ||
                        selectedJobDetails.date}
                    </span>
                  </div>
                  <div>
                    <span className="text-ash block text-[11px]">
                      Scheduled Time
                    </span>
                    <span className="font-semibold text-onyx flex items-center gap-1.5 mt-0.5">
                      <Clock className="h-3.5 w-3.5 text-forest" />
                      {selectedJobDetails.timeSlot}
                    </span>
                  </div>
                </div>

                {selectedJobDetails.notes && (
                  <div>
                    <span className="text-xs font-bold text-onyx block mb-1">
                      Notes & Instructions
                    </span>
                    <div className="p-3 bg-breath/20 rounded-[8px] text-xs text-onyx border border-pebble/60">
                      {selectedJobDetails.notes}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 pt-5 mt-4 border-t border-pebble/60">
                <button
                  type="button"
                  onClick={() => {
                    unscheduleJob(selectedJobDetails.id);
                    setSelectedJobDetails(null);
                  }}
                  className="rounded-[10px] border border-amber-300 text-amber-800 hover:bg-amber-50 px-3.5 py-2 text-xs font-semibold transition cursor-pointer"
                >
                  Unschedule
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      updateJobStatus(
                        selectedJobDetails.id,
                        selectedJobDetails.status === "Completed"
                          ? "Scheduled"
                          : "Completed"
                      );
                      setSelectedJobDetails(null);
                    }}
                    className="rounded-[10px] bg-forest hover:bg-forest-hover text-white px-4 py-2 text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    {selectedJobDetails.status === "Completed"
                      ? "Reopen Schedule"
                      : "Mark Completed"}
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

export default function SchedulingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-ash text-sm">Loading schedule...</div>}>
      <SchedulingContent />
    </Suspense>
  );
}
