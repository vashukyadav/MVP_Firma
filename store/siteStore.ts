import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type SiteStatus = "Active" | "Mobilizing" | "Completed" | "On Hold";

export interface ConstructionSite {
  id: string; // e.g. "SITE-01"
  name: string; // e.g. "Skyline Apartments • Main Tower"
  projectName: string; // e.g. "Skyline Apartments"
  address: string; // e.g. "Plot 42, Sector 62, Golf Course Ext Road"
  city: string; // e.g. "Gurugram"
  state: string; // e.g. "Haryana"
  pincode: string; // e.g. "122011"
  siteManagerId?: string; // e.g. "crew-4"
  siteManagerName: string; // e.g. "Mohit Singh"
  siteManagerPhone?: string; // e.g. "+91 98765 43213"
  status: SiteStatus;
  startDate: string; // e.g. "15 Jul 2025"
  expectedCompletion: string; // e.g. "30 Dec 2026"
  totalAreaSqFt?: string; // e.g. "85,000 sq.ft"
  notes?: string;
  createdAt: string;
}

interface SiteState {
  sites: ConstructionSite[];
  addSite: (site: Omit<ConstructionSite, "id" | "createdAt">) => ConstructionSite;
  updateSite: (id: string, updates: Partial<ConstructionSite>) => void;
  deleteSite: (id: string) => void;
  resetToDefaults: () => void;
}

export const defaultSitesList: ConstructionSite[] = [];

export const useSiteStore = create<SiteState>()(
  persist(
    (set, get) => ({
      sites: defaultSitesList,

      addSite: (data) => {
        const nextNum = get().sites.length + 1;
        const id = `SITE-${String(nextNum).padStart(2, "0")}`;
        const newSite: ConstructionSite = {
          ...data,
          id,
          createdAt: new Date().toISOString().split("T")[0],
        };
        set((state) => ({
          sites: [newSite, ...state.sites],
        }));
        return newSite;
      },

      updateSite: (id, updates) => {
        set((state) => ({
          sites: state.sites.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }));
      },

      deleteSite: (id) => {
        set((state) => ({
          sites: state.sites.filter((s) => s.id !== id),
        }));
      },

      resetToDefaults: () => {
        set({ sites: [] });
      },
    }),
    {
      name: "mini-firma-sites-store-v2",
      storage: {
        getItem: (name: string) => {
          if (typeof window === "undefined") return null;
          try {
            const localVal = localStorage.getItem(name);
            if (localVal) return JSON.parse(localVal);
            const sessionVal = sessionStorage.getItem(name);
            if (sessionVal) {
              localStorage.setItem(name, sessionVal);
              return JSON.parse(sessionVal);
            }
          } catch (e) {
            console.error("Failed to read site store:", e);
          }
          return null;
        },
        setItem: (name: string, value: unknown) => {
          if (typeof window === "undefined") return;
          try {
            localStorage.setItem(name, JSON.stringify(value));
          } catch (e) {
            console.error("Failed to save site store:", e);
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
    }
  )
);
