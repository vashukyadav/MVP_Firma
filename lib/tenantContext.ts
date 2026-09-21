/**
 * Multi-Tenancy Organization Storage & Context Helper
 *
 * Ensures that all Zustand stores and database queries operate strictly
 * within the active user's Organization (companyId).
 */

export function getActiveCompanyId(): string {
  if (typeof window === "undefined") return "ORG-DEFAULT";
  try {
    const raw =
      window.sessionStorage.getItem("mini-firma-auth") ||
      window.localStorage.getItem("mini-firma-auth");
    if (raw) {
      const parsed = JSON.parse(raw);
      const companyId = parsed?.state?.currentUser?.companyId;
      if (companyId && typeof companyId === "string" && companyId.trim().length > 0) {
        return companyId.trim();
      }
    }
  } catch {
    // Storage access might be restricted in some environments
  }
  return "ORG-DEFAULT";
}

/**
 * Generates a tenant-scoped storage key for localStorage / sessionStorage
 */
import { createJSONStorage, type StateStorage } from "zustand/middleware";

export function getTenantStorageKey(baseName: string, companyId?: string): string {
  const cId = companyId || getActiveCompanyId();
  return `${baseName}_${cId}`;
}

/**
 * Creates a Zustand persist storage adapter that dynamically scopes
 * persistence to the active tenant's companyId.
 */
export function createTenantStorage<S = any>(baseName: string) {
  const storageAdapter: StateStorage = {
    getItem: (name: string): string | null => {
      if (typeof window === "undefined") return null;
      try {
        const activeCId = getActiveCompanyId();
        const tenantKey = `${baseName}_${activeCId}`;
        const item = window.localStorage.getItem(tenantKey);
        if (item) return item;

        // Fallback for demo tenant backwards compatibility
        if (activeCId === "ORG-DEFAULT") {
          return (
            window.localStorage.getItem(name) ||
            window.sessionStorage.getItem(name)
          );
        }
        return null;
      } catch (e) {
        console.error(`Failed to read tenant storage for ${baseName}:`, e);
        return null;
      }
    },
    setItem: (name: string, value: string): void => {
      if (typeof window === "undefined") return;
      try {
        const activeCId = getActiveCompanyId();
        const tenantKey = `${baseName}_${activeCId}`;
        window.localStorage.setItem(tenantKey, value);

        if (activeCId === "ORG-DEFAULT") {
          window.localStorage.setItem(name, value);
        }
      } catch (e) {
        console.error(`Failed to save tenant storage for ${baseName}:`, e);
      }
    },
    removeItem: (name: string): void => {
      if (typeof window === "undefined") return;
      try {
        const activeCId = getActiveCompanyId();
        const tenantKey = `${baseName}_${activeCId}`;
        window.localStorage.removeItem(tenantKey);
      } catch (e) {
        console.error(`Failed to remove tenant storage for ${baseName}:`, e);
      }
    },
  };

  return createJSONStorage<S>(() => storageAdapter);
}

// Registry of rehydrate functions to avoid circular dependencies
type RehydrateFn = () => void;
const storeRehydrators: Set<RehydrateFn> = new Set();

export function registerStoreRehydrator(fn: RehydrateFn): () => void {
  storeRehydrators.add(fn);
  return () => {
    storeRehydrators.delete(fn);
  };
}

/**
 * Triggers rehydration across all registered Zustand stores for the new tenant.
 */
export function rehydrateAllTenantStores(): void {
  if (typeof window === "undefined") return;
  storeRehydrators.forEach((rehydrate) => {
    try {
      rehydrate();
    } catch (e) {
      console.error("Store rehydration failed:", e);
    }
  });

  // Broadcast event for any UI listeners
  try {
    window.dispatchEvent(
      new CustomEvent("tenant-switched", {
        detail: { companyId: getActiveCompanyId() },
      })
    );
  } catch {}
}
