import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getActiveCompanyId,
  createTenantStorage,
  registerStoreRehydrator,
} from "@/lib/tenantContext";

export type SiteStatus = "Active" | "Mobilizing" | "Completed" | "On Hold";

export interface ConstructionSite {
  id: string; // e.g. "SITE-01"
  companyId?: string;
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
    companyId: "ORG-DEFAULT",
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
    companyId: "ORG-DEFAULT",
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
    companyId: "ORG-DEFAULT",
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
      sites: getActiveCompanyId() === "ORG-DEFAULT" ? defaultSitesList : [],

      addSite: (data) => {
        const nextNum = get().sites.length + 1;
        const id = `SITE-${String(nextNum).padStart(2, "0")}`;
        const newSite: ConstructionSite = {
          ...data,
          id,
          companyId: (data as any).companyId || getActiveCompanyId(),
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
      storage: createTenantStorage("mini-firma-sites-store-v2"),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const currentCompany = getActiveCompanyId();
        if (currentCompany === "ORG-DEFAULT") {
          if (!state.sites || state.sites.length === 0) {
            state.sites = [...defaultSitesList];
          }
        } else {
          if (!state.sites) state.sites = [];
        }
      },
    }
  )
);

// Register store for automatic tenant rehydration
if (typeof window !== "undefined") {
  registerStoreRehydrator(() => {
    const cId = getActiveCompanyId();
    if (cId !== "ORG-DEFAULT") {
      useSiteStore.setState({ sites: [] });
    }
    useSiteStore.persist.rehydrate();
  });
}
