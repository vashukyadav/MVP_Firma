import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/lib/db";

type AuthUser = Omit<User, "password">;

type AuthState = {
  currentUser: AuthUser | null;
  setUser: (user: AuthUser) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,

      setUser: (user) => {
        set({ currentUser: user });
      },

      logout: () => {
        set({ currentUser: null });
      },
    }),
    {
      name: "mini-firma-auth",
    }
  )
);