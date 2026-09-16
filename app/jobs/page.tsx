"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import FirmaLayout from "@/components/layout/FirmaLayout";
import {
  useTenderFlowStore,
  AwardedContractor,
  JobItem,
} from "@/store/tenderFlowStore";
import { useLeadFlowStore } from "@/store/leadFlowStore";
import { useSchedulingStore } from "@/store/schedulingStore";
import { useAuthStore } from "@/store/authStore";
import { db, type User as DbUser } from "@/lib/db";
import {
  Briefcase,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Square,
  CheckSquare,
  MapPin,
  HardHat,
  User,
  Calendar,
  AlertCircle,
  X,
  ArrowRight,
  Gavel,
  Check,
  ChevronDown,
  Camera,
  Eye,
  Sparkles,
  Info,
} from "lucide-react";
import JobPhotoModal from "@/components/jobs/JobPhotoModal";
import JobDetailView from "@/components/jobs/JobDetailView";

function JobsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUser = useAuthStore((state) => state.currentUser);
  const initialContractorId = searchParams.get("contractorId");
  const autoOpenAssign = searchParams.get("openAssign") === "true";
  const initialJobId = searchParams.get("jobId");

  const [selectedJobId, setSelectedJobId] = useState<string | null>(
    initialJobId || null
  );

  useEffect(() => {
    const paramJobId = searchParams.get("jobId");
    if (paramJobId) {
      setSelectedJobId(paramJobId);
    }
  }, [searchParams]);

  const {
    jobs = [],
    contractors = [],
    assignJobToContractor,
    toggleJob,
    updateJobStatus,
  } = useTenderFlowStore();

  const selectedJob = useMemo(() => {
    if (!selectedJobId) return null;
    return (jobs || []).find((j) => j.id === selectedJobId) || null;
  }, [jobs, selectedJobId]);

  const { scheduledJobs = [] } = useSchedulingStore();

  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  // Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigneeType, setAssigneeType] = useState<"CONTRACTOR" | "INTERNAL">(
    "CONTRACTOR"
  );
  const [selectedContractorId, setSelectedContractorId] = useState<string>("");
  const [internalAssignee, setInternalAssignee] = useState<string>("");
  const [teamUsers, setTeamUsers] = useState<DbUser[]>([]);
  const [jobTitle, setJobTitle] = useState("");
  const [jobProject, setJobProject] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [jobPriority, setJobPriority] = useState<"High" | "Medium" | "Low">("High");
  const [jobDue, setJobDue] = useState("Today");
  const [jobDescription, setJobDescription] = useState("");

  useEffect(() => {
    db.users.toArray().then((users) => {
      setTeamUsers(users);
      if (users.length > 0) {
        setInternalAssignee(users[0].name);
      }
    }).catch(() => {});
  }, []);

  // Reassign Modal State
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignTargetJob, setReassignTargetJob] = useState<JobItem | null>(null);
  const [reassignContractorId, setReassignContractorId] = useState("");

  // Field Worker Photos Modal State
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoTargetJob, setPhotoTargetJob] = useState<JobItem | null>(null);

  // Pre-fill from URL param if available
  useEffect(() => {
    if (initialContractorId && contractors.length > 0) {
      const found = contractors.find((c) => c.id === initialContractorId);
      if (found) {
        setAssigneeType("CONTRACTOR");
        setSelectedContractorId(found.id);
        setJobTitle(`Site Execution – ${found.trade} (${found.projectName})`);
        setJobProject(found.projectName);
        setJobLocation(`${found.projectName}, Site Zone 1`);
        setShowAssignModal(true);
      }
    } else if (autoOpenAssign && contractors.length > 0) {
      const first = contractors[0];
      setAssigneeType("CONTRACTOR");
      setSelectedContractorId(first.id);
      setJobTitle(`Site Execution – ${first.trade} (${first.projectName})`);
      setJobProject(first.projectName);
      setJobLocation(`${first.projectName}, Site Zone 1`);
      setShowAssignModal(true);
    }
  }, [initialContractorId, autoOpenAssign, contractors]);

  // Handle Contractor Selection Change in Modal
  const handleContractorSelect = (contractorId: string) => {
    setSelectedContractorId(contractorId);
    const contractor = contractors.find((c) => c.id === contractorId);
    if (contractor) {
      setJobTitle(`Execute ${contractor.trade} Works – ${contractor.projectName}`);
      setJobProject(contractor.projectName);
      setJobLocation(`${contractor.projectName}, Main Site Area`);
      setJobDescription(
        `Execute trade work scope per awarded tender #${contractor.tenderId}. Ensure quality sign-off.`
      );
    }
  };

  // Open Dispatch Modal
  const handleOpenDispatchModal = () => {
    const firstProject = useLeadFlowStore.getState().projects[0];
    if (contractors.length > 0) {
      const first = contractors[0];
      setAssigneeType("CONTRACTOR");
      setSelectedContractorId(first.id);
      setJobTitle(`Execute ${first.trade} Works – ${first.projectName}`);
      setJobProject(first.projectName);
      setJobLocation(`${first.projectName} Site`);
    } else {
      setAssigneeType("INTERNAL");
      setJobTitle("Site Inspection & Verification");
      setJobProject(firstProject?.name || "");
      setJobLocation(firstProject?.location || "");
    }
    setJobPriority("High");
    setJobDue("Tomorrow");
    setJobDescription("");
    setShowAssignModal(true);
  };

  // Submit Job Assignment
  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (assigneeType === "CONTRACTOR") {
      const contractor = contractors.find((c) => c.id === selectedContractorId);
      if (!contractor) {
        alert("Please select an awarded contractor.");
        return;
      }

      assignJobToContractor({
        title: jobTitle,
        projectName: jobProject || contractor.projectName,
        location: jobLocation || `${contractor.projectName} Site`,
        contractorId: contractor.id,
        contractorName: contractor.name,
        trade: contractor.trade,
        priority: jobPriority,
        due: jobDue,
        description: jobDescription,
        tenderId: contractor.tenderId,
      });

      alert(`Job assigned successfully to ${contractor.name}!`);
    } else {
      // Internal staff job
      const firstProject = useLeadFlowStore.getState().projects[0];
      assignJobToContractor({
        title: jobTitle,
        projectName: jobProject || firstProject?.name || "Main Site",
        location: jobLocation || firstProject?.location || "Project Site",
        contractorId: "",
        contractorName: internalAssignee || "Site Team",
        priority: jobPriority,
        due: jobDue,
        description: jobDescription,
      });
      alert(`Job assigned to ${internalAssignee || "Site Team"}!`);
    }

    setShowAssignModal(false);
  };

  // Submit Reassign
  const handleReassignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignTargetJob || !reassignContractorId) return;

    const contractor = contractors.find((c) => c.id === reassignContractorId);
    if (!contractor) return;

    // Remove old job and replace with reassigned
    assignJobToContractor({
      title: reassignTargetJob.title,
      projectName: reassignTargetJob.projectName,
      location: reassignTargetJob.location,
      contractorId: contractor.id,
      contractorName: contractor.name,
      trade: contractor.trade,
      priority: reassignTargetJob.priority,
      due: reassignTargetJob.due,
      description: reassignTargetJob.description,
      tenderId: contractor.tenderId,
    });

    setShowReassignModal(false);
    alert(`Work order successfully reassigned to ${contractor.name}!`);
  };

  // Filter Jobs
  const filtered = useMemo(() => {
    return (jobs || []).filter((j) => {
      const matchSearch =
        j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.assignee.toLowerCase().includes(search.toLowerCase()) ||
        j.location.toLowerCase().includes(search.toLowerCase()) ||
        (j.projectName && j.projectName.toLowerCase().includes(search.toLowerCase()));

      let matchTab = true;
      if (filter === "CONTRACTOR_JOBS") {
        matchTab = Boolean(j.isContractorJob);
      } else if (filter === "WITH_PHOTOS") {
        matchTab = Boolean(j.photos && j.photos.length > 0);
      } else if (filter === "SCHEDULED") {
        matchTab = j.status === "Scheduled" || scheduledJobs.some((sj) => sj.id === j.id);
      } else if (filter === "IN_PROGRESS") {
        matchTab = j.status === "In Progress" || (!j.completed && j.status !== "Scheduled");
      } else if (filter === "COMPLETED") {
        matchTab = j.completed || j.status === "Completed";
      }

      return matchSearch && matchTab;
    });
  }, [jobs, search, filter]);

  const completedCount = jobs.filter((j) => j.completed).length;
  const activeCount = jobs.filter((j) => !j.completed).length;
  const contractorJobsCount = jobs.filter((j) => j.isContractorJob).length;
  const withPhotosCount = jobs.filter((j) => j.photos && j.photos.length > 0).length;

  // Unassigned Awarded Contractors (contractors with 0 jobs)
  const unassignedContractors = useMemo(() => {
    return contractors.filter((c) => {
      const jobCount = jobs.filter((j) => j.contractorId === c.id).length;
      return jobCount === 0;
    });
  }, [contractors, jobs]);

  // If a job is selected (e.g. clicked on card or ?jobId=JOB-401), render the dedicated Figma Job Detail View!
  if (selectedJob) {
    return (
      <FirmaLayout activeNav="Jobs">
        <JobDetailView
          job={selectedJob}
          onBack={() => {
            setSelectedJobId(null);
            router.push("/jobs");
          }}
          onOpenSchedule={() => {
            router.push(`/scheduling?jobId=${selectedJob.id}&openSchedule=true`);
          }}
          onOpenReassign={() => {
            setReassignTargetJob(selectedJob);
            setReassignContractorId(
              selectedJob.contractorId || (contractors[0]?.id || "")
            );
            setShowReassignModal(true);
          }}
        />

        {/* Reassign Modal if opened from detail view */}
        {showReassignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-onyx/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-md rounded-[16px] bg-white p-6 shadow-2xl border border-pebble relative">
              <button
                type="button"
                onClick={() => setShowReassignModal(false)}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-ash hover:bg-stone hover:text-onyx transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3 pb-3 border-b border-pebble">
                <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-forest text-white">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-onyx">
                    Reassign Work Order
                  </h2>
                  <p className="text-xs text-ash">
                    Assign {reassignTargetJob?.id} to a different contractor
                  </p>
                </div>
              </div>

              <form onSubmit={handleReassignSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-onyx mb-1.5">
                    Select New Contractor
                  </label>
                  <select
                    value={reassignContractorId}
                    onChange={(e) => setReassignContractorId(e.target.value)}
                    className="w-full h-9.5 px-3 text-xs bg-stone text-onyx font-medium rounded-[8px] border border-pebble outline-none focus:border-forest cursor-pointer"
                  >
                    {contractors.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.trade} • {c.projectName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-pebble">
                  <button
                    type="button"
                    onClick={() => setShowReassignModal(false)}
                    className="px-4 py-2 rounded-[8px] text-xs font-semibold text-ash hover:bg-stone transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4.5 py-2 rounded-[8px] bg-forest hover:bg-forest-hover text-white text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    Confirm Reassign
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </FirmaLayout>
    );
  }

  return (
    <FirmaLayout activeNav="Jobs">
      <div className="space-y-6 mt-4 pb-12">
        {/* ========================================================================= */}
        {/* HEADER SECTION                                                            */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-pebble/60">
          <div>
            <span className="text-eyebrow font-semibold tracking-wider text-ash uppercase">
              FIELD &amp; SITE OPERATIONS
            </span>
            <h1 className="text-display-h1 font-bold text-onyx mt-0.5 tracking-tight flex items-center gap-2.5">
              <Briefcase className="h-6 w-6 text-forest" />
              <span>Active Jobs &amp; Work Orders</span>
            </h1>
            <p className="text-sm text-ash mt-1">
              Coordinate field technicians, dispatch awarded trade contractors, and track site milestones.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => router.push("/contractors")}
              className="flex items-center gap-2 rounded-[10px] bg-white border border-pebble hover:bg-stone text-onyx px-3.5 py-2 text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <HardHat className="h-4 w-4 text-forest" />
              <span>Contractors Directory ({contractors.length})</span>
            </button>
            {currentUser?.role === "SITE_MANAGER" ? (
              <button
                type="button"
                onClick={() => router.push("/scheduling")}
                className="flex items-center gap-2 rounded-[10px] bg-forest hover:bg-forest-hover text-white px-4 py-2 text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <Calendar className="h-4 w-4" />
                <span>View Schedule</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenDispatchModal}
                className="flex items-center gap-2 rounded-[10px] bg-forest hover:bg-forest-hover text-white px-4 py-2 text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                <span>Dispatch / Assign Job</span>
              </button>
            )}
          </div>
        </div>

        {/* Site Manager Callout Banner (Matching Screen 4) */}
        {currentUser?.role === "SITE_MANAGER" && (
          <div className="rounded-[12px] bg-amber-50/80 border border-amber-200 p-3.5 shadow-2xs flex items-center gap-2.5 text-xs text-amber-900 animate-in fade-in duration-150">
            <Info className="h-4 w-4 text-amber-600 shrink-0" />
            <span className="font-semibold">
              Site Manager can view, schedule and manage (&apos;Create Job&apos; hidden if only PM can create)
            </span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PROMPT BANNER: AWARDED CONTRACTOR READY FOR JOB ASSIGNMENT                */}
        {/* ========================================================================= */}
        {unassignedContractors.length > 0 && (
          <div className="rounded-[12px] bg-clear-bg border border-success/40 p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest text-white shrink-0 shadow-xs">
                <HardHat className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-onyx">
                  {unassignedContractors.length === 1
                    ? `Awarded Contractor "${unassignedContractors[0].name}" (${unassignedContractors[0].trade}) is ready for work assignment!`
                    : `${unassignedContractors.length} Awarded Contractors are ready for work order dispatch!`}
                </p>
                <p className="text-xs text-ash mt-0.5">
                  Tender awarded for {unassignedContractors[0].projectName}. Assign a job order to start on-site execution.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                handleContractorSelect(unassignedContractors[0].id);
                setShowAssignModal(true);
              }}
              className="bg-forest hover:bg-forest-hover text-white text-xs font-bold px-4 py-2 rounded-[8px] shadow-xs cursor-pointer whitespace-nowrap self-stretch sm:self-auto flex items-center gap-1.5 justify-center"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Assign Job to {unassignedContractors[0].name.split(" ")[0]}</span>
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3 KPI SUMMARY CARDS                                                       */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-[12px] bg-white p-4.5 border border-pebble flex items-center gap-3.5 shadow-2xs">
            <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-breath text-onyx shrink-0">
              <Briefcase className="h-5 w-5 text-forest" />
            </div>
            <div>
              <span className="text-xs font-semibold text-ash">Total Work Orders</span>
              <p className="text-2xl font-bold text-onyx mt-0.5">{jobs.length}</p>
              <p className="text-xs font-medium text-forest mt-0.5">
                {contractorJobsCount} assigned to contractors
              </p>
            </div>
          </div>

          <div className="rounded-[12px] bg-white p-4.5 border border-pebble flex items-center gap-3.5 shadow-2xs">
            <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-caution-bg text-caution-text shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-ash">Active Site Work</span>
              <p className="text-2xl font-bold text-onyx mt-0.5">{activeCount}</p>
              <p className="text-xs font-medium text-caution-text mt-0.5">
                In progress &amp; scheduled
              </p>
            </div>
          </div>

          <div className="rounded-[12px] bg-white p-4.5 border border-pebble flex items-center gap-3.5 shadow-2xs">
            <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-clear-bg text-success-text shrink-0">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <span className="text-xs font-semibold text-ash">Completed &amp; Signed</span>
              <p className="text-2xl font-bold text-onyx mt-0.5">{completedCount}</p>
              <p className="text-xs font-medium text-success-text mt-0.5">
                Quality verified
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FILTER TABS & SEARCH BAR                                                  */}
        {/* ========================================================================= */}
        <div className="rounded-[12px] bg-white p-3 border border-pebble flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {[
              { key: "ALL", label: `All Jobs (${jobs.length})` },
              { key: "CONTRACTOR_JOBS", label: `Contractor Jobs (${contractorJobsCount})` },
              { key: "WITH_PHOTOS", label: `📸 Field Photos (${withPhotosCount})` },
              { key: "SCHEDULED", label: "Scheduled" },
              { key: "IN_PROGRESS", label: "In Progress" },
              { key: "COMPLETED", label: "Completed" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`px-3.5 py-1.5 rounded-[8px] text-xs font-semibold transition cursor-pointer shrink-0 ${
                  filter === tab.key
                    ? "bg-forest text-white shadow-xs"
                    : "bg-stone text-ash hover:bg-mist hover:text-onyx"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="h-3.5 w-3.5 text-ash absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search job, contractor, or project..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs text-onyx placeholder:text-ash bg-stone rounded-[8px] border border-pebble outline-none focus:border-forest transition"
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* JOBS LIST                                                                 */}
        {/* ========================================================================= */}
        <div className="rounded-[14px] bg-white p-5 border border-pebble space-y-3 shadow-2xs">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-ash space-y-2">
              <Briefcase className="h-8 w-8 mx-auto text-ash/60" />
              <p className="text-sm font-semibold text-onyx">No work orders found</p>
              <p className="text-xs text-ash">
                Try a different filter or click &quot;Dispatch / Assign Job&quot; to assign a new job.
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedJobId(item.id);
                  router.push(`/jobs?jobId=${item.id}`);
                }}
                className={`flex flex-col gap-3.5 p-4.5 rounded-[12px] border transition cursor-pointer hover:border-forest hover:shadow-xs ${
                  item.completed
                    ? "bg-stone/50 border-pebble/70 opacity-60"
                    : item.isContractorJob
                    ? "bg-white border-forest/30 shadow-2xs hover:border-forest"
                    : "bg-white border-pebble hover:border-onyx"
                }`}
              >
                {/* Top Row: Job Info (Left) and Assignee / Actions (Right) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left Side: Checkbox & Info */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleJob(item.id);
                      }}
                      className="text-ash hover:text-onyx shrink-0 cursor-pointer mt-0.5"
                    >
                      {item.completed ? (
                        <CheckSquare className="h-5 w-5 text-forest stroke-[2.5]" />
                      ) : (
                        <Square className="h-5 w-5 text-ash" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-eyebrow font-bold text-ash uppercase">
                          {item.id}
                        </span>
                        <span
                          className={`text-eyebrow font-semibold px-2 py-0.5 rounded-full border ${item.priorityColor}`}
                        >
                          {item.priority}
                        </span>

                        {item.isContractorJob && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-breath text-forest border border-forest/20">
                            <HardHat className="h-3 w-3" />
                            <span>Awarded Contractor</span>
                          </span>
                        )}

                        {item.trade && (
                          <span className="text-[10px] font-semibold text-ash bg-stone px-2 py-0.5 rounded-md border border-pebble">
                            {item.trade}
                          </span>
                        )}
                      </div>

                      <h3
                        className={`text-sm mt-1 truncate ${
                          item.completed
                            ? "line-through text-ash"
                            : "font-bold text-onyx"
                        }`}
                      >
                        {item.title}
                      </h3>

                      <p className="text-xs text-ash flex items-center gap-1.5 mt-0.5">
                        <MapPin className="h-3 w-3 shrink-0 text-forest" />
                        <span>{item.location}</span>
                        {item.projectName && (
                          <>
                            <span className="text-pebble">•</span>
                            <span className="font-semibold text-onyx">
                              {item.projectName}
                            </span>
                          </>
                        )}
                      </p>

                      {item.description && (
                        <p className="text-[11px] text-ash/90 mt-1 max-w-xl italic">
                          &quot;{item.description}&quot;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Assignee, Schedule, Due Date, Photo Quick Button, and Reassign */}
                  <div className="flex items-center justify-between sm:justify-end gap-3.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-pebble/50">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-semibold text-ash block uppercase">
                        {item.isContractorJob ? "Contractor Partner" : "Assigned To"}
                      </span>
                      <span className="text-xs font-bold text-onyx flex items-center sm:justify-end gap-1 mt-0.5">
                        {item.isContractorJob && (
                          <HardHat className="h-3.5 w-3.5 text-forest" />
                        )}
                        <span>{item.assignee}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Schedule Button */}
                      {(() => {
                        const isScheduled =
                          item.status === "Scheduled" ||
                          scheduledJobs.some((sj) => sj.id === item.id);
                        return (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(
                                `/scheduling?jobId=${item.id}&openSchedule=true`
                              );
                            }}
                            className={`px-2.5 py-1 rounded-[6px] text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                              isScheduled
                                ? "border-success/30 bg-clear-bg text-success-text hover:bg-clear-bg/80"
                                : "border-forest/40 bg-breath text-forest hover:bg-forest hover:text-white"
                            }`}
                            title={
                              isScheduled
                                ? "Job is scheduled on calendar (click to view/edit)"
                                : "Click to schedule worker & date on calendar"
                            }
                          >
                            {isScheduled ? (
                              <CheckCircle2 className="h-3 w-3 text-success" />
                            ) : (
                              <Calendar className="h-3 w-3" />
                            )}
                            <span>{isScheduled ? "Scheduled" : "Schedule"}</span>
                          </button>
                        );
                      })()}

                      {/* Due Badge */}
                      <div className="bg-stone border border-pebble px-2.5 py-1 rounded-[6px] text-xs font-medium text-onyx">
                        {item.due}
                      </div>

                      {/* Quick Photo Inspection Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedJobId(item.id);
                          router.push(`/jobs?jobId=${item.id}`);
                        }}
                        className={`px-2.5 py-1 rounded-[6px] text-xs font-bold border transition cursor-pointer flex items-center gap-1 shadow-2xs ${
                          item.photos && item.photos.length > 0
                            ? "border-forest/30 bg-breath text-forest hover:bg-forest hover:text-white"
                            : "border-pebble bg-stone text-ash hover:text-onyx"
                        }`}
                        title={
                          item.photos && item.photos.length > 0
                            ? `View ${item.photos.length} field photos`
                            : "Attach field photo"
                        }
                      >
                        <Camera className="h-3 w-3" />
                        <span>{item.photos?.length || 0}</span>
                      </button>

                      {/* Reassign / Change Assignee Button */}
                      {contractors.length > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setReassignTargetJob(item);
                            setReassignContractorId(
                              item.contractorId || contractors[0].id
                            );
                            setShowReassignModal(true);
                          }}
                          className="p-1 text-ash hover:text-forest hover:bg-stone rounded-md transition cursor-pointer text-xs"
                          title="Reassign to Contractor"
                        >
                          <User className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Field Worker Photo Evidence Strip */}
                {item.photos && item.photos.length > 0 ? (
                  <div className="pt-3 border-t border-pebble/60 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-stone/30 rounded-[10px] p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Photo Thumbnails */}
                      <div className="flex items-center -space-x-2 shrink-0">
                        {item.photos.slice(0, 4).map((photo, pIdx) => (
                          <div
                            key={photo.id || pIdx}
                            onClick={() => {
                              setPhotoTargetJob(item);
                              setShowPhotoModal(true);
                            }}
                            className="h-11 w-14 rounded-[7px] overflow-hidden border-2 border-white shadow-xs bg-stone cursor-pointer hover:scale-110 hover:z-10 transition duration-150 relative group"
                            title={photo.caption || "Click to inspect photo"}
                          >
                            <img
                              src={photo.url}
                              alt="Site Evidence"
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                              <Eye className="h-3 w-3 text-white" />
                            </div>
                          </div>
                        ))}
                        {item.photos.length > 4 && (
                          <div
                            onClick={() => {
                              setPhotoTargetJob(item);
                              setShowPhotoModal(true);
                            }}
                            className="h-11 w-11 rounded-[7px] bg-onyx text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xs cursor-pointer"
                          >
                            +{item.photos.length - 4}
                          </div>
                        )}
                      </div>

                      {/* Info & Attribution */}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-onyx flex items-center gap-1.5">
                            <Camera className="h-3.5 w-3.5 text-forest" />
                            <span>Field Evidence ({item.photos.length} Photos Received)</span>
                          </span>

                          {item.photos.some((p) => p.verified) ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-success-text bg-clear-bg px-2 py-0.5 rounded-full border border-success/30">
                              <CheckCircle2 className="h-2.5 w-2.5 text-success" />
                              <span>Quality Verified ✓</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-caution-text bg-caution-bg px-2 py-0.5 rounded-full border border-pebble">
                              <Clock className="h-2.5 w-2.5" />
                              <span>Awaiting PM Review</span>
                            </span>
                          )}

                          <span className="text-[10px] text-ash bg-white px-2 py-0.5 rounded border border-pebble">
                            Sent by {item.photos[0]?.uploadedBy || item.assignee}
                          </span>
                        </div>

                        <p className="text-[11px] text-ash truncate mt-0.5">
                          Latest note: &quot;{item.photos[0]?.caption || "Site progress photo submitted"}&quot; • {item.photos[0]?.timestamp}
                        </p>
                      </div>
                    </div>

                    {/* Inspect Photos Action Button */}
                    <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoTargetJob(item);
                          setShowPhotoModal(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-forest hover:bg-forest-hover text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Inspect &amp; Verify Photos ({item.photos.length})</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2.5 border-t border-pebble/40 flex items-center justify-between text-xs text-ash">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <Camera className="h-3 w-3 text-ash/60" />
                      <span>No field photos submitted yet for this work order</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoTargetJob(item);
                        setShowPhotoModal(true);
                      }}
                      className="text-forest hover:text-forest-hover font-bold text-xs cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Attach Field Photo</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* ========================================================================= */}
        {/* MODAL: DISPATCH / ASSIGN NEW JOB                                          */}
        {/* ========================================================================= */}
        {showAssignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-onyx/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-lg rounded-[16px] bg-white p-6 shadow-2xl border border-pebble relative animate-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-ash hover:bg-stone hover:text-onyx transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3 pb-3 border-b border-pebble">
                <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-forest text-white">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-onyx">
                    Dispatch Work Order
                  </h2>
                  <p className="text-xs text-ash">
                    Assign site task to an awarded contractor or internal technician
                  </p>
                </div>
              </div>

              <form onSubmit={handleAssignSubmit} className="mt-4 space-y-3.5">
                {/* Toggle: Awarded Contractor vs Internal */}
                <div>
                  <label className="block text-xs font-semibold text-onyx mb-1.5">
                    Assignee Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAssigneeType("CONTRACTOR")}
                      className={`py-2 px-3 rounded-[8px] text-xs font-bold flex items-center justify-center gap-2 border transition cursor-pointer ${
                        assigneeType === "CONTRACTOR"
                          ? "bg-forest text-white border-forest shadow-xs"
                          : "bg-stone text-ash border-pebble hover:bg-mist"
                      }`}
                    >
                      <HardHat className="h-3.5 w-3.5" />
                      <span>Awarded Contractor ({contractors.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssigneeType("INTERNAL")}
                      className={`py-2 px-3 rounded-[8px] text-xs font-bold flex items-center justify-center gap-2 border transition cursor-pointer ${
                        assigneeType === "INTERNAL"
                          ? "bg-forest text-white border-forest shadow-xs"
                          : "bg-stone text-ash border-pebble hover:bg-mist"
                      }`}
                    >
                      <User className="h-3.5 w-3.5" />
                      <span>Internal Team</span>
                    </button>
                  </div>
                </div>

                {/* Dropdown for Awarded Contractors */}
                {assigneeType === "CONTRACTOR" ? (
                  <div>
                    <label className="block text-xs font-semibold text-onyx mb-1">
                      Select Awarded Contractor <span className="text-red-500">*</span>
                    </label>
                    {contractors.length === 0 ? (
                      <div className="p-3 bg-sunfleck/40 rounded-[8px] border border-pebble text-xs text-ash space-y-2">
                        <p>No contractors awarded through Tenders yet.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAssignModal(false);
                            router.push("/tenders");
                          }}
                          className="text-forest font-bold hover:underline flex items-center gap-1"
                        >
                          <span>Open Tenders to award a contractor</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <select
                          required
                          value={selectedContractorId}
                          onChange={(e) => handleContractorSelect(e.target.value)}
                          className="w-full h-9.5 px-3 text-xs bg-stone text-onyx font-medium rounded-[8px] border border-pebble outline-none focus:border-forest appearance-none cursor-pointer"
                        >
                          {contractors.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} • {c.trade} ({c.projectName} - ₹{c.awardedAmount.toLocaleString("en-IN")})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="h-4 w-4 text-ash absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-onyx mb-1">
                      Internal Field Tech / Supervisor
                    </label>
                    {teamUsers.length > 0 ? (
                      <select
                        value={internalAssignee}
                        onChange={(e) => setInternalAssignee(e.target.value)}
                        className="w-full h-9 px-3 text-xs bg-stone text-onyx rounded-[8px] border border-pebble outline-none focus:border-forest cursor-pointer"
                      >
                        {teamUsers.map((u) => (
                          <option key={u.id || u.email} value={u.name}>
                            {u.name} ({u.role.replace(/_/g, " ")})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={internalAssignee}
                        onChange={(e) => setInternalAssignee(e.target.value)}
                        placeholder="e.g. Site Supervisor / Engineer"
                        className="w-full h-9 px-3 text-xs bg-stone text-onyx rounded-[8px] border border-pebble outline-none focus:border-forest"
                      />
                    )}
                  </div>
                )}

                {/* Job Title */}
                <div>
                  <label className="block text-xs font-semibold text-onyx mb-1">
                    Job Title / Work Scope <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Electrical 3-Phase Panel Wiring"
                    className="w-full h-9 px-3 text-xs bg-stone rounded-[8px] border border-pebble outline-none focus:border-forest"
                  />
                </div>

                {/* Project & Location */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-onyx mb-1">
                      Project
                    </label>
                    <input
                      type="text"
                      required
                      value={jobProject}
                      onChange={(e) => setJobProject(e.target.value)}
                      className="w-full h-9 px-3 text-xs bg-stone rounded-[8px] border border-pebble outline-none focus:border-forest"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-onyx mb-1">
                      Location / Site Area
                    </label>
                    <input
                      type="text"
                      required
                      value={jobLocation}
                      onChange={(e) => setJobLocation(e.target.value)}
                      className="w-full h-9 px-3 text-xs bg-stone rounded-[8px] border border-pebble outline-none focus:border-forest"
                    />
                  </div>
                </div>

                {/* Priority & Due Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-onyx mb-1">
                      Priority
                    </label>
                    <select
                      value={jobPriority}
                      onChange={(e) =>
                        setJobPriority(
                          e.target.value as "High" | "Medium" | "Low"
                        )
                      }
                      className="w-full h-9 px-3 text-xs bg-stone rounded-[8px] border border-pebble outline-none focus:border-forest cursor-pointer"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-onyx mb-1">
                      Target Completion
                    </label>
                    <input
                      type="text"
                      value={jobDue}
                      onChange={(e) => setJobDue(e.target.value)}
                      placeholder="e.g. Today, Tomorrow, 28 May"
                      className="w-full h-9 px-3 text-xs bg-stone rounded-[8px] border border-pebble outline-none focus:border-forest"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-onyx mb-1">
                    Work Order Instructions &amp; Safety Scope
                  </label>
                  <textarea
                    rows={2}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Provide specific notes, milestones, or tender reference..."
                    className="w-full p-2 text-xs bg-stone rounded-[8px] border border-pebble outline-none focus:border-forest resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-pebble">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="px-4 py-2 rounded-[8px] text-xs font-semibold text-ash hover:bg-stone transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-[8px] bg-forest hover:bg-forest-hover text-white text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    Assign Work Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: REASSIGN JOB TO CONTRACTOR                                         */}
        {/* ========================================================================= */}
        {showReassignModal && reassignTargetJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-onyx/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-md rounded-[16px] bg-white p-6 shadow-2xl border border-pebble relative animate-in zoom-in-95 duration-150 space-y-4">
              <button
                type="button"
                onClick={() => setShowReassignModal(false)}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-ash hover:bg-stone hover:text-onyx transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3 pb-3 border-b border-pebble">
                <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-forest text-white">
                  <HardHat className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-onyx">
                    Reassign Work Order
                  </h2>
                  <p className="text-xs text-ash">{reassignTargetJob.title}</p>
                </div>
              </div>

              <form onSubmit={handleReassignSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-onyx mb-1">
                    Select Awarded Contractor
                  </label>
                  <select
                    value={reassignContractorId}
                    onChange={(e) => setReassignContractorId(e.target.value)}
                    className="w-full h-9.5 px-3 text-xs bg-stone text-onyx font-medium rounded-[8px] border border-pebble outline-none focus:border-forest cursor-pointer"
                  >
                    {contractors.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.trade} • {c.projectName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-pebble">
                  <button
                    type="button"
                    onClick={() => setShowReassignModal(false)}
                    className="px-4 py-2 rounded-[8px] text-xs font-semibold text-ash hover:bg-stone transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4.5 py-2 rounded-[8px] bg-forest hover:bg-forest-hover text-white text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    Confirm Reassign
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: FIELD PHOTO INSPECTION & QUALITY VERIFICATION                      */}
        {/* ========================================================================= */}
        {photoTargetJob && (
          <JobPhotoModal
            job={photoTargetJob}
            isOpen={showPhotoModal}
            onClose={() => {
              setShowPhotoModal(false);
              setPhotoTargetJob(null);
            }}
            currentUserName="Project Manager"
          />
        )}
      </div>
    </FirmaLayout>
  );
}

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <FirmaLayout activeNav="Jobs">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center space-y-2">
              <div className="h-6 w-6 border-2 border-forest border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-ash">Loading Jobs...</p>
            </div>
          </div>
        </FirmaLayout>
      }
    >
      <JobsContent />
    </Suspense>
  );
}