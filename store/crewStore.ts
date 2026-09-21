import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getActiveCompanyId,
  createTenantStorage,
  registerStoreRehydrator,
} from "@/lib/tenantContext";

export type CrewRole = "Field Worker" | "Site Manager" | "Office";
export type CrewStatus = "Active" | "On Leave" | "Inactive";

export interface CrewMember {
  id: string;
  companyId?: string;
  name: string;
  role: CrewRole;
  contact: string;
  status: CrewStatus;
  trade?: string;
  site?: string;
  email?: string;
  wageRate?: string;
  avatarBg?: string;
  joinedDate?: string;
}

interface CrewState {
  members: CrewMember[];
  setMembers: (members: CrewMember[]) => void;
  addMember: (member: Omit<CrewMember, "id">) => CrewMember;
  updateMember: (id: string, updates: Partial<CrewMember>) => void;
  deleteMember: (id: string) => void;
  resetToDefaults: () => void;
}

const defaultCrewMembers: CrewMember[] = [];

export const useCrewStore = create<CrewState>()(
  persist(
    (set, get) => ({
      members: defaultCrewMembers,

      setMembers: (members) => set({ members }),

      addMember: (memberData) => {
        const newMember: CrewMember = {
          ...memberData,
          id: `crew-${Date.now()}`,
          companyId: (memberData as any).companyId || getActiveCompanyId(),
          joinedDate:
            memberData.joinedDate ||
            new Date().toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
          avatarBg:
            memberData.avatarBg ||
            (memberData.role === "Field Worker"
              ? "bg-emerald-100 text-emerald-800"
              : memberData.role === "Site Manager"
              ? "bg-purple-100 text-purple-800"
              : "bg-blue-100 text-blue-800"),
        };

        set((state) => ({
          members: [newMember, ...state.members],
        }));

        return newMember;
      },

      updateMember: (id, updates) => {
        set((state) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        }));
      },

      deleteMember: (id) => {
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
        }));
      },

      resetToDefaults: () => {
        set({ members: [] });
      },
    }),
    {
      name: "mini-firma-crew-store-v2",
      storage: createTenantStorage("mini-firma-crew-store-v2"),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const dummyIds = new Set([
          "crew-1", "crew-2", "crew-3", "crew-4", "crew-5", "crew-6",
          "crew-7", "crew-8", "crew-9", "crew-10", "crew-11", "crew-12"
        ]);
        state.members = (state.members || []).filter((m) => !dummyIds.has(m.id));
      },
    }
  )
);

// Register store for automatic tenant rehydration
if (typeof window !== "undefined") {
  registerStoreRehydrator(() => {
    const cId = getActiveCompanyId();
    if (cId !== "ORG-DEFAULT") {
      useCrewStore.setState({ members: [] });
    }
    useCrewStore.persist.rehydrate();
  });
}
