"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { useAuthStore } from "@/store/authStore";
import { db } from "@/lib/db";
import {
  Building2,
  LayoutDashboard,
  Building,
  CreditCard,
  Users,
  FolderKanban,
  BarChart3,
  Settings,
  HelpCircle,
  Bell,
  ChevronDown,
  UserPlus,
  Eye,
  EyeOff,
  ShieldCheck,
  X,
  LogOut,
  Search,
  ArrowRight,
  Briefcase,
  Layers,
  FileCheck2,
} from "lucide-react";

interface FirmaLayoutProps {
  children: React.ReactNode;
  activeNav?: string;
}

export default function FirmaLayout({ children, activeNav }: FirmaLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, logout } = useAuthStore();

  // Admin Modal State
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // User Dropdown State
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const user = currentUser || {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul@abcsolutions.com",
    role: "OWNER",
    size: 0,
  };

  const userInitial = (user.name?.charAt(0) || "R").toUpperCase();

  // Create Admin Submission
  const handleCreateAdmin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!adminName || !adminEmail || !adminPassword || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }

    if (adminPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const existingUser = await db.users
      .where("email")
      .equals(adminEmail)
      .first();

    if (existingUser) {
      alert("User with this email already exists");
      return;
    }

    await db.users.add({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: "ACCOUNT_ADMIN",
      size: 0,
    });

    alert("Account Admin created successfully!");

    setAdminName("");
    setAdminEmail("");
    setAdminPassword("");
    setConfirmPassword("");

    setAdminOpen(false);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Determine current active item
  const currentNav =
    activeNav ||
    (pathname === "/dashboard"
      ? "Dashboard"
      : pathname.startsWith("/company")
      ? "Company"
      : pathname.startsWith("/subscription")
      ? "Subscription"
      : pathname.startsWith("/team")
      ? "Team & Admins"
      : pathname.startsWith("/projects")
      ? "Projects"
      : pathname.startsWith("/customers")
      ? "Customers"
      : pathname.startsWith("/quotations")
      ? "Quotations"
      : pathname.startsWith("/jobs")
      ? "Jobs"
      : pathname.startsWith("/reports")
      ? "Reports"
      : pathname.startsWith("/setting")
      ? "Settings"
      : pathname.startsWith("/help")
      ? "Help & Support"
      : "");

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Company", href: "/company", icon: Building },
    { name: "Subscription", href: "/subscription", icon: CreditCard },
    { name: "Team & Admins", href: "/team", icon: Users },
    { name: "Projects", href: "/projects", icon: FolderKanban },
    { name: "Customers", href: "/customers", icon: Layers },
    { name: "Enquiries", href: "/quotations", icon: HelpCircle },
    { name: "Quotations", href: "/quotations", icon: FileCheck2 },
    { name: "Jobs", href: "/jobs", icon: Briefcase },
    { name: "Reports", href: "/reports", icon: BarChart3 },
    { name: "Settings", href: "/setting", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F5F6F5] flex text-slate-800 font-sans antialiased">
      {/* ========================================================================= */}
      {/* 1. LEFT SIDEBAR                                                           */}
      {/* ========================================================================= */}
      <aside className="w-60 bg-[#F5F6F5] flex flex-col justify-between shrink-0 hidden lg:flex p-4 pr-1 sticky top-0 h-screen">
        <div>
          {/* Logo & Brand Header */}
          <div
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-3 px-2 py-3 mb-4 cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white shadow-xs">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-slate-900 block leading-tight">
                FIRMA
              </span>
              <span className="text-[10px] font-medium text-slate-500 block leading-none mt-0.5">
                Build Smarter. Together.
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs">
            {navItems.map((item) => {
              const isActive = currentNav === item.name;
              const Icon = item.icon;

              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => router.push(item.href)}
                  className={`flex w-full items-center gap-3 px-3.5 py-2 transition text-left cursor-pointer ${
                    isActive
                      ? "rounded-2xl bg-[#E5EDE7] font-semibold text-[#182E25] shadow-2xs"
                      : "rounded-xl font-medium text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      isActive ? "text-[#182E25]" : "text-slate-500"
                    }`}
                  />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom Promo Card ("Smarter people. Stronger projects.") */}
        <div className="mt-6 rounded-2xl bg-[#EBE7DF] p-4 relative overflow-hidden flex flex-col justify-between h-36 shadow-xs group">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-85">
            <Image
              src="/images/sidebar_leaves.jpg"
              alt="Botanical Leaves"
              fill
              className="object-cover object-right mix-blend-multiply"
            />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-slate-900 leading-snug">
              Smarter
              <br />
              people.
              <br />
              Stronger
              <br />
              projects.
            </p>
          </div>
          <div className="relative z-10 flex justify-end">
            <button
              type="button"
              onClick={() => router.push("/team")}
              className="w-7 h-7 rounded-full bg-[#182E25] text-white flex items-center justify-center hover:scale-105 transition shadow-xs cursor-pointer"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN CONTENT AREA                                                      */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 px-6 flex items-center justify-between gap-4 sticky top-0 z-20 bg-[#F5F6F5]/90 backdrop-blur-md border-b border-slate-200/40">
          {/* Left: Search input */}
          <div className="flex-1 max-w-md">
            <div className="flex items-center gap-2.5 rounded-xl bg-[#EBECEB] px-3.5 py-2 text-xs text-slate-600 focus-within:ring-2 focus-within:ring-slate-300 transition">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search anything... (projects, users, customers)"
                className="w-full bg-transparent text-slate-800 placeholder-slate-400 outline-none text-xs"
              />
            </div>
          </div>

          {/* Right: Notifications & User Profile Pill */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button
              type="button"
              className="relative p-2 rounded-full hover:bg-slate-200/60 text-slate-600 transition cursor-pointer"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 hover:bg-slate-200/50 transition cursor-pointer"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#182E25] text-xs font-bold text-white shadow-xs">
                  {userInitial}S
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[10px] font-medium text-slate-400 leading-none capitalize">
                    {user.role?.toLowerCase() || "Owner"}
                  </p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-100 bg-white py-1.5 shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-800">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-slate-400 capitalize">
                      {user.role?.toLowerCase() || "owner"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setAdminOpen(true);
                    }}
                    className="flex w-full items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    <UserPlus className="h-3.5 w-3.5 text-slate-500" />
                    Add Admin
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50/60 transition"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 px-6 pb-8 space-y-5 max-w-[1400px] w-full mx-auto">
          {children}

          {/* Footer */}
          <footer className="pt-6 pb-2 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-900" />
              <span className="font-bold text-slate-900 tracking-tight">
                FIRMA
              </span>
              <span className="text-[11px]">
                &copy; 2025 FIRMA, All rights reserved.
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <button
                type="button"
                onClick={() => router.push("/help")}
                className="hover:text-slate-600 transition cursor-pointer"
              >
                Privacy
              </button>
              <button
                type="button"
                onClick={() => router.push("/help")}
                className="hover:text-slate-600 transition cursor-pointer"
              >
                Terms
              </button>
              <button
                type="button"
                onClick={() => router.push("/help")}
                className="hover:text-slate-600 transition cursor-pointer"
              >
                Support
              </button>
            </div>

            <div className="text-[11px] text-slate-500 font-medium">
              &mdash; Built for a better tomorrow.
            </div>
          </footer>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 3. SHARED MODAL: Add Account Admin Dialog Modal                           */}
      {/* ========================================================================= */}
      {adminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150 relative">
            <button
              type="button"
              onClick={() => setAdminOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Add Account Admin
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Create an account admin to help you manage your organization.
              </p>
            </div>

            <form onSubmit={handleCreateAdmin} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-0.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Pooja Verma"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 shadow-2xs outline-none transition focus:border-slate-800 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-0.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="pooja@abcsolutions.com"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 shadow-2xs outline-none transition focus:border-slate-800 focus:ring-2 focus:ring-slate-100"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-0.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 pr-9 text-xs text-slate-800 placeholder-slate-400 shadow-2xs outline-none transition focus:border-slate-800 focus:ring-2 focus:ring-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-0.5">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 pr-9 text-xs text-slate-800 placeholder-slate-400 shadow-2xs outline-none transition focus:border-slate-800 focus:ring-2 focus:ring-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-[#E5EDE7]/40 p-3.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E5EDE7] text-[#182E25] shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Role: Account Admin
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                    Can manage users, teams, projects and day-to-day operations.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setAdminOpen(false)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#182E25] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#12231B] active:scale-[0.99] transition cursor-pointer"
                >
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
