"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import FirmaLayout from "@/components/layout/FirmaLayout";
import { useAuthStore } from "@/store/authStore";
import { useSiteStore } from "@/store/siteStore";
import { useLeadFlowStore } from "@/store/leadFlowStore";
import { useTenderFlowStore } from "@/store/tenderFlowStore";
import { useSchedulingStore } from "@/store/schedulingStore";
import { useCrewStore } from "@/store/crewStore";
import { db, type UserRole } from "@/lib/db";
import { toast } from "@/components/ui/toast";
import {
  isSiteManager,
  isFieldWorker,
  getAssignedSites,
  getAssignedProjects,
  getAssignedJobs,
} from "@/lib/roleAccess";
import {
  UserCircle,
  Building2,
  HardHat,
  MapPin,
  Briefcase,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
  KeyRound,
  Edit3,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Award,
  Users,
  Layers,
  Wrench,
  FileText,
  DollarSign,
  TrendingUp,
  Activity,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  Save,
  Radio,
  Building,
  Check,
} from "lucide-react";

type ProfileTab = "OVERVIEW" | "EDIT" | "SECURITY" | "PERMISSIONS";

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, setUser } = useAuthStore();

  // Stores
  const { sites = [] } = useSiteStore();
  const { projects = [] } = useLeadFlowStore();
  const { jobs = [], contractors = [] } = useTenderFlowStore();
  const { scheduledJobs = [] } = useSchedulingStore();
  const { members: crewMembers = [] } = useCrewStore();

  // Active Tab
  const [activeTab, setActiveTab] = useState<ProfileTab>("OVERVIEW");

  // User Profile Form State
  const [name, setName] = useState(currentUser?.name || "User");
  const [email, setEmail] = useState(currentUser?.email || "user@firma.com");
  const [phone, setPhone] = useState(
    (currentUser as any)?.phone || "+91 98765 43210"
  );
  const [designation, setDesignation] = useState(
    (currentUser as any)?.designation || ""
  );
  const [bio, setBio] = useState(
    (currentUser as any)?.bio ||
      "Dedicated construction professional executing operations on FIRMA platform."
  );
  const [department, setDepartment] = useState(
    (currentUser as any)?.department || "Operations & Construction"
  );
  const [emergencyContact, setEmergencyContact] = useState(
    (currentUser as any)?.emergencyContact || "+91 98111 22334 (Site Safety Office)"
  );
  const [workLocation, setWorkLocation] = useState(
    (currentUser as any)?.workLocation || "Main Project Yard, Gurugram"
  );
  const [isSaving, setIsSaving] = useState(false);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Sync state if currentUser changes
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
      if ((currentUser as any).phone) setPhone((currentUser as any).phone);
      if ((currentUser as any).designation)
        setDesignation((currentUser as any).designation);
      if ((currentUser as any).bio) setBio((currentUser as any).bio);
      if ((currentUser as any).department)
        setDepartment((currentUser as any).department);
      if ((currentUser as any).emergencyContact)
        setEmergencyContact((currentUser as any).emergencyContact);
      if ((currentUser as any).workLocation)
        setWorkLocation((currentUser as any).workLocation);
    }
  }, [currentUser]);

  const role: UserRole = (currentUser?.role as UserRole) || "OWNER";

  // Role Formatter
  const getFormattedRole = (r: UserRole) => {
    switch (r) {
      case "SITE_MANAGER":
        return "Site Manager";
      case "PROJECT_MANAGER":
        return "Project Manager";
      case "FIELD_WORKER":
        return "Field Worker";
      case "SALES_MANAGER":
        return "Sales Manager";
      case "FINANCE_MANAGER":
        return "Finance Manager";
      case "ACCOUNT_ADMIN":
        return "Account Admin";
      case "OWNER":
        return "Company Owner / Director";
      default:
        return String(r).replace("_", " ");
    }
  };

  const getRoleTheme = (r: UserRole) => {
    switch (r) {
      case "SITE_MANAGER":
        return {
          bg: "bg-emerald-600",
          text: "text-emerald-700",
          lightBg: "bg-emerald-50",
          border: "border-emerald-200",
          pill: "bg-emerald-100 text-emerald-800 border-emerald-300",
          icon: HardHat,
        };
      case "PROJECT_MANAGER":
        return {
          bg: "bg-blue-600",
          text: "text-blue-700",
          lightBg: "bg-blue-50",
          border: "border-blue-200",
          pill: "bg-blue-100 text-blue-800 border-blue-300",
          icon: Briefcase,
        };
      case "FIELD_WORKER":
        return {
          bg: "bg-amber-500",
          text: "text-amber-700",
          lightBg: "bg-amber-50",
          border: "border-amber-200",
          pill: "bg-amber-100 text-amber-800 border-amber-300",
          icon: Wrench,
        };
      case "SALES_MANAGER":
        return {
          bg: "bg-sky-500",
          text: "text-sky-700",
          lightBg: "bg-sky-50",
          border: "border-sky-200",
          pill: "bg-sky-100 text-sky-800 border-sky-300",
          icon: TrendingUp,
        };
      case "FINANCE_MANAGER":
        return {
          bg: "bg-indigo-600",
          text: "text-indigo-700",
          lightBg: "bg-indigo-50",
          border: "border-indigo-200",
          pill: "bg-indigo-100 text-indigo-800 border-indigo-300",
          icon: DollarSign,
        };
      case "ACCOUNT_ADMIN":
      case "OWNER":
      default:
        return {
          bg: "bg-onyx",
          text: "text-forest",
          lightBg: "bg-clear-bg",
          border: "border-forest/30",
          pill: "bg-forest text-white border-forest",
          icon: Building2,
        };
    }
  };

  const roleTheme = getRoleTheme(role);
  const RoleIcon = roleTheme.icon;

  // Derive Role Data
  const assignedProjects = useMemo(() => {
    return getAssignedProjects(projects, sites, currentUser);
  }, [projects, sites, currentUser]);

  const assignedSites = useMemo(() => {
    return getAssignedSites(sites, currentUser, assignedProjects);
  }, [sites, currentUser, assignedProjects]);

  const combinedJobs = useMemo(() => {
    const list = [...jobs];
    for (const sj of scheduledJobs) {
      if (!list.some((j) => j.id === sj.id)) {
        list.push({
          id: sj.id,
          title: sj.title,
          projectName: sj.project,
          location: sj.site || `${sj.project} Site`,
          assignee: sj.contractorName || sj.worker,
          contractorName: sj.contractorName,
          isContractorJob: Boolean(sj.contractorName),
          priority: "High",
          priorityColor: "bg-caution-bg text-caution-text border-pebble",
          due: sj.endDate || sj.dateFormatted || sj.date || "Next Week",
          startDate: sj.startDate || sj.date,
          endDate: sj.endDate || sj.deadline,
          completed: sj.status === "Completed",
          status:
            sj.status === "Completed"
              ? "Completed"
              : sj.status === "In Progress"
              ? "In Progress"
              : "Scheduled",
          description: sj.notes || `Scheduled for ${sj.worker}`,
          assignedDate: sj.startDate || sj.dateFormatted || "15 Sep 2026",
          siteManagerName: sj.siteManagerName,
          siteManagerId: sj.siteManagerId,
        });
      }
    }
    return list;
  }, [jobs, scheduledJobs]);

  const roleJobs = useMemo(() => {
    return getAssignedJobs(combinedJobs, assignedProjects, assignedSites, currentUser);
  }, [combinedJobs, assignedProjects, assignedSites, currentUser]);

  // Unique contractors supervised by this user
  const supervisedContractors = useMemo(() => {
    const map = new Map<string, { name: string; trade: string; project: string }>();
    roleJobs.forEach((j) => {
      if (j.isContractorJob && j.contractorName) {
        map.set(j.contractorName.toLowerCase(), {
          name: j.contractorName,
          trade: j.trade || "Specialty Trade",
          project: j.projectName,
        });
      }
    });
    return Array.from(map.values());
  }, [roleJobs]);

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }

    setIsSaving(true);
    try {
      if (currentUser?.id) {
        await db.users.update(currentUser.id, {
          name: name.trim(),
        });
      }

      // Update in authStore
      setUser({
        ...currentUser!,
        name: name.trim(),
        ...({
          phone: phone.trim(),
          designation: designation.trim(),
          bio: bio.trim(),
          department: department.trim(),
          emergencyContact: emergencyContact.trim(),
          workLocation: workLocation.trim(),
        } as any),
      });

      toast.success("Profile details updated successfully!");
      setActiveTab("OVERVIEW");
    } catch (err) {
      console.error("Failed to update profile:", err);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    try {
      if (currentUser?.id) {
        const dbUser = await db.users.get(currentUser.id);
        if (dbUser && dbUser.password !== currentPassword) {
          setPasswordError("Current password is incorrect.");
          return;
        }

        await db.users.update(currentUser.id, {
          password: newPassword,
        });
      }

      setPasswordSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully!");
    } catch (err) {
      console.error("Failed to change password:", err);
      setPasswordError("Failed to update password. Try again.");
    }
  };

  return (
    <FirmaLayout activeNav="Profile">
      <div className="space-y-6 mt-2 max-w-6xl mx-auto">
        {/* ========================================================================= */}
        {/* TOP HERO PROFILE HEADER                                                  */}
        {/* ========================================================================= */}
        <div className="rounded-[16px] bg-white border border-pebble/80 p-6 shadow-2xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-forest/5 to-transparent pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
            <div className="flex items-center gap-4.5 min-w-0">
              {/* Avatar Pill */}
              <div
                className={`h-16 w-16 sm:h-20 sm:w-20 rounded-2xl ${roleTheme.bg} text-white flex items-center justify-center font-extrabold text-xl sm:text-2xl shadow-md shrink-0`}
              >
                {name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase() || "US"}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-onyx tracking-tight truncate">
                    {name}
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${roleTheme.pill}`}
                  >
                    <RoleIcon className="h-3.5 w-3.5" />
                    <span>{getFormattedRole(role)}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Active Session</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-ash mt-2">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-forest" />
                    <span className="text-onyx font-medium">{email}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-forest" />
                    <span className="text-onyx font-medium">{phone}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 text-forest" />
                    <span className="text-onyx font-medium">
                      Company ID: {currentUser?.companyId || "ORG-DEFAULT"}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Top Quick Actions */}
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab("EDIT")}
                className="px-3.5 py-2 rounded-[10px] bg-stone hover:bg-mist text-onyx border border-pebble text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit Details</span>
              </button>
              <button
                type="button"
                onClick={() => router.push("/setting")}
                className="px-3.5 py-2 rounded-[10px] bg-forest text-white hover:bg-forest-hover text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Account Settings</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-t border-pebble/60 pt-4 mt-5 overflow-x-auto">
            {[
              {
                id: "OVERVIEW" as ProfileTab,
                label: "Role Scope & Operations",
                icon: Layers,
              },
              {
                id: "EDIT" as ProfileTab,
                label: "Edit Profile & Contact",
                icon: UserCircle,
              },
              {
                id: "SECURITY" as ProfileTab,
                label: "Security & Credentials",
                icon: KeyRound,
              },
              {
                id: "PERMISSIONS" as ProfileTab,
                label: "Permissions & Role Matrix",
                icon: ShieldCheck,
              },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-[8px] text-xs font-semibold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-forest text-white shadow-2xs font-bold"
                      : "text-ash hover:text-onyx hover:bg-stone/60"
                  }`}
                >
                  <TabIcon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: ROLE SCOPE & OPERATIONS DASHBOARD                                  */}
        {/* ========================================================================= */}
        {activeTab === "OVERVIEW" && (
          <div className="space-y-6">
            {/* --------------------------------------------------------------------- */}
            {/* CASE A: SITE MANAGER PROFILE VIEW                                     */}
            {/* --------------------------------------------------------------------- */}
            {role === "SITE_MANAGER" && (
              <div className="space-y-5">
                {/* 4 KPI Summary Cards for Site Manager */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div className="rounded-[14px] bg-white border border-pebble/80 p-4 shadow-2xs flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-ash uppercase tracking-wider block">
                        Assigned Construction Sites
                      </span>
                      <p className="text-2xl font-bold text-onyx mt-1">
                        {assignedSites.length}
                      </p>
                      <span className="text-[11px] text-forest font-semibold mt-0.5 block">
                        Active site yards
                      </span>
                    </div>
                    <div className="h-10 w-10 rounded-[10px] bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <MapPin className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="rounded-[14px] bg-white border border-pebble/80 p-4 shadow-2xs flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-ash uppercase tracking-wider block">
                        Live Site Tasks
                      </span>
                      <p className="text-2xl font-bold text-onyx mt-1">
                        {roleJobs.length}
                      </p>
                      <span className="text-[11px] text-caution-text font-semibold mt-0.5 block">
                        In-progress &amp; scheduled
                      </span>
                    </div>
                    <div className="h-10 w-10 rounded-[10px] bg-caution-bg text-caution-text flex items-center justify-center">
                      <Briefcase className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="rounded-[14px] bg-white border border-pebble/80 p-4 shadow-2xs flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-ash uppercase tracking-wider block">
                        Trade Contractors
                      </span>
                      <p className="text-2xl font-bold text-onyx mt-1">
                        {supervisedContractors.length}
                      </p>
                      <span className="text-[11px] text-forest font-semibold mt-0.5 block">
                        Under SM supervision
                      </span>
                    </div>
                    <div className="h-10 w-10 rounded-[10px] bg-breath text-onyx flex items-center justify-center">
                      <HardHat className="h-5 w-5 text-forest" />
                    </div>
                  </div>

                  <div className="rounded-[14px] bg-white border border-pebble/80 p-4 shadow-2xs flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-ash uppercase tracking-wider block">
                        Supervised Projects
                      </span>
                      <p className="text-2xl font-bold text-onyx mt-1">
                        {assignedProjects.length}
                      </p>
                      <span className="text-[11px] text-success-text font-semibold mt-0.5 block">
                        Assigned by PM
                      </span>
                    </div>
                    <div className="h-10 w-10 rounded-[10px] bg-clear-bg text-success-text flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-success" />
                    </div>
                  </div>
                </div>

                {/* Assigned Sites List Section */}
                <div className="rounded-[14px] bg-white border border-pebble/80 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-onyx uppercase tracking-wider flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-forest" />
                        <span>My Construction Sites Under Supervision ({assignedSites.length})</span>
                      </h2>
                      <p className="text-xs text-ash mt-0.5">
                        Sites where you are the designated Site Supervisor in charge of contractor work packages.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => router.push("/sites")}
                      className="px-3 py-1.5 rounded-[8px] text-xs font-semibold text-forest bg-forest/10 hover:bg-forest/20 transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open Sites Directory</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>

                  {assignedSites.length === 0 ? (
                    <div className="py-8 text-center text-ash text-xs">
                      <MapPin className="h-8 w-8 mx-auto mb-2 text-pebble" />
                      <p className="font-semibold text-onyx">No Sites Currently Assigned to You</p>
                      <p className="text-[11px] mt-0.5">Contact your Project Manager to assign site yards.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {assignedSites.map((s) => (
                        <div
                          key={s.id}
                          className="p-4 rounded-[12px] bg-stone/40 border border-pebble hover:border-forest/60 transition group flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-extrabold text-[11px] text-forest bg-clear-bg px-2 py-0.5 rounded">
                                {s.id}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                {s.status}
                              </span>
                            </div>

                            <h3 className="text-sm font-bold text-onyx group-hover:text-forest transition">
                              {s.name}
                            </h3>

                            <div className="mt-2 text-xs text-ash space-y-1">
                              <p className="flex items-center gap-1.5 text-onyx font-medium">
                                <Building2 className="h-3.5 w-3.5 text-ash" />
                                <span>{s.projectName}</span>
                              </p>
                              <p className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-forest shrink-0" />
                                <span className="truncate">
                                  {s.address}, {s.city}
                                </span>
                              </p>
                              <p className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-ash" />
                                <span>
                                  {s.startDate} – {s.expectedCompletion}
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-pebble/60 flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-forest">
                              Plot: {s.totalAreaSqFt || "50,000 sq.ft"}
                            </span>
                            <button
                              type="button"
                              onClick={() => router.push(`/sites`)}
                              className="text-xs font-bold text-forest hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <span>View Scope</span>
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Supervised Trade Contractors & Packages */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="rounded-[14px] bg-white border border-pebble/80 p-5 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-onyx uppercase tracking-wider flex items-center gap-2">
                        <HardHat className="h-4 w-4 text-forest" />
                        <span>Active Trade Contractors on Your Sites ({supervisedContractors.length})</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => router.push("/contractors")}
                        className="text-xs text-forest hover:underline font-semibold"
                      >
                        Directory
                      </button>
                    </div>

                    {supervisedContractors.length === 0 ? (
                      <p className="text-xs text-ash py-4 text-center">
                        No trade contractors awarded yet on your sites.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {supervisedContractors.map((c) => (
                          <div
                            key={c.name}
                            className="p-3 rounded-[10px] bg-stone/30 border border-pebble/70 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-lg bg-white border border-pebble flex items-center justify-center font-bold text-xs text-onyx">
                                {c.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-onyx">{c.name}</p>
                                <p className="text-[11px] text-ash">
                                  {c.trade} &bull; {c.project}
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] font-semibold text-forest bg-forest/10 px-2 py-0.5 rounded">
                              Supervised
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Operational Shortcuts */}
                  <div className="rounded-[14px] bg-white border border-pebble/80 p-5 shadow-2xs space-y-3">
                    <h3 className="text-xs font-bold text-onyx uppercase tracking-wider flex items-center gap-2">
                      <Activity className="h-4 w-4 text-forest" />
                      <span>Site Manager Operations Hub</span>
                    </h3>

                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => router.push("/sites")}
                        className="p-3 rounded-[10px] bg-stone/40 hover:bg-mist border border-pebble text-left transition cursor-pointer"
                      >
                        <MapPin className="h-4 w-4 text-forest mb-1.5" />
                        <p className="text-xs font-bold text-onyx">Construction Sites</p>
                        <p className="text-[11px] text-ash mt-0.5">Yards &amp; Plots</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => router.push("/jobs")}
                        className="p-3 rounded-[10px] bg-stone/40 hover:bg-mist border border-pebble text-left transition cursor-pointer"
                      >
                        <Briefcase className="h-4 w-4 text-forest mb-1.5" />
                        <p className="text-xs font-bold text-onyx">Work Orders</p>
                        <p className="text-[11px] text-ash mt-0.5">Tasks &amp; Sign-offs</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => router.push("/scheduling")}
                        className="p-3 rounded-[10px] bg-stone/40 hover:bg-mist border border-pebble text-left transition cursor-pointer"
                      >
                        <Calendar className="h-4 w-4 text-forest mb-1.5" />
                        <p className="text-xs font-bold text-onyx">Scheduling Calendar</p>
                        <p className="text-[11px] text-ash mt-0.5">Day &amp; Month Plans</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => router.push("/safety")}
                        className="p-3 rounded-[10px] bg-stone/40 hover:bg-mist border border-pebble text-left transition cursor-pointer"
                      >
                        <ShieldCheck className="h-4 w-4 text-forest mb-1.5" />
                        <p className="text-xs font-bold text-onyx">Site Safety</p>
                        <p className="text-[11px] text-ash mt-0.5">Audits &amp; PPE</p>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* CASE B: PROJECT MANAGER PROFILE VIEW                                  */}
            {/* --------------------------------------------------------------------- */}
            {role === "PROJECT_MANAGER" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div className="rounded-[14px] bg-white border border-pebble/80 p-4 shadow-2xs">
                    <span className="text-[11px] font-bold text-ash uppercase tracking-wider block">
                      Managed Projects
                    </span>
                    <p className="text-2xl font-bold text-onyx mt-1">{assignedProjects.length}</p>
                    <span className="text-[11px] text-blue-600 font-semibold mt-0.5 block">
                      Under PM ownership
                    </span>
                  </div>

                  <div className="rounded-[14px] bg-white border border-pebble/80 p-4 shadow-2xs">
                    <span className="text-[11px] font-bold text-ash uppercase tracking-wider block">
                      Active Sites
                    </span>
                    <p className="text-2xl font-bold text-onyx mt-1">{assignedSites.length}</p>
                    <span className="text-[11px] text-forest font-semibold mt-0.5 block">
                      Yards &amp; blocks
                    </span>
                  </div>

                  <div className="rounded-[14px] bg-white border border-pebble/80 p-4 shadow-2xs">
                    <span className="text-[11px] font-bold text-ash uppercase tracking-wider block">
                      Site Supervisors
                    </span>
                    <p className="text-2xl font-bold text-onyx mt-1">
                      {new Set(assignedSites.map((s) => s.siteManagerName)).size}
                    </p>
                    <span className="text-[11px] text-onyx font-semibold mt-0.5 block">
                      Site Managers deployed
                    </span>
                  </div>

                  <div className="rounded-[14px] bg-white border border-pebble/80 p-4 shadow-2xs">
                    <span className="text-[11px] font-bold text-ash uppercase tracking-wider block">
                      Total Work Orders
                    </span>
                    <p className="text-2xl font-bold text-onyx mt-1">{roleJobs.length}</p>
                    <span className="text-[11px] text-success-text font-semibold mt-0.5 block">
                      Across all projects
                    </span>
                  </div>
                </div>

                <div className="rounded-[14px] bg-white border border-pebble/80 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-onyx uppercase tracking-wider flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-blue-600" />
                      <span>Project Portfolio ({assignedProjects.length})</span>
                    </h2>
                    <button
                      type="button"
                      onClick={() => router.push("/projects")}
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <span>All Projects</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {assignedProjects.map((p) => (
                      <div
                        key={p.name}
                        className="p-4 rounded-[12px] bg-stone/40 border border-pebble hover:border-blue-400 transition"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            {p.status || "Active"}
                          </span>
                          <span className="text-xs font-semibold text-ash">
                            Due: {p.endDate || p.due || "—"}
                          </span>
                        </div>
                        <h3 className="font-bold text-onyx text-sm mt-2">{p.name}</h3>
                        <p className="text-xs text-ash mt-0.5">Client: {p.client || "SSS"}</p>
                        <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-pebble/60">
                          <span className="text-ash">
                            Site Manager: <strong>{p.siteManagerName || "SM"}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => router.push("/projects")}
                            className="font-bold text-blue-600 hover:underline"
                          >
                            Inspect
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* CASE C: FIELD WORKER PROFILE VIEW                                     */}
            {/* --------------------------------------------------------------------- */}
            {role === "FIELD_WORKER" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div className="rounded-[14px] bg-white border border-pebble/80 p-4 shadow-2xs">
                    <span className="text-[11px] font-bold text-ash uppercase tracking-wider block">
                      Assigned Tasks
                    </span>
                    <p className="text-2xl font-bold text-onyx mt-1">{roleJobs.length}</p>
                    <span className="text-[11px] text-amber-700 font-semibold mt-0.5 block">
                      In your queue
                    </span>
                  </div>

                  <div className="rounded-[14px] bg-white border border-pebble/80 p-4 shadow-2xs">
                    <span className="text-[11px] font-bold text-ash uppercase tracking-wider block">
                      Completed Jobs
                    </span>
                    <p className="text-2xl font-bold text-onyx mt-1">
                      {roleJobs.filter((j) => j.completed).length}
                    </p>
                    <span className="text-[11px] text-success-text font-semibold mt-0.5 block">
                      Signed &amp; verified
                    </span>
                  </div>

                  <div className="rounded-[14px] bg-white border border-pebble/80 p-4 shadow-2xs">
                    <span className="text-[11px] font-bold text-ash uppercase tracking-wider block">
                      Specialty Trade
                    </span>
                    <p className="text-base font-bold text-onyx mt-2">Plumbing &amp; Field Work</p>
                    <span className="text-[11px] text-ash font-medium mt-0.5 block">
                      On-site execution
                    </span>
                  </div>

                  <div className="rounded-[14px] bg-white border border-pebble/80 p-4 shadow-2xs">
                    <span className="text-[11px] font-bold text-ash uppercase tracking-wider block">
                      Active Sites
                    </span>
                    <p className="text-2xl font-bold text-onyx mt-1">{assignedSites.length}</p>
                    <span className="text-[11px] text-forest font-semibold mt-0.5 block">
                      Assigned locations
                    </span>
                  </div>
                </div>

                <div className="rounded-[14px] bg-white border border-pebble/80 p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-onyx uppercase tracking-wider flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-amber-600" />
                      <span>My Assigned Work Orders</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => router.push("/jobs")}
                      className="text-xs font-bold text-forest hover:underline"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-2">
                    {roleJobs.slice(0, 4).map((j) => (
                      <div
                        key={j.id}
                        className="p-3 rounded-[10px] bg-stone/30 border border-pebble flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-onyx">{j.title}</p>
                          <p className="text-[11px] text-ash">
                            {j.location} &bull; Due: {j.due}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                          {j.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* CASE D: SALES MANAGER PROFILE VIEW                                    */}
            {/* --------------------------------------------------------------------- */}
            {role === "SALES_MANAGER" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div className="rounded-[14px] bg-white border border-pebble/80 p-4 shadow-2xs">
                    <span className="text-[11px] font-bold text-ash uppercase tracking-wider block">
                      Active Projects
                    </span>
                    <p className="text-2xl font-bold text-onyx mt-1">{projects.length}</p>
                    <span className="text-[11px] text-sky-600 font-semibold mt-0.5 block">
                      In pipeline
                    </span>
                  </div>
                  <div className="rounded-[14px] bg-white border border-pebble/80 p-4 shadow-2xs">
                    <span className="text-[11px] font-bold text-ash uppercase tracking-wider block">
                      Quotations Won
                    </span>
                    <p className="text-2xl font-bold text-onyx mt-1">12</p>
                    <span className="text-[11px] text-success-text font-semibold mt-0.5 block">
                      Contract signed
                    </span>
                  </div>
                  <div className="rounded-[14px] bg-white border border-pebble/80 p-4 shadow-2xs">
                    <span className="text-[11px] font-bold text-ash uppercase tracking-wider block">
                      Win Rate
                    </span>
                    <p className="text-2xl font-bold text-onyx mt-1">68%</p>
                    <span className="text-[11px] text-forest font-semibold mt-0.5 block">
                      Strong conversions
                    </span>
                  </div>
                  <div className="rounded-[14px] bg-white border border-pebble/80 p-4 shadow-2xs">
                    <span className="text-[11px] font-bold text-ash uppercase tracking-wider block">
                      Conversion Speed
                    </span>
                    <p className="text-2xl font-bold text-onyx mt-1">14d</p>
                    <span className="text-[11px] text-ash font-medium mt-0.5 block">
                      Average cycle
                    </span>
                  </div>
                </div>

                <div className="rounded-[14px] bg-white border border-pebble/80 p-5 shadow-2xs space-y-3">
                  <h3 className="text-xs font-bold text-onyx uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-sky-600" />
                    <span>Sales Operations Quick Links</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => router.push("/pipeline")}
                      className="p-3 rounded-[10px] bg-stone/40 hover:bg-mist border border-pebble text-left transition cursor-pointer"
                    >
                      <Layers className="h-4 w-4 text-sky-600 mb-1" />
                      <p className="text-xs font-bold text-onyx">Deal Pipeline</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push("/leads")}
                      className="p-3 rounded-[10px] bg-stone/40 hover:bg-mist border border-pebble text-left transition cursor-pointer"
                    >
                      <Users className="h-4 w-4 text-sky-600 mb-1" />
                      <p className="text-xs font-bold text-onyx">Enquiries &amp; Leads</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push("/quotations")}
                      className="p-3 rounded-[10px] bg-stone/40 hover:bg-mist border border-pebble text-left transition cursor-pointer"
                    >
                      <FileText className="h-4 w-4 text-sky-600 mb-1" />
                      <p className="text-xs font-bold text-onyx">Quotations</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push("/customers")}
                      className="p-3 rounded-[10px] bg-stone/40 hover:bg-mist border border-pebble text-left transition cursor-pointer"
                    >
                      <Award className="h-4 w-4 text-sky-600 mb-1" />
                      <p className="text-xs font-bold text-onyx">Customer Accounts</p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* CASE E: FINANCE MANAGER PROFILE VIEW                                  */}
            {/* --------------------------------------------------------------------- */}
            {role === "FINANCE_MANAGER" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div className="rounded-[14px] bg-white border border-pebble/80 p-4 shadow-2xs">
                    <span className="text-[11px] font-bold text-ash uppercase tracking-wider block">
                      Invoices Issued
                    </span>
                    <p className="text-2xl font-bold text-onyx mt-1">₹42.5 L</p>
                    <span className="text-[11px] text-indigo-700 font-semibold mt-0.5 block">
                      Across projects
                    </span>
                  </div>
                  <div className="rounded-[14px] bg-white border border-pebble/80 p-4 shadow-2xs">
                    <span className="text-[11px] font-bold text-ash uppercase tracking-wider block">
                      Supplier Bills
                    </span>
                    <p className="text-2xl font-bold text-onyx mt-1">₹18.2 L</p>
                    <span className="text-[11px] text-caution-text font-semibold mt-0.5 block">
                      Verified &amp; active
                    </span>
                  </div>
                  <div className="rounded-[14px] bg-white border border-pebble/80 p-4 shadow-2xs">
                    <span className="text-[11px] font-bold text-ash uppercase tracking-wider block">
                      GST Compliance
                    </span>
                    <p className="text-2xl font-bold text-onyx mt-1">100%</p>
                    <span className="text-[11px] text-success-text font-semibold mt-0.5 block">
                      Up to date
                    </span>
                  </div>
                  <div className="rounded-[14px] bg-white border border-pebble/80 p-4 shadow-2xs">
                    <span className="text-[11px] font-bold text-ash uppercase tracking-wider block">
                      Net Margin
                    </span>
                    <p className="text-2xl font-bold text-onyx mt-1">24.2%</p>
                    <span className="text-[11px] text-forest font-semibold mt-0.5 block">
                      Healthy cash flow
                    </span>
                  </div>
                </div>

                <div className="rounded-[14px] bg-white border border-pebble/80 p-5 shadow-2xs">
                  <h3 className="text-xs font-bold text-onyx uppercase tracking-wider flex items-center gap-2 mb-3">
                    <DollarSign className="h-4 w-4 text-indigo-600" />
                    <span>Financial Controls &amp; Invoices</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => router.push("/finance")}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-[8px] shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Open Finance Hub</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* CASE F: OWNER / ACCOUNT ADMIN PROFILE VIEW                             */}
            {/* --------------------------------------------------------------------- */}
            {(role === "OWNER" || role === "ACCOUNT_ADMIN") && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div className="rounded-[14px] bg-white border border-pebble/80 p-4 shadow-2xs">
                    <span className="text-[11px] font-bold text-ash uppercase tracking-wider block">
                      Active Enterprise Tier
                    </span>
                    <p className="text-xl font-bold text-onyx mt-1">ENTERPRISE</p>
                    <span className="text-[11px] text-forest font-semibold mt-0.5 block">
                      All modules unlocked
                    </span>
                  </div>
                  <div className="rounded-[14px] bg-white border border-pebble/80 p-4 shadow-2xs">
                    <span className="text-[11px] font-bold text-ash uppercase tracking-wider block">
                      Total Projects
                    </span>
                    <p className="text-2xl font-bold text-onyx mt-1">{projects.length}</p>
                    <span className="text-[11px] text-onyx font-semibold mt-0.5 block">
                      Company portfolio
                    </span>
                  </div>
                  <div className="rounded-[14px] bg-white border border-pebble/80 p-4 shadow-2xs">
                    <span className="text-[11px] font-bold text-ash uppercase tracking-wider block">
                      Active Sites
                    </span>
                    <p className="text-2xl font-bold text-onyx mt-1">{sites.length}</p>
                    <span className="text-[11px] text-forest font-semibold mt-0.5 block">
                      Live yards
                    </span>
                  </div>
                  <div className="rounded-[14px] bg-white border border-pebble/80 p-4 shadow-2xs">
                    <span className="text-[11px] font-bold text-ash uppercase tracking-wider block">
                      Team Capacity
                    </span>
                    <p className="text-2xl font-bold text-onyx mt-1">Unlimited</p>
                    <span className="text-[11px] text-success-text font-semibold mt-0.5 block">
                      Full multi-role seats
                    </span>
                  </div>
                </div>

                <div className="rounded-[14px] bg-white border border-pebble/80 p-5 shadow-2xs space-y-3">
                  <h3 className="text-xs font-bold text-onyx uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-forest" />
                    <span>Executive Administration Hub</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => router.push("/users")}
                      className="p-3 rounded-[10px] bg-stone/40 hover:bg-mist border border-pebble text-left transition cursor-pointer"
                    >
                      <Users className="h-4 w-4 text-forest mb-1" />
                      <p className="text-xs font-bold text-onyx">Team &amp; Roles</p>
                      <p className="text-[11px] text-ash">Access control</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push("/subscription")}
                      className="p-3 rounded-[10px] bg-stone/40 hover:bg-mist border border-pebble text-left transition cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4 text-forest mb-1" />
                      <p className="text-xs font-bold text-onyx">Subscription</p>
                      <p className="text-[11px] text-ash">Plan &amp; billing</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push("/company")}
                      className="p-3 rounded-[10px] bg-stone/40 hover:bg-mist border border-pebble text-left transition cursor-pointer"
                    >
                      <Building className="h-4 w-4 text-forest mb-1" />
                      <p className="text-xs font-bold text-onyx">Company Profile</p>
                      <p className="text-[11px] text-ash">Business info</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push("/dashboard")}
                      className="p-3 rounded-[10px] bg-stone/40 hover:bg-mist border border-pebble text-left transition cursor-pointer"
                    >
                      <Activity className="h-4 w-4 text-forest mb-1" />
                      <p className="text-xs font-bold text-onyx">Executive Board</p>
                      <p className="text-[11px] text-ash">KPIs &amp; Reports</p>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: EDIT PROFILE & CONTACT INFORMATION                                */}
        {/* ========================================================================= */}
        {activeTab === "EDIT" && (
          <div className="rounded-[16px] bg-white border border-pebble/80 p-6 shadow-2xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-onyx tracking-tight flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-forest" />
                <span>Edit Profile &amp; Contact Details</span>
              </h2>
              <p className="text-xs text-ash mt-0.5">
                Update your personal information, on-site contact numbers, and operational bio.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-onyx">
                    Full Name <span className="text-hazard-text">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-[10px] border border-pebble bg-stone/40 px-3.5 py-2.5 text-xs text-onyx outline-none focus:border-forest transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-onyx">Email Address (Read-only)</label>
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full rounded-[10px] border border-pebble bg-stone/20 px-3.5 py-2.5 text-xs text-ash cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-onyx">Direct Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-[10px] border border-pebble bg-stone/40 px-3.5 py-2.5 text-xs text-onyx outline-none focus:border-forest transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-onyx">Department / Operational Area</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Operations &amp; Site Supervision"
                    className="w-full rounded-[10px] border border-pebble bg-stone/40 px-3.5 py-2.5 text-xs text-onyx outline-none focus:border-forest transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-onyx">Base Physical Work Location</label>
                  <input
                    type="text"
                    value={workLocation}
                    onChange={(e) => setWorkLocation(e.target.value)}
                    placeholder="Main Project Yard, Gurugram"
                    className="w-full rounded-[10px] border border-pebble bg-stone/40 px-3.5 py-2.5 text-xs text-onyx outline-none focus:border-forest transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-onyx">
                    Emergency Contact / Radio Channel
                  </label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="+91 98111 22334 (Channel 4)"
                    className="w-full rounded-[10px] border border-pebble bg-stone/40 px-3.5 py-2.5 text-xs text-onyx outline-none focus:border-forest transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-onyx">Operational Bio / Notes</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe your role, responsibilities, or site coordination notes..."
                  className="w-full rounded-[10px] border border-pebble bg-stone/40 p-3 text-xs text-onyx outline-none focus:border-forest transition resize-none"
                />
              </div>

              <div className="pt-4 border-t border-pebble/60 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("OVERVIEW")}
                  className="px-4 py-2 rounded-[8px] bg-stone hover:bg-mist text-onyx text-xs font-semibold border border-pebble transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-[8px] bg-forest hover:bg-forest-hover text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{isSaving ? "Saving..." : "Save Profile Details"}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SECURITY & CREDENTIALS                                            */}
        {/* ========================================================================= */}
        {activeTab === "SECURITY" && (
          <div className="rounded-[16px] bg-white border border-pebble/80 p-6 shadow-2xs space-y-5 max-w-xl">
            <div>
              <h2 className="text-base font-bold text-onyx tracking-tight flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-forest" />
                <span>Change Password &amp; Credentials</span>
              </h2>
              <p className="text-xs text-ash mt-0.5">
                Ensure your account stays secure with an enterprise-grade password.
              </p>
            </div>

            {passwordError && (
              <div className="p-3 rounded-[10px] bg-hazard-bg border border-hazard-bg text-hazard-text text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 rounded-[10px] bg-clear-bg border border-success/30 text-success-text text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-onyx">Current Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-[10px] border border-pebble bg-stone/40 px-3.5 py-2.5 text-xs text-onyx outline-none focus:border-forest transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ash hover:text-onyx cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-onyx">New Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-[10px] border border-pebble bg-stone/40 px-3.5 py-2.5 text-xs text-onyx outline-none focus:border-forest transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-onyx">Confirm New Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full rounded-[10px] border border-pebble bg-stone/40 px-3.5 py-2.5 text-xs text-onyx outline-none focus:border-forest transition"
                />
              </div>

              <div className="pt-3 border-t border-pebble/60 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-[8px] bg-forest hover:bg-forest-hover text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: PERMISSIONS & ROLE MATRIX                                         */}
        {/* ========================================================================= */}
        {activeTab === "PERMISSIONS" && (
          <div className="rounded-[16px] bg-white border border-pebble/80 p-6 shadow-2xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-onyx tracking-tight flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-forest" />
                <span>Enterprise Permissions for {getFormattedRole(role)}</span>
              </h2>
              <p className="text-xs text-ash mt-0.5">
                Overview of access control rights, read/write privileges, and operational governance for your role.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-pebble/80 text-[11px] font-bold text-ash uppercase">
                    <th className="pb-3">Module</th>
                    <th className="pb-3">Scope</th>
                    <th className="pb-3">Access Level</th>
                    <th className="pb-3">Approval Authority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pebble/40 text-onyx">
                  <tr>
                    <td className="py-3 font-bold flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-forest" />
                      <span>Construction Sites</span>
                    </td>
                    <td className="py-3 text-ash">
                      {role === "SITE_MANAGER"
                        ? "Assigned Sites & Supervised Yards"
                        : "Company-wide Sites"}
                    </td>
                    <td className="py-3">
                      <span className="font-semibold text-forest bg-forest/10 px-2 py-0.5 rounded">
                        Full Operations &amp; Inspection
                      </span>
                    </td>
                    <td className="py-3 font-medium">Site Sign-offs</td>
                  </tr>

                  <tr>
                    <td className="py-3 font-bold flex items-center gap-2">
                      <Briefcase className="h-3.5 w-3.5 text-forest" />
                      <span>Work Orders &amp; Jobs</span>
                    </td>
                    <td className="py-3 text-ash">On-Site Execution Packages</td>
                    <td className="py-3">
                      <span className="font-semibold text-forest bg-forest/10 px-2 py-0.5 rounded">
                        Status &amp; Schedule Updates
                      </span>
                    </td>
                    <td className="py-3 font-medium">Quality Checklist Verification</td>
                  </tr>

                  <tr>
                    <td className="py-3 font-bold flex items-center gap-2">
                      <HardHat className="h-3.5 w-3.5 text-forest" />
                      <span>Trade Contractors</span>
                    </td>
                    <td className="py-3 text-ash">Awarded Subcontractors</td>
                    <td className="py-3">
                      <span className="font-semibold text-forest bg-forest/10 px-2 py-0.5 rounded">
                        Daily Supervision &amp; RFIs
                      </span>
                    </td>
                    <td className="py-3 font-medium">Work Completion Sign-off</td>
                  </tr>

                  <tr>
                    <td className="py-3 font-bold flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-forest" />
                      <span>Scheduling</span>
                    </td>
                    <td className="py-3 text-ash">Multi-day Timeline &amp; Deadlines</td>
                    <td className="py-3">
                      <span className="font-semibold text-forest bg-forest/10 px-2 py-0.5 rounded">
                        Dispatch &amp; Calendar Booking
                      </span>
                    </td>
                    <td className="py-3 font-medium">Resource Scheduling</td>
                  </tr>

                  <tr>
                    <td className="py-3 font-bold flex items-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-forest" />
                      <span>Safety &amp; Audits</span>
                    </td>
                    <td className="py-3 text-ash">Field Inspection Reports</td>
                    <td className="py-3">
                      <span className="font-semibold text-forest bg-forest/10 px-2 py-0.5 rounded">
                        Log &amp; Corrective Directives
                      </span>
                    </td>
                    <td className="py-3 font-medium">Safety Clearance</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </FirmaLayout>
  );
}
