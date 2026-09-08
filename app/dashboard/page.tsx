"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Calendar,
  UserPlus,
  FolderPlus,
  FileText,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
  X,
  Sparkles,
  LogOut,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser, logout } = useAuthStore();

  const [adminOpen, setAdminOpen] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const [companyName, setCompanyName] = useState("ABC Solutions Pvt. Ltd.");
  const [currentPlan, setCurrentPlan] = useState("Starter");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);


  const user = currentUser || {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul@abcsolutions.com",
    role: "OWNER",
    size: 0,
  };

  const userInitial = (user.name?.charAt(0) || "R").toUpperCase();
  const firstName = user.name?.split(" ")[0] || "Rahul";

  useEffect(() => {
    async function loadData() {
      if (currentUser?.id) {
        const comp = await db.company.get(currentUser.id);
        if (comp?.companyName) {
          setCompanyName(comp.companyName);
        }

        const onboard = await db.onboarding.get(currentUser.id);
        if (onboard?.plan) {
          const planFormatted =
            onboard.plan.charAt(0) + onboard.plan.slice(1).toLowerCase();
          setCurrentPlan(planFormatted);
        }
      }
    }
    loadData();
  }, [currentUser?.id]);

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


  const todayFormatted = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-800">


      <aside className="w-64 border-r border-slate-200/80 bg-white flex flex-col justify-between shrink-0 hidden lg:flex">
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center gap-2.5 px-6 border-b border-slate-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white shadow-xs">
              <Building2 className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <span className="text-sm font-extrabold tracking-tight text-slate-900 block leading-tight">
                FIRMA
              </span>
              <span className="text-[10px] font-medium text-slate-400 block leading-none">
                Build Smarter. Together.
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              <Building className="h-4 w-4 text-slate-400" />
              <span>Company</span>
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              <CreditCard className="h-4 w-4 text-slate-400" />
              <span>Subscription</span>
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              <Users className="h-4 w-4 text-slate-400" />
              <span>Team &amp; Admins</span>
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              <FolderKanban className="h-4 w-4 text-slate-400" />
              <span>Projects</span>
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              <BarChart3 className="h-4 w-4 text-slate-400" />
              <span>Reports</span>
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              <Settings className="h-4 w-4 text-slate-400" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Bottom Sidebar Help */}
        <div className="p-4 border-t border-slate-100">
          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 transition"
          >
            <HelpCircle className="h-4 w-4 text-slate-400" />
            <span>Help &amp; Support</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Header */}
        <header className="h-16 border-b border-slate-200/80 bg-white flex items-center justify-between px-6 sticky top-0 z-20">
          {/* Mobile brand indicator */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-white">
              <Building2 className="h-4 w-4 text-blue-400" />
            </div>
            <span className="text-sm font-extrabold text-slate-900">FIRMA</span>
          </div>

          <div className="hidden lg:block"></div>

          {/* Right Header: Notification & User Pill */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="relative rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 rounded-full border border-slate-200/80 bg-white py-1 pl-1 pr-3 shadow-2xs hover:border-slate-300 transition"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">
                  {userInitial}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-slate-800 leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[10px] font-medium text-slate-400 leading-none capitalize">
                    {user.role?.toLowerCase() || "owner"}
                  </p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-100 bg-white py-1.5 shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3.5 py-2 border-b border-slate-100 sm:hidden">
                    <p className="text-xs font-semibold text-slate-800">{user.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{user.role?.toLowerCase()}</p>
                  </div>
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
        <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-6">

          {/* Welcome Banner & Date */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                Welcome back, {firstName}! 👋
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Here&apos;s an overview of your company.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-2xs">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>{todayFormatted}</span>
            </div>
          </div>

          {/* 4 Stats KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* Card 1: Company */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold text-slate-500">Company</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Building className="h-3.5 w-3.5" />
                </div>
              </div>
              <p className="mt-3 text-sm font-bold text-slate-900 truncate">
                {companyName}
              </p>
            </div>

            {/* Card 2: Plan */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold text-slate-500">Plan</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <CreditCard className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="mt-3 flex items-center">
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                  {currentPlan}
                </span>
              </div>
            </div>

            {/* Card 3: Team Members */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold text-slate-500">Team Members</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                  <Users className="h-3.5 w-3.5" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">
                0
              </p>
            </div>

            {/* Card 4: Active Projects */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold text-slate-500">Active Projects</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <FolderKanban className="h-3.5 w-3.5" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">
                0
              </p>
            </div>

          </div>

          {/* Main 2-Column Split Layout */}
          <div className="grid gap-6 lg:grid-cols-12">

            {/* Left Column (8 cols): Quick Actions & Getting Started */}
            <div className="lg:col-span-8 space-y-6">

              {/* Quick Actions Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
                <h2 className="text-sm font-bold text-slate-900">
                  Quick Actions
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Get started with the key features.
                </p>

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">

                  {/* Action 1: Add Admin (Special Red/Accent focus outline as in screenshot) */}
                  <button
                    type="button"
                    onClick={() => setAdminOpen(true)}
                    className="flex flex-col items-center justify-center rounded-xl border border-red-300 bg-red-50/20 p-4 text-center transition hover:bg-red-50/40 cursor-pointer shadow-2xs group"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:scale-105 transition">
                      <UserPlus className="h-4 w-4" />
                    </div>
                    <span className="mt-2 text-xs font-bold text-slate-900">
                      Add Admin
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      Create your first account admin
                    </span>
                  </button>

                  {/* Action 2: Invite Team */}
                  <button
                    type="button"
                    className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-4 text-center transition hover:bg-slate-50 cursor-pointer shadow-2xs group"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:scale-105 transition">
                      <Users className="h-4 w-4" />
                    </div>
                    <span className="mt-2 text-xs font-bold text-slate-900">
                      Invite Team
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      Add team members
                    </span>
                  </button>

                  {/* Action 3: Create Project */}
                  <button
                    type="button"
                    className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-4 text-center transition hover:bg-slate-50 cursor-pointer shadow-2xs group"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:scale-105 transition">
                      <FolderPlus className="h-4 w-4" />
                    </div>
                    <span className="mt-2 text-xs font-bold text-slate-900">
                      Create Project
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      Start a new project
                    </span>
                  </button>

                  {/* Action 4: View Reports */}
                  <button
                    type="button"
                    className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-4 text-center transition hover:bg-slate-50 cursor-pointer shadow-2xs group"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:scale-105 transition">
                      <FileText className="h-4 w-4" />
                    </div>
                    <span className="mt-2 text-xs font-bold text-slate-900">
                      View Reports
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      Track your business
                    </span>
                  </button>

                </div>
              </div>

              {/* Getting Started Checklist Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
                <h2 className="text-sm font-bold text-slate-900">
                  Getting Started
                </h2>

                <div className="mt-4 space-y-3.5">
                  {/* Step 1: Completed */}
                  <div className="flex items-center gap-3 text-xs text-slate-700">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shrink-0">
                      <Check className="h-3 w-3 stroke-[2.5]" />
                    </div>
                    <span className="font-medium">Company setup completed</span>
                  </div>

                  {/* Step 2: Completed */}
                  <div className="flex items-center gap-3 text-xs text-slate-700">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shrink-0">
                      <Check className="h-3 w-3 stroke-[2.5]" />
                    </div>
                    <span className="font-medium">Subscription activated</span>
                  </div>

                  {/* Step 3: Pending with Add Admin button */}
                  <div className="flex items-center justify-between gap-3 text-xs text-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full border border-slate-300 bg-white shrink-0" />
                      <span className="font-medium">Add your first account admin</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAdminOpen(true)}
                      className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700 transition cursor-pointer"
                    >
                      Add Admin
                    </button>
                  </div>

                  {/* Step 4: Pending */}
                  <div className="flex items-center gap-3 text-xs text-slate-700">
                    <div className="h-5 w-5 rounded-full border border-slate-300 bg-white shrink-0" />
                    <span className="font-medium text-slate-600">Invite your team members</span>
                  </div>

                  {/* Step 5: Pending */}
                  <div className="flex items-center gap-3 text-xs text-slate-700">
                    <div className="h-5 w-5 rounded-full border border-slate-300 bg-white shrink-0" />
                    <span className="font-medium text-slate-600">Create your first project</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column (4 cols): Your Plan & Need Help */}
            <div className="lg:col-span-4 space-y-6">

              {/* Your Plan Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Your Plan
                  </span>
                  <button
                    type="button"
                    onClick={() => router.push("/onboarding/plan")}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Manage Plan
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {currentPlan} Plan
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Valid till 26 May 2026
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      Active
                    </span>
                    <p className="text-xs font-bold text-slate-900 mt-1">
                      ₹4,999 / year
                    </p>
                  </div>
                </div>

                <div className="my-4 border-t border-slate-100" />

                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>Up to 50 team members</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>Project management</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>Basic reporting</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>Email support</span>
                  </div>
                </div>
              </div>

              {/* Need Help? Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Need Help?
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Our team is here to help you.
                  </p>
                </div>

                {/* Friendly Support Avatar Graphic */}
                <div className="my-4 flex items-center justify-center">
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
                    <svg viewBox="0 0 100 100" className="h-16 w-16" fill="none">
                      <circle cx="50" cy="40" r="18" fill="#FDBA74" />
                      {/* Hair */}
                      <path d="M32 38C32 26 40 20 50 20C60 20 68 26 68 38C68 39 67 42 66 43C64 36 60 30 50 30C40 30 36 36 34 43C33 42 32 39 32 38Z" fill="#1E293B" />
                      {/* Body */}
                      <path d="M28 85C28 65 38 60 50 60C62 60 72 65 72 85Z" fill="#3B82F6" />
                      {/* Headset */}
                      <path d="M30 40C30 25 70 25 70 40" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="31" cy="40" r="4" fill="#0F172A" />
                      <circle cx="69" cy="40" r="4" fill="#0F172A" />
                      <path d="M31 42L40 48" stroke="#0F172A" strokeWidth="2" />
                    </svg>
                  </div>
                </div>

                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
                  <span>Contact Support</span>
                </button>
              </div>

            </div>

          </div>

        </main>
      </div>

      {/* 3. Screen 7: Add Account Admin Dialog Modal */}
      {adminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150 relative">

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setAdminOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Modal Title */}
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Add Account Admin
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Create an account admin to help you manage your organization.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateAdmin} className="mt-5 space-y-4">

              {/* Row 1: Full Name & Email */}
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
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 shadow-2xs outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 shadow-2xs outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Row 2: Password & Confirm Password */}
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
                      className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 pr-9 text-xs text-slate-800 placeholder-slate-400 shadow-2xs outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                      className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 pr-9 text-xs text-slate-800 placeholder-slate-400 shadow-2xs outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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

              {/* Role Info Box */}
              <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/40 p-3.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100/70 text-blue-700 shrink-0">
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

              {/* Footer Buttons */}
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
                  className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 active:scale-[0.99] transition cursor-pointer"
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