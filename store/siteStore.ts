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
    id: "SITE-01",
    name: "Skyline Apartments • Main Site Area",
    projectName: "Skyline Apartments",
    address: "Plot 42, Sector 62, Golf Course Extension Road",
    city: "Gurugram",
    state: "Haryana",
    pincode: "122011",
    siteManagerId: "crew-4",
    siteManagerName: "Mohit Singh",
    siteManagerPhone: "+91 98765 43213",
    status: "Active",
    startDate: "15 Jul 2025",
    expectedCompletion: "30 Dec 2026",
    totalAreaSqFt: "85,000 sq.ft",
    notes: "High-rise residential tower execution. Structural framing and MEP ongoing on 14th floor.",
    createdAt: "2025-07-15",
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
        set({ sites: defaultSitesList });
      },
    }),
    {
      name: "mini-firma-sites-store-v1",
      storage: createJSONStorage(() => sessionStorage),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (!state.sites || state.sites.length === 0) {
          state.sites = [...defaultSitesList];
        }
      },
    }
  )
);
