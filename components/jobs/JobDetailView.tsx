"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  JobItem,
  JobPhoto,
  CrewMemberAssignment,
  JobRFI,
  JobVariation,
  JobDocument,
  JobSafetyItem,
  JobPunchItem,
  JobTimesheetEntry,
  useTenderFlowStore,
} from "@/store/tenderFlowStore";
import { useSchedulingStore } from "@/store/schedulingStore";
import { useCrewStore } from "@/store/crewStore";
import { useLeadFlowStore } from "@/store/leadFlowStore";
import { useAuthStore } from "@/store/authStore";
import { db } from "@/lib/db";
import { getJobScheduleState } from "@/lib/dateValidation";
import {
  Briefcase,
  MapPin,
  Calendar,
  ArrowLeftRight,
  Plus,
  CheckCircle2,
  Clock,
  Camera,
  CloudUpload,
  Info,
  Layers,
  Users,
  Box,
  FileText,
  Activity,
  ArrowRight,
  HardHat,
  Wrench,
  CalendarCheck,
  Zap,
  Check,
  ChevronRight,
  ChevronDown,
  Filter,
  Eye,
  Trash2,
  Phone,
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  Navigation,
  Send,
  HelpCircle,
  Package,
  MoreHorizontal,
  Edit2,
  X,
  FileCheck,
  ListChecks,
  AlertTriangle,
  AlertCircle,
  Upload,
  Download,
  Search,
  ExternalLink,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import JobPhotoModal from "./JobPhotoModal";
import JobFinanceTab from "./JobFinanceTab";

interface JobDetailViewProps {
  job: JobItem;
  onBack: () => void;
  onOpenSchedule?: () => void;
  onOpenReassign?: () => void;
}

export type TabKey =
  | "OVERVIEW"
  | "CREW"
  | "MATERIALS"
  | "PHOTOS"
  | "NOTES"
  | "TIMESHEET"
  | "RFIS"
  | "VARIATIONS"
  | "DOCUMENTS"
  | "SAFETY"
  | "PUNCH_LISTS"
  | "FINANCE";

export type PhotoCategory = "ALL" | "BEFORE" | "PROGRESS" | "AFTER";

export interface DbFieldWorker {
  id: string;
  name: string;
  role: string;
  contact?: string;
  email?: string;
  trade?: string;
}

export default function JobDetailView({
  job,
  onBack,
  onOpenSchedule,
  onOpenReassign,
}: JobDetailViewProps) {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.currentUser);
  const isWorker = currentUser?.role === "FIELD_WORKER";

  // Live store subscriptions
  const liveJobs = useTenderFlowStore((state) => state.jobs);
  const scheduledJobs = useSchedulingStore((state) => state.scheduledJobs);
  const {
    updateJobStatus,
    updateJob,
    addPhotoToJob,
    deletePhotoFromJob,
    addMaterialToJob,
    addNoteToJob,
    addCrewToJob,
    updateCrewStatus,
    removeCrewFromJob,
    addRfi,
    updateRfiStatus,
    addVariation,
    updateVariationStatus,
    addRfiToJob,
    addVariationToJob,
    addDocumentToJob,
    addSafetyItemToJob,
    addPunchItemToJob,
    addTimesheetToJob,
  } = useTenderFlowStore();

  const allProjects = useLeadFlowStore((state) => state.projects) || [];
  const contractors = useTenderFlowStore((state) => state.contractors) || [];

  // Resolve the live reactive job from the store
  const liveJob = useMemo(() => {
    const fromTender = liveJobs.find((j) => j.id === job.id);
    if (fromTender) return fromTender;
    const fromScheduled = scheduledJobs.find((sj) => sj.id === job.id);
    if (fromScheduled) {
      return {
        ...job,
        photos: fromScheduled.photos || job.photos || [],
        materials: fromScheduled.materials || job.materials || [],
        notes: fromScheduled.notesList || job.notes || [],
        status: (fromScheduled.status as JobItem["status"]) || job.status,
        completed: fromScheduled.status === "Completed" || job.completed,
        startDate: fromScheduled.startDate || job.startDate,
        endDate: fromScheduled.endDate || job.endDate,
        contractorName: fromScheduled.contractorName || job.contractorName,
        siteManagerName: fromScheduled.siteManagerName || job.siteManagerName,
      };
    }
    return job;
  }, [liveJobs, scheduledJobs, job]);

  // Match project
  const matchedProject = useMemo(() => {
    const pName = (liveJob.projectName || "").toLowerCase().trim();
    return allProjects.find((p) =>
      (liveJob.projectId && p.id === liveJob.projectId) ||
      (pName && p.name.toLowerCase().trim() === pName) ||
      (pName && (p.name.toLowerCase().includes(pName) || pName.includes(p.name.toLowerCase())))
    );
  }, [allProjects, liveJob.projectId, liveJob.projectName]);

  // Match contractor
  const matchedContractor = useMemo(() => {
    if (liveJob.contractorId) {
      const found = contractors.find((c) => c.id === liveJob.contractorId);
      if (found) return found;
    }
    if (liveJob.contractorName && !["sm", "site manager", "field worker"].includes(liveJob.contractorName.toLowerCase().trim())) {
      const found = contractors.find((c) => c.name.toLowerCase().trim() === liveJob.contractorName?.toLowerCase().trim());
      if (found) return found;
    }
    if (liveJob.tenderId) {
      const found = contractors.find((c) => c.tenderId === liveJob.tenderId);
      if (found) return found;
    }
    if (liveJob.projectName) {
      const found = contractors.find((c) => c.projectName.toLowerCase().trim() === liveJob.projectName.toLowerCase().trim());
      if (found) return found;
    }
    return contractors[0] || null;
  }, [contractors, liveJob.contractorId, liveJob.contractorName, liveJob.tenderId, liveJob.projectName]);

  // Resolved display names
  const displayContractorName = useMemo(() => {
    if (liveJob.contractorName && !["sm", "site manager", "field worker"].includes(liveJob.contractorName.toLowerCase().trim())) {
      return liveJob.contractorName;
    }
    return matchedContractor?.name || "apex solutions";
  }, [liveJob.contractorName, matchedContractor]);

  const displaySiteManagerName = useMemo(() => {
    return (
      liveJob.siteManagerName ||
      matchedProject?.siteManagerName ||
      (liveJob.contractorName?.toLowerCase().trim() === "sm" ? "SM" : null) ||
      "SM"
    );
  }, [liveJob.siteManagerName, matchedProject, liveJob.contractorName]);

  const displayClientName = useMemo(() => {
    return liveJob.client || matchedProject?.client || "SSS";
  }, [liveJob.client, matchedProject]);

  const displayDates = useMemo(() => {
    const start = liveJob.startDate || "15 Sep 2026";
    const end = liveJob.endDate || matchedProject?.due || "30 Nov 2026";
    return `${start} – ${end}`;
  }, [liveJob.startDate, liveJob.endDate, matchedProject?.due]);

  const displayDuration = useMemo(() => {
    return liveJob.expectedDuration || "76 Days (~2.5 Months)";
  }, [liveJob.expectedDuration]);

  // Tab State
  const [activeTab, setActiveTab] = useState<TabKey>("OVERVIEW");
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [photoCategory, setPhotoCategory] = useState<PhotoCategory>("ALL");

  // Modals
  const [showEditDetailsModal, setShowEditDetailsModal] = useState(false);
  const [showAssignCrewModal, setShowAssignCrewModal] = useState(false);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showLogTimesheetModal, setShowLogTimesheetModal] = useState(false);
  const [showRaiseRfiModal, setShowRaiseRfiModal] = useState(false);
  const [showRequestVariationModal, setShowRequestVariationModal] = useState(false);
  const [showUploadDocModal, setShowUploadDocModal] = useState(false);
  const [showReportSafetyModal, setShowReportSafetyModal] = useState(false);
  const [showAddPunchModal, setShowAddPunchModal] = useState(false);
  const [showEarlyTravelModal, setShowEarlyTravelModal] = useState(false);

  // Form states for modals
  const [editDesc, setEditDesc] = useState(liveJob.description || "");
  const [editLocation, setEditLocation] = useState(liveJob.location || "");
  const [editStartDate, setEditStartDate] = useState(liveJob.startDate || "");
  const [editDuration, setEditDuration] = useState(liveJob.expectedDuration || "");
  const [editSafetyNotes, setEditSafetyNotes] = useState(liveJob.safetyNotes || "");

  // DB Field Workers for assignment
  const [dbWorkers, setDbWorkers] = useState<DbFieldWorker[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>("");
  const [isLoadingDbWorkers, setIsLoadingDbWorkers] = useState<boolean>(false);

  // Crew Form
  const [newCrewName, setNewCrewName] = useState("");
  const [newCrewRole, setNewCrewRole] = useState("Field Worker");
  const [newCrewPhone, setNewCrewPhone] = useState("");
  const [newCrewStatus, setNewCrewStatus] = useState<CrewMemberAssignment["status"]>("On Site");

  // Material Form
  const [matName, setMatName] = useState("");
  const [matQty, setMatQty] = useState("");

  // Note Form
  const [noteText, setNoteText] = useState("");

  // Timesheet Form
  const [tsWorker, setTsWorker] = useState("");
  const [tsHours, setTsHours] = useState("8");
  const [tsDesc, setTsDesc] = useState("");

  // RFI Form
  const [rfiTitle, setRfiTitle] = useState("");
  const [rfiQuestion, setRfiQuestion] = useState("");
  const [rfiPriority, setRfiPriority] = useState<"High" | "Medium" | "Low">("High");
  const [rfiAttachment, setRfiAttachment] = useState("");
  const [reviewingRfi, setReviewingRfi] = useState<JobRFI | null>(null);
  const [rfiReviewDirective, setRfiReviewDirective] = useState("");
  const [rfiReviewStatus, setRfiReviewStatus] = useState<"Open" | "In Review" | "Closed">("Closed");

  // Variation Form
  const [varTitle, setVarTitle] = useState("");
  const [varDescription, setVarDescription] = useState("");
  const [varMaterials, setVarMaterials] = useState("");
  const [varAmount, setVarAmount] = useState("");
  const [varImpact, setVarImpact] = useState("");
  const [varAttachment, setVarAttachment] = useState("");

  // Document Form
  const [docName, setDocName] = useState("");
  const [docCategory, setDocCategory] = useState<JobDocument["category"]>("Drawings");

  // Safety Form
  const [safetyTitle, setSafetyTitle] = useState("");
  const [safetyType, setSafetyType] = useState<JobSafetyItem["type"]>("PPE");
  const [safetyDetails, setSafetyDetails] = useState("");

  // Punch List Form
  const [punchTitle, setPunchTitle] = useState("");
  const [punchLocation, setPunchLocation] = useState(liveJob.location || "");
  const [punchSeverity, setPunchSeverity] = useState<"High" | "Medium" | "Low">("Medium");

  // Derived lists strictly from real store data (no fake records)
  const crewList: CrewMemberAssignment[] = useMemo(() => {
    return liveJob.crew || [];
  }, [liveJob.crew]);

  const materialsList = useMemo(() => {
    return liveJob.materials || [];
  }, [liveJob.materials]);

  const photosList = liveJob.photos || [];
  const notesList = liveJob.notes || [];

  const rfisList: JobRFI[] = useMemo(() => {
    return liveJob.rfis || [];
  }, [liveJob.rfis]);

  const variationsList: JobVariation[] = useMemo(() => {
    return liveJob.variations || [];
  }, [liveJob.variations]);

  const documentsList: JobDocument[] = useMemo(() => {
    return liveJob.documents || [];
  }, [liveJob.documents]);

  const safetyList: JobSafetyItem[] = useMemo(() => {
    return liveJob.safety || [];
  }, [liveJob.safety]);

  const punchListsList: JobPunchItem[] = liveJob.punchLists || [];

  const timesheetsList: JobTimesheetEntry[] = useMemo(() => {
    return liveJob.timesheets || [];
  }, [liveJob.timesheets]);

  const totalHoursLogged = useMemo(() => {
    const fromTimesheets = timesheetsList.reduce((acc, t) => acc + (t.hours || 0), 0);
    return fromTimesheets || liveJob.hoursLogged || 0;
  }, [timesheetsList, liveJob.hoursLogged]);

  const scopeList = liveJob.scopeOfWork || [];

  // Auto-select first worker for timesheet form if available
  useEffect(() => {
    if (!tsWorker && crewList.length > 0) {
      setTsWorker(crewList[0].name);
    }
  }, [crewList, tsWorker]);

  // Load real Field Workers from Dexie DB (db.users and db.crew)
  const loadDbFieldWorkers = useCallback(async () => {
    setIsLoadingDbWorkers(true);
    try {
      const [allDbUsers, allDbCrew] = await Promise.all([
        db.users.toArray().catch(() => []),
        db.crew.toArray().catch(() => []),
      ]);

      const storeCrew = useCrewStore.getState().members || [];
      const workerMap = new Map<string, DbFieldWorker>();

      // 1. Ingest workers from db.crew
      for (const c of allDbCrew) {
        const isFieldRole =
          c.role === "Field Worker" ||
          (!c.role && c.status !== "Inactive") ||
          (c.role !== "Site Manager" && c.role !== "Office");
        if (isFieldRole) {
          const key = (c.email || c.name || "").trim().toLowerCase();
          if (key && !workerMap.has(key)) {
            workerMap.set(key, {
              id: `crew-${c.id || Math.random()}`,
              name: c.name,
              role: c.trade || c.role || "Field Worker",
              contact: c.contact || "",
              email: c.email || "",
              trade: c.trade || "Field Worker",
            });
          }
        }
      }

      // 2. Ingest from db.users where role === "FIELD_WORKER"
      for (const u of allDbUsers) {
        if (u.role === "FIELD_WORKER") {
          const key = (u.email || u.name || "").trim().toLowerCase();
          if (key && !workerMap.has(key)) {
            workerMap.set(key, {
              id: `user-${u.id || Math.random()}`,
              name: u.name,
              role: "Field Worker",
              contact: "",
              email: u.email || "",
              trade: "Field Worker",
            });
          } else if (key && workerMap.has(key)) {
            const existing = workerMap.get(key)!;
            if (!existing.email && u.email) existing.email = u.email;
          }
        }
      }

      // 3. Fallback: Ingest non-dummy members from useCrewStore if not already present
      const dummySet = new Set([
        "crew-1", "crew-2", "crew-3", "crew-4", "crew-5", "crew-6",
        "crew-7", "crew-8", "crew-9", "crew-10", "crew-11", "crew-12"
      ]);
      for (const sm of storeCrew) {
        if (!dummySet.has(sm.id) && !sm.id.startsWith("user-") && sm.role === "Field Worker") {
          const key = (sm.email || sm.name || "").trim().toLowerCase();
          if (key && !workerMap.has(key)) {
            workerMap.set(key, {
              id: sm.id,
              name: sm.name,
              role: sm.trade || sm.role || "Field Worker",
              contact: sm.contact || "",
              email: sm.email || "",
              trade: sm.trade || "Field Worker",
            });
          }
        }
      }

      setDbWorkers(Array.from(workerMap.values()));
    } catch (err) {
      console.error("Failed to load field workers from DB:", err);
    } finally {
      setIsLoadingDbWorkers(false);
    }
  }, []);

  useEffect(() => {
    loadDbFieldWorkers();
  }, [loadDbFieldWorkers, showAssignCrewModal]);

  const handleSelectWorker = (workerId: string) => {
    setSelectedWorkerId(workerId);
    if (!workerId) {
      setNewCrewName("");
      setNewCrewPhone("");
      setNewCrewRole("Field Worker");
      return;
    }
    const worker = dbWorkers.find((w) => w.id === workerId);
    if (worker) {
      setNewCrewName(worker.name);
      setNewCrewPhone(worker.contact || "");
      if (worker.trade && worker.trade !== "Field Worker") {
        setNewCrewRole(worker.trade);
      } else if (worker.role) {
        setNewCrewRole(worker.role);
      } else {
        setNewCrewRole("Field Worker");
      }
    }
  };

  const openAssignCrewModal = () => {
    setSelectedWorkerId("");
    setNewCrewName("");
    setNewCrewPhone("");
    setNewCrewRole("Field Worker");
    setShowAssignCrewModal(true);
  };

  // Dynamically constructed real activity items
  const recentActivityItems = useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      subtitle: string;
      time: string;
      icon: any;
    }> = [];

    if (liveJob.assignedDate || liveJob.startDate) {
      items.push({
        id: "act-init",
        title: "Work order initialized",
        subtitle: liveJob.assignee ? `Assigned to ${liveJob.assignee}` : "Work Order Created",
        time: liveJob.assignedDate || liveJob.startDate || "Recent",
        icon: FileText,
      });
    }

    (liveJob.notes || []).forEach((n) => {
      items.push({
        id: `act-note-${n.id}`,
        title: `Note: "${n.text.slice(0, 45)}${n.text.length > 45 ? "..." : ""}"`,
        subtitle: `By ${n.author}`,
        time: n.time,
        icon: FileText,
      });
    });

    (liveJob.photos || []).forEach((p) => {
      items.push({
        id: `act-photo-${p.id}`,
        title: `Photo uploaded: ${p.title || p.caption || "Site Photo"}`,
        subtitle: `By ${p.uploadedBy || "Field Worker"}`,
        time: p.timestamp || p.time || "Recent",
        icon: Camera,
      });
    });

    (liveJob.crew || []).forEach((c) => {
      items.push({
        id: `act-crew-${c.id}`,
        title: `${c.name} assigned as ${c.role}`,
        subtitle: `Status: ${c.status}`,
        time: "Current",
        icon: Users,
      });
    });

    (liveJob.timesheets || []).forEach((t) => {
      items.push({
        id: `act-ts-${t.id}`,
        title: `${t.workerName} logged ${t.hours} hrs`,
        subtitle: t.description || "Site execution tasks",
        time: t.date,
        icon: Clock,
      });
    });

    return items;
  }, [liveJob]);

  // Filtered photos
  const filteredPhotos = useMemo(() => {
    if (photoCategory === "ALL") return photosList;
    return photosList.filter((p) => {
      const stage = (p.stage || p.category || "").toUpperCase();
      return stage.includes(photoCategory);
    });
  }, [photosList, photoCategory]);

  // Handlers
  const handleStatusChange = (newStatus: JobItem["status"]) => {
    if (newStatus === "Travelling") {
      const sched = getJobScheduleState(liveJob.startDate || liveJob.due);
      if (!sched.allowDirectTravel) {
        setShowStatusMenu(false);
        setShowEarlyTravelModal(true);
        return;
      }
    }
    updateJobStatus(liveJob.id, newStatus);
    setShowStatusMenu(false);
    toast.success(`Job status updated to ${newStatus}`);
  };

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    updateJob(liveJob.id, {
      description: editDesc,
      location: editLocation,
      startDate: editStartDate,
      expectedDuration: editDuration,
      safetyNotes: editSafetyNotes,
    });
    setShowEditDetailsModal(false);
    toast.success("Job specifications updated!");
  };

  const handleAddCrew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkerId || !newCrewName.trim()) {
      toast.error("Please select a registered Field Worker from the dropdown");
      return;
    }

    const alreadyAssigned = crewList.some(
      (c) => c.name.trim().toLowerCase() === newCrewName.trim().toLowerCase()
    );
    if (alreadyAssigned) {
      toast.error(`${newCrewName} is already assigned to this job.`);
      return;
    }

    const initials =
      newCrewName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "FW";

    addCrewToJob(liveJob.id, {
      id: `crew-${Date.now()}`,
      name: newCrewName.trim(),
      role: newCrewRole,
      contact: newCrewPhone.trim(),
      status: newCrewStatus,
      initials,
    });
    setNewCrewName("");
    setNewCrewPhone("");
    setSelectedWorkerId("");
    setShowAssignCrewModal(false);
    toast.success(`${newCrewName} assigned to job successfully!`);
  };

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matName.trim() || !matQty.trim()) return;
    addMaterialToJob(liveJob.id, {
      name: matName.trim(),
      quantity: matQty.trim(),
    });
    setMatName("");
    setMatQty("");
    setShowAddMaterialModal(false);
    toast.success("Material added to work order!");
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    addNoteToJob(liveJob.id, {
      text: noteText.trim(),
      author: currentUser?.name || "Site Manager",
    });
    setNoteText("");
    setShowAddNoteModal(false);
    toast.success("Site note added!");
  };

  const handleLogTimesheet = (e: React.FormEvent) => {
    e.preventDefault();
    const workerToLog = tsWorker.trim() || currentUser?.name || "Worker";
    const hoursNum = parseFloat(tsHours) || 8;
    const workerRole = crewList.find((c) => c.name === workerToLog)?.role || "Field Worker";
    addTimesheetToJob(liveJob.id, {
      workerName: workerToLog,
      role: workerRole,
      date: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      hours: hoursNum,
      description: tsDesc.trim() || "Work performed on site",
    });
    setTsDesc("");
    setShowLogTimesheetModal(false);
    toast.success(`Logged ${hoursNum} hours for ${workerToLog}!`);
  };

  const handleRaiseRfi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfiQuestion.trim()) return;
    const nextNum = (useTenderFlowStore.getState().rfis || []).length + 1;
    const rfiNumber = `RFI-${String(nextNum).padStart(3, "0")}`;
    addRfi({
      rfiNumber,
      organizationId: liveJob.organizationId || "ORG-DEFAULT",
      projectId: liveJob.projectId || "PRJ-ABC",
      projectName: liveJob.projectName || "ABC Commercial Building",
      siteId: liveJob.siteId || "SITE-BHP",
      siteName: liveJob.siteName || liveJob.location || "Bhopal Site",
      jobId: liveJob.id,
      jobTitle: liveJob.title,
      createdBy: currentUser?.name || "Salim",
      createdById: String(currentUser?.id || "user-salim"),
      creatorRole: isWorker ? "Field Worker" : "Site Manager",
      createdAt: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      title: rfiTitle.trim() || `Technical Query - ${liveJob.title}`,
      question: rfiQuestion.trim(),
      priority: rfiPriority,
      status: "Open",
      attachments: rfiAttachment.trim()
        ? [{ id: `att-${Date.now()}`, name: rfiAttachment.trim(), size: "1.2 MB" }]
        : [],
    });
    setRfiTitle("");
    setRfiQuestion("");
    setRfiAttachment("");
    setShowRaiseRfiModal(false);
    toast.success("RFI raised successfully!");
  };

  const handleRequestVariation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!varDescription.trim() || !varAmount.trim()) return;
    const amountNum = parseFloat(varAmount.replace(/[^0-9.]/g, "")) || 0;
    const nextNum = (useTenderFlowStore.getState().variations || []).length + 12;
    const variationNumber = `V-${String(nextNum).padStart(4, "0")}`;
    addVariation({
      variationNumber,
      organizationId: liveJob.organizationId || "ORG-DEFAULT",
      projectId: liveJob.projectId || "PRJ-ABC",
      projectName: liveJob.projectName || "ABC Commercial Building",
      siteId: liveJob.siteId || "SITE-BHP",
      siteName: liveJob.siteName || liveJob.location || "Bhopal Site",
      jobId: liveJob.id,
      jobTitle: liveJob.title,
      createdBy: currentUser?.name || "Salim",
      createdById: String(currentUser?.id || "user-salim"),
      creatorRole: isWorker ? "Field Worker" : "Site Manager",
      createdAt: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      title: varTitle.trim() || `Scope Variation - ${liveJob.title}`,
      description: varDescription.trim(),
      additionalMaterials: varMaterials.trim(),
      costImpact: amountNum,
      amount: amountNum,
      scheduleImpact: varImpact.trim() || "—",
      status: "Awaiting PM Approval",
      attachments: varAttachment.trim()
        ? [{ id: `att-${Date.now()}`, name: varAttachment.trim(), size: "1.5 MB" }]
        : [],
    });
    setVarTitle("");
    setVarDescription("");
    setVarMaterials("");
    setVarAmount("");
    setVarImpact("");
    setVarAttachment("");
    setShowRequestVariationModal(false);
    toast.success("Variation request submitted!");
  };

  const handleSaveRfiReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingRfi) return;
    updateRfiStatus(
      reviewingRfi.id,
      rfiReviewStatus,
      rfiReviewDirective.trim(),
      currentUser?.name || "Reviewer"
    );
    toast.success(`RFI ${reviewingRfi.rfiNumber} review updated.`);
    setReviewingRfi(null);
  };

  const handleUploadDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;
    addDocumentToJob(liveJob.id, {
      name: docName.trim().endsWith(".pdf") ? docName.trim() : `${docName.trim()}.pdf`,
      type: "PDF",
      size: "1.2 MB",
      uploadedDate: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      category: docCategory,
    });
    setDocName("");
    setShowUploadDocModal(false);
    toast.success("Document attached to job!");
  };

  const handleReportSafety = (e: React.FormEvent) => {
    e.preventDefault();
    if (!safetyTitle.trim()) return;
    addSafetyItemToJob(liveJob.id, {
      title: safetyTitle.trim(),
      type: safetyType,
      status: "Reported",
      details: safetyDetails.trim() || "Safety check logged on site.",
      date: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    });
    setSafetyTitle("");
    setSafetyDetails("");
    setShowReportSafetyModal(false);
    toast.success("Safety report logged!");
  };

  const handleAddPunch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!punchTitle.trim()) return;
    addPunchItemToJob(liveJob.id, {
      title: punchTitle.trim(),
      location: punchLocation.trim() || liveJob.location || "Site",
      severity: punchSeverity,
      status: "Open",
      reportedDate: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    });
    setPunchTitle("");
    setShowAddPunchModal(false);
    toast.success("Punch list item recorded!");
  };

  // Helper for status badge styling
  const getStatusBadge = (status: JobItem["status"]) => {
    switch (status) {
      case "Scheduled":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "Travelling":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "On-site":
      case "In Progress":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "Completed":
        return "bg-green-100 text-green-900 border-green-300";
      default:
        return "bg-stone text-ash border-pebble";
    }
  };

  return (
    <div className="space-y-5 mt-2 pb-16 font-sans">
      {/* ========================================================================= */}
      {/* 1. BREADCRUMBS & TOP NAV                                                  */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between gap-4 text-xs">
        <nav className="flex items-center gap-2 text-ash font-medium">
          <button
            type="button"
            onClick={onBack}
            className="hover:text-forest transition cursor-pointer"
          >
            Jobs
          </button>
          <span>&gt;</span>
          <span className="text-ash truncate max-w-[200px]">
            {liveJob.projectName || liveJob.title || liveJob.id}
          </span>
          <span>&gt;</span>
          <span className="font-bold text-onyx">{liveJob.id}</span>
        </nav>

        <button
          type="button"
          onClick={onBack}
          className="font-semibold text-ash hover:text-onyx transition cursor-pointer flex items-center gap-1"
        >
          <span>&larr; Back to Jobs List</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. JOB TITLE & TOP ACTION BUTTONS (Header Row from Screenshot)            */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-onyx tracking-tight">
              {liveJob.id} &ndash; {liveJob.title}
            </h1>
            <span
              className={`px-3 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(
                liveJob.status
              )}`}
            >
              {liveJob.status}
            </span>
          </div>

          <p className="text-xs text-ash mt-1 flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-onyx">
              {liveJob.projectName || liveJob.title || liveJob.id}
            </span>
            {liveJob.block && (
              <>
                <span>&bull;</span>
                <span>{liveJob.block}</span>
              </>
            )}
            {liveJob.trade && (
              <>
                <span>&bull;</span>
                <span className="text-forest font-semibold">
                  {liveJob.trade}
                </span>
              </>
            )}
          </p>
        </div>

        {/* Action Buttons Top Right: Update Status, Schedule, Reassign, More */}
        <div className="flex items-center gap-2 relative">
          {/* Update Status Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className="flex items-center gap-2 px-4 py-2 rounded-[10px] bg-forest hover:bg-[#083a2d] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <span>Update Status</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {showStatusMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-44 rounded-[12px] bg-white border border-pebble p-1.5 shadow-xl z-30 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-ash tracking-wider">
                  Change Status
                </div>
                {(["Scheduled", "Travelling", "On-site", "In Progress", "Completed"] as JobItem["status"][]).map(
                  (st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(st)}
                      className={`w-full text-left px-3 py-2 rounded-[8px] text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                        liveJob.status === st
                          ? "bg-breath text-onyx font-bold"
                          : "text-onyx hover:bg-stone"
                      }`}
                    >
                      <span>{st}</span>
                      {liveJob.status === st && <Check className="h-3.5 w-3.5 text-forest" />}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* Quick Schedule Button */}
          {onOpenSchedule && (
            <button
              type="button"
              onClick={onOpenSchedule}
              className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] bg-stone hover:bg-mist text-onyx text-xs font-semibold transition border border-pebble cursor-pointer"
            >
              <Calendar className="h-4 w-4 text-ash" />
              <span className="hidden sm:inline">Schedule</span>
            </button>
          )}

          {/* Reassign Button */}
          {onOpenReassign && !isWorker && (
            <button
              type="button"
              onClick={onOpenReassign}
              className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] bg-stone hover:bg-mist text-onyx text-xs font-semibold transition border border-pebble cursor-pointer"
            >
              <ArrowLeftRight className="h-4 w-4 text-ash" />
              <span className="hidden sm:inline">Reassign</span>
            </button>
          )}

          {/* More Actions Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2 rounded-[10px] bg-stone hover:bg-mist text-ash hover:text-onyx transition border border-pebble cursor-pointer"
              title="More Actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {showMoreMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-48 rounded-[12px] bg-white border border-pebble p-1.5 shadow-xl z-30 space-y-1 animate-in fade-in zoom-in-95 duration-100 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(false);
                    setShowEditDetailsModal(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-[8px] hover:bg-stone font-semibold text-onyx flex items-center gap-2 cursor-pointer"
                >
                  <Edit2 className="h-3.5 w-3.5 text-ash" />
                  <span>Edit Specifications</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(false);
                    openAssignCrewModal();
                  }}
                  className="w-full text-left px-3 py-2 rounded-[8px] hover:bg-stone font-semibold text-onyx flex items-center gap-2 cursor-pointer"
                >
                  <Users className="h-3.5 w-3.5 text-ash" />
                  <span>Assign Crew</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(false);
                    setShowPhotoModal(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-[8px] hover:bg-stone font-semibold text-onyx flex items-center gap-2 cursor-pointer"
                >
                  <Camera className="h-3.5 w-3.5 text-ash" />
                  <span>Upload Photos</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(false);
                    setShowAddNoteModal(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-[8px] hover:bg-stone font-semibold text-onyx flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5 text-ash" />
                  <span>Add Site Note</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TOP 5 INFO METRIC CARDS (Scheduled Date, Client, Location, Contact, Status) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Scheduled Timeline */}
        <div className="rounded-[14px] bg-white border border-pebble/80 p-3.5 shadow-2xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-emerald-50 text-emerald-700 shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-ash block">Scheduled Timeline</span>
            <p className="text-xs font-bold text-onyx truncate" title={displayDates}>
              {displayDates}
            </p>
            <p className="text-[11px] text-ash truncate">
              {liveJob.timeSlot || "Full Work Order"}
            </p>
          </div>
        </div>

        {/* Card 2: Client */}
        <div className="rounded-[14px] bg-white border border-pebble/80 p-3.5 shadow-2xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-emerald-50 text-emerald-700 shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-ash block">Client</span>
            <p className="text-xs font-bold text-onyx truncate">
              {displayClientName}
            </p>
            <p className="text-[11px] text-ash truncate">Project Client</p>
          </div>
        </div>

        {/* Card 3: Construction Site */}
        <div className="rounded-[14px] bg-white border border-pebble/80 p-3.5 shadow-2xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-emerald-50 text-emerald-700 shrink-0">
            <MapPin className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-ash block">Construction Site</span>
            <p className="text-xs font-bold text-onyx truncate">
              {liveJob.location || liveJob.projectName || "—"}
            </p>
            <p className="text-[11px] text-forest font-medium truncate">Site Location</p>
          </div>
        </div>

        {/* Card 4: Site Manager */}
        <div className="rounded-[14px] bg-white border border-pebble/80 p-3.5 shadow-2xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-emerald-50 text-emerald-700 shrink-0">
            <UserCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-ash block">Site Manager</span>
            <p className="text-xs font-bold text-onyx truncate">
              {displaySiteManagerName}
            </p>
            <span className="text-[11px] text-forest font-semibold block">Site Supervisor</span>
          </div>
        </div>

        {/* Card 5: Job Status */}
        <div className="rounded-[14px] bg-white border border-pebble/80 p-3.5 shadow-2xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-emerald-50 text-emerald-700 shrink-0">
              <FileCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-ash block">Job Status</span>
              <button
                type="button"
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-xs font-bold border mt-0.5 transition cursor-pointer ${getStatusBadge(
                  liveJob.status
                )}`}
              >
                <span>{liveJob.status}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. TAB NAVIGATION (11 TABS FROM SCREENSHOT)                                */}
      {/* ========================================================================= */}
      <div className="border-b border-pebble/80 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-5 text-xs min-w-max pb-0.5">
          {[
            { key: "OVERVIEW", label: "Overview" },
            { key: "CREW", label: `Crew (${crewList.length})` },
            { key: "MATERIALS", label: `Materials (${materialsList.length})` },
            { key: "PHOTOS", label: `Photos (${photosList.length})` },
            { key: "NOTES", label: `Notes (${notesList.length})` },
            { key: "TIMESHEET", label: `Timesheet (${timesheetsList.length})` },
            { key: "RFIS", label: `RFIs (${rfisList.length})` },
            { key: "VARIATIONS", label: `Variations (${variationsList.length})` },
            { key: "DOCUMENTS", label: `Documents (${documentsList.length})` },
            { key: "SAFETY", label: `Safety (${safetyList.length})` },
            { key: "PUNCH_LISTS", label: `Punch Lists (${punchListsList.length})` },
            { key: "FINANCE", label: "Finance & Costs" },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as TabKey)}
                className={`pb-3 font-semibold transition cursor-pointer whitespace-nowrap relative ${
                  isActive
                    ? "text-forest font-bold border-b-2 border-forest"
                    : "text-ash hover:text-onyx"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. TAB 1: OVERVIEW SCREEN (Exact 3 Columns + Bottom Row from Screenshot)    */}
      {/* ========================================================================= */}
      {activeTab === "OVERVIEW" && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Main 3-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* ------------------------------------------------------------- */}
            {/* COLUMN 1: Job Details Card (4 cols)                            */}
            {/* ------------------------------------------------------------- */}
            <div className="lg:col-span-4 rounded-[16px] bg-white border border-pebble/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-onyx">Job Details</h3>
                <button
                  type="button"
                  onClick={() => setShowEditDetailsModal(true)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-onyx hover:text-forest bg-stone hover:bg-mist rounded-[6px] border border-pebble transition cursor-pointer"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>Edit</span>
                </button>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-onyx block">Description</span>
                <p className="text-xs text-ash leading-relaxed">
                  {liveJob.description || "No description provided."}
                </p>
              </div>

              {/* Scope of Work */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-onyx block">Scope of Work</span>
                {scopeList.length === 0 ? (
                  <p className="text-xs text-ash italic">No scope items specified.</p>
                ) : (
                  <ul className="space-y-1 text-xs text-ash">
                    {scopeList.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-forest shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Start Date */}
              <div className="space-y-0.5 pt-1">
                <span className="text-xs font-bold text-onyx block">Start Date</span>
                <p className="text-xs text-ash">
                  {liveJob.startDate || "15 Sep 2026"}
                  {liveJob.timeSlot ? `, ${liveJob.timeSlot}` : ""}
                </p>
              </div>

              {/* End Date / Deadline */}
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-onyx block">End Date / Deadline</span>
                <p className="text-xs text-ash">
                  {liveJob.endDate || matchedProject?.due || "30 Nov 2026"}
                </p>
              </div>

              {/* Expected Duration */}
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-onyx block">Expected Duration</span>
                <p className="text-xs text-ash">{displayDuration}</p>
              </div>

              {/* Location */}
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-onyx block">Location</span>
                <p className="text-xs text-ash">
                  {liveJob.location || "Not specified"}
                </p>
              </div>

              {/* Safety Notes Alert Box */}
              <div className="rounded-[10px] bg-amber-50/70 border border-amber-200 p-3 flex items-start gap-2.5 text-xs text-amber-900">
                <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-950 block">Safety Notes</span>
                  <p className="text-amber-900 text-[11px] mt-0.5">
                    {liveJob.safetyNotes || "Standard site safety precautions apply."}
                  </p>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* COLUMN 2: Assigned Crew & Progress (4 cols)                    */}
            {/* ------------------------------------------------------------- */}
            <div className="lg:col-span-4 space-y-5">
              {/* Assigned Crew Card */}
              <div className="rounded-[16px] bg-white border border-pebble/80 p-5 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-onyx">
                    Assigned Crew ({crewList.length})
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={openAssignCrewModal}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-forest hover:bg-forest/10 rounded-[6px] border border-forest/30 transition cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Assign Crew</span>
                    </button>
                    {crewList.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveTab("CREW")}
                        className="text-xs font-bold text-forest hover:underline cursor-pointer"
                      >
                        View All
                      </button>
                    )}
                  </div>
                </div>

                {/* Crew List Table or Clean Empty State */}
                {crewList.length === 0 ? (
                  <div className="py-6 text-center text-ash text-xs">
                    <Users className="h-6 w-6 mx-auto mb-1.5 text-pebble opacity-60" />
                    <p className="font-semibold text-onyx">No crew assigned yet</p>
                    <p className="mt-0.5 text-ash">Click "Assign Crew" to allocate team members.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-pebble/60 text-xs">
                    {crewList.slice(0, 5).map((m) => (
                      <div key={m.id} className="py-2.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-forest text-white font-bold text-[10px] shrink-0">
                            {m.initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-onyx truncate leading-tight">{m.name}</p>
                            <p className="text-[11px] text-ash truncate leading-tight mt-0.5">
                              {m.role}{m.contact ? ` • ${m.contact}` : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                              m.status === "On Site"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : m.status === "Travelling"
                                ? "bg-purple-50 text-purple-800 border-purple-200"
                                : "bg-stone text-ash border-pebble"
                            }`}
                          >
                            {m.status}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const nextStatus = m.status === "On Site" ? "Not Started" : "On Site";
                              updateCrewStatus(liveJob.id, m.id, nextStatus);
                              toast.success(`${m.name} marked as ${nextStatus}`);
                            }}
                            className="p-1 text-ash hover:text-onyx cursor-pointer"
                            title="Toggle On Site / Not Started"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Progress Card */}
              <div className="rounded-[16px] bg-white border border-pebble/80 p-5 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-onyx">Progress</h3>
                  <span className="text-xs font-bold text-forest">
                    {liveJob.progressPercent ?? 0}% Complete
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 rounded-full bg-stone overflow-hidden">
                  <div
                    className="h-full bg-forest rounded-full transition-all duration-300"
                    style={{ width: `${liveJob.progressPercent ?? 0}%` }}
                  />
                </div>

                {/* 4 Stats Grid */}
                <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                  <div>
                    <span className="text-[10px] font-semibold text-ash block leading-tight">
                      Tasks Completed
                    </span>
                    <p className="text-sm font-bold text-onyx mt-0.5">
                      {liveJob.tasksCompletedCount ?? 0} / {liveJob.tasksTotalCount ?? (scopeList.length || 0)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-ash block leading-tight">
                      Hours Logged
                    </span>
                    <p className="text-sm font-bold text-onyx mt-0.5">
                      {totalHoursLogged} hrs
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-ash block leading-tight">
                      Photos Uploaded
                    </span>
                    <p className="text-sm font-bold text-onyx mt-0.5">{photosList.length}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-ash block leading-tight">
                      Open RFIs
                    </span>
                    <p className="text-sm font-bold text-onyx mt-0.5">
                      {rfisList.filter((r) => r.status === "Open").length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* COLUMN 3: Site Location Map & Related Information (4 cols)     */}
            {/* ------------------------------------------------------------- */}
            <div className="lg:col-span-4 space-y-5">
              {/* Site Location Map Card */}
              <div className="rounded-[16px] bg-white border border-pebble/80 p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-onyx">Site Location Map</h3>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      liveJob.location || liveJob.projectName || "Site Location"
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-forest hover:underline flex items-center gap-1"
                  >
                    <Navigation className="h-3 w-3" />
                    <span>Open in Maps</span>
                  </a>
                </div>

                {/* Stylized Map Preview Graphic */}
                <div className="relative h-44 w-full rounded-[12px] overflow-hidden border border-pebble bg-stone flex items-center justify-center shadow-inner">
                  {/* Map Grid Pattern */}
                  <div
                    className="absolute inset-0 opacity-40"
                    style={{
                      backgroundImage:
                        "radial-gradient(#0B4D3C 0.75px, transparent 0.75px), radial-gradient(#1c2e26 0.75px, #f4f3ef 0.75px)",
                      backgroundSize: "20px 20px",
                      backgroundPosition: "0 0, 10px 10px",
                    }}
                  />

                  {/* Road Vectors */}
                  <svg
                    className="absolute inset-0 h-full w-full opacity-35"
                    viewBox="0 0 300 180"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M-10 30 Q 140 60 310 10" stroke="#1c2e26" strokeWidth="10" />
                    <path d="M70 -10 Q 90 100 150 190" stroke="#1c2e26" strokeWidth="14" />
                    <path d="M10 150 Q 140 120 310 140" stroke="#0B4D3C" strokeWidth="6" />
                  </svg>

                  {/* Pin Badge */}
                  <div className="relative z-10 flex flex-col items-center px-3 text-center">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-forest text-white shadow-md animate-bounce">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="mt-1 rounded-[6px] bg-onyx px-2.5 py-1 text-[11px] font-bold text-white shadow-md text-center max-w-[200px] truncate">
                      {liveJob.projectName || liveJob.title || liveJob.id}
                    </div>
                    <span className="text-[10px] font-medium text-ash mt-0.5 truncate max-w-[200px]">
                      {liveJob.location || "Site Location"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Related Information Card */}
              <div className="rounded-[16px] bg-white border border-pebble/80 p-5 shadow-2xs space-y-3">
                <h3 className="text-base font-bold text-onyx">Related Information</h3>

                <div className="divide-y divide-pebble/60 text-xs">
                  {/* Construction Site */}
                  <button
                    type="button"
                    onClick={() => router.push("/sites")}
                    className="w-full py-2.5 flex items-center justify-between text-left hover:bg-stone/50 rounded-[6px] px-1 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className="h-4 w-4 text-forest" />
                      <div>
                        <span className="text-[11px] text-ash block">Construction Site</span>
                        <span className="font-bold text-forest">
                          {liveJob.location || liveJob.projectName || "Main Site Yard"}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-ash" />
                  </button>

                  {/* Project */}
                  <button
                    type="button"
                    onClick={() => router.push("/projects")}
                    className="w-full py-2.5 flex items-center justify-between text-left hover:bg-stone/50 rounded-[6px] px-1 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="h-4 w-4 text-ash" />
                      <div>
                        <span className="text-[11px] text-ash block">Project</span>
                        <span className="font-bold text-onyx">
                          {liveJob.projectName || matchedProject?.name || liveJob.title || "—"}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-ash" />
                  </button>

                  {/* Assigned Site Manager */}
                  <div className="w-full py-2.5 flex items-center justify-between px-1">
                    <div className="flex items-center gap-2.5">
                      <UserCheck className="h-4 w-4 text-forest" />
                      <div>
                        <span className="text-[11px] text-ash block">Assigned Site Manager</span>
                        <span className="font-bold text-onyx flex items-center gap-1.5">
                          <span>{displaySiteManagerName}</span>
                          <span className="text-[10px] bg-forest/10 text-forest px-1.5 py-0.2 rounded font-semibold">
                            Supervisor
                          </span>
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-ash font-medium">On Site</span>
                  </div>

                  {/* Trade Contractor */}
                  <button
                    type="button"
                    onClick={() => router.push("/contractors")}
                    className="w-full py-2.5 flex items-center justify-between text-left hover:bg-stone/50 rounded-[6px] px-1 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <HardHat className="h-4 w-4 text-ash" />
                      <div>
                        <span className="text-[11px] text-ash block">Trade Contractor</span>
                        <span className="font-bold text-onyx">
                          {displayContractorName}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-ash" />
                  </button>

                  {/* Site Contact */}
                  <div className="py-2.5 flex items-center justify-between px-1">
                    <div className="flex items-center gap-2.5">
                      <Users className="h-4 w-4 text-ash" />
                      <div>
                        <span className="text-[11px] text-ash block">Site Contact</span>
                        <span className="font-bold text-onyx">
                          {liveJob.siteContact
                            ? `${liveJob.siteContact}${liveJob.siteContactPhone ? ` (${liveJob.siteContactPhone})` : ""}`
                            : `${displaySiteManagerName} (Site Manager)`}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-ash" />
                  </div>

                  {/* Drawings */}
                  <button
                    type="button"
                    onClick={() => setActiveTab("DOCUMENTS")}
                    className="w-full py-2.5 flex items-center justify-between text-left hover:bg-stone/50 rounded-[6px] px-1 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="h-4 w-4 text-ash" />
                      <div>
                        <span className="text-[11px] text-ash block">Drawings</span>
                        <span className="font-bold text-forest">View Drawings ({documentsList.length})</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-ash" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================= */}
          {/* BOTTOM SECTION: Recent Activity (left) & Quick Actions (right) */}
          {/* ============================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Recent Activity (8 cols) */}
            <div className="lg:col-span-8 rounded-[16px] bg-white border border-pebble/80 p-5 shadow-2xs space-y-3.5">
              <h3 className="text-base font-bold text-onyx">Recent Activity</h3>

              {recentActivityItems.length === 0 ? (
                <div className="py-8 text-center text-ash text-xs">
                  <Activity className="h-6 w-6 mx-auto mb-2 text-pebble opacity-60" />
                  <p className="font-semibold text-onyx">No recent activity</p>
                  <p className="mt-0.5 text-ash">Updates, notes, and crew logs will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  {recentActivityItems.slice(0, 6).map((item) => {
                    const Icon = item.icon || Activity;
                    return (
                      <div key={item.id} className="flex items-start gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-emerald-50 text-emerald-700 shrink-0 mt-0.5">
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div>
                            <p className="font-bold text-onyx">{item.title}</p>
                            <p className="text-[11px] text-ash">{item.subtitle}</p>
                          </div>
                          <span className="text-[11px] text-ash shrink-0">{item.time}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Actions (4 cols, 2-column grid of 6 buttons) */}
            <div className="lg:col-span-4 rounded-[16px] bg-white border border-pebble/80 p-5 shadow-2xs space-y-3.5">
              <h3 className="text-base font-bold text-onyx">Quick Actions</h3>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                {/* Log Timesheet */}
                <button
                  type="button"
                  onClick={() => setShowLogTimesheetModal(true)}
                  className="p-3 rounded-[10px] bg-stone/60 hover:bg-mist/80 border border-pebble/80 text-onyx font-semibold flex flex-col items-start gap-1.5 transition cursor-pointer"
                >
                  <Clock className="h-4 w-4 text-ash" />
                  <span>Log Timesheet</span>
                </button>

                {/* Upload Photos */}
                <button
                  type="button"
                  onClick={() => setShowPhotoModal(true)}
                  className="p-3 rounded-[10px] bg-stone/60 hover:bg-mist/80 border border-pebble/80 text-onyx font-semibold flex flex-col items-start gap-1.5 transition cursor-pointer"
                >
                  <Camera className="h-4 w-4 text-ash" />
                  <span>Upload Photos</span>
                </button>

                {/* Add Note */}
                <button
                  type="button"
                  onClick={() => setShowAddNoteModal(true)}
                  className="p-3 rounded-[10px] bg-stone/60 hover:bg-mist/80 border border-pebble/80 text-onyx font-semibold flex flex-col items-start gap-1.5 transition cursor-pointer"
                >
                  <FileText className="h-4 w-4 text-ash" />
                  <span>Add Note</span>
                </button>

                {/* Request Variation */}
                <button
                  type="button"
                  onClick={() => setShowRequestVariationModal(true)}
                  className="p-3 rounded-[10px] bg-stone/60 hover:bg-mist/80 border border-pebble/80 text-onyx font-semibold flex flex-col items-start gap-1.5 transition cursor-pointer"
                >
                  <ArrowLeftRight className="h-4 w-4 text-ash" />
                  <span>Request Variation</span>
                </button>

                {/* Raise RFI */}
                <button
                  type="button"
                  onClick={() => setShowRaiseRfiModal(true)}
                  className="p-3 rounded-[10px] bg-stone/60 hover:bg-mist/80 border border-pebble/80 text-onyx font-semibold flex flex-col items-start gap-1.5 transition cursor-pointer"
                >
                  <HelpCircle className="h-4 w-4 text-ash" />
                  <span>Raise RFI</span>
                </button>

                {/* Report Safety Issue */}
                <button
                  type="button"
                  onClick={() => setShowReportSafetyModal(true)}
                  className="p-3 rounded-[10px] bg-stone/60 hover:bg-mist/80 border border-pebble/80 text-onyx font-semibold flex flex-col items-start gap-1.5 transition cursor-pointer"
                >
                  <ShieldAlert className="h-4 w-4 text-ash" />
                  <span>Report Safety Issue</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. TAB 2: CREW TAB                                                        */}
      {/* ========================================================================= */}
      {activeTab === "CREW" && (
        <div className="rounded-[16px] bg-white border border-pebble/80 p-5 sm:p-6 shadow-2xs space-y-5 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-pebble/60">
            <div>
              <h2 className="text-lg font-bold text-onyx">Assigned Crew Members</h2>
              <p className="text-xs text-ash mt-0.5">
                Manage site electricians, trade specialists, and field helpers allocated to this work order.
              </p>
            </div>
            <button
              type="button"
              onClick={openAssignCrewModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-forest hover:bg-forest-hover text-white text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Assign New Worker</span>
            </button>
          </div>

          {crewList.length === 0 ? (
            <div className="py-12 border-2 border-dashed border-pebble rounded-[14px] text-center space-y-2">
              <Users className="h-10 w-10 text-ash mx-auto opacity-50" />
              <p className="text-sm font-semibold text-onyx">No crew assigned yet</p>
              <p className="text-xs text-ash max-w-sm mx-auto">
                Assign electricians, trade specialists, or field helpers to work on this job.
              </p>
              <button
                type="button"
                onClick={openAssignCrewModal}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-forest text-white rounded-[8px] text-xs font-bold hover:bg-forest-hover transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Assign Worker</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-pebble/60 text-xs">
              {crewList.map((worker) => (
                <div key={worker.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-forest text-white font-bold text-xs shrink-0">
                      {worker.initials}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-onyx">{worker.name}</p>
                      <p className="text-xs text-ash">{worker.role}{worker.contact ? ` • ${worker.contact}` : ""}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={worker.status}
                      onChange={(e) =>
                        updateCrewStatus(liveJob.id, worker.id, e.target.value as CrewMemberAssignment["status"])
                      }
                      className={`px-3 py-1 rounded-[6px] text-xs font-bold border outline-none cursor-pointer ${
                        worker.status === "On Site"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                          : worker.status === "Travelling"
                          ? "bg-purple-50 text-purple-800 border-purple-300"
                          : "bg-stone text-ash border-pebble"
                      }`}
                    >
                      <option value="On Site">On Site</option>
                      <option value="Travelling">Travelling</option>
                      <option value="Not Started">Not Started</option>
                      <option value="Off Site">Off Site</option>
                    </select>

                    {worker.contact && (
                      <a
                        href={`tel:${worker.contact}`}
                        className="p-2 rounded-[8px] bg-stone hover:bg-mist text-ash hover:text-onyx transition cursor-pointer"
                        title="Call"
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        removeCrewFromJob(liveJob.id, worker.id);
                        toast.success(`${worker.name} removed from job crew.`);
                      }}
                      className="p-2 rounded-[8px] bg-stone hover:bg-rose-50 text-ash hover:text-rose-600 transition cursor-pointer"
                      title="Remove Worker"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. TAB 3: MATERIALS TAB                                                   */}
      {/* ========================================================================= */}
      {activeTab === "MATERIALS" && (
        <div className="rounded-[16px] bg-white border border-pebble/80 p-5 sm:p-6 shadow-2xs space-y-5 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-pebble/60">
            <div>
              <h2 className="text-lg font-bold text-onyx">Job Materials &amp; Consumables</h2>
              <p className="text-xs text-ash mt-0.5">
                Track electrical fixtures, cables, and installation components allocated to this job.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddMaterialModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-forest hover:bg-forest-hover text-white text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Add Material</span>
            </button>
          </div>

          {materialsList.length === 0 ? (
            <div className="py-12 border-2 border-dashed border-pebble rounded-[14px] text-center space-y-2">
              <Package className="h-10 w-10 text-ash mx-auto opacity-50" />
              <p className="text-sm font-semibold text-onyx">No materials logged</p>
              <p className="text-xs text-ash max-w-sm mx-auto">
                Record supplies, consumables, and fixtures allocated to this job order.
              </p>
              <button
                type="button"
                onClick={() => setShowAddMaterialModal(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-forest text-white rounded-[8px] text-xs font-bold hover:bg-forest-hover transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Material</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-pebble/60 text-xs">
              {materialsList.map((mat) => (
                <div key={mat.id} className="py-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-stone text-onyx shrink-0">
                      <Package className="h-4 w-4 text-forest" />
                    </div>
                    <div>
                      <p className="font-bold text-onyx">{mat.name}</p>
                      <p className="text-ash text-[11px]">Allocated from Main Site Store</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-[6px] bg-stone text-onyx font-bold border border-pebble">
                      {mat.quantity}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      On Site
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. TAB 4: PHOTOS TAB                                                      */}
      {/* ========================================================================= */}
      {activeTab === "PHOTOS" && (
        <div className="rounded-[16px] bg-white border border-pebble/80 p-5 sm:p-6 shadow-2xs space-y-5 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-pebble/60">
            <div>
              <h2 className="text-lg font-bold text-onyx">Site Progress Photos</h2>
              <p className="text-xs text-ash mt-0.5">
                Visual photo records, quality inspections, and milestone snapshots.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPhotoModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-forest hover:bg-forest-hover text-white text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <Camera className="h-4 w-4" />
              <span>Upload Site Photo</span>
            </button>
          </div>

          {/* Photo Category Filter */}
          <div className="flex items-center gap-2">
            {(["ALL", "BEFORE", "PROGRESS", "AFTER"] as PhotoCategory[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setPhotoCategory(cat)}
                className={`px-3 py-1 rounded-[8px] text-xs font-bold transition cursor-pointer ${
                  photoCategory === cat
                    ? "bg-forest text-white"
                    : "bg-stone text-ash hover:text-onyx"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Photos Grid */}
          {filteredPhotos.length === 0 ? (
            <div className="py-12 border-2 border-dashed border-pebble rounded-[14px] text-center space-y-3">
              <Camera className="h-10 w-10 text-ash mx-auto opacity-50" />
              <p className="text-sm font-semibold text-onyx">No photos uploaded yet</p>
              <p className="text-xs text-ash max-w-sm mx-auto">
                Site managers and field workers can capture and upload time-stamped inspection photos.
              </p>
              <button
                type="button"
                onClick={() => setShowPhotoModal(true)}
                className="px-4 py-2 bg-forest text-white rounded-[8px] text-xs font-bold hover:bg-forest-hover transition cursor-pointer"
              >
                Upload First Photo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="rounded-[12px] border border-pebble overflow-hidden bg-white shadow-2xs group"
                >
                  <div className="relative h-44 w-full bg-stone">
                    <img
                      src={photo.url}
                      alt={photo.title || "Job photo"}
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-200"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-[4px] bg-black/60 text-white text-[10px] font-bold">
                      {photo.stage || "Progress"}
                    </span>
                  </div>
                  <div className="p-3 text-xs space-y-1">
                    <p className="font-bold text-onyx truncate">{photo.title || "Site Photo"}</p>
                    <p className="text-[11px] text-ash">{photo.uploadedBy} &bull; {photo.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. TAB 5: NOTES TAB                                                       */}
      {/* ========================================================================= */}
      {activeTab === "NOTES" && (
        <div className="rounded-[16px] bg-white border border-pebble/80 p-5 sm:p-6 shadow-2xs space-y-5 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-pebble/60">
            <div>
              <h2 className="text-lg font-bold text-onyx">Technician &amp; Site Logs</h2>
              <p className="text-xs text-ash mt-0.5">
                Coordination remarks, inspection entries, and field supervisor updates.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddNoteModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-forest hover:bg-forest-hover text-white text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Note</span>
            </button>
          </div>

          {notesList.length === 0 ? (
            <div className="py-12 border-2 border-dashed border-pebble rounded-[14px] text-center space-y-2">
              <FileText className="h-10 w-10 text-ash mx-auto opacity-50" />
              <p className="text-sm font-semibold text-onyx">No site notes posted</p>
              <p className="text-xs text-ash max-w-sm mx-auto">
                Keep site observations, instructions, and coordination logs recorded here.
              </p>
              <button
                type="button"
                onClick={() => setShowAddNoteModal(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-forest text-white rounded-[8px] text-xs font-bold hover:bg-forest-hover transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Note</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              {notesList.map((note) => (
                <div key={note.id} className="p-3.5 rounded-[12px] bg-stone/50 border border-pebble/70 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-onyx">{note.author}</span>
                    <span className="text-[11px] text-ash">{note.time}</span>
                  </div>
                  <p className="text-ash leading-relaxed">{note.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. TAB 6: TIMESHEET TAB                                                  */}
      {/* ========================================================================= */}
      {activeTab === "TIMESHEET" && (
        <div className="rounded-[16px] bg-white border border-pebble/80 p-5 sm:p-6 shadow-2xs space-y-5 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-pebble/60">
            <div>
              <h2 className="text-lg font-bold text-onyx">Worker Hours Logged</h2>
              <p className="text-xs text-ash mt-0.5">
                Total hours recorded for field technicians and helpers on this job card.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowLogTimesheetModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-forest hover:bg-forest-hover text-white text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <Clock className="h-4 w-4" />
              <span>Log Hours</span>
            </button>
          </div>

          {timesheetsList.length === 0 ? (
            <div className="py-12 border-2 border-dashed border-pebble rounded-[14px] text-center space-y-2">
              <Clock className="h-10 w-10 text-ash mx-auto opacity-50" />
              <p className="text-sm font-semibold text-onyx">No worker hours logged</p>
              <p className="text-xs text-ash max-w-sm mx-auto">
                Log technician hours, overtime, and work execution descriptions for this job.
              </p>
              <button
                type="button"
                onClick={() => setShowLogTimesheetModal(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-forest text-white rounded-[8px] text-xs font-bold hover:bg-forest-hover transition cursor-pointer"
              >
                <Clock className="h-4 w-4" />
                <span>Log Hours</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-pebble/60 text-xs">
              {timesheetsList.map((ts) => (
                <div key={ts.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-onyx">{ts.workerName} ({ts.role})</p>
                    <p className="text-ash text-[11px]">{ts.description} &bull; {ts.date}</p>
                  </div>
                  <span className="px-3 py-1 rounded-[6px] bg-forest text-white font-bold">
                    {ts.hours} hrs
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 11. TAB 7: RFIS TAB                                                       */}
      {/* ========================================================================= */}
      {activeTab === "RFIS" && (
        <div className="rounded-[16px] bg-white border border-pebble/80 p-5 sm:p-6 shadow-2xs space-y-5 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-pebble/60">
            <div>
              <h2 className="text-lg font-bold text-onyx">Requests for Information (RFIs)</h2>
              <p className="text-xs text-ash mt-0.5">
                Technical queries and design clarifications submitted to Project Engineers.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowRaiseRfiModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-forest hover:bg-forest-hover text-white text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Raise RFI</span>
            </button>
          </div>

          {rfisList.length === 0 ? (
            <div className="py-12 border-2 border-dashed border-pebble rounded-[14px] text-center space-y-2">
              <HelpCircle className="h-10 w-10 text-ash mx-auto opacity-50" />
              <p className="text-sm font-semibold text-onyx">No RFIs raised</p>
              <p className="text-xs text-ash max-w-sm mx-auto">
                Submit formal technical questions or site queries to Project Engineers.
              </p>
              <button
                type="button"
                onClick={() => setShowRaiseRfiModal(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-forest text-white rounded-[8px] text-xs font-bold hover:bg-forest-hover transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Raise RFI</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              {rfisList.map((rfi) => (
                <div key={rfi.id} className="p-4 rounded-[12px] border border-pebble bg-stone/40 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-forest bg-forest/10 px-2 py-0.5 rounded-[4px] font-mono text-xs">
                        {rfi.rfiNumber}
                      </span>
                      <span className="font-bold text-onyx">{rfi.title}</span>
                      <span className="text-[11px] text-ash bg-white border border-pebble px-2 py-0.5 rounded-[4px]">
                        {liveJob.projectName} &bull; {liveJob.siteName || liveJob.location} &bull; {liveJob.id}
                      </span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      rfi.status === "Open"
                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                        : rfi.status === "In Review"
                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                        : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                    }`}>
                      {rfi.status}
                    </span>
                  </div>

                  <div className="p-3 rounded-[8px] bg-white border border-pebble/80 text-xs text-onyx">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ash mb-1">
                      Question / Clarification Requested
                    </p>
                    <p className="text-xs text-onyx whitespace-pre-wrap">{rfi.question || rfi.description}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-ash pt-1 border-t border-pebble/50">
                    <div>
                      Raised by <span className="font-bold text-onyx">{rfi.createdBy}</span> ({rfi.creatorRole || "Field Worker"}) on {rfi.createdAt || rfi.date}
                    </div>
                    {rfi.attachments && rfi.attachments.length > 0 && (
                      <div className="flex items-center gap-1.5 text-forest font-semibold">
                        <FileText className="h-3.5 w-3.5" />
                        <span>{rfi.attachments[0].name}</span>
                      </div>
                    )}
                  </div>

                  {rfi.response && (
                    <div className="p-2.5 rounded-[8px] bg-emerald-50/70 border border-emerald-200 text-onyx text-xs">
                      <strong className="text-[11px] text-forest block font-bold">Technical Directive / Response:</strong>
                      <span className="text-onyx">{rfi.response}</span>
                      {rfi.reviewedBy && (
                        <p className="text-[10px] text-ash mt-1">Reviewed by {rfi.reviewedBy} on {rfi.reviewedAt}</p>
                      )}
                    </div>
                  )}

                  {/* Review action for PM / Site Manager */}
                  {(currentUser?.role === "PROJECT_MANAGER" || currentUser?.role === "SITE_MANAGER" || currentUser?.role === "OWNER" || currentUser?.role === "ACCOUNT_ADMIN") && (
                    <div className="pt-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setReviewingRfi(rfi);
                          setRfiReviewDirective(rfi.response || "");
                          setRfiReviewStatus((rfi.status as any) || "Closed");
                        }}
                        className="px-3 py-1 rounded-[6px] bg-forest text-white text-xs font-bold hover:bg-forest-hover transition cursor-pointer"
                      >
                        Review / Direct RFI
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 12. TAB 8: VARIATIONS TAB                                                 */}
      {/* ========================================================================= */}
      {activeTab === "VARIATIONS" && (
        <div className="rounded-[16px] bg-white border border-pebble/80 p-5 sm:p-6 shadow-2xs space-y-5 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-pebble/60">
            <div>
              <h2 className="text-lg font-bold text-onyx">Job Variations &amp; Change Orders</h2>
              <p className="text-xs text-ash mt-0.5">
                Scope changes, additional site conduits, and client-approved cost variations.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowRequestVariationModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-forest hover:bg-forest-hover text-white text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Request Variation</span>
            </button>
          </div>

          {variationsList.length === 0 ? (
            <div className="py-12 border-2 border-dashed border-pebble rounded-[14px] text-center space-y-2">
              <Layers className="h-10 w-10 text-ash mx-auto opacity-50" />
              <p className="text-sm font-semibold text-onyx">No variations requested</p>
              <p className="text-xs text-ash max-w-sm mx-auto">
                Scope changes, additional site works, and client-approved cost variations will appear here.
              </p>
              <button
                type="button"
                onClick={() => setShowRequestVariationModal(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-forest text-white rounded-[8px] text-xs font-bold hover:bg-forest-hover transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Request Variation</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              {variationsList.map((v) => (
                <div key={v.id} className="p-4 rounded-[12px] border border-pebble bg-white shadow-2xs space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-forest bg-forest/10 px-2 py-0.5 rounded-[4px] font-mono text-xs">
                        {v.variationNumber}
                      </span>
                      <span className="font-bold text-onyx">{v.title}</span>
                      <span className="text-[11px] text-ash bg-stone border border-pebble px-2 py-0.5 rounded-[4px]">
                        {liveJob.projectName} &bull; {liveJob.siteName || liveJob.location} &bull; {liveJob.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-black text-onyx text-sm">
                        ₹{(v.costImpact ?? v.amount ?? 0).toLocaleString("en-IN")}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          v.status === "Approved"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : v.status === "Rejected"
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {v.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-[8px] bg-stone/40 border border-pebble text-xs space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ash">Scope Description</p>
                    <p className="text-onyx whitespace-pre-wrap">{v.description || v.details}</p>
                    {v.additionalMaterials && (
                      <div className="pt-1 text-[11px] text-ash">
                        <span className="font-semibold text-onyx">Additional Materials: </span>
                        {v.additionalMaterials}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-ash pt-1 border-t border-pebble/50">
                    <div>
                      Raised by <span className="font-bold text-onyx">{v.createdBy || "Field Worker"}</span> ({v.creatorRole || "Field Worker"}) on {v.createdAt || v.date}
                    </div>
                    {v.attachments && v.attachments.length > 0 && (
                      <div className="flex items-center gap-1.5 text-forest font-semibold">
                        <FileText className="h-3.5 w-3.5" />
                        <span>{v.attachments[0].name}</span>
                      </div>
                    )}
                  </div>

                  {v.pmReviewNotes && (
                    <div className="p-2.5 rounded-[8px] bg-stone border border-pebble text-xs text-onyx">
                      <strong className="text-[10px] text-ash uppercase font-bold block">PM Review Remarks:</strong>
                      <span>{v.pmReviewNotes}</span>
                      {v.reviewedBy && (
                        <p className="text-[10px] text-ash mt-0.5">Signed off by {v.reviewedBy} on {v.reviewedAt}</p>
                      )}
                    </div>
                  )}

                  {/* PM Approve / Reject Actions */}
                  {(currentUser?.role === "PROJECT_MANAGER" || currentUser?.role === "OWNER" || currentUser?.role === "ACCOUNT_ADMIN") && v.status === "Awaiting PM Approval" && (
                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-pebble/50">
                      <button
                        type="button"
                        onClick={() => {
                          updateVariationStatus(v.id, "Rejected", "Rejected by Project Manager", currentUser?.name || "PM");
                          toast.error(`Variation ${v.variationNumber} rejected.`);
                        }}
                        className="px-3 py-1.5 rounded-[8px] bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition cursor-pointer"
                      >
                        Reject Variation
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateVariationStatus(v.id, "Approved", "Approved for site execution & cost accounting", currentUser?.name || "PM");
                          toast.success(`Variation ${v.variationNumber} approved!`);
                        }}
                        className="px-4 py-1.5 rounded-[8px] bg-forest hover:bg-[#083a2d] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                      >
                        Approve Variation
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 13. TAB 9: DOCUMENTS TAB                                                  */}
      {/* ========================================================================= */}
      {activeTab === "DOCUMENTS" && (
        <div className="rounded-[16px] bg-white border border-pebble/80 p-5 sm:p-6 shadow-2xs space-y-5 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-pebble/60">
            <div>
              <h2 className="text-lg font-bold text-onyx">Job Drawings &amp; Specifications</h2>
              <p className="text-xs text-ash mt-0.5">
                Single-line diagrams (SLD), CAD layouts, technical method statements, and work permits.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowUploadDocModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-forest hover:bg-forest-hover text-white text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Document</span>
            </button>
          </div>

          {documentsList.length === 0 ? (
            <div className="py-12 border-2 border-dashed border-pebble rounded-[14px] text-center space-y-2">
              <FileText className="h-10 w-10 text-ash mx-auto opacity-50" />
              <p className="text-sm font-semibold text-onyx">No documents attached</p>
              <p className="text-xs text-ash max-w-sm mx-auto">
                Upload single-line diagrams (SLD), CAD drawings, or safety method statements.
              </p>
              <button
                type="button"
                onClick={() => setShowUploadDocModal(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-forest text-white rounded-[8px] text-xs font-bold hover:bg-forest-hover transition cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Document</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              {documentsList.map((doc) => (
                <div key={doc.id} className="p-3.5 rounded-[12px] border border-pebble bg-stone/40 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-white border border-pebble text-forest shrink-0 font-bold">
                      {doc.type}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-onyx truncate">{doc.name}</p>
                      <p className="text-[11px] text-ash truncate">{doc.category} &bull; {doc.size}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => toast.success(`Viewing ${doc.name}`)}
                      className="px-2.5 py-1 bg-white border border-pebble rounded-[6px] font-semibold text-onyx hover:bg-stone transition cursor-pointer"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => toast.success(`Downloaded ${doc.name}`)}
                      className="p-1.5 bg-white border border-pebble rounded-[6px] text-ash hover:text-onyx transition cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 14. TAB 10: SAFETY TAB                                                    */}
      {/* ========================================================================= */}
      {activeTab === "SAFETY" && (
        <div className="rounded-[16px] bg-white border border-pebble/80 p-5 sm:p-6 shadow-2xs space-y-5 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-pebble/60">
            <div>
              <h2 className="text-lg font-bold text-onyx">Safety Inspections &amp; Clearances</h2>
              <p className="text-xs text-ash mt-0.5">
                PPE compliance audits, Lockout/Tagout verification, and daily hazards clearance.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowReportSafetyModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <ShieldAlert className="h-4 w-4" />
              <span>Report Safety Issue</span>
            </button>
          </div>

          {safetyList.length === 0 ? (
            <div className="py-12 border-2 border-dashed border-pebble rounded-[14px] text-center space-y-2">
              <ShieldCheck className="h-10 w-10 text-ash mx-auto opacity-50" />
              <p className="text-sm font-semibold text-onyx">No safety items or incidents logged</p>
              <p className="text-xs text-ash max-w-sm mx-auto">
                PPE compliance checks, LOTO clearances, and hazard notices will be displayed here.
              </p>
              <button
                type="button"
                onClick={() => setShowReportSafetyModal(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-amber-700 text-white rounded-[8px] text-xs font-bold hover:bg-amber-800 transition cursor-pointer"
              >
                <ShieldAlert className="h-4 w-4" />
                <span>Report Safety Issue</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              {safetyList.map((item) => (
                <div key={item.id} className="p-4 rounded-[12px] border border-pebble bg-emerald-50/40 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-700" />
                      <span className="font-bold text-onyx">{item.title}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-ash text-[11px]">{item.details} &bull; Verified on {item.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 15. TAB 11: PUNCH LISTS TAB                                               */}
      {/* ========================================================================= */}
      {activeTab === "PUNCH_LISTS" && (
        <div className="rounded-[16px] bg-white border border-pebble/80 p-5 sm:p-6 shadow-2xs space-y-5 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-pebble/60">
            <div>
              <h2 className="text-lg font-bold text-onyx">Punch Lists &amp; Snag Items</h2>
              <p className="text-xs text-ash mt-0.5">
                Defect tracking, snag resolutions, and pre-handover electrical checklists.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddPunchModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-forest hover:bg-forest-hover text-white text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Add Punch Item</span>
            </button>
          </div>

          {punchListsList.length === 0 ? (
            <div className="py-12 border-2 border-dashed border-pebble rounded-[14px] text-center space-y-2">
              <ListChecks className="h-10 w-10 text-ash mx-auto opacity-50" />
              <p className="text-sm font-semibold text-onyx">No punch items recorded</p>
              <p className="text-xs text-ash">
                All electrical installation checkpoints are currently snag-free.
              </p>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              {punchListsList.map((p) => (
                <div key={p.id} className="p-3.5 rounded-[12px] border border-pebble bg-white shadow-2xs flex items-center justify-between">
                  <div>
                    <p className="font-bold text-onyx">{p.title}</p>
                    <p className="text-[11px] text-ash">{p.location} &bull; {p.reportedDate}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 12: FINANCE & COSTS                                                   */}
      {/* ========================================================================= */}
      {activeTab === "FINANCE" && <JobFinanceTab job={liveJob} />}

      {/* ========================================================================= */}
      {/* MODALS SECTION                                                            */}
      {/* ========================================================================= */}

      {/* 1. Edit Details Modal */}
      {showEditDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-[16px] bg-white p-6 shadow-2xl border border-pebble space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-pebble">
              <h3 className="text-base font-bold text-onyx">Edit Job Specifications</h3>
              <button
                type="button"
                onClick={() => setShowEditDetailsModal(false)}
                className="p-1 text-ash hover:text-onyx"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDetails} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-onyx block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full rounded-[8px] border border-pebble p-2.5 text-onyx outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="font-semibold text-onyx block mb-1">Location</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full h-9 rounded-[8px] border border-pebble px-3 text-onyx outline-none focus:border-forest"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-onyx block mb-1">Start Date</label>
                  <input
                    type="text"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full h-9 rounded-[8px] border border-pebble px-3 text-onyx outline-none focus:border-forest"
                  />
                </div>
                <div>
                  <label className="font-semibold text-onyx block mb-1">Expected Duration</label>
                  <input
                    type="text"
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    className="w-full h-9 rounded-[8px] border border-pebble px-3 text-onyx outline-none focus:border-forest"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-onyx block mb-1">Safety Notes</label>
                <input
                  type="text"
                  value={editSafetyNotes}
                  onChange={(e) => setEditSafetyNotes(e.target.value)}
                  className="w-full h-9 rounded-[8px] border border-pebble px-3 text-onyx outline-none focus:border-forest"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-pebble">
                <button
                  type="button"
                  onClick={() => setShowEditDetailsModal(false)}
                  className="px-3.5 py-1.5 rounded-[8px] border border-pebble font-semibold text-ash hover:bg-stone"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-[8px] bg-forest hover:bg-forest-hover text-white font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Assign Crew Modal */}
      {showAssignCrewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-[16px] bg-white p-6 shadow-2xl border border-pebble space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-pebble">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-forest/10 flex items-center justify-center text-forest">
                  <HardHat className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-onyx">Assign Crew Member</h3>
                  <p className="text-[11px] text-ash">Select a registered Field Worker from database</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAssignCrewModal(false)}
                className="p-1 text-ash hover:text-onyx cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddCrew} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-onyx block mb-1">
                  Field Worker (from Database) *
                </label>
                {isLoadingDbWorkers ? (
                  <div className="flex items-center gap-2 p-3 rounded-[8px] border border-pebble bg-stone/40 text-ash text-xs">
                    <Clock className="h-4 w-4 animate-spin text-forest" />
                    <span>Loading workers from database...</span>
                  </div>
                ) : dbWorkers.length === 0 ? (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-[10px] text-amber-900 space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-xs">Database me koi Field Worker nahi mila</p>
                        <p className="text-[11px] text-amber-700 mt-0.5">
                          Manually kisi unknown person ko add karna allowed nahi hai. Job me assign karne ke liye worker pehle database me registered hona zaroori hai.
                        </p>
                      </div>
                    </div>
                    <div className="pt-1 flex flex-wrap gap-2 border-t border-amber-200/80">
                      <Link
                        href="/users"
                        onClick={() => setShowAssignCrewModal(false)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-amber-300 rounded-[6px] text-[11px] font-bold text-forest hover:bg-forest/10 transition"
                      >
                        <Users className="h-3 w-3" />
                        <span>Users &amp; Roles me add karein</span>
                      </Link>
                      <Link
                        href="/crew"
                        onClick={() => setShowAssignCrewModal(false)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-amber-300 rounded-[6px] text-[11px] font-bold text-forest hover:bg-forest/10 transition"
                      >
                        <HardHat className="h-3 w-3" />
                        <span>Crew Management me add karein</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <select
                      required
                      value={selectedWorkerId}
                      onChange={(e) => handleSelectWorker(e.target.value)}
                      className="w-full h-10 rounded-[8px] border border-pebble px-3 text-onyx outline-none focus:border-forest bg-white cursor-pointer font-medium"
                    >
                      <option value="">-- Choose Registered Field Worker --</option>
                      {dbWorkers.map((worker) => {
                        const isAlreadyAssigned = crewList.some(
                          (c) => c.name.trim().toLowerCase() === worker.name.trim().toLowerCase()
                        );
                        return (
                          <option
                            key={worker.id}
                            value={worker.id}
                            disabled={isAlreadyAssigned}
                          >
                            {worker.name} • {worker.role || worker.trade || "Field Worker"} {worker.email ? `(${worker.email})` : ""} {isAlreadyAssigned ? "— [Already Assigned]" : ""}
                          </option>
                        );
                      })}
                    </select>

                    {/* Selected Worker Verified Badge */}
                    {selectedWorkerId && (
                      <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-[8px] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          <div>
                            <p className="font-bold text-onyx text-xs">{newCrewName}</p>
                            <p className="text-[10px] text-ash">
                              {newCrewPhone ? `Phone: ${newCrewPhone}` : "Registered Field Worker"}
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          DB Verified
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-onyx block mb-1">Trade Role *</label>
                  <select
                    value={newCrewRole}
                    onChange={(e) => setNewCrewRole(e.target.value)}
                    className="w-full h-9 rounded-[8px] border border-pebble px-2.5 text-onyx outline-none focus:border-forest cursor-pointer"
                  >
                    <option value="Field Worker">Field Worker</option>
                    <option value="Electrician (Lead)">Electrician (Lead)</option>
                    <option value="Electrician">Electrician</option>
                    <option value="Helper">Helper</option>
                    <option value="General Construction">General Construction</option>
                    <option value="Safety Officer">Safety Officer</option>
                    <option value="Supervisor">Supervisor</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-onyx block mb-1">Status</label>
                  <select
                    value={newCrewStatus}
                    onChange={(e) =>
                      setNewCrewStatus(e.target.value as CrewMemberAssignment["status"])
                    }
                    className="w-full h-9 rounded-[8px] border border-pebble px-2.5 text-onyx outline-none focus:border-forest cursor-pointer"
                  >
                    <option value="On Site">On Site</option>
                    <option value="Travelling">Travelling</option>
                    <option value="Not Started">Not Started</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-onyx block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newCrewPhone}
                  onChange={(e) => setNewCrewPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full h-9 rounded-[8px] border border-pebble px-3 text-onyx outline-none focus:border-forest"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-pebble">
                <button
                  type="button"
                  onClick={() => setShowAssignCrewModal(false)}
                  className="px-3.5 py-1.5 rounded-[8px] border border-pebble font-semibold text-ash hover:bg-stone cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedWorkerId || dbWorkers.length === 0}
                  className="px-4 py-1.5 rounded-[8px] bg-forest hover:bg-forest-hover text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  Assign to Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add Material Modal */}
      {showAddMaterialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-[16px] bg-white p-6 shadow-2xl border border-pebble space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-pebble">
              <h3 className="text-base font-bold text-onyx">Add Job Material</h3>
              <button
                type="button"
                onClick={() => setShowAddMaterialModal(false)}
                className="p-1 text-ash hover:text-onyx"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddMaterial} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-onyx block mb-1">Material Name *</label>
                <input
                  required
                  type="text"
                  value={matName}
                  onChange={(e) => setMatName(e.target.value)}
                  placeholder="e.g. PVC Conduit 25mm"
                  className="w-full h-9 rounded-[8px] border border-pebble px-3 text-onyx outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="font-semibold text-onyx block mb-1">Quantity &amp; Unit *</label>
                <input
                  required
                  type="text"
                  value={matQty}
                  onChange={(e) => setMatQty(e.target.value)}
                  placeholder="e.g. 50 Meters"
                  className="w-full h-9 rounded-[8px] border border-pebble px-3 text-onyx outline-none focus:border-forest"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-pebble">
                <button
                  type="button"
                  onClick={() => setShowAddMaterialModal(false)}
                  className="px-3.5 py-1.5 rounded-[8px] border border-pebble font-semibold text-ash hover:bg-stone"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-[8px] bg-forest hover:bg-forest-hover text-white font-bold"
                >
                  Add Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Add Note Modal */}
      {showAddNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-[16px] bg-white p-6 shadow-2xl border border-pebble space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-pebble">
              <h3 className="text-base font-bold text-onyx">Add Site Note</h3>
              <button
                type="button"
                onClick={() => setShowAddNoteModal(false)}
                className="p-1 text-ash hover:text-onyx"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddNote} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-onyx block mb-1">Note Content *</label>
                <textarea
                  required
                  rows={4}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Type site observations or instructions..."
                  className="w-full rounded-[8px] border border-pebble p-2.5 text-onyx outline-none focus:border-forest"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-pebble">
                <button
                  type="button"
                  onClick={() => setShowAddNoteModal(false)}
                  className="px-3.5 py-1.5 rounded-[8px] border border-pebble font-semibold text-ash hover:bg-stone"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-[8px] bg-forest hover:bg-forest-hover text-white font-bold"
                >
                  Post Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Log Timesheet Modal */}
      {showLogTimesheetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-[16px] bg-white p-6 shadow-2xl border border-pebble space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-pebble">
              <h3 className="text-base font-bold text-onyx">Log Worker Timesheet</h3>
              <button
                type="button"
                onClick={() => setShowLogTimesheetModal(false)}
                className="p-1 text-ash hover:text-onyx"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleLogTimesheet} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-onyx block mb-1">Worker *</label>
                {crewList.length > 0 ? (
                  <select
                    value={tsWorker || crewList[0].name}
                    onChange={(e) => setTsWorker(e.target.value)}
                    className="w-full h-9 rounded-[8px] border border-pebble px-3 text-onyx outline-none focus:border-forest cursor-pointer"
                  >
                    {crewList.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.role})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={tsWorker}
                    onChange={(e) => setTsWorker(e.target.value)}
                    placeholder="Worker Name"
                    className="w-full h-9 rounded-[8px] border border-pebble px-3 text-onyx outline-none focus:border-forest"
                  />
                )}
              </div>

              <div>
                <label className="font-semibold text-onyx block mb-1">Hours Logged *</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="24"
                  value={tsHours}
                  onChange={(e) => setTsHours(e.target.value)}
                  className="w-full h-9 rounded-[8px] border border-pebble px-3 text-onyx outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="font-semibold text-onyx block mb-1">Task Description</label>
                <input
                  type="text"
                  value={tsDesc}
                  onChange={(e) => setTsDesc(e.target.value)}
                  placeholder="e.g. Completed DB installation and wire pulling"
                  className="w-full h-9 rounded-[8px] border border-pebble px-3 text-onyx outline-none focus:border-forest"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-pebble">
                <button
                  type="button"
                  onClick={() => setShowLogTimesheetModal(false)}
                  className="px-3.5 py-1.5 rounded-[8px] border border-pebble font-semibold text-ash hover:bg-stone"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-[8px] bg-forest hover:bg-forest-hover text-white font-bold"
                >
                  Save Timesheet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Raise RFI Modal */}
      {showRaiseRfiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-[16px] bg-white p-6 shadow-2xl border border-pebble space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-pebble">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-forest" />
                <h3 className="text-base font-bold text-onyx">Raise Technical RFI</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRaiseRfiModal(false)}
                className="p-1 text-ash hover:text-onyx"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-2.5 rounded-[8px] bg-stone text-xs text-ash space-y-0.5 border border-pebble/60">
              <span className="font-bold text-onyx block">{liveJob.projectName} &bull; {liveJob.siteName || liveJob.location}</span>
              <span>Job: {liveJob.id} &bull; Raised by: {currentUser?.name || "Salim"}</span>
            </div>

            <form onSubmit={handleRaiseRfi} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-onyx block mb-1">RFI Subject / Title *</label>
                <input
                  type="text"
                  required
                  value={rfiTitle}
                  onChange={(e) => setRfiTitle(e.target.value)}
                  placeholder="e.g. Electrical drawing clarification"
                  className="w-full h-9 rounded-[8px] border border-pebble px-3 text-onyx outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="font-semibold text-onyx block mb-1">Question / Clarification Details *</label>
                <textarea
                  required
                  rows={3}
                  value={rfiQuestion}
                  onChange={(e) => setRfiQuestion(e.target.value)}
                  placeholder="I need clarification about the electrical drawing..."
                  className="w-full rounded-[8px] border border-pebble p-2.5 text-onyx outline-none focus:border-forest"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-onyx block mb-1">Priority</label>
                  <select
                    value={rfiPriority}
                    onChange={(e) => setRfiPriority(e.target.value as "High" | "Medium" | "Low")}
                    className="w-full h-9 rounded-[8px] border border-pebble px-3 text-onyx outline-none focus:border-forest cursor-pointer"
                  >
                    <option value="High">High (Blocks Work)</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-onyx block mb-1">Attachment</label>
                  <input
                    type="text"
                    value={rfiAttachment}
                    onChange={(e) => setRfiAttachment(e.target.value)}
                    placeholder="e.g. drawing-rev2.pdf"
                    className="w-full h-9 rounded-[8px] border border-pebble px-3 text-onyx outline-none focus:border-forest"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-pebble">
                <button
                  type="button"
                  onClick={() => setShowRaiseRfiModal(false)}
                  className="px-3.5 py-1.5 rounded-[8px] border border-pebble font-semibold text-ash hover:bg-stone"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-[8px] bg-forest hover:bg-forest-hover text-white font-bold"
                >
                  Submit RFI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review RFI Modal (PM / Site Manager) */}
      {reviewingRfi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-[16px] bg-white p-6 shadow-2xl border border-pebble space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-pebble">
              <div>
                <span className="font-mono text-xs font-bold text-forest">{reviewingRfi.rfiNumber}</span>
                <h3 className="text-base font-bold text-onyx mt-0.5">Review Technical Query</h3>
              </div>
              <button
                type="button"
                onClick={() => setReviewingRfi(null)}
                className="p-1 text-ash hover:text-onyx"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 rounded-[8px] bg-stone text-xs text-onyx space-y-1 border border-pebble/60">
              <p className="font-bold text-onyx">{reviewingRfi.title}</p>
              <p className="text-ash">{reviewingRfi.question || reviewingRfi.description}</p>
              <p className="text-[11px] text-ash pt-1 border-t border-pebble/40">
                Raised by {reviewingRfi.createdBy} &bull; Job {reviewingRfi.jobId}
              </p>
            </div>

            <form onSubmit={handleSaveRfiReview} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-onyx block mb-1">Set RFI Status</label>
                <select
                  value={rfiReviewStatus}
                  onChange={(e) => setRfiReviewStatus(e.target.value as any)}
                  className="w-full h-9 rounded-[8px] border border-pebble px-3 text-onyx outline-none focus:border-forest cursor-pointer"
                >
                  <option value="Open">Open</option>
                  <option value="In Review">In Review</option>
                  <option value="Closed">Closed / Answered</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-onyx block mb-1">Technical Directive / Directive</label>
                <textarea
                  rows={3}
                  value={rfiReviewDirective}
                  onChange={(e) => setRfiReviewDirective(e.target.value)}
                  placeholder="Provide resolution or engineer guidance..."
                  className="w-full rounded-[8px] border border-pebble p-2.5 text-onyx outline-none focus:border-forest"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-pebble">
                <button
                  type="button"
                  onClick={() => setReviewingRfi(null)}
                  className="px-3.5 py-1.5 rounded-[8px] border border-pebble font-semibold text-ash hover:bg-stone"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-[8px] bg-forest hover:bg-forest-hover text-white font-bold"
                >
                  Save Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Request Variation Modal */}
      {showRequestVariationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-[16px] bg-white p-6 shadow-2xl border border-pebble space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-pebble">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5 text-amber-600" />
                <h3 className="text-base font-bold text-onyx">Request Job Variation</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRequestVariationModal(false)}
                className="p-1 text-ash hover:text-onyx"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-2.5 rounded-[8px] bg-stone text-xs text-ash space-y-0.5 border border-pebble/60">
              <span className="font-bold text-onyx block">{liveJob.projectName} &bull; {liveJob.siteName || liveJob.location}</span>
              <span>Job: {liveJob.id} &bull; Requested by: {currentUser?.name || "Salim"}</span>
            </div>

            <form onSubmit={handleRequestVariation} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-onyx block mb-1">Variation Title / Scope *</label>
                <input
                  required
                  type="text"
                  value={varTitle}
                  onChange={(e) => setVarTitle(e.target.value)}
                  placeholder="e.g. Additional conduit routes in server room"
                  className="w-full h-9 rounded-[8px] border border-pebble px-3 text-onyx outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="font-semibold text-onyx block mb-1">Scope Explanation *</label>
                <textarea
                  required
                  rows={2.5}
                  value={varDescription}
                  onChange={(e) => setVarDescription(e.target.value)}
                  placeholder="Explain why scope modified on site..."
                  className="w-full rounded-[8px] border border-pebble p-2 text-onyx outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="font-semibold text-onyx block mb-1">Additional Materials</label>
                <input
                  type="text"
                  value={varMaterials}
                  onChange={(e) => setVarMaterials(e.target.value)}
                  placeholder="e.g. 50m PVC conduit, 2x junction boxes"
                  className="w-full h-9 rounded-[8px] border border-pebble px-3 text-onyx outline-none focus:border-forest"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-onyx block mb-1">Estimated Cost (₹) *</label>
                  <input
                    required
                    type="number"
                    value={varAmount}
                    onChange={(e) => setVarAmount(e.target.value)}
                    placeholder="15000"
                    className="w-full h-9 rounded-[8px] border border-pebble px-3 text-onyx outline-none focus:border-forest font-semibold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-onyx block mb-1">Schedule Impact</label>
                  <input
                    type="text"
                    value={varImpact}
                    onChange={(e) => setVarImpact(e.target.value)}
                    placeholder="+2 Days"
                    className="w-full h-9 rounded-[8px] border border-pebble px-3 text-onyx outline-none focus:border-forest"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-onyx block mb-1">Attachment</label>
                <input
                  type="text"
                  value={varAttachment}
                  onChange={(e) => setVarAttachment(e.target.value)}
                  placeholder="e.g. site-markup.pdf"
                  className="w-full h-9 rounded-[8px] border border-pebble px-3 text-onyx outline-none focus:border-forest"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-pebble">
                <button
                  type="button"
                  onClick={() => setShowRequestVariationModal(false)}
                  className="px-3.5 py-1.5 rounded-[8px] border border-pebble font-semibold text-ash hover:bg-stone"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-[8px] bg-forest hover:bg-forest-hover text-white font-bold"
                >
                  Submit Variation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Upload Document Modal */}
      {showUploadDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-[16px] bg-white p-6 shadow-2xl border border-pebble space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-pebble">
              <h3 className="text-base font-bold text-onyx">Upload Drawing or Spec</h3>
              <button
                type="button"
                onClick={() => setShowUploadDocModal(false)}
                className="p-1 text-ash hover:text-onyx"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUploadDoc} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-onyx block mb-1">Document Name *</label>
                <input
                  required
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. Electrical_Panel_Detail_v1.pdf"
                  className="w-full h-9 rounded-[8px] border border-pebble px-3 text-onyx outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="font-semibold text-onyx block mb-1">Category</label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value as JobDocument["category"])}
                  className="w-full h-9 rounded-[8px] border border-pebble px-3 text-onyx outline-none focus:border-forest cursor-pointer"
                >
                  <option value="Drawings">Drawings &amp; Schematics</option>
                  <option value="Specifications">Technical Specifications</option>
                  <option value="Permits">Work Permits</option>
                  <option value="Manuals">Manuals &amp; Guidelines</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-pebble">
                <button
                  type="button"
                  onClick={() => setShowUploadDocModal(false)}
                  className="px-3.5 py-1.5 rounded-[8px] border border-pebble font-semibold text-ash hover:bg-stone"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-[8px] bg-forest hover:bg-forest-hover text-white font-bold"
                >
                  Attach Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Report Safety Issue Modal */}
      {showReportSafetyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-[16px] bg-white p-6 shadow-2xl border border-pebble space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-pebble">
              <h3 className="text-base font-bold text-onyx">Log Safety Issue / Checklist</h3>
              <button
                type="button"
                onClick={() => setShowReportSafetyModal(false)}
                className="p-1 text-ash hover:text-onyx"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleReportSafety} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-onyx block mb-1">Safety Issue Title *</label>
                <input
                  required
                  type="text"
                  value={safetyTitle}
                  onChange={(e) => setSafetyTitle(e.target.value)}
                  placeholder="e.g. Exposed cabling near Zone 1 walkway"
                  className="w-full h-9 rounded-[8px] border border-pebble px-3 text-onyx outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="font-semibold text-onyx block mb-1">Issue Type</label>
                <select
                  value={safetyType}
                  onChange={(e) => setSafetyType(e.target.value as JobSafetyItem["type"])}
                  className="w-full h-9 rounded-[8px] border border-pebble px-3 text-onyx outline-none focus:border-forest cursor-pointer"
                >
                  <option value="Hazard">Physical Hazard</option>
                  <option value="PPE">PPE Violation</option>
                  <option value="Clearance">Clearance Missing</option>
                  <option value="Incident">Incident Report</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-onyx block mb-1">Action / Details</label>
                <textarea
                  rows={3}
                  value={safetyDetails}
                  onChange={(e) => setSafetyDetails(e.target.value)}
                  placeholder="Describe corrective action taken or required..."
                  className="w-full rounded-[8px] border border-pebble p-2.5 text-onyx outline-none focus:border-forest"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-pebble">
                <button
                  type="button"
                  onClick={() => setShowReportSafetyModal(false)}
                  className="px-3.5 py-1.5 rounded-[8px] border border-pebble font-semibold text-ash hover:bg-stone"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-[8px] bg-amber-700 hover:bg-amber-800 text-white font-bold"
                >
                  Log Safety Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10. Add Punch Item Modal */}
      {showAddPunchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-[16px] bg-white p-6 shadow-2xl border border-pebble space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-pebble">
              <h3 className="text-base font-bold text-onyx">Add Punch Item / Snag</h3>
              <button
                type="button"
                onClick={() => setShowAddPunchModal(false)}
                className="p-1 text-ash hover:text-onyx"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddPunch} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-onyx block mb-1">Item Title *</label>
                <input
                  required
                  type="text"
                  value={punchTitle}
                  onChange={(e) => setPunchTitle(e.target.value)}
                  placeholder="e.g. Loose DB cover screw on Panel 2"
                  className="w-full h-9 rounded-[8px] border border-pebble px-3 text-onyx outline-none focus:border-forest"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-onyx block mb-1">Location</label>
                  <input
                    type="text"
                    value={punchLocation}
                    onChange={(e) => setPunchLocation(e.target.value)}
                    placeholder="Block A, 2nd Floor"
                    className="w-full h-9 rounded-[8px] border border-pebble px-3 text-onyx outline-none focus:border-forest"
                  />
                </div>
                <div>
                  <label className="font-semibold text-onyx block mb-1">Severity</label>
                  <select
                    value={punchSeverity}
                    onChange={(e) => setPunchSeverity(e.target.value as "High" | "Medium" | "Low")}
                    className="w-full h-9 rounded-[8px] border border-pebble px-3 text-onyx outline-none focus:border-forest cursor-pointer"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-pebble">
                <button
                  type="button"
                  onClick={() => setShowAddPunchModal(false)}
                  className="px-3.5 py-1.5 rounded-[8px] border border-pebble font-semibold text-ash hover:bg-stone"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-[8px] bg-forest hover:bg-forest-hover text-white font-bold"
                >
                  Record Snag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 11. Photo Upload / Lightbox Modal */}
      {showPhotoModal && (
        <JobPhotoModal
          job={liveJob}
          isOpen={showPhotoModal}
          onClose={() => setShowPhotoModal(false)}
          currentUserId={currentUser?.id?.toString() || "user-1"}
          currentUserName={currentUser?.name || "Site Manager"}
        />
      )}

      {/* 12. Early Travel Confirmation Modal */}
      {showEarlyTravelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-[16px] bg-white border border-pebble p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-pebble/60 pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <h3 className="text-base font-bold text-onyx">Early Travel Confirmation</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEarlyTravelModal(false)}
                className="text-ash hover:text-onyx cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-[10px] bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-xs">
                  <Calendar className="h-4 w-4 text-amber-700 shrink-0" />
                  <span>
                    Work Order scheduled for{" "}
                    {getJobScheduleState(liveJob.startDate || liveJob.due).scheduledDateFormatted} (
                    {getJobScheduleState(liveJob.startDate || liveJob.due).category === "TOMORROW"
                      ? "Tomorrow"
                      : "Future Date"}
                    )
                  </span>
                </p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  This work order is scheduled for a future date. Setting status to <strong>Travelling</strong> now indicates early mobilization ahead of the scheduled date.
                </p>
              </div>

              <div className="p-3 rounded-[8px] bg-stone/70 border border-pebble space-y-1">
                <p className="font-bold text-onyx">{liveJob.id}: {liveJob.title}</p>
                <p className="text-[11px] text-ash">
                  Assigned To: {liveJob.assignee} &bull; Site: {liveJob.projectName || liveJob.location}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 border-t border-pebble/60">
              <button
                type="button"
                onClick={() => setShowEarlyTravelModal(false)}
                className="px-3.5 py-2 rounded-[8px] bg-stone hover:bg-mist text-ash hover:text-onyx font-bold text-xs transition cursor-pointer"
              >
                Cancel (Keep Current Status)
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEarlyTravelModal(false);
                  updateJobStatus(liveJob.id, "Travelling");
                  toast.success(`${liveJob.id}: Status changed to Travelling (early mobilization confirmed).`);
                }}
                className="px-4 py-2 rounded-[8px] bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Confirm &amp; Start Travel Early</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
