"use client";

import { useAuthStore } from "@/store/authStore";

const menuByRole = {
  OWNER: [
    "Dashboard",
    "Company",
    "Subscription",
    "Team & Admins",
    "Projects",
    "Reports",
    "Settings",
    "Help & Support",
  ],

  ACCOUNT_ADMIN: [
    "Dashboard",
    "Users & Roles",
    "Customers",
    "Enquiries",
    "Quotations",
    "Projects",
    "Jobs",
    "Reports",
    "Settings",
    "Help & Support",
  ],

  SALES_MANAGER: [
    "Dashboard",
    "Customers",
    "Leads",
    "Quotations",
    "Reports",
  ],

  PROJECT_MANAGER: [
    "Dashboard",
    "Projects",
    "Jobs",
    "Field Workers",
    "Reports",
  ],

  FIELD_WORKER: [
    "Dashboard",
    "My Jobs",
    "Tasks",
  ],

  FINANCE_MANAGER: [
    "Dashboard",
    "Invoices",
    "Payments",
    "Finance Reports",
  ],
};

export default function Sidebar() {
  const currentUser = useAuthStore((state) => state.currentUser);

  const menuItems = currentUser
    ? menuByRole[currentUser.role]
    : [];

  return (
    <aside className="w-60 bg-stone text-onyx border-r border-pebble p-4 space-y-4 font-sans">
      {/* Logo */}
      <div className="text-base font-black tracking-tight text-onyx">
        MINI FIRMA
      </div>

      {/* Menu */}
      <nav className="space-y-1 text-xs">
        {menuItems.map((item) => (
          <button
            key={item}
            type="button"
            className="w-full text-left px-3 py-2 rounded-[10px] text-ash hover:bg-mist/70 hover:text-onyx transition cursor-pointer"
          >
            {item}
          </button>
        ))}
      </nav>
    </aside>
  );
}