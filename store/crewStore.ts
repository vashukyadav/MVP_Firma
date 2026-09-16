import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CrewRole = "Field Worker" | "Site Manager" | "Office";
export type CrewStatus = "Active" | "On Leave" | "Inactive";

export interface CrewMember {
  id: string;
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
  addMember: (member: Omit<CrewMember, "id">) => CrewMember;
  updateMember: (id: string, updates: Partial<CrewMember>) => void;
  deleteMember: (id: string) => void;
  resetToDefaults: () => void;
}

const defaultCrewMembers: CrewMember[] = [
  {
    id: "crew-1",
    name: "Amit Verma",
    role: "Field Worker",
    contact: "+91 98765 43210",
    status: "Active",
    trade: "Masonry & Structural",
    site: "Main Site",
    avatarBg: "bg-emerald-100 text-emerald-800",
    joinedDate: "10 Aug 2025",
  },
  {
    id: "crew-2",
    name: "Ravi Kumar",
    role: "Field Worker",
    contact: "+91 98765 43211",
    status: "Active",
    trade: "Electrical Conduit & Cabling",
    site: "Skyline Apartments",
    avatarBg: "bg-blue-100 text-blue-800",
    joinedDate: "12 Aug 2025",
  },
  {
    id: "crew-3",
    name: "Suresh Yadav",
    role: "Field Worker",
    contact: "+91 98765 43212",
    status: "Active",
    trade: "Plumbing & Piping",
    site: "Warehouse Project",
    avatarBg: "bg-amber-100 text-amber-800",
    joinedDate: "15 Aug 2025",
  },
  {
    id: "crew-4",
    name: "Mohit Singh",
    role: "Site Manager",
    contact: "+91 98765 43213",
    status: "Active",
    trade: "Site Supervision & Safety",
    site: "Skyline Apartments",
    avatarBg: "bg-purple-100 text-purple-800",
    joinedDate: "01 Jul 2025",
  },
  {
    id: "crew-5",
    name: "Vikram Sharma",
    role: "Field Worker",
    contact: "+91 98765 43214",
    status: "Active",
    trade: "Carpentry & Shuttering",
    site: "Main Site",
    avatarBg: "bg-teal-100 text-teal-800",
    joinedDate: "20 Aug 2025",
  },
  {
    id: "crew-6",
    name: "Dinesh Patel",
    role: "Field Worker",
    contact: "+91 98765 43215",
    status: "Active",
    trade: "Reinforcement Steel Fixing",
    site: "Skyline Apartments",
    avatarBg: "bg-rose-100 text-rose-800",
    joinedDate: "22 Aug 2025",
  },
  {
    id: "crew-7",
    name: "Rajesh Chauhan",
    role: "Field Worker",
    contact: "+91 98765 43216",
    status: "Active",
    trade: "Painting & Surface Prep",
    site: "Warehouse Project",
    avatarBg: "bg-indigo-100 text-indigo-800",
    joinedDate: "01 Sep 2025",
  },
  {
    id: "crew-8",
    name: "Manoj Tiwari",
    role: "Field Worker",
    contact: "+91 98765 43217",
    status: "Active",
    trade: "General Site Labor",
    site: "Main Site",
    avatarBg: "bg-stone text-onyx",
    joinedDate: "05 Sep 2025",
  },
  {
    id: "crew-9",
    name: "Pankaj Gupta",
    role: "Field Worker",
    contact: "+91 98765 43218",
    status: "Active",
    trade: "Tile & Flooring Laying",
    site: "Skyline Apartments",
    avatarBg: "bg-cyan-100 text-cyan-800",
    joinedDate: "08 Sep 2025",
  },
  {
    id: "crew-10",
    name: "Arun Joshi",
    role: "Site Manager",
    contact: "+91 98765 43219",
    status: "Active",
    trade: "Quality Assurance & Execution",
    site: "Warehouse Project",
    avatarBg: "bg-violet-100 text-violet-800",
    joinedDate: "10 Jul 2025",
  },
  {
    id: "crew-11",
    name: "Neha Sharma",
    role: "Office",
    contact: "+91 98765 43220",
    status: "Active",
    trade: "Billing & Vendor Accounts",
    site: "Head Office",
    avatarBg: "bg-emerald-100 text-emerald-800",
    joinedDate: "01 Jun 2025",
  },
  {
    id: "crew-12",
    name: "Pooja Mehta",
    role: "Office",
    contact: "+91 98765 43221",
    status: "Active",
    trade: "Procurement & Dispatch",
    site: "Head Office",
    avatarBg: "bg-fuchsia-100 text-fuchsia-800",
    joinedDate: "15 Jun 2025",
  },
];

export const useCrewStore = create<CrewState>()(
  persist(
    (set, get) => ({
      members: defaultCrewMembers,

      addMember: (memberData) => {
        const newMember: CrewMember = {
          ...memberData,
          id: `crew-${Date.now()}`,
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
        set({ members: defaultCrewMembers });
      },
    }),
    {
      name: "mini-firma-crew-store-v1",
    }
  )
);
