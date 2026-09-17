"use client";

import { useState, useEffect, useRef } from "react";
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
  Target,
  Gavel,
  ClipboardList,
  Calendar,
  ArrowLeftRight,
  MapPin,
  HardHat,
  Users2,
  FileText,
  Clock,
  ShieldAlert,
  ListChecks,
  Camera,
  Store,
  Sparkles,
  UserCircle,
  ChevronRight,
  LifeBuoy,
} from "lucide-react";

interface FirmaLayoutProps {
  children: React.ReactNode;
  activeNav?: string;
}

export default function FirmaLayout({ children, activeNav }: FirmaLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, logout, setUser } = useAuthStore();

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
  const [hasAdmin, setHasAdmin] = useState(false);

  // Bottom Left Sidebar Profile Menu State
  const [sidebarMenuOpen, setSidebarMenuOpen] = useState(false);
  const sidebarMenuRef = useRef<HTMLDivElement>(null);

  const user = currentUser || {
    id: 0,
    companyId: "ORG-DEFAULT",
    name: "vashukyadav",
    email: "vashu@firma.com",
    role: "OWNER" as const,
    size: 0,
  };

  const displayName = user.name || currentUser?.name || "vashukyadav";

  const getInitials = (name?: string) => {
    if (!name) return "VA";
    const trimmed = name.trim();
    const parts = trimmed.split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return trimmed.slice(0, 2).toUpperCase();
  };

  const userInitial = (currentUser?.name?.charAt(0) || "U").toUpperCase();

  // Close bottom sidebar menu on click outside or escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarMenuRef.current &&
        !sidebarMenuRef.current.contains(event.target as Node)
      ) {
        setSidebarMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSidebarMenuOpen(false);
      }
    };
    if (sidebarMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [sidebarMenuOpen]);

  // Check if an Account Admin has already been created in this company
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user.companyId) return;
      try {
        const adminCount = await db.users
          .where("companyId")
          .equals(user.companyId)
          .filter((u) => u.role === "ACCOUNT_ADMIN")
          .count();
        setHasAdmin(adminCount > 0);
      } catch (err) {
        console.error("Failed to check admin status:", err);
      }
    };
    checkAdminStatus();
  }, [adminOpen, user.role, user.companyId]);

  // Listen to custom event to open Admin creation modal (e.g. from Dashboard banner)
  useEffect(() => {
    const handleOpenModal = () => {
      if (user.role === "OWNER" && !hasAdmin) {
        setAdminOpen(true);
      }
    };
    window.addEventListener("open-add-admin-modal", handleOpenModal);
    return () => {
      window.removeEventListener("open-add-admin-modal", handleOpenModal);
    };
  }, [user.role, hasAdmin]);

  // Create Admin Submission
  const handleCreateAdmin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (user.role !== "OWNER") {
      alert("Only the Owner can create an Account Admin");
      setAdminOpen(false);
      return;
    }

    if (!adminName || !adminEmail || !adminPassword || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }

    if (adminPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const existingAdmin = await db.users
      .where("companyId")
      .equals(user.companyId || "")
      .filter((u) => u.role === "ACCOUNT_ADMIN")
      .first();

    if (existingAdmin) {
      alert("Account Admin already exists for your company");
      setHasAdmin(true);
      setAdminOpen(false);
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
      companyId: user.companyId || "ORG-DEFAULT",
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: "ACCOUNT_ADMIN",
      size: 0,
    });

    setHasAdmin(true);
    window.dispatchEvent(new CustomEvent("admin-created"));
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

  const isPmRoute =
    pathname.startsWith("/scheduling") ||
    pathname.startsWith("/variations") ||
    pathname.startsWith("/rfis") ||
    pathname.startsWith("/sites") ||
    pathname.startsWith("/crew") ||
    pathname.startsWith("/documents") ||
    pathname.startsWith("/timesheets");

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
            : pathname.startsWith("/users")
              ? "Users & Roles"
              : pathname.startsWith("/projects")
                ? "Projects"
                : pathname.startsWith("/customers")
                  ? "Customers"
                  : pathname.startsWith("/leads")
                    ? "Leads"
                    : pathname.startsWith("/tenders")
                      ? "Tenders"
                      : pathname.startsWith("/pipeline")
                        ? "Pipeline"
                        : pathname.startsWith("/quotations")
                          ? "Quotations"
                          : pathname.startsWith("/jobs")
                            ? (user.role === "FIELD_WORKER" ? "My Jobs" : "Jobs")
                            : pathname.startsWith("/scheduling")
                              ? (user.role === "FIELD_WORKER" ? "Schedule" : "Scheduling")
                              : pathname.startsWith("/variations")
                                ? "Variations"
                                : pathname.startsWith("/rfis")
                                  ? "RFIs"
                                  : pathname.startsWith("/sites")
                                    ? "Sites"
                                    : pathname.startsWith("/contractors")
                                      ? "Contractors"
                                      : pathname.startsWith("/crew")
                                        ? "Crew / People"
                                        : pathname.startsWith("/documents")
                                          ? "Documents"
                                          : pathname.startsWith("/timesheets")
                                            ? "Timesheets"
                                            : pathname.startsWith("/site-reports")
                                              ? "Site Reports"
                                              : pathname.startsWith("/safety")
                                                ? "Safety & Incidents"
                                                : pathname.startsWith("/punch-lists")
                                                  ? "Punch Lists"
                                                  : pathname.startsWith("/photos")
                                                    ? "Photos"
                                                    : pathname.startsWith("/reports")
                                                      ? "Reports"
                                                      : pathname.startsWith("/setting")
                                                        ? "Settings"
                                                        : pathname.startsWith("/help")
                                                          ? "Help & Support"
                                                          : "");

  const fieldWorkerNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Jobs", href: "/jobs", icon: ClipboardList },
    { name: "Schedule", href: "/scheduling", icon: Calendar },
    { name: "Timesheets", href: "/timesheets", icon: Clock },
    { name: "Photos", href: "/photos", icon: Camera },
    { name: "Documents", href: "/documents", icon: FileText },
    { name: "RFIs", href: "/rfis", icon: HelpCircle },
    { name: "Variations", href: "/variations", icon: ArrowLeftRight },
    { name: "Sites", href: "/sites", icon: MapPin },
  ];

  const siteManagerNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Projects", href: "/projects", icon: Building2 },
    { name: "Tenders", href: "/tenders", icon: Gavel },
    { name: "Jobs", href: "/jobs", icon: ClipboardList },
    { name: "Scheduling", href: "/scheduling", icon: Calendar },
    { name: "Variations", href: "/variations", icon: ArrowLeftRight },
    { name: "RFIs", href: "/rfis", icon: HelpCircle },
    { name: "Sites", href: "/sites", icon: MapPin },
    { name: "Contractors", href: "/contractors", icon: HardHat },
    { name: "Crew / People", href: "/crew", icon: Users2 },
    { name: "Documents", href: "/documents", icon: FileText },
    { name: "Timesheets", href: "/timesheets", icon: Clock },
    { name: "Reports", href: "/site-reports", icon: BarChart3 },
    { name: "Safety & Incidents", href: "/safety", icon: ShieldAlert },
    { name: "Punch Lists", href: "/punch-lists", icon: ListChecks },
  ];

  const ownerNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Company", href: "/company", icon: Building },
    { name: "Subscription", href: "/subscription", icon: CreditCard },
    { name: "Team & Admins", href: "/team", icon: Users },
    { name: "Customers", href: "/customers", icon: Layers },
    { name: "Leads", href: "/leads", icon: Target },
    { name: "Quotations", href: "/quotations", icon: FileCheck2 },
    { name: "Tenders", href: "/tenders", icon: Gavel },
    { name: "Projects", href: "/projects", icon: FolderKanban },
    { name: "Jobs", href: "/jobs", icon: Briefcase },
    { name: "Contractors", href: "/contractors", icon: HardHat },
    { name: "Reports", href: "/reports", icon: BarChart3 },
    { name: "Settings", href: "/setting", icon: Settings },
    { name: "Help & Support", href: "/help", icon: HelpCircle },
  ];

  const adminNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Users & Roles", href: "/users", icon: Users },
    { name: "Customers", href: "/customers", icon: Layers },
    { name: "Leads", href: "/leads", icon: Target },
    { name: "Quotations", href: "/quotations", icon: FileCheck2 },
    { name: "Tenders", href: "/tenders", icon: Gavel },
    { name: "Projects", href: "/projects", icon: FolderKanban },
    { name: "Jobs", href: "/jobs", icon: Briefcase },
    { name: "Contractors", href: "/contractors", icon: HardHat },
    { name: "Reports", href: "/reports", icon: BarChart3 },
    { name: "Settings", href: "/setting", icon: Settings },
    { name: "Help & Support", href: "/help", icon: HelpCircle },
  ];

  const salesmanagerNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Customers", href: "/customers", icon: Layers },
    { name: "Leads", href: "/leads", icon: Target },
    { name: "Quotations", href: "/quotations", icon: FileCheck2 },
    { name: "Tenders", href: "/tenders", icon: FolderKanban },
    { name: "Pipeline", href: "/pipeline", icon: Briefcase },
    { name: "Reports", href: "/reports", icon: BarChart3 },
    { name: "Settings", href: "/setting", icon: Settings },
    { name: "Help & Support", href: "/help", icon: HelpCircle },
  ];

  // Project Manager Menubar Items (Matching PDF / Screenshot Flow)
  const projectManagerNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Projects", href: "/projects", icon: Building2 },
    { name: "Tenders", href: "/tenders", icon: Gavel },
    { name: "Jobs", href: "/jobs", icon: ClipboardList },
    { name: "Scheduling", href: "/scheduling", icon: Calendar },
    { name: "Variations", href: "/variations", icon: ArrowLeftRight },
    { name: "RFIs", href: "/rfis", icon: HelpCircle },
    { name: "Sites", href: "/sites", icon: MapPin },
    { name: "Contractors", href: "/contractors", icon: HardHat },
    { name: "Crew / People", href: "/crew", icon: Users2 },
    { name: "Documents", href: "/documents", icon: FileText },
    { name: "Timesheets", href: "/timesheets", icon: Clock },
    { name: "Reports", href: "/reports", icon: BarChart3 },
  ];

  const isProjectManager =
    user.role === "PROJECT_MANAGER" ||
    (user.role !== "OWNER" && user.role !== "ACCOUNT_ADMIN" && user.role !== "SALES_MANAGER" && isPmRoute);

  const isSiteManagerRoute =
    pathname.startsWith("/site-reports") ||
    pathname.startsWith("/safety") ||
    pathname.startsWith("/punch-lists");

  const navItems =
    user.role === "FIELD_WORKER"
      ? fieldWorkerNavItems
      : user.role === "SITE_MANAGER" || (user.role !== "OWNER" && user.role !== "ACCOUNT_ADMIN" && isSiteManagerRoute)
      ? siteManagerNavItems
      : user.role === "OWNER"
      ? ownerNavItems
      : user.role === "ACCOUNT_ADMIN"
      ? adminNavItems
      : user.role === "SALES_MANAGER"
      ? salesmanagerNavItems
      : user.role === "PROJECT_MANAGER"
      ? projectManagerNavItems
      : isPmRoute
      ? projectManagerNavItems
      : ownerNavItems;

  return (
    <div className="min-h-screen bg-stone flex text-onyx font-sans antialiased">
      {/* ========================================================================= */}
      {/* 1. LEFT SIDEBAR                                                           */}
      {/* ========================================================================= */}
      <aside className="w-60 bg-stone flex flex-col justify-between shrink-0 hidden lg:flex p-4 pr-2 sticky top-0 h-screen border-r border-pebble/60">
        <div className="flex flex-col min-h-0 flex-1">
          {/* Logo & Brand Header */}
          <div
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-3 px-2 py-3 mb-2 cursor-pointer shrink-0"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-onyx text-white shadow-xs">
              <Building2 className="h-5 w-5 text-breath" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-onyx block leading-tight">
                FIRMA
              </span>
              <span className="text-[10px] font-medium text-ash block leading-none mt-0.5">
                Build Smarter. Together.
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-sm overflow-y-auto flex-1 pr-1.5 min-h-0">
            {navItems.map((item) => {
              const isActive = currentNav === item.name;
              const Icon = item.icon;

              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => router.push(item.href)}
                  className={`flex w-full items-center gap-3 px-3.5 py-2 transition text-left cursor-pointer ${isActive
                      ? "rounded-[10px] bg-breath font-semibold text-onyx shadow-2xs"
                      : "rounded-[10px] font-medium text-ash hover:bg-mist/70 hover:text-onyx"
                    }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${isActive ? "text-onyx" : "text-ash"
                      }`}
                  />
                  <span className="truncate">{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom: User Profile Pill & Popup Menu for All Roles */}
        <div ref={sidebarMenuRef} className="pt-2 border-t border-pebble/60 mt-2 shrink-0 relative">
          {/* Popup Menu */}
          {sidebarMenuOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-full rounded-[18px] bg-[#222222] border border-white/10 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Profile Header Item */}
              <button
                type="button"
                onClick={() => {
                  setSidebarMenuOpen(false);
                  router.push("/setting");
                }}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-[#ea7a65] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                    {getInitials(displayName)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-white truncate leading-tight">
                      {displayName}
                    </p>
                    <p className="text-[11px] text-neutral-400 font-medium leading-tight mt-0.5">
                      Go
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-white transition shrink-0 ml-1" />
              </button>

              <div className="my-1.5 border-t border-white/10" />

              {/* Upgrade plan: ONLY visible to OWNER */}
              {user.role === "OWNER" && (
                <button
                  type="button"
                  onClick={() => {
                    setSidebarMenuOpen(false);
                    router.push("/subscription");
                  }}
                  className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-[13px] font-medium text-neutral-200 hover:text-white hover:bg-white/5 transition text-left cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-neutral-300 shrink-0" />
                  <span>Upgrade plan</span>
                </button>
              )}

              {/* Profile */}
              <button
                type="button"
                onClick={() => {
                  setSidebarMenuOpen(false);
                  router.push("/setting");
                }}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-[13px] font-medium text-neutral-200 hover:text-white hover:bg-white/5 transition text-left cursor-pointer"
              >
                <UserCircle className="h-4 w-4 text-neutral-300 shrink-0" />
                <span>Profile</span>
              </button>

              {/* Settings */}
              <button
                type="button"
                onClick={() => {
                  setSidebarMenuOpen(false);
                  router.push("/setting");
                }}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-[13px] font-medium text-neutral-200 hover:text-white hover:bg-white/5 transition text-left cursor-pointer"
              >
                <Settings className="h-4 w-4 text-neutral-300 shrink-0" />
                <span>Settings</span>
              </button>

              <div className="my-1.5 border-t border-white/10" />

              {/* Help */}
              <button
                type="button"
                onClick={() => {
                  setSidebarMenuOpen(false);
                  router.push("/help");
                }}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-[13px] font-medium text-neutral-200 hover:text-white hover:bg-white/5 transition text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <LifeBuoy className="h-4 w-4 text-neutral-300 shrink-0" />
                  <span>Help</span>
                </div>
                <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-white transition shrink-0" />
              </button>

              {/* Log out */}
              <button
                type="button"
                onClick={() => {
                  setSidebarMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-[13px] font-medium text-neutral-200 hover:text-rose-400 hover:bg-rose-500/10 transition text-left cursor-pointer"
              >
                <LogOut className="h-4 w-4 text-neutral-300 shrink-0" />
                <span>Log out</span>
              </button>
            </div>
          )}

          {/* Bottom Trigger Pill */}
          <button
            type="button"
            onClick={() => setSidebarMenuOpen((prev) => !prev)}
            className="w-full rounded-[14px] bg-[#1a1a1a] hover:bg-[#252528] text-white p-2.5 flex items-center justify-between cursor-pointer transition border border-white/5 shadow-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-full bg-[#ea7a65] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {getInitials(displayName)}
              </div>
              <div className="min-w-0 text-left">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {displayName}
                </p>
                <p className="text-[11px] text-neutral-400 font-medium leading-tight mt-0.5">
                  Go
                </p>
              </div>
            </div>
            <Store className="h-4 w-4 text-neutral-400 shrink-0 ml-2" />
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN CONTENT AREA                                                      */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 px-6 flex items-center justify-between gap-4 sticky top-0 z-20 bg-stone/90 backdrop-blur-md border-b border-pebble/60">
          {/* Left: Search input */}
          <div className="flex-1 max-w-md">
            <div className="flex items-center gap-2.5 rounded-[10px] bg-white border border-pebble/80 px-3.5 h-10 text-sm text-onyx focus-within:ring-2 focus-within:ring-forest/20 focus-within:border-forest transition shadow-2xs">
              <Search className="h-4 w-4 text-ash shrink-0" />
              <input
                type="text"
                placeholder="Search anything... (projects, users, customers)"
                className="w-full bg-transparent text-onyx placeholder-ash outline-none text-sm"
              />
            </div>
          </div>

          {/* Right: Notifications & User Profile Pill */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Site Manager Top Header Pill (Matching Design Screenshot) */}
            {(user.role === "SITE_MANAGER" || isSiteManagerRoute) && (
              <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-[12px] bg-white border border-pebble/80 shadow-2xs text-left">
                <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-forest text-white">
                  <HardHat className="h-4 w-4 text-white" />
                </div>
                <div className="leading-tight">
                  <span className="text-xs font-bold text-onyx block">Role: Site Manager</span>
                  <span className="text-[10px] text-ash block leading-tight truncate max-w-[280px]">
                    On-site execution, daily reporting, crew coordination and site management
                  </span>
                </div>
              </div>
            )}

            {/* Notification Bell */}
            <button
              type="button"
              className="relative p-2 rounded-full hover:bg-mist text-ash hover:text-onyx transition cursor-pointer"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-hazard ring-2 ring-white" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 hover:bg-mist/70 transition cursor-pointer"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-onyx text-xs font-bold text-white shadow-xs">
                  {user.role === "SITE_MANAGER" ? "SM" : userInitial}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-onyx leading-tight">
                    {user.name || currentUser?.name || "User"}
                  </p>
                  <p className="text-[10px] font-medium text-ash leading-none capitalize">
                    {user.role === "SITE_MANAGER" ? "Site Manager" : user.role?.toLowerCase() || "Owner"}
                  </p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-ash" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-[10px] border border-pebble bg-white py-1.5 shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3.5 py-2 border-b border-pebble/60">
                    <p className="text-xs font-semibold text-onyx">
                      {user.name || currentUser?.name || "User"}
                    </p>
                    <p className="text-[10px] text-ash capitalize">
                      {user.role === "SITE_MANAGER" ? "Site Manager" : user.role?.toLowerCase().replace("_", " ") || "owner"}
                    </p>
                  </div>

                  {/* Role Switcher for UI Navigation & Testing */}
                  <div className="px-3 py-2 border-b border-pebble/60 bg-stone/50">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ash mb-1.5">
                      Switch Role (UI Demo)
                    </p>
                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => {
                          setUser({
                            id: currentUser?.id || 99,
                            companyId: currentUser?.companyId || "ORG-DEFAULT",
                            name: currentUser?.name || "Site Manager",
                            email: currentUser?.email || "sitemanager@firma.com",
                            role: "SITE_MANAGER",
                            size: currentUser?.size || 10,
                          });
                          setUserDropdownOpen(false);
                          router.push("/dashboard");
                        }}
                        className={`px-2 py-1 rounded-[5px] font-medium text-center transition cursor-pointer ${user.role === "SITE_MANAGER"
                            ? "bg-forest text-white font-semibold shadow-2xs"
                            : "bg-white text-onyx border border-pebble/80 hover:bg-mist"
                          }`}
                      >
                        Site Mgr
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUser({
                            id: currentUser?.id || 1,
                            companyId: currentUser?.companyId || "ORG-DEFAULT",
                            name: currentUser?.name || "Project Manager",
                            email: currentUser?.email || "pm@firma.com",
                            role: "PROJECT_MANAGER",
                            size: currentUser?.size || 10,
                          });
                          setUserDropdownOpen(false);
                          router.push("/dashboard");
                        }}
                        className={`px-2 py-1 rounded-[5px] font-medium text-center transition cursor-pointer ${user.role === "PROJECT_MANAGER"
                            ? "bg-forest text-white font-semibold shadow-2xs"
                            : "bg-white text-onyx border border-pebble/80 hover:bg-mist"
                          }`}
                      >
                        Project Mgr
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUser({
                            id: currentUser?.id || 1,
                            companyId: currentUser?.companyId || "ORG-DEFAULT",
                            name: currentUser?.name || "vashukyadav",
                            email: currentUser?.email || "vashu@firma.com",
                            role: "OWNER",
                            size: 10,
                          });
                          setUserDropdownOpen(false);
                          router.push("/dashboard");
                        }}
                        className={`px-2 py-1 rounded-[5px] font-medium text-center transition cursor-pointer ${user.role === "OWNER"
                            ? "bg-forest text-white font-semibold shadow-2xs"
                            : "bg-white text-onyx border border-pebble/80 hover:bg-mist"
                          }`}
                      >
                        Owner
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUser({
                            id: currentUser?.id || 1,
                            companyId: currentUser?.companyId || "ORG-DEFAULT",
                            name: currentUser?.name || "Sales User",
                            email: currentUser?.email || "sales@firma.com",
                            role: "SALES_MANAGER",
                            size: 10,
                          });
                          setUserDropdownOpen(false);
                          router.push("/dashboard");
                        }}
                        className={`px-2 py-1 rounded-[5px] font-medium text-center transition cursor-pointer ${user.role === "SALES_MANAGER"
                            ? "bg-forest text-white font-semibold shadow-2xs"
                            : "bg-white text-onyx border border-pebble/80 hover:bg-mist"
                          }`}
                      >
                        Sales Mgr
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUser({
                            id: currentUser?.id || 1,
                            companyId: currentUser?.companyId || "ORG-DEFAULT",
                            name: currentUser?.name || "Admin User",
                            email: currentUser?.email || "admin@firma.com",
                            role: "ACCOUNT_ADMIN",
                            size: 10,
                          });
                          setUserDropdownOpen(false);
                          router.push("/dashboard");
                        }}
                        className={`px-2 py-1 rounded-[5px] font-medium text-center transition cursor-pointer ${user.role === "ACCOUNT_ADMIN"
                            ? "bg-forest text-white font-semibold shadow-2xs"
                            : "bg-white text-onyx border border-pebble/80 hover:bg-mist"
                          }`}
                      >
                        Admin
                      </button>
                    </div>
                  </div>

                  {/* Only show 'Add Admin' if current logged in user is OWNER and no admin has been created yet */}
                  {user.role === "OWNER" && !hasAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setAdminOpen(true);
                      }}
                      className="flex w-full items-center gap-2 px-3.5 py-2 text-xs font-medium text-onyx hover:bg-stone transition cursor-pointer"
                    >
                      <UserPlus className="h-3.5 w-3.5 text-ash" />
                      Add Admin
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-3.5 py-2 text-xs font-medium text-hazard-text hover:bg-hazard-bg transition"
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
        <main className="flex-1 px-6 pb-8 space-y-5 w-full">
          {children}

          {/* Footer */}
          <footer className="pt-6 pb-2 border-t border-pebble/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ash">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-onyx" />
              <span className="font-bold text-onyx tracking-tight">
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
                className="hover:text-onyx transition cursor-pointer"
              >
                Privacy
              </button>
              <button
                type="button"
                onClick={() => router.push("/help")}
                className="hover:text-onyx transition cursor-pointer"
              >
                Terms
              </button>
              <button
                type="button"
                onClick={() => router.push("/help")}
                className="hover:text-onyx transition cursor-pointer"
              >
                Support
              </button>
            </div>

            <div className="text-[11px] text-ash font-medium">
              &mdash; Built for a better tomorrow.
            </div>
          </footer>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 3. SHARED MODAL: Add Account Admin Dialog Modal                           */}
      {/* ========================================================================= */}
      {adminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-onyx/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-[20px] bg-white p-6 shadow-2xl border border-pebble animate-in zoom-in-95 duration-150 relative">
            <button
              type="button"
              onClick={() => setAdminOpen(false)}
              className="absolute right-4 top-4 rounded-[6px] p-1.5 text-ash hover:bg-mist hover:text-onyx transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <h2 className="text-lg font-bold text-onyx">
                Add Account Admin
              </h2>
              <p className="mt-1 text-sm text-ash">
                Create an account admin to help you manage your organization.
              </p>
            </div>

            <form onSubmit={handleCreateAdmin} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-onyx flex items-center gap-0.5">
                    Full Name <span className="text-hazard">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Admin Full Name"
                    className="w-full h-10 rounded-[10px] border border-pebble bg-white px-3.5 py-2 text-sm text-onyx placeholder-ash shadow-2xs outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-onyx flex items-center gap-0.5">
                    Email <span className="text-hazard">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@company.com"
                    className="w-full h-10 rounded-[10px] border border-pebble bg-white px-3.5 py-2 text-sm text-onyx placeholder-ash shadow-2xs outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-onyx flex items-center gap-0.5">
                    Password <span className="text-hazard">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-10 rounded-[10px] border border-pebble bg-white px-3.5 py-2 pr-9 text-sm text-onyx placeholder-ash shadow-2xs outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ash hover:text-onyx cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-onyx flex items-center gap-0.5">
                    Confirm Password <span className="text-hazard">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-10 rounded-[10px] border border-pebble bg-white px-3.5 py-2 pr-9 text-sm text-onyx placeholder-ash shadow-2xs outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ash hover:text-onyx cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-[10px] border border-clear-bg bg-clear-bg/60 p-3.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-clear-bg text-success-text shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-success-text">
                    Role: Account Admin
                  </p>
                  <p className="text-xs text-success-text/80 mt-0.5 leading-normal">
                    Can manage users, teams, projects and day-to-day operations.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setAdminOpen(false)}
                  className="rounded-[10px] border border-pebble bg-white px-4 py-2.5 text-sm font-medium text-onyx hover:bg-stone transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-[10px] bg-forest px-5 py-2.5 text-sm font-medium text-white shadow-xs hover:bg-forest-hover active:scale-[0.99] transition cursor-pointer"
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
