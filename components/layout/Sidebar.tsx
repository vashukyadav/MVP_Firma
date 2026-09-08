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
    "Enquiries",
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
    <aside>
      
      {/* Logo */}
      <div>
        MINI FIRMA
      </div>

      {/* Menu */}
      <nav>
        {menuItems.map((item) => (
          <button key={item}>
            {item}
          </button>
        ))}
      </nav>

    </aside>
  );
}