import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { JobPhoto, JobMaterial, JobNote } from "./tenderFlowStore";

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
  // Field-worker submission data
  photos?: JobPhoto[];
  materials?: JobMaterial[];
  notesList?: JobNote[];
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
  addPhotoToScheduledJob: (jobId: string, photo: JobPhoto) => void;
  addMaterialToScheduledJob: (jobId: string, material: JobMaterial) => void;
  addNoteToScheduledJob: (jobId: string, note: JobNote) => void;
  resetToDefaults: () => void;
}

export const defaultScheduledJobs: ScheduledJob[] = [];
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

      addPhotoToScheduledJob: (jobId, photo) => {
        set((state) => ({
          scheduledJobs: state.scheduledJobs.map((j) =>
            j.id === jobId
              ? { ...j, photos: [photo, ...(j.photos || [])] }
              : j
          ),
        }));
      },

      addMaterialToScheduledJob: (jobId, material) => {
        set((state) => ({
          scheduledJobs: state.scheduledJobs.map((j) =>
            j.id === jobId
              ? { ...j, materials: [...(j.materials || []), material] }
              : j
          ),
        }));
      },

      addNoteToScheduledJob: (jobId, note) => {
        set((state) => ({
          scheduledJobs: state.scheduledJobs.map((j) =>
            j.id === jobId
              ? { ...j, notesList: [...(j.notesList || []), note] }
              : j
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
      name: "mini-firma-scheduling-store-v3",
      storage: {
        getItem: (name: string) => {
          if (typeof window === "undefined") return null;
          try {
            const raw = localStorage.getItem(name) || sessionStorage.getItem(name);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (parsed?.state?.scheduledJobs && Array.isArray(parsed.state.scheduledJobs)) {
                const dummyJobIds = new Set([
                  "JOB-101", "JOB-102", "JOB-103", "JOB-104", "JOB-105", "JOB-106", "JOB-107",
                  "JOB-201", "JOB-202", "JOB-203", "J-001", "J-002", "J-003", "J-004", "J-005"
                ]);
                parsed.state.scheduledJobs = parsed.state.scheduledJobs.filter(
                  (j: ScheduledJob) => !dummyJobIds.has(j.id) && !/^J-00\d/.test(j.id)
                );
              }
              if (parsed?.state?.unscheduledJobs && Array.isArray(parsed.state.unscheduledJobs)) {
                const dummyJobIds = new Set([
                  "JOB-101", "JOB-102", "JOB-103", "JOB-104", "JOB-105", "JOB-106", "JOB-107",
                  "JOB-201", "JOB-202", "JOB-203", "J-001", "J-002", "J-003", "J-004", "J-005"
                ]);
                parsed.state.unscheduledJobs = parsed.state.unscheduledJobs.filter(
                  (j: UnscheduledJob) => !dummyJobIds.has(j.id) && !/^J-00\d/.test(j.id)
                );
              }
              return parsed;
            }
          } catch (e) {
            console.error("Failed to read scheduling store:", e);
          }
          return null;
        },
        setItem: (name: string, value: unknown) => {
          if (typeof window === "undefined") return;
          try {
            localStorage.setItem(name, JSON.stringify(value));
          } catch (e) {
            console.error("Failed to save scheduling store:", e);
          }
        },
        removeItem: (name: string) => {
          if (typeof window === "undefined") return;
          try {
            localStorage.removeItem(name);
            sessionStorage.removeItem(name);
          } catch (e) {}
        },
      },
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
          "JOB-201",
          "JOB-202",
          "JOB-203",
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
      },
    }
  )
);
