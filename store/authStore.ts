import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/lib/db";
import { rehydrateAllTenantStores } from "@/lib/tenantContext";

type AuthUser = Omit<User, "password">;

type AuthState = {
  currentUser: AuthUser | null;
  setUser: (user: AuthUser) => void;
  logout: () => void;
};

// Migrate from localStorage to sessionStorage if needed, then remove from localStorage
// so each browser tab maintains its own independent session without overwriting others.
if (typeof window !== "undefined") {
  try {
    const legacyAuth = window.localStorage.getItem("mini-firma-auth");
    if (legacyAuth && !window.sessionStorage.getItem("mini-firma-auth")) {
      window.sessionStorage.setItem("mini-firma-auth", legacyAuth);
    }
    window.localStorage.removeItem("mini-firma-auth");
  } catch {
    // Storage access might be restricted in some environments
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,

      setUser: (user) => {
        set({ currentUser: user });
        // Synchronously rehydrate all stores for the user's company
        setTimeout(() => {
          rehydrateAllTenantStores();
        }, 0);
      },

      logout: () => {
        set({ currentUser: null });
        // Clear/rehydrate stores for unauthenticated/default state
        setTimeout(() => {
          rehydrateAllTenantStores();
        }, 0);
      },
    }),
    {
      name: "mini-firma-auth",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);