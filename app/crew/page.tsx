"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import FirmaLayout from "@/components/layout/FirmaLayout";
import { db } from "@/lib/db";
import {
  useCrewStore,
  type CrewMember,
  type CrewRole,
  type CrewStatus,
} from "@/store/crewStore";
import {
  useSchedulingStore,
  type ScheduledJob,
  type UnscheduledJob,
} from "@/store/schedulingStore";
import { useTenderFlowStore } from "@/store/tenderFlowStore";
import { useLeadFlowStore } from "@/store/leadFlowStore";
import { useAuthStore } from "@/store/authStore";
import {
  Users2,
  Plus,
  Search,
  Phone,
  Edit2,
  Trash2,
  X,
  Check,
  Building2,
  HardHat,
  Briefcase,
  UserCheck,
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { toast } from "@/components/ui/toast";

export interface AssignedJobSummary {
  id: string;
  title: string;
  project: string;
  site: string;
  date: string;
  timeSlot: string;
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled" | "On-site" | "Travelling" | "Upcoming";
  colorScheme: ScheduledJob["colorScheme"];
  notes?: string;
  source: "schedule" | "tender";
}

export default function CrewPage() {
  const router = useRouter();

  // Stores
  const { members, addMember, updateMember, deleteMember } = useCrewStore();
  const {
    scheduledJobs = [],
    unscheduledJobs = [],
    scheduleJob,
    unscheduleJob,
  } = useSchedulingStore();
  const { jobs: tenderJobs = [] } = useTenderFlowStore();
  const { projects = [] } = useLeadFlowStore();
  const currentUser = useAuthStore((state) => state.currentUser);

  // IndexedDB Real Crew Members (stored in db.crew)
  const [dbCrewMembers, setDbCrewMembers] = useState<CrewMember[]>([]);

  const loadDbCrew = useCallback(async () => {
    try {
      // Check if db.crew is empty; if so, migrate any non-system crew members from useCrewStore
      const count = await db.crew.count();
      if (count === 0) {
        const storeMembers = useCrewStore.getState().members || [];
        const dummyIds = new Set([
          "crew-1", "crew-2", "crew-3", "crew-4", "crew-5", "crew-6",
          "crew-7", "crew-8", "crew-9", "crew-10", "crew-11", "crew-12"
        ]);
        const validStoreMembers = storeMembers.filter(
          (m) => !dummyIds.has(m.id) && !m.id.startsWith("user-")
        );
        if (validStoreMembers.length > 0) {
          for (const sm of validStoreMembers) {
            await db.crew.add({
              companyId: "ORG-DEFAULT",
              name: sm.name,
              role: sm.role,
              contact: sm.contact || "+91 98000 00000",
              status: sm.status || "Active",
              trade: sm.trade || "General Construction",
              site: sm.site || "Main Site",
              email: sm.email,
              wageRate: sm.wageRate,
              avatarBg: sm.avatarBg,
              joinedDate: sm.joinedDate,
              createdAt: new Date().toISOString(),
            });
          }
        }
      }

      const records = await db.crew.toArray();

      // Automatically sync any FIELD_WORKER or SITE_MANAGER users created by Admin in db.users
      const allDbUsers = await db.users.toArray();
      const relevantUsers = allDbUsers.filter(
        (u) => u.role === "FIELD_WORKER" || u.role === "SITE_MANAGER"
      );

      for (const u of relevantUsers) {
        const roleLabel: CrewRole =
          u.role === "SITE_MANAGER" ? "Site Manager" : "Field Worker";
        const cleanUserEmail = (u.email || "").trim().toLowerCase();
        const cleanUserName = (u.name || "").trim().toLowerCase();

        const alreadyInCrew = records.some((c) => {
          const cEmail = (c.email || "").trim().toLowerCase();
          const cName = (c.name || "").trim().toLowerCase();
          return (cleanUserEmail && cEmail && cEmail === cleanUserEmail) || cName === cleanUserName;
        });

        if (!alreadyInCrew) {
          const newId = await db.crew.add({
            companyId: u.companyId || "ORG-DEFAULT",
            name: u.name,
            role: roleLabel,
            contact: "+91 98000 00000",
            email: cleanUserEmail,
            status: "Active",
            trade:
              roleLabel === "Field Worker"
                ? "General Construction"
                : "Site Operations",
            site: "Main Site",
            avatarBg:
              roleLabel === "Field Worker"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-purple-100 text-purple-800",
            joinedDate: new Date().toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            createdAt: new Date().toISOString(),
          });

          records.push({
            id: newId as number,
            companyId: u.companyId || "ORG-DEFAULT",
            name: u.name,
            role: roleLabel,
            contact: "+91 98000 00000",
            email: cleanUserEmail,
            status: "Active",
            trade:
              roleLabel === "Field Worker"
                ? "General Construction"
                : "Site Operations",
            site: "Main Site",
            avatarBg:
              roleLabel === "Field Worker"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-purple-100 text-purple-800",
            joinedDate: new Date().toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            createdAt: new Date().toISOString(),
          });
        }
      }

      const mapped: CrewMember[] = records.map((c) => ({
        id: `crew-${c.id}`,
        name: c.name,
        role: c.role,
        contact: c.contact || "+91 98000 00000",
        status: c.status || "Active",
        trade:
          c.trade ||
          (c.role === "Field Worker"
            ? "General Construction"
            : "Site Operations"),
        site: c.site || "Main Site",
        email: c.email,
        wageRate: c.wageRate,
        avatarBg:
          c.avatarBg ||
          (c.role === "Field Worker"
            ? "bg-emerald-100 text-emerald-800"
            : c.role === "Site Manager"
            ? "bg-purple-100 text-purple-800"
            : "bg-blue-100 text-blue-800"),
        joinedDate:
          c.joinedDate ||
          new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
      }));

      setDbCrewMembers(mapped);
      useCrewStore.getState().setMembers(mapped);
    } catch (e) {
      console.error("Failed to load crew from IndexedDB:", e);
    }
  }, []);

  useEffect(() => {
    loadDbCrew();
  }, [loadDbCrew]);

  // Combined real crew from IndexedDB db.crew
  const allMembers = useMemo(() => {
    return dbCrewMembers;
  }, [dbCrewMembers]);

  // Search, Role Tab & Assignment Filter State
  const [search, setSearch] = useState("");
  const [activeRoleTab, setActiveRoleTab] = useState<"ALL" | CrewRole>("ALL");
  const [assignmentFilter, setAssignmentFilter] = useState<
    "ALL" | "ASSIGNED" | "AVAILABLE"
  >("ALL");

  // Add Field Worker Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newContact, setNewContact] = useState("+91 ");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("123456");
  const [newTrade, setNewTrade] = useState("");
  const [newWage, setNewWage] = useState("");
  const [newStatus, setNewStatus] = useState<CrewStatus>("Active");
  const [addError, setAddError] = useState("");

  // Edit Member Modal State
  const [editingMember, setEditingMember] = useState<CrewMember | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<CrewRole>("Field Worker");
  const [editContact, setEditContact] = useState("");
  const [editTrade, setEditTrade] = useState("");
  const [editSite, setEditSite] = useState("");
  const [editStatus, setEditStatus] = useState<CrewStatus>("Active");

  // Assign Job Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTargetMember, setAssignTargetMember] =
    useState<CrewMember | null>(null);
  const [assignJobMode, setAssignJobMode] = useState<"SELECT" | "CUSTOM">(
    "SELECT"
  );
  const [selectedUnscheduledId, setSelectedUnscheduledId] =
    useState<string>("");
  const [customJobTitle, setCustomJobTitle] = useState("");
  const [assignProject, setAssignProject] = useState("Skyline Apartments");
  const [assignSite, setAssignSite] = useState("Main Site Area");
  const [assignDate, setAssignDate] = useState("16/09/2026");
  const [assignTime, setAssignTime] = useState("09:00 AM - 05:00 PM");
  const [assignNotes, setAssignNotes] = useState("");

  // Job Details Viewing Modal
  const [viewingJob, setViewingJob] = useState<{
    job: AssignedJobSummary;
    member: CrewMember;
  } | null>(null);

  // All Jobs for Member Modal (when member has multiple jobs)
  const [viewingAllJobsMember, setViewingAllJobsMember] =
    useState<CrewMember | null>(null);

  // Derive All Unscheduled Backlog Options (Tender Jobs + Unscheduled Store Jobs)
  const backlogOptions = useMemo(() => {
    const list: { id: string; title: string; project: string; site: string }[] =
      [];

    // 1. From tenderJobs not yet in scheduledJobs
    tenderJobs.forEach((tj) => {
      if (!scheduledJobs.some((sj) => sj.id === tj.id)) {
        list.push({
          id: tj.id,
          title: tj.title,
          project: tj.projectName || "Site Project",
          site: tj.location || "Project Site",
        });
      }
    });

    // 2. From unscheduledJobs
    unscheduledJobs.forEach((uj) => {
      if (!list.some((item) => item.id === uj.id)) {
        list.push({
          id: uj.id,
          title: uj.title,
          project: uj.project,
          site: uj.site,
        });
      }
    });

    return list;
  }, [tenderJobs, scheduledJobs, unscheduledJobs]);

  // Derive Assigned Jobs for each crew member
  const memberJobsMap = useMemo(() => {
    const map: Record<string, AssignedJobSummary[]> = {};

    allMembers.forEach((m) => {
      map[m.id] = [];
      const mName = m.name.trim().toLowerCase();

      // 1. Check scheduledJobs (highest fidelity)
      scheduledJobs.forEach((sj) => {
        if (sj.worker && sj.worker.trim().toLowerCase() === mName) {
          map[m.id].push({
            id: sj.id,
            title: sj.title,
            project: sj.project,
            site: sj.site,
            date: sj.dateFormatted || sj.date,
            timeSlot: sj.timeSlot || `${sj.startTime} - ${sj.endTime}`,
            status: sj.status || "Scheduled",
            colorScheme: sj.colorScheme || "emerald",
            notes: sj.notes,
            source: "schedule",
          });
        }
      });

      // 2. Check tenderJobs
      tenderJobs.forEach((tj) => {
        const matchName =
          (tj.assignee && tj.assignee.trim().toLowerCase() === mName) ||
          (tj.contractorName && tj.contractorName.trim().toLowerCase() === mName);

        if (matchName && !map[m.id].some((x) => x.id === tj.id)) {
          map[m.id].push({
            id: tj.id,
            title: tj.title,
            project: tj.projectName,
            site: tj.location,
            date: tj.due || tj.assignedDate,
            timeSlot: "Full Shift (09:00 AM - 05:00 PM)",
            status: tj.status || (tj.completed ? "Completed" : "In Progress"),
            colorScheme: "indigo",
            notes: tj.description,
            source: "tender",
          });
        }
      });
    });

    return map;
  }, [allMembers, scheduledJobs, tenderJobs]);

  // Summary Metrics Counts
  const metrics = useMemo(() => {
    const total = allMembers.length;
    let assignedCount = 0;
    let availableCount = 0;
    let siteManagersCount = 0;

    allMembers.forEach((m) => {
      const hasJob = (memberJobsMap[m.id] || []).length > 0;
      if (hasJob) {
        assignedCount++;
      } else if (m.status === "Active") {
        availableCount++;
      }
      if (m.role === "Site Manager") {
        siteManagersCount++;
      }
    });

    return {
      total,
      assignedCount,
      availableCount,
      siteManagersCount,
    };
  }, [allMembers, memberJobsMap]);

  // Role Counts for Tabs
  const roleCounts = useMemo(() => {
    return {
      ALL: allMembers.length,
      "Field Worker": allMembers.filter((m) => m.role === "Field Worker").length,
      "Site Manager": allMembers.filter((m) => m.role === "Site Manager").length,
      Office: allMembers.filter((m) => m.role === "Office").length,
    };
  }, [allMembers]);

  // Filtered Members
  const filteredMembers = useMemo(() => {
    return allMembers.filter((m) => {
      // Role tab filter
      if (activeRoleTab !== "ALL" && m.role !== activeRoleTab) {
        return false;
      }

      // Assignment filter (All / Assigned / Available)
      const hasJobs = (memberJobsMap[m.id] || []).length > 0;
      if (assignmentFilter === "ASSIGNED" && !hasJobs) return false;
      if (assignmentFilter === "AVAILABLE" && (hasJobs || m.status !== "Active"))
        return false;

      // Search filter
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const hasMatchingJob = (memberJobsMap[m.id] || []).some(
        (j) =>
          j.id.toLowerCase().includes(q) ||
          j.title.toLowerCase().includes(q) ||
          j.project.toLowerCase().includes(q) ||
          j.site.toLowerCase().includes(q)
      );

      return (
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.contact.toLowerCase().includes(q) ||
        (m.trade && m.trade.toLowerCase().includes(q)) ||
        (m.site && m.site.toLowerCase().includes(q)) ||
        hasMatchingJob
      );
    });
  }, [allMembers, activeRoleTab, assignmentFilter, search, memberJobsMap]);

  // Open Assign Job Modal for a Member
  const handleOpenAssignModal = (member: CrewMember) => {
    setAssignTargetMember(member);
    if (backlogOptions.length > 0) {
      setAssignJobMode("SELECT");
      setSelectedUnscheduledId(backlogOptions[0].id);
      setCustomJobTitle(backlogOptions[0].title);
      setAssignProject(backlogOptions[0].project);
      setAssignSite(backlogOptions[0].site);
    } else {
      setAssignJobMode("CUSTOM");
      setCustomJobTitle(
        member.trade ? `${member.trade} Execution Works` : "Site Work Package"
      );
      setAssignProject(projects[0]?.name || "Skyline Apartments");
      setAssignSite(member.site || "Main Site Area");
    }
    setAssignDate("16/09/2026");
    setAssignTime("09:00 AM - 05:00 PM");
    setAssignNotes("");
    setShowAssignModal(true);
  };

  // Submit Job Assignment
  const handleSubmitAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTargetMember) return;

    let finalJobId = "";
    let finalTitle = "";
    let finalProject = assignProject;
    let finalSite = assignSite;

    if (assignJobMode === "SELECT") {
      const selected = backlogOptions.find(
        (b) => b.id === selectedUnscheduledId
      );
      if (selected) {
        finalJobId = selected.id;
        finalTitle = selected.title;
        finalProject = selected.project;
        finalSite = selected.site;
      } else {
        finalJobId = `JOB-${Date.now().toString().slice(-4)}`;
        finalTitle = customJobTitle || "Site Trade Execution";
      }
    } else {
      finalJobId = `JOB-${Date.now().toString().slice(-4)}`;
      finalTitle = customJobTitle || "Site Execution Work";
    }

    scheduleJob({
      jobId: finalJobId,
      title: finalTitle,
      project: finalProject,
      site: finalSite,
      worker: assignTargetMember.name,
      workerRole: assignTargetMember.role,
      date: assignDate,
      timeRange: assignTime,
      notes:
        assignNotes ||
        `Assigned from Crew dashboard to ${assignTargetMember.name}.`,
    });

    // Also mirror to tenderFlowStore so it is displayed in Active Jobs & Work Orders!
    try {
      const isSM = currentUser?.role === "SITE_MANAGER";
      useTenderFlowStore.getState().assignJobToContractor({
        title: finalTitle,
        projectName: finalProject,
        location: finalSite || `${finalProject} Site`,
        contractorId: "",
        contractorName: assignTargetMember.name,
        trade: assignTargetMember.trade || "General Trade",
        priority: "High",
        due: assignDate,
        description: assignNotes || `Assigned from Crew to ${assignTargetMember.name}`,
        siteManagerId: isSM ? String(currentUser?.id) : undefined,
        siteManagerName: isSM ? currentUser?.name : undefined,
      });
    } catch (e) {
      console.error("Failed to mirror job to tenderFlowStore:", e);
    }

    setShowAssignModal(false);
    toast.success("Job Assigned Successfully", {
      description: `${finalTitle} assigned to ${assignTargetMember.name} on ${assignDate}`,
    });
  };

  // Unassign / Free Worker
  const handleUnscheduleJob = (jobId: string) => {
    if (
      confirm(
        "Are you sure you want to unassign this job? It will move back to the unscheduled queue."
      )
    ) {
      unscheduleJob(jobId);
      setViewingJob(null);
      setViewingAllJobsMember(null);
      toast.info("Job Unassigned", {
        description: "Job moved back to the unscheduled backlog.",
      });
    }
  };

  // Handle Add Field Worker Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setAddError("Please enter the worker's full name");
      return;
    }
    if (!newContact.trim() || newContact.trim() === "+91") {
      setAddError("Please enter a valid contact phone number");
      return;
    }
    if (!newEmail.trim() || !newEmail.includes("@")) {
      setAddError("Please enter a valid email address for worker login");
      return;
    }
    if (!newPassword.trim() || newPassword.trim().length < 6) {
      setAddError("Password must be at least 6 characters for worker login");
      return;
    }

    const cleanEmail = newEmail.trim().toLowerCase();
    const cleanPassword = newPassword.trim();
    const cleanName = newName.trim();
    const cleanContact = newContact.trim();
    const companyId = currentUser?.companyId || "ORG-DEFAULT";

    // Check if user with this email already exists in db.users
    const existingUser = await db.users
      .where("email")
      .equals(cleanEmail)
      .first();
    if (existingUser) {
      setAddError(`A user with email "${cleanEmail}" already exists. Please use a unique email.`);
      return;
    }

    const trade = newTrade.trim() || "General Construction";
    const avatarBg = "bg-emerald-100 text-emerald-800";
    const joinedDate = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    try {
      // 1. Create Login Account in db.users so worker can log in directly
      await db.users.add({
        companyId,
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword,
        role: "FIELD_WORKER",
        size: 1,
      });

      // 2. Add to db.crew
      await db.crew.add({
        companyId,
        name: cleanName,
        role: "Field Worker",
        contact: cleanContact,
        email: cleanEmail,
        status: newStatus,
        trade,
        site: "", // Unassigned by default, not assigned from this form
        wageRate: newWage.trim() || undefined,
        avatarBg,
        joinedDate,
        createdAt: new Date().toISOString(),
      });

      await loadDbCrew();

      setNewName("");
      setNewContact("+91 ");
      setNewEmail("");
      setNewPassword("123456");
      setNewTrade("");
      setNewWage("");
      setNewStatus("Active");
      setAddError("");
      setShowAddModal(false);

      toast.success("Field Worker Added", {
        description: `${cleanName} registered! Can now log in with email: ${cleanEmail}`,
      });
    } catch (err) {
      console.error("Error adding to db.crew or db.users:", err);
      setAddError("Failed to save field worker. Please try again.");
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (member: CrewMember) => {
    setEditingMember(member);
    setEditName(member.name);
    setEditRole(member.role);
    setEditContact(member.contact);
    setEditTrade(member.trade || "");
    setEditSite(member.site || "Main Site");
    setEditStatus(member.status);
  };

  // Handle Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    const numId = parseInt(
      editingMember.id.replace("crew-", "").replace("user-", ""),
      10
    );

    const updatedData = {
      name: editName.trim() || editingMember.name,
      role: editRole,
      contact: editContact.trim() || editingMember.contact,
      trade: editTrade.trim() || editingMember.trade,
      site: editSite.trim() || editingMember.site,
      status: editStatus,
    };

    if (!isNaN(numId)) {
      try {
        await db.crew.update(numId, updatedData);
      } catch (err) {
        console.error("Failed to update in db.crew:", err);
      }
    }

    if (editingMember.email) {
      try {
        const u = await db.users.where("email").equals(editingMember.email).first();
        if (u?.id) {
          const userRole = editRole === "Site Manager" ? "SITE_MANAGER" : "FIELD_WORKER";
          await db.users.update(u.id, { name: updatedData.name, role: userRole });
        }
      } catch (e) {}
    }

    updateMember(editingMember.id, updatedData);
    await loadDbCrew();
    setEditingMember(null);
    toast.success("Crew Details Updated", {
      description: `Updated profile for ${editName.trim()}.`,
    });
  };

  // Handle Delete Member
  const handleDeleteMember = async (member: CrewMember) => {
    if (
      !confirm(
        `Are you sure you want to remove ${member.name} from the crew?`
      )
    ) {
      return;
    }

    const numId = parseInt(
      member.id.replace("crew-", "").replace("user-", ""),
      10
    );
    if (!isNaN(numId)) {
      try {
        await db.crew.delete(numId);
      } catch (err) {
        console.error("Failed to delete from db.crew:", err);
      }
    }

    if (member.email) {
      try {
        const u = await db.users.where("email").equals(member.email).first();
        if (u?.id) {
          await db.users.delete(u.id);
        }
      } catch (e) {}
    }

    deleteMember(member.id);
    await loadDbCrew();
    toast.warning("Crew Member Removed", {
      description: `${member.name} has been removed from the team.`,
    });
  };

  const fieldTradeSuggestions = [
    "Masonry",
    "Electrical",
    "Plumbing",
    "Carpentry",
    "Steel Fixing",
    "Painting",
    "Tile Work",
    "General Helper",
  ];

  const isSiteManager = currentUser?.role === "SITE_MANAGER";

  return (
    <FirmaLayout activeNav="Crew / People">
      <div className="space-y-5 mt-3">
        {/* Site Manager Allocation Notice */}
        {isSiteManager && (
          <div className="rounded-[12px] bg-emerald-50 border border-emerald-200 p-3.5 flex items-center justify-between text-xs text-emerald-900 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <Users2 className="h-4 w-4 text-emerald-700 shrink-0" />
              <span>
                <strong>Site Manager View (Crew &amp; Allocation):</strong> View registered field crew, trade specializations, and availability. Use the <strong>Scheduling Calendar</strong> to assign workers to site shifts and active jobs.
              </span>
            </div>
            <button
              type="button"
              onClick={() => router.push("/scheduling")}
              className="px-3 py-1.5 rounded-[8px] bg-emerald-700 text-white font-bold text-[11px] shrink-0 hover:bg-emerald-800 transition cursor-pointer"
            >
              Open Scheduling ➔
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TOP SUMMARY KPI STATS                                                     */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Total Crew */}
          <div className="rounded-[14px] bg-white border border-pebble/80 p-4 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-ash uppercase tracking-wider">
                Total Crew
              </p>
              <h3 className="text-2xl font-black text-onyx mt-1">
                {metrics.total}
              </h3>
              <p className="text-[11px] text-ash mt-0.5">Registered workers</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-forest/10 text-forest flex items-center justify-center">
              <Users2 className="h-5 w-5" />
            </div>
          </div>

          {/* Assigned on Jobs */}
          <div
            onClick={() => setAssignmentFilter("ASSIGNED")}
            className="rounded-[14px] bg-white border border-pebble/80 p-4 shadow-2xs flex items-center justify-between cursor-pointer hover:border-forest/50 transition group"
          >
            <div>
              <p className="text-xs font-semibold text-forest uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-forest animate-pulse" />
                <span>Assigned on Job</span>
              </p>
              <h3 className="text-2xl font-black text-onyx mt-1 group-hover:text-forest transition">
                {metrics.assignedCount}
              </h3>
              <p className="text-[11px] text-ash mt-0.5">Active site tasks</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-forest text-white flex items-center justify-center shadow-xs">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>

          {/* Available for Work */}
          <div
            onClick={() => setAssignmentFilter("AVAILABLE")}
            className="rounded-[14px] bg-white border border-pebble/80 p-4 shadow-2xs flex items-center justify-between cursor-pointer hover:border-emerald-500/50 transition group"
          >
            <div>
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                Available for Dispatch
              </p>
              <h3 className="text-2xl font-black text-onyx mt-1 group-hover:text-emerald-700 transition">
                {metrics.availableCount}
              </h3>
              <p className="text-[11px] text-ash mt-0.5">Ready for new jobs</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>

          {/* Site Supervisors */}
          <div
            onClick={() => setActiveRoleTab("Site Manager")}
            className="rounded-[14px] bg-white border border-pebble/80 p-4 shadow-2xs flex items-center justify-between cursor-pointer hover:border-pebble transition"
          >
            <div>
              <p className="text-xs font-semibold text-ash uppercase tracking-wider">
                Site Managers
              </p>
              <h3 className="text-2xl font-black text-onyx mt-1">
                {metrics.siteManagersCount}
              </h3>
              <p className="text-[11px] text-ash mt-0.5">Supervisors on site</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-stone text-onyx flex items-center justify-center">
              <HardHat className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN CREW CARD & WORKER ASSIGNMENT DIRECTORY                              */}
        {/* ========================================================================= */}
        <div className="rounded-[16px] bg-white border border-pebble/80 p-5 sm:p-6 shadow-2xs">
          {/* Header Title & Subtitle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-onyx tracking-tight">
                Crew / People Directory
              </h1>
              <p className="text-xs sm:text-sm text-ash mt-0.5">
                Track assigned jobs, worker schedules, trades, and site dispatch
                allocations.
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push("/scheduling")}
                className="inline-flex items-center justify-center gap-1.5 rounded-[10px] border border-pebble/90 bg-white hover:bg-stone text-onyx px-3.5 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer shrink-0"
              >
                <Calendar className="h-4 w-4 text-forest" />
                <span>View Calendar</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddError("");
                  setShowAddModal(true);
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-[10px] bg-forest hover:bg-forest-hover text-white px-4 py-2 text-xs sm:text-sm font-semibold transition shadow-xs cursor-pointer shrink-0"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                <span>Add Field Worker</span>
              </button>
            </div>
          </div>

          {/* Controls Bar: Search & Assignment Filters */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mt-5">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ash" />
              <input
                type="text"
                placeholder="Search by worker name, trade, site, or assigned job..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-[10px] border border-pebble/80 bg-white pl-9.5 pr-4 py-2 text-xs sm:text-sm text-onyx placeholder:text-ash focus:outline-none focus:ring-1 focus:ring-forest/50"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ash hover:text-onyx"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Assignment Status Filter Buttons */}
            <div className="flex items-center gap-1.5 bg-stone/70 p-1 rounded-[10px] border border-pebble/60 text-xs font-semibold shrink-0">
              <button
                type="button"
                onClick={() => setAssignmentFilter("ALL")}
                className={`px-3 py-1.5 rounded-[7px] transition cursor-pointer ${
                  assignmentFilter === "ALL"
                    ? "bg-white text-onyx shadow-2xs font-bold"
                    : "text-ash hover:text-onyx"
                }`}
              >
                All Crew ({metrics.total})
              </button>
              <button
                type="button"
                onClick={() => setAssignmentFilter("ASSIGNED")}
                className={`px-3 py-1.5 rounded-[7px] transition cursor-pointer flex items-center gap-1.5 ${
                  assignmentFilter === "ASSIGNED"
                    ? "bg-forest text-white shadow-2xs font-bold"
                    : "text-ash hover:text-onyx"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Assigned on Job ({metrics.assignedCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setAssignmentFilter("AVAILABLE")}
                className={`px-3 py-1.5 rounded-[7px] transition cursor-pointer flex items-center gap-1.5 ${
                  assignmentFilter === "AVAILABLE"
                    ? "bg-white text-emerald-800 shadow-2xs font-bold"
                    : "text-ash hover:text-onyx"
                }`}
              >
                <span>Available ({metrics.availableCount})</span>
              </button>
            </div>
          </div>

          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1 sm:gap-2 mt-4 border-b border-pebble/70 overflow-x-auto pb-0">
            {(["ALL", "Field Worker", "Site Manager", "Office"] as const).map(
              (role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setActiveRoleTab(role)}
                  className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-t-[8px] transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    activeRoleTab === role
                      ? "border-b-2 border-forest text-onyx bg-clear-bg/40 font-bold"
                      : "text-ash hover:text-onyx hover:bg-stone/60"
                  }`}
                >
                  <span>{role === "ALL" ? "All Roles" : role}</span>
                  <span className="text-[11px] font-medium opacity-80">
                    ({roleCounts[role]})
                  </span>
                </button>
              )
            )}
          </div>

          {/* Table Container */}
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm min-w-[760px]">
              <thead>
                <tr className="border-b border-pebble/60 text-[11px] uppercase font-bold text-ash tracking-wider bg-stone/30">
                  <th className="py-3 px-3">Name & Trade</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3 min-w-[240px]">Assigned Job</th>
                  <th className="py-3 px-3">Work Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pebble/40">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-ash">
                      <Users2 className="h-9 w-9 mx-auto text-pebble mb-2" />
                      <p className="font-bold text-onyx text-sm">
                        No crew members found
                      </p>
                      <p className="text-xs text-ash mt-1 max-w-sm mx-auto">
                        {search
                          ? `No crew matching "${search}". Try resetting the search.`
                          : assignmentFilter === "ASSIGNED"
                          ? "No workers are currently assigned to any job."
                          : "No workers in this category. Click '+ Add Person' to register a new member."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => {
                    const assignedJobs = memberJobsMap[member.id] || [];
                    const primaryJob = assignedJobs[0];
                    const hasJob = assignedJobs.length > 0;

                    return (
                      <tr
                        key={member.id}
                        className={`hover:bg-stone/30 transition group ${
                          hasJob ? "bg-white" : ""
                        }`}
                      >
                        {/* Name & Trade */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                member.avatarBg ||
                                "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-onyx block leading-tight text-xs sm:text-sm truncate">
                                {member.name}
                              </span>
                              <div className="text-[11px] text-ash flex items-center gap-1.5 mt-0.5 truncate">
                                <span className="font-medium text-onyx/70 truncate">
                                  {member.trade || "General Works"}
                                </span>
                                {member.site && (
                                  <>
                                    <span className="opacity-40">•</span>
                                    <span className="truncate">
                                      {member.site}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                              member.role === "Site Manager"
                                ? "bg-purple-100 text-purple-900 border border-purple-200"
                                : member.role === "Office"
                                ? "bg-stone text-onyx border border-pebble"
                                : "bg-blue-50 text-blue-800 border border-blue-200"
                            }`}
                          >
                            {member.role}
                          </span>
                        </td>

                        {/* Contact */}
                        <td className="py-3.5 px-3 text-onyx/85">
                          <a
                            href={`tel:${member.contact.replace(/\s+/g, "")}`}
                            className="hover:text-forest transition inline-flex items-center gap-1.5 font-medium text-xs"
                          >
                            <Phone className="h-3 w-3 text-ash group-hover:text-forest" />
                            <span>{member.contact}</span>
                          </a>
                        </td>

                        {/* ASSIGNED JOB COLUMN (Primary User Request Feature) */}
                        <td className="py-3.5 px-3">
                          {hasJob ? (
                            <div className="space-y-1.5 max-w-[280px]">
                              {/* Primary Active Job Card */}
                              <div
                                onClick={() =>
                                  setViewingJob({ job: primaryJob, member })
                                }
                                className="group/card rounded-[8px] p-2 bg-clear-bg/60 hover:bg-clear-bg border border-forest/25 transition cursor-pointer shadow-2xs hover:shadow-xs"
                                title="Click to view full job & assignment details"
                              >
                                <div className="flex items-center justify-between gap-1.5">
                                  <span className="font-black text-[11px] text-forest">
                                    {primaryJob.id}
                                  </span>
                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                                      primaryJob.status === "In Progress"
                                        ? "bg-forest text-white"
                                        : primaryJob.status === "Completed"
                                        ? "bg-pebble text-ash"
                                        : "bg-forest/15 text-forest"
                                    }`}
                                  >
                                    {primaryJob.status}
                                  </span>
                                </div>
                                <div className="text-xs font-bold text-onyx mt-0.5 truncate group-hover/card:text-forest transition">
                                  {primaryJob.title}
                                </div>
                                <div className="text-[10px] text-ash mt-0.5 flex items-center justify-between gap-1">
                                  <span className="truncate">
                                    {primaryJob.site}
                                  </span>
                                  <span className="shrink-0 font-medium text-onyx/75">
                                    {primaryJob.date}
                                  </span>
                                </div>
                              </div>

                              {/* More jobs indicator */}
                              {assignedJobs.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setViewingAllJobsMember(member)
                                  }
                                  className="text-[10px] font-bold text-forest hover:underline flex items-center gap-1 pl-1 cursor-pointer"
                                >
                                  <span>
                                    +{assignedJobs.length - 1} more assigned
                                    task{assignedJobs.length > 2 ? "s" : ""}
                                  </span>
                                  <ChevronRight className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center text-[11px] font-medium text-ash/80 bg-stone/80 px-2 py-0.5 rounded-md">
                                No active job
                              </span>
                              <button
                                type="button"
                                onClick={() => handleOpenAssignModal(member)}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-forest hover:text-forest-hover hover:underline cursor-pointer"
                              >
                                <Plus className="h-3 w-3 stroke-[2.5]" />
                                <span>Assign Job</span>
                              </button>
                            </div>
                          )}
                        </td>

                        {/* WORK STATUS COLUMN */}
                        <td className="py-3.5 px-3">
                          {hasJob ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-forest/15 text-forest border border-forest/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-forest animate-pulse" />
                              <span>Assigned ({assignedJobs.length})</span>
                            </span>
                          ) : member.status === "Active" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>Available</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-stone text-ash border border-pebble">
                              {member.status}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Quick Assign Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenAssignModal(member)}
                              className="p-1.5 rounded-[6px] text-forest hover:text-white hover:bg-forest transition cursor-pointer"
                              title={`Assign new job to ${member.name}`}
                            >
                              <Plus className="h-4 w-4 stroke-[2.5]" />
                            </button>

                            {/* Edit Member */}
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(member)}
                              className="p-1.5 rounded-[6px] text-ash hover:text-onyx hover:bg-pebble/40 transition cursor-pointer"
                              title="Edit Member"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>

                            {/* Delete Member */}
                            <button
                              type="button"
                              onClick={() => handleDeleteMember(member)}
                              className="p-1.5 rounded-[6px] text-ash hover:text-danger-text hover:bg-hazard-bg/50 transition cursor-pointer"
                              title="Delete Member"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ASSIGN JOB TO CREW MEMBER                                          */}
      {/* ========================================================================= */}
      {showAssignModal && assignTargetMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-[16px] bg-white border border-pebble p-6 shadow-xl relative animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3.5 border-b border-pebble/60">
              <div>
                <h3 className="text-lg font-bold text-onyx flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-forest" />
                  <span>Assign Job to {assignTargetMember.name}</span>
                </h3>
                <p className="text-xs text-ash mt-0.5">
                  Role: {assignTargetMember.role} • Trade:{" "}
                  {assignTargetMember.trade || "General Construction"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="p-1 rounded-[6px] text-ash hover:text-onyx hover:bg-stone transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAssign} className="space-y-4 mt-4">
              {/* Assignment Mode Tabs */}
              <div>
                <label className="text-xs font-bold text-onyx block mb-1.5">
                  Job Source
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAssignJobMode("SELECT")}
                    disabled={backlogOptions.length === 0}
                    className={`py-2 px-3 rounded-[8px] text-xs font-bold border transition text-center cursor-pointer ${
                      assignJobMode === "SELECT"
                        ? "border-forest bg-clear-bg text-forest"
                        : "border-pebble/70 bg-stone/40 text-ash hover:text-onyx"
                    } ${
                      backlogOptions.length === 0
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    Select Backlog Job ({backlogOptions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssignJobMode("CUSTOM")}
                    className={`py-2 px-3 rounded-[8px] text-xs font-bold border transition text-center cursor-pointer ${
                      assignJobMode === "CUSTOM"
                        ? "border-forest bg-clear-bg text-forest"
                        : "border-pebble/70 bg-stone/40 text-ash hover:text-onyx"
                    }`}
                  >
                    Custom Work Package
                  </button>
                </div>
              </div>

              {/* Job Select Dropdown if SELECT mode */}
              {assignJobMode === "SELECT" && backlogOptions.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-onyx block mb-1">
                    Select Unscheduled Work Order{" "}
                    <span className="text-danger-text">*</span>
                  </label>
                  <select
                    value={selectedUnscheduledId}
                    onChange={(e) => {
                      setSelectedUnscheduledId(e.target.value);
                      const sel = backlogOptions.find(
                        (b) => b.id === e.target.value
                      );
                      if (sel) {
                        setCustomJobTitle(sel.title);
                        setAssignProject(sel.project);
                        setAssignSite(sel.site);
                      }
                    }}
                    className="w-full rounded-[8px] border border-pebble bg-white px-3 py-2 text-xs sm:text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-forest cursor-pointer"
                  >
                    {backlogOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.id} – {opt.title} ({opt.project})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Custom Job Title */}
              {assignJobMode === "CUSTOM" && (
                <div>
                  <label className="text-xs font-bold text-onyx block mb-1">
                    Job Title <span className="text-danger-text">*</span>
                  </label>
                  <input
                    type="text"
                    value={customJobTitle}
                    onChange={(e) => setCustomJobTitle(e.target.value)}
                    placeholder="e.g. Electrical Conduit & Box Fixing"
                    className="w-full rounded-[8px] border border-pebble bg-white px-3 py-2 text-xs sm:text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-forest"
                    required
                  />
                </div>
              )}

              {/* Project & Site */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-onyx block mb-1">
                    Project
                  </label>
                  <input
                    type="text"
                    value={assignProject}
                    onChange={(e) => setAssignProject(e.target.value)}
                    placeholder="Skyline Apartments"
                    className="w-full rounded-[8px] border border-pebble bg-white px-3 py-2 text-xs sm:text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-forest"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-onyx block mb-1">
                    Site Location
                  </label>
                  <input
                    type="text"
                    value={assignSite}
                    onChange={(e) => setAssignSite(e.target.value)}
                    placeholder="Main Site Area"
                    className="w-full rounded-[8px] border border-pebble bg-white px-3 py-2 text-xs sm:text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-forest"
                  />
                </div>
              </div>

              {/* Date & Shift */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-onyx block mb-1">
                    Schedule Date <span className="text-danger-text">*</span>
                  </label>
                  <input
                    type="text"
                    value={assignDate}
                    onChange={(e) => setAssignDate(e.target.value)}
                    placeholder="16/09/2026"
                    className="w-full rounded-[8px] border border-pebble bg-white px-3 py-2 text-xs sm:text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-forest"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-onyx block mb-1">
                    Shift Time <span className="text-danger-text">*</span>
                  </label>
                  <select
                    value={assignTime}
                    onChange={(e) => setAssignTime(e.target.value)}
                    className="w-full rounded-[8px] border border-pebble bg-white px-3 py-2 text-xs sm:text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-forest cursor-pointer"
                  >
                    <option value="09:00 AM - 05:00 PM">
                      Full Day (09:00 AM - 05:00 PM)
                    </option>
                    <option value="08:00 AM - 04:00 PM">
                      Early Shift (08:00 AM - 04:00 PM)
                    </option>
                    <option value="08:00 AM - 01:00 PM">
                      Morning (08:00 AM - 01:00 PM)
                    </option>
                    <option value="01:00 PM - 06:00 PM">
                      Afternoon (01:00 PM - 06:00 PM)
                    </option>
                    <option value="09:00 AM - 06:00 PM">
                      Extended Shift (09:00 AM - 06:00 PM)
                    </option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-onyx block mb-1">
                  Scope & Worker Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="Specific tasks, equipment required, or execution safety points..."
                  className="w-full rounded-[8px] border border-pebble bg-white p-2.5 text-xs sm:text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-forest resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-pebble/60 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="rounded-[8px] border border-pebble bg-white px-4 py-2 text-xs font-semibold text-onyx hover:bg-stone transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-[8px] bg-forest hover:bg-forest-hover text-white px-5 py-2 text-xs font-semibold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>Assign & Dispatch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW ASSIGNED JOB DETAILS                                          */}
      {/* ========================================================================= */}
      {viewingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-[16px] bg-white border border-pebble p-6 shadow-xl relative animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3.5 border-b border-pebble/60">
              <div>
                <span className="font-extrabold text-xs text-forest bg-clear-bg px-2.5 py-0.5 rounded-md">
                  {viewingJob.job.id}
                </span>
                <h3 className="text-base font-bold text-onyx mt-1.5">
                  {viewingJob.job.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingJob(null)}
                className="p-1 rounded-[6px] text-ash hover:text-onyx hover:bg-stone transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-[8px] bg-stone/50 border border-pebble/60">
                <span className="text-ash font-medium">Assigned Worker:</span>
                <span className="font-bold text-onyx flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-forest" />
                  {viewingJob.member.name} ({viewingJob.member.role})
                </span>
              </div>

              <div className="space-y-2 pt-1 text-ash">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-ash shrink-0" />
                  <span className="font-medium text-onyx">Project:</span>
                  <span>{viewingJob.job.project}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-ash shrink-0" />
                  <span className="font-medium text-onyx">Site Area:</span>
                  <span>{viewingJob.job.site}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-ash shrink-0" />
                  <span className="font-medium text-onyx">Date:</span>
                  <span>{viewingJob.job.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-ash shrink-0" />
                  <span className="font-medium text-onyx">Shift:</span>
                  <span>{viewingJob.job.timeSlot}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-ash shrink-0" />
                  <span className="font-medium text-onyx">Status:</span>
                  <span className="font-bold text-forest">
                    {viewingJob.job.status}
                  </span>
                </div>
              </div>

              {viewingJob.job.notes && (
                <div className="p-2.5 rounded-[8px] bg-clear-bg/40 border border-forest/20 text-onyx mt-2">
                  <p className="text-[11px] font-bold text-forest mb-0.5">
                    Job Scope / Instructions:
                  </p>
                  <p className="text-xs text-onyx/90 leading-relaxed">
                    {viewingJob.job.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-4 border-t border-pebble/60 mt-5">
              <button
                type="button"
                onClick={() => handleUnscheduleJob(viewingJob.job.id)}
                className="rounded-[8px] border border-hazard-bg text-danger-text hover:bg-hazard-bg px-3 py-1.5 text-xs font-semibold transition cursor-pointer"
              >
                Unassign Job
              </button>

              <button
                type="button"
                onClick={() => {
                  setViewingJob(null);
                  router.push("/scheduling");
                }}
                className="rounded-[8px] bg-forest hover:bg-forest-hover text-white px-4 py-1.5 text-xs font-semibold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>View in Calendar</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ALL JOBS FOR MEMBER (When person has multiple tasks)               */}
      {/* ========================================================================= */}
      {viewingAllJobsMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-[16px] bg-white border border-pebble p-6 shadow-xl relative animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3.5 border-b border-pebble/60">
              <div>
                <h3 className="text-base font-bold text-onyx flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-forest" />
                  <span>Tasks Assigned to {viewingAllJobsMember.name}</span>
                </h3>
                <p className="text-xs text-ash mt-0.5">
                  {(memberJobsMap[viewingAllJobsMember.id] || []).length} active
                  site assignments
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingAllJobsMember(null)}
                className="p-1 rounded-[6px] text-ash hover:text-onyx hover:bg-stone transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {(memberJobsMap[viewingAllJobsMember.id] || []).map((j) => (
                <div
                  key={j.id}
                  className="rounded-[10px] p-3 border border-pebble/80 bg-stone/20 flex items-start justify-between gap-3 hover:border-forest/40 transition"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-forest">
                        {j.id}
                      </span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-forest/15 text-forest">
                        {j.status}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-onyx mt-1 truncate">
                      {j.title}
                    </h4>
                    <p className="text-[11px] text-ash mt-0.5">
                      {j.site} • {j.date} ({j.timeSlot})
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUnscheduleJob(j.id)}
                    className="text-xs font-semibold text-danger-text hover:underline shrink-0 cursor-pointer pt-1"
                  >
                    Unassign
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-pebble/60 mt-4">
              <button
                type="button"
                onClick={() => setViewingAllJobsMember(null)}
                className="rounded-[8px] border border-pebble bg-white px-4 py-2 text-xs font-semibold text-onyx hover:bg-stone transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewingAllJobsMember(null);
                  router.push("/scheduling");
                }}
                className="rounded-[8px] bg-forest hover:bg-forest-hover text-white px-4 py-2 text-xs font-semibold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Open Calendar View</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW FIELD WORKER                                               */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-[16px] bg-white border border-pebble p-6 shadow-xl relative animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3.5 border-b border-pebble/60">
              <div>
                <h3 className="text-lg font-bold text-onyx flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-forest" />
                  <span>Add Field Worker</span>
                </h3>
                <p className="text-xs text-ash mt-0.5">
                  Register a field worker for on-site operations. Site and job assignments can be made later from Scheduling.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-[6px] text-ash hover:text-onyx hover:bg-stone transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {addError && (
              <div className="mt-3 p-2.5 rounded-[8px] bg-hazard-bg text-hazard-text text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-bold text-onyx block mb-1">
                  Full Name <span className="text-danger-text">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Verma"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    if (addError) setAddError("");
                  }}
                  className="w-full rounded-[8px] border border-pebble bg-white px-3 py-2 text-xs sm:text-sm text-onyx placeholder:text-ash focus:outline-none focus:ring-1 focus:ring-forest"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-onyx block mb-1">
                    Phone Number <span className="text-danger-text">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    className="w-full rounded-[8px] border border-pebble bg-white px-3 py-2 text-xs sm:text-sm text-onyx placeholder:text-ash focus:outline-none focus:ring-1 focus:ring-forest"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-onyx block mb-1">
                    Login Email Address <span className="text-danger-text">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. ramesh.verma@company.com"
                    value={newEmail}
                    onChange={(e) => {
                      setNewEmail(e.target.value);
                      if (addError) setAddError("");
                    }}
                    className="w-full rounded-[8px] border border-pebble bg-white px-3 py-2 text-xs sm:text-sm text-onyx placeholder:text-ash focus:outline-none focus:ring-1 focus:ring-forest"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-onyx block mb-1">
                  Login Password <span className="text-danger-text">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Minimum 6 characters (default: 123456)"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (addError) setAddError("");
                  }}
                  className="w-full rounded-[8px] border border-pebble bg-white px-3 py-2 text-xs sm:text-sm text-onyx placeholder:text-ash focus:outline-none focus:ring-1 focus:ring-forest font-mono"
                  required
                  minLength={6}
                />
                <p className="text-[11px] text-ash mt-1">
                  Worker can use this email &amp; password to sign in to the FIRMA field portal.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-onyx block mb-1">
                  Trade / Specialization
                </label>
                <input
                  type="text"
                  placeholder="e.g. Masonry, Electrical, Plumbing"
                  value={newTrade}
                  onChange={(e) => setNewTrade(e.target.value)}
                  className="w-full rounded-[8px] border border-pebble bg-white px-3 py-2 text-xs sm:text-sm text-onyx placeholder:text-ash focus:outline-none focus:ring-1 focus:ring-forest"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {fieldTradeSuggestions.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewTrade(t)}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border cursor-pointer transition ${
                        newTrade === t
                          ? "bg-forest text-white border-forest"
                          : "bg-stone/80 text-ash border-pebble hover:text-onyx"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-onyx block mb-1">
                    Wage Rate / Salary (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹850 / day"
                    value={newWage}
                    onChange={(e) => setNewWage(e.target.value)}
                    className="w-full rounded-[8px] border border-pebble bg-white px-3 py-2 text-xs sm:text-sm text-onyx placeholder:text-ash focus:outline-none focus:ring-1 focus:ring-forest"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-onyx block mb-1">
                    Initial Status
                  </label>
                  <div className="flex items-center gap-3 pt-2">
                    {(["Active", "On Leave", "Inactive"] as CrewStatus[]).map(
                      (s) => (
                        <label
                          key={s}
                          className="flex items-center gap-1.5 text-xs text-onyx cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="status"
                            checked={newStatus === s}
                            onChange={() => setNewStatus(s)}
                            className="accent-forest"
                          />
                          <span>{s}</span>
                        </label>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-pebble/60 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-[8px] border border-pebble bg-white px-4 py-2 text-xs font-semibold text-onyx hover:bg-stone transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-[8px] bg-forest hover:bg-forest-hover text-white px-5 py-2 text-xs font-semibold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Field Worker</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT PERSON                                                        */}
      {/* ========================================================================= */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-[16px] bg-white border border-pebble p-6 shadow-xl relative animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3.5 border-b border-pebble/60">
              <div>
                <h3 className="text-lg font-bold text-onyx flex items-center gap-2">
                  <Edit2 className="h-5 w-5 text-forest" />
                  <span>Edit Crew Member</span>
                </h3>
                <p className="text-xs text-ash mt-0.5">
                  Update details for {editingMember.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="p-1 rounded-[6px] text-ash hover:text-onyx hover:bg-stone transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-bold text-onyx block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-[8px] border border-pebble bg-white px-3 py-2 text-xs sm:text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-forest"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-onyx block mb-1">
                    Role
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as CrewRole)}
                    className="w-full rounded-[8px] border border-pebble bg-white px-3 py-2 text-xs sm:text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-forest cursor-pointer"
                  >
                    <option value="Field Worker">Field Worker</option>
                    <option value="Site Manager">Site Manager</option>
                    <option value="Office">Office</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-onyx block mb-1">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) =>
                      setEditStatus(e.target.value as CrewStatus)
                    }
                    className="w-full rounded-[8px] border border-pebble bg-white px-3 py-2 text-xs sm:text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-forest cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-onyx block mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={editContact}
                  onChange={(e) => setEditContact(e.target.value)}
                  className="w-full rounded-[8px] border border-pebble bg-white px-3 py-2 text-xs sm:text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-forest"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-onyx block mb-1">
                    Trade / Specialization
                  </label>
                  <input
                    type="text"
                    value={editTrade}
                    onChange={(e) => setEditTrade(e.target.value)}
                    className="w-full rounded-[8px] border border-pebble bg-white px-3 py-2 text-xs sm:text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-forest"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-onyx block mb-1">
                    Assigned Site
                  </label>
                  <input
                    type="text"
                    value={editSite}
                    onChange={(e) => setEditSite(e.target.value)}
                    className="w-full rounded-[8px] border border-pebble bg-white px-3 py-2 text-xs sm:text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-forest"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-pebble/60 mt-4">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="rounded-[8px] border border-pebble bg-white px-4 py-2 text-xs font-semibold text-onyx hover:bg-stone transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-[8px] bg-forest hover:bg-forest-hover text-white px-5 py-2 text-xs font-semibold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </FirmaLayout>
  );
}
