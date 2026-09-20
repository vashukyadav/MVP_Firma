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

export const defaultSitesList: ConstructionSite[] = [
  {
    id: "SITE-BHP",
    name: "Bhopal Site",
    projectName: "ABC Commercial Building",
    address: "Hoshangabad Road, Zone II",
    city: "Bhopal",
    state: "Madhya Pradesh",
    pincode: "462011",
    siteManagerName: "Site Manager",
    status: "Active",
    startDate: "01 Aug 2026",
    expectedCompletion: "30 Nov 2026",
    totalAreaSqFt: "45,000 sq.ft",
    createdAt: "2026-08-01",
  },
  {
    id: "SITE-SKY",
    name: "Skyline Apartments Main Yard",
    projectName: "Skyline Apartments • Phase 1",
    address: "Plot 42, Sector 62, Golf Course Ext Road",
    city: "Gurugram",
    state: "Haryana",
    pincode: "122011",
    siteManagerName: "Site Manager",
    status: "Active",
    startDate: "15 Jul 2026",
    expectedCompletion: "15 Jan 2027",
    totalAreaSqFt: "85,000 sq.ft",
    createdAt: "2026-07-15",
  },
  {
    id: "SITE-APX",
    name: "Apex Tech Park Site Yard",
    projectName: "Apex Tech Park & Corporate Towers",
    address: "Plot 14, Sector 63, Electronic City",
    city: "Noida",
    state: "Uttar Pradesh",
    pincode: "201301",
    siteManagerName: "Site Manager",
    status: "Active",
    startDate: "01 Sep 2026",
    expectedCompletion: "28 Feb 2027",
    totalAreaSqFt: "1,20,000 sq.ft",
    createdAt: "2026-09-01",
  },
];

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
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (!state.sites || state.sites.length === 0) {
          state.sites = [...defaultSitesList];
        } else if (state.sites.length < 3) {
          defaultSitesList.forEach((ds) => {
            if (
              !state.sites.some(
                (s) =>
                  s.id === ds.id ||
                  s.name.toLowerCase() === ds.name.toLowerCase()
              )
            ) {
              state.sites.push(ds);
            }
          });
        }
      },
    }
  )
);
