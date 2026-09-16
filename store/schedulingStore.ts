import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface ScheduledJob {
  id: string; // e.g. "JOB-101"
  title: string; // e.g. "Electrical Installation"
  project: string; // e.g. "Skyline Apartments"
  site: string; // e.g. "Main Site"
  worker: string; // e.g. "Amit Verma"
  workerRole?: string; // e.g. "Field Worker"
  date: string; // ISO date "2026-09-15" or formatted "15 Sep 2026"
  dateFormatted?: string; // "15 Sep 2026"
  startTime: string; // "08:30 AM" or "09:00 AM"
  endTime: string; // "10:00 AM" or "05:00 PM"
  timeSlot: string; // "09:00 AM - 05:00 PM" or "8:30 AM - 10:00 AM"
  notes?: string;
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled";
  colorScheme: "emerald" | "indigo" | "rose" | "teal" | "amber";
  dayOfWeek: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  dayDate: string; // "15 Sep"
}

export interface UnscheduledJob {
  id: string;
  title: string;
  project: string;
  site: string;
  trade: string;
  priority: "High" | "Medium" | "Low";
  estimatedHours: string;
  description: string;
}

export interface FieldWorker {
  id: string;
  name: string;
  role: string;
  trade: string;
  phone: string;
  avatarBg: string;
}

export interface SiteLocation {
  id: string;
  name: string;
  project: string;
}

interface SchedulingState {
  scheduledJobs: ScheduledJob[];
  unscheduledJobs: UnscheduledJob[];
  workers: FieldWorker[];
  sites: SiteLocation[];

  // Actions
  scheduleJob: (job: {
    jobId: string;
    title: string;
    project: string;
    site: string;
    worker: string;
    workerRole?: string;
    date: string;
    timeRange: string;
    notes?: string;
    colorScheme?: "emerald" | "indigo" | "rose" | "teal" | "amber";
  }) => ScheduledJob;

  updateScheduledJob: (id: string, updates: Partial<ScheduledJob>) => void;
  deleteScheduledJob: (id: string) => void;
  unscheduleJob: (id: string) => void;
  updateJobStatus: (id: string, status: ScheduledJob["status"]) => void;
  resetToDefaults: () => void;
}

export const defaultScheduledJobs: ScheduledJob[] = [
  {
    id: "JOB-201",
    title: "Electrical Installation & Distribution Board",
    project: "Skyline Apartments",
    site: "Main Site • Block A",
    worker: "Amit Verma",
    workerRole: "Field Worker",
    date: "15/09/2026",
    dateFormatted: "15 Sep 2026",
    startTime: "09:00 AM",
    endTime: "05:00 PM",
    timeSlot: "09:00 AM - 05:00 PM",
    notes: "Main conduit laying and distribution switchboard installation.",
    status: "In Progress",
    colorScheme: "emerald",
    dayOfWeek: "Tue",
    dayDate: "15 Sep",
  },
  {
    id: "JOB-202",
    title: "Plumbing Riser Installation",
    project: "Skyline Apartments",
    site: "Skyline Apartments • Tower 2",
    worker: "Ravi Kumar",
    workerRole: "Field Worker",
    date: "16/09/2026",
    dateFormatted: "16 Sep 2026",
    startTime: "08:30 AM",
    endTime: "04:30 PM",
    timeSlot: "08:30 AM - 04:30 PM",
    notes: "Fix high-pressure UPVC water supply pipes and drainage lines.",
    status: "Scheduled",
    colorScheme: "indigo",
    dayOfWeek: "Wed",
    dayDate: "16 Sep",
  },
  {
    id: "JOB-203",
    title: "Site Safety Supervision & Execution Check",
    project: "Skyline Apartments",
    site: "Skyline Apartments • Main Zone",
    worker: "Mohit Singh",
    workerRole: "Site Manager",
    date: "15/09/2026",
    dateFormatted: "15 Sep 2026",
    startTime: "08:00 AM",
    endTime: "05:00 PM",
    timeSlot: "08:00 AM - 05:00 PM",
    notes: "Daily safety briefing, crane perimeter inspection, work sign-off.",
    status: "In Progress",
    colorScheme: "teal",
    dayOfWeek: "Tue",
    dayDate: "15 Sep",
  },
];
const defaultUnscheduledJobs: UnscheduledJob[] = [];
const defaultWorkers: FieldWorker[] = [];
const defaultSites: SiteLocation[] = [];

export const useSchedulingStore = create<SchedulingState>()(
  persist(
    (set, get) => ({
      scheduledJobs: defaultScheduledJobs,
      unscheduledJobs: defaultUnscheduledJobs,
      workers: defaultWorkers,
      sites: defaultSites,

      scheduleJob: (data) => {
        let dateFormatted = data.date;
        let dayOfWeek: ScheduledJob["dayOfWeek"] = "Mon";
        let dayDate = "15 Sep";

        try {
          let parsedDate: Date;
          if (data.date.includes("/")) {
            const [d, m, y] = data.date.split("/").map(Number);
            parsedDate = new Date(y, m - 1, d);
          } else {
            parsedDate = new Date(data.date);
          }

          if (!isNaN(parsedDate.getTime())) {
            dateFormatted = parsedDate.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });
            const days: ScheduledJob["dayOfWeek"][] = [
              "Sun",
              "Mon",
              "Tue",
              "Wed",
              "Thu",
              "Fri",
              "Sat",
            ];
            dayOfWeek = days[parsedDate.getDay()];
            dayDate = parsedDate.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
            });
          }
        } catch {
          dateFormatted = data.date;
        }

        const colorPalette: ScheduledJob["colorScheme"][] = [
          "emerald",
          "indigo",
          "rose",
          "teal",
          "amber",
        ];
        const colorScheme =
          data.colorScheme ||
          colorPalette[get().scheduledJobs.length % colorPalette.length];

        const [startTime = "09:00 AM", endTime = "05:00 PM"] =
          data.timeRange.includes("-")
            ? data.timeRange.split("-").map((s) => s.trim())
            : [data.timeRange, "05:00 PM"];

        const newScheduledJob: ScheduledJob = {
          id: data.jobId,
          title: data.title,
          project: data.project,
          site: data.site,
          worker: data.worker,
          workerRole: data.workerRole || "Field Worker",
          date: data.date,
          dateFormatted,
          startTime,
          endTime,
          timeSlot: data.timeRange,
          notes: data.notes || "",
          status: "Scheduled",
          colorScheme,
          dayOfWeek,
          dayDate,
        };

        set((state) => ({
          scheduledJobs: [
            newScheduledJob,
            ...state.scheduledJobs.filter((j) => j.id !== data.jobId),
          ],
          unscheduledJobs: state.unscheduledJobs.filter((j) => j.id !== data.jobId),
        }));

        return newScheduledJob;
      },

      updateScheduledJob: (id, updates) => {
        set((state) => ({
          scheduledJobs: state.scheduledJobs.map((j) =>
            j.id === id ? { ...j, ...updates } : j
          ),
        }));
      },

      deleteScheduledJob: (id) => {
        set((state) => ({
          scheduledJobs: state.scheduledJobs.filter((j) => j.id !== id),
        }));
      },

      unscheduleJob: (id) => {
        const found = get().scheduledJobs.find((j) => j.id === id);
        if (!found) return;

        const newUnscheduled: UnscheduledJob = {
          id: found.id,
          title: found.title,
          project: found.project,
          site: found.site,
          trade: "General Trade",
          priority: "Medium",
          estimatedHours: "4 hrs",
          description: found.notes || `Unscheduled work order for ${found.site}.`,
        };

        set((state) => ({
          scheduledJobs: state.scheduledJobs.filter((j) => j.id !== id),
          unscheduledJobs: [newUnscheduled, ...state.unscheduledJobs],
        }));
      },

      updateJobStatus: (id, status) => {
        set((state) => ({
          scheduledJobs: state.scheduledJobs.map((j) =>
            j.id === id ? { ...j, status } : j
          ),
        }));
      },

      resetToDefaults: () => {
        set({
          scheduledJobs: [],
          unscheduledJobs: [],
          workers: [],
          sites: [],
        });
      },
    }),
    {
      name: "mini-firma-scheduling-store-v2",
      storage: createJSONStorage(() => sessionStorage),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const dummyJobIds = new Set([
          "JOB-101",
          "JOB-102",
          "JOB-103",
          "JOB-104",
          "JOB-105",
          "JOB-106",
          "JOB-107",
        ]);
        const dummyWorkerIds = new Set([
          "W-01",
          "W-02",
          "W-03",
          "W-04",
          "W-05",
        ]);
        const dummySiteIds = new Set([
          "SITE-01",
          "SITE-02",
          "SITE-03",
          "SITE-04",
          "SITE-05",
        ]);

        state.scheduledJobs = (state.scheduledJobs || []).filter(
          (j) => !dummyJobIds.has(j.id)
        );
        state.unscheduledJobs = (state.unscheduledJobs || []).filter(
          (j) => !dummyJobIds.has(j.id)
        );
        state.workers = (state.workers || []).filter(
          (w) => !dummyWorkerIds.has(w.id)
        );
        state.sites = (state.sites || []).filter(
          (s) => !dummySiteIds.has(s.id)
        );

        if (!state.scheduledJobs || state.scheduledJobs.length === 0) {
          state.scheduledJobs = [...defaultScheduledJobs];
        }
      },
    }
  )
);
