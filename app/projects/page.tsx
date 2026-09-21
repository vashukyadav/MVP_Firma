"use client";

import { useState, useEffect, useMemo } from "react";
import FirmaLayout from "@/components/layout/FirmaLayout";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { usePermissions } from "@/lib/permissions";
import {
  useLeadFlowStore,
  type ProjectItem,
  type Quote,
  type QuoteLineItem,
} from "@/store/leadFlowStore";
import { toast } from "@/components/ui/toast";
import { useSiteStore } from "@/store/siteStore";
import { useCrewStore } from "@/store/crewStore";
import { useAuthStore } from "@/store/authStore";
import { db } from "@/lib/db";
import {
  getAssignedProjects,
  isSiteManager,
  isAdminOrOwner,
  isProjectManager,
} from "@/lib/roleAccess";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  Calendar,
  IndianRupee,
  ChevronRight,
  User,
  Sparkles,
  Building,
  Briefcase,
  X,
  Layers,
  Trash2,
  HardHat,
  ShieldCheck,
  FileText,
  Package,
  Eye,
  Download,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

export default function ProjectsPage() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const {
    projects,
    quotes = [],
    addProject,
    updateProject,
    updateProjectLineItems,
    deleteProject,
  } = useLeadFlowStore();
  const sites = useSiteStore((state) => state.sites) || [];
  const crewMembers = useCrewStore((state) => state.members) || [];

  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  // Project Details Modal States
  const [projectModalTab, setProjectModalTab] = useState<"overview" | "materials" | "commercial">("overview");
  const [previewQuote, setPreviewQuote] = useState<Quote | null>(null);
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [newMaterialDesc, setNewMaterialDesc] = useState("");
  const [newMaterialQty, setNewMaterialQty] = useState<number | "">(1);
  const [newMaterialRate, setNewMaterialRate] = useState<number | "">("");

  // Available Site Managers from DB + CrewStore
  const [dbManagers, setDbManagers] = useState<
    { id: string; name: string; contact?: string; role: string }[]
  >([]);

  useEffect(() => {
    setMounted(true);
    async function loadManagers() {
      try {
        const companyId = currentUser?.companyId || "ORG-DEFAULT";
        const users = await db.users
          .where("companyId")
          .equals(companyId)
          .toArray();
        const siteMgrs = users
          .filter((u) => u.role === "SITE_MANAGER")
          .map((u) => ({
            id: `user-${u.id}`,
            name: u.name,
            role: "Site Manager",
            contact: "+91 98000 00000",
          }));
        setDbManagers(siteMgrs);
      } catch (err) {
        console.error("Failed to load managers:", err);
      }
    }
    loadManagers();
  }, [currentUser?.companyId]);

  const availableSiteManagers = useMemo(() => {
    const list = [...dbManagers];
    const managersFromCrew = crewMembers.filter((m) => m.role === "Site Manager");
    for (const m of managersFromCrew) {
      if (!list.some((x) => x.name.toLowerCase() === m.name.toLowerCase())) {
        list.push({
          id: m.id,
          name: m.name,
          role: "Site Manager",
          contact: m.contact,
        });
      }
    }
    if (list.length === 0) {
      list.push({
        id: "user-default-sm",
        name: "Site Manager",
        role: "Site Manager",
        contact: "+91 98000 00000",
      });
    }
    if (
      currentUser?.role === "SITE_MANAGER" &&
      currentUser.name &&
      !list.some((x) => x.name.toLowerCase() === currentUser.name.toLowerCase())
    ) {
      list.push({
        id: `user-${currentUser.id || "sm"}`,
        name: currentUser.name,
        role: "Site Manager",
        contact: "+91 98000 00000",
      });
    }
    return list;
  }, [dbManagers, crewMembers, currentUser]);

  // Handle query params on mount to select project directly (e.g. from PM Dashboard)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const selId = params.get("id") || params.get("selectedId");
      if (selId && projects.length > 0) {
        const found = projects.find((p) => p.id === selId);
        if (found) {
          setSelectedProject(found);
          setProjectModalTab("overview");
        }
      }
    }
  }, [projects]);

  // Helper to reliably find linked quote and materials for any project
  function getProjectQuoteAndMaterials(
    project: ProjectItem | null,
    quotesList: Quote[]
  ) {
    if (!project) return { linkedQuote: null, lineItems: [] as QuoteLineItem[], totalQuotedAmount: 0 };

    const linkedQuote =
      quotesList.find(
        (q) =>
          (project.quoteId && (q.id === project.quoteId || q.quoteNo === project.quoteId)) ||
          (project.quoteNo && (q.id === project.quoteNo || q.quoteNo === project.quoteNo)) ||
          (project.sourceOpportunityId && q.opportunityId === project.sourceOpportunityId) ||
          (q.opportunityTitle && project.name && q.opportunityTitle.trim().toLowerCase() === project.name.trim().toLowerCase()) ||
          (q.customerName && project.client && q.customerName.trim().toLowerCase() === project.client.trim().toLowerCase() && (q.value || 0) > 0)
      ) || null;

    const lineItems: QuoteLineItem[] =
      project.lineItems && project.lineItems.length > 0
        ? project.lineItems
        : linkedQuote?.lineItems && linkedQuote.lineItems.length > 0
        ? linkedQuote.lineItems
        : [];

    const totalQuotedAmount =
      lineItems.reduce((acc, item) => acc + (Number(item.amount) || 0), 0) ||
      (linkedQuote?.value || 0);

    return { linkedQuote, lineItems, totalQuotedAmount };
  }

  const {
    linkedQuote: selectedProjectQuote,
    lineItems: selectedProjectMaterials,
    totalQuotedAmount: selectedProjectMaterialTotal,
  } = useMemo(
    () => getProjectQuoteAndMaterials(selectedProject, quotes),
    [selectedProject, quotes]
  );

  // Auto-sync project materials & quote reference into store for existing projects (like PRJ-506)
  useEffect(() => {
    if (
      selectedProject &&
      (!selectedProject.lineItems || selectedProject.lineItems.length === 0) &&
      selectedProjectQuote?.lineItems &&
      selectedProjectQuote.lineItems.length > 0
    ) {
      updateProject(selectedProject.id, {
        quoteId: selectedProjectQuote.id,
        quoteNo: selectedProjectQuote.quoteNo,
        quoteValue: selectedProjectQuote.value,
        lineItems: selectedProjectQuote.lineItems,
      });
      setSelectedProject((prev) =>
        prev
          ? {
              ...prev,
              quoteId: selectedProjectQuote.id,
              quoteNo: selectedProjectQuote.quoteNo,
              quoteValue: selectedProjectQuote.value,
              lineItems: selectedProjectQuote.lineItems,
            }
          : null
      );
    }
  }, [selectedProject?.id, selectedProjectQuote]);

  // New Project Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectClient, setProjectClient] = useState("");
  const [projectLocation, setProjectLocation] = useState("");
  const [projectBudget, setProjectBudget] = useState("");
  const [projectLead, setProjectLead] = useState("");
  const [projectDue, setProjectDue] = useState("");
  const [projectStartDate, setProjectStartDate] = useState("");
  const [projectEndDate, setProjectEndDate] = useState("");
  const [projectSiteManagerId, setProjectSiteManagerId] = useState("");
  const [projectSiteManagerName, setProjectSiteManagerName] = useState("");

  const { hasPermission } = usePermissions();
  const isSM = isSiteManager(currentUser);
  const canCreateProject = hasPermission("projects", "create");
  const canDeleteProject = hasPermission("projects", "delete");
  const canAssignSM = isAdminOrOwner(currentUser) || isProjectManager(currentUser);

  // Compute Assigned Projects list based on current user role & assignment
  const assignedProjects = useMemo(() => {
    return getAssignedProjects(projects, sites, currentUser);
  }, [projects, sites, currentUser]);

  const projectList = mounted ? assignedProjects : [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return {
          label: "Completed",
          color: "bg-clear-bg text-success-text border-clear-bg",
        };
      case "IN_PROGRESS":
        return {
          label: "In Progress",
          color: "bg-breath text-onyx border-pebble",
        };
      case "AT_RISK":
        return {
          label: "At Risk",
          color: "bg-caution-bg text-caution-text border-caution-bg",
        };
      case "DELAYED":
        return {
          label: "Delayed",
          color: "bg-hazard-bg text-hazard-text border-hazard-bg",
        };
      default:
        return {
          label: status,
          color: "bg-mist text-onyx border-pebble",
        };
    }
  };

  const filtered = projectList.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      (p.siteManagerName && p.siteManagerName.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = filter === "ALL" || p.status === filter;
    return matchSearch && matchStatus;
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !projectClient.trim()) return;

    const newId = `PRJ-${Math.floor(100 + Math.random() * 900)}`;
    const newProj: ProjectItem = {
      id: newId,
      name: projectName.trim(),
      client: projectClient.trim(),
      location: projectLocation.trim() || "Delhi NCR",
      budget: projectBudget.startsWith("₹") ? projectBudget : `₹${projectBudget}`,
      progress: 0,
      status: "IN_PROGRESS",
      lead: projectLead || "Project Lead",
      startDate: projectStartDate.trim() || undefined,
      endDate: projectEndDate.trim() || projectDue.trim() || undefined,
      due: projectEndDate.trim() || projectDue.trim() || "Ongoing",
      siteManagerId: projectSiteManagerId || undefined,
      siteManagerName: projectSiteManagerName || undefined,
    };

    addProject(newProj);

    // Sync site in useSiteStore so it appears under Sites & Locations
    try {
      useSiteStore.getState().addSite({
        name: `${newProj.name} • Main Site`,
        projectName: newProj.name,
        address: newProj.location || "Active Construction Site Yard",
        city: newProj.location?.includes(",") ? newProj.location.split(",")[0].trim() : "Gurugram",
        state: newProj.location?.includes(",") ? newProj.location.split(",")[1]?.trim() || "Haryana" : "Haryana",
        pincode: "122001",
        siteManagerId: projectSiteManagerId || undefined,
        siteManagerName: projectSiteManagerName || "Unassigned",
        status: "Active",
        startDate: newProj.startDate || "15 Sep 2026",
        expectedCompletion: newProj.endDate || projectDue || "31 Dec 2026",
        totalAreaSqFt: "50,000 sq.ft",
      });
    } catch (e) {
      console.error("Failed to sync site in siteStore:", e);
    }

    setShowAddModal(false);
    setProjectName("");
    setProjectClient("");
    setProjectLocation("");
    setProjectBudget("");
    setProjectLead("");
    setProjectDue("");
    setProjectStartDate("");
    setProjectEndDate("");
    setProjectSiteManagerId("");
    setProjectSiteManagerName("");
  };

  // KPIs
  const totalCount = projectList.length;
  const inProgressCount = projectList.filter((p) => p.status === "IN_PROGRESS").length;
  const completedCount = projectList.filter((p) => p.status === "COMPLETED").length;
  const atRiskCount = projectList.filter((p) => p.status === "AT_RISK").length;

  return (
    <FirmaLayout activeNav="Projects">
      <PermissionGuard module="projects" action="view">
        {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 pb-2">
        <div>
          <span className="text-eyebrow text-ash uppercase tracking-wider font-semibold">
            PROJECT EXECUTION &amp; SITE DELIVERY
          </span>
          <h1 className="text-display-h1 font-bold text-onyx mt-0.5 tracking-tight flex items-center gap-2">
            Active Projects
          </h1>
          <p className="text-body text-ash mt-1">
            Monitor real-time progress, budgets, site milestones, and handovers from sales.
          </p>
        </div>

        {canCreateProject && (
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-[10px] bg-forest hover:bg-forest-hover text-white px-4.5 py-2.5 text-sm font-medium shadow-xs transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="h-4 w-4 text-breath" />
            <span>New Project</span>
          </button>
        )}
      </div>

      {/* Site Manager Notice Banner */}
      {isSM && (
        <div className="rounded-[12px] bg-emerald-50 border border-emerald-200 p-4 flex items-center justify-between text-xs text-emerald-900 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0">
              <HardHat className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-emerald-950">
                Site Manager Workspace ({currentUser?.name || "Site Manager"})
              </p>
              <p className="text-emerald-800 text-[11px] mt-0.5">
                Showing only active projects and sites assigned to you. Contact your Project Manager to update your site assignments.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] shrink-0 border border-emerald-300">
            {projectList.length} Assigned {projectList.length === 1 ? "Project" : "Projects"}
          </span>
        </div>
      )}

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-[10px] bg-white p-4 border border-pebble/60 shadow-2xs">
          <span className="text-xs font-semibold text-ash">
            {isSM ? "My Projects" : "Total Projects"}
          </span>
          <p className="text-2xl font-bold text-onyx mt-1">{totalCount}</p>
          <p className="text-xs font-medium text-complete-status mt-1">
            {isSM ? "Assigned to you" : "Across all sites"}
          </p>
        </div>
        <div className="rounded-[10px] bg-white p-4 border border-pebble/60 shadow-2xs">
          <span className="text-xs font-semibold text-ash">In Progress</span>
          <p className="text-2xl font-bold text-caution-text mt-1">{inProgressCount}</p>
          <p className="text-xs font-medium text-ash mt-1">Active site execution</p>
        </div>
        <div className="rounded-[10px] bg-white p-4 border border-pebble/60 shadow-2xs">
          <span className="text-xs font-semibold text-ash">Completed</span>
          <p className="text-2xl font-bold text-complete-status mt-1">{completedCount}</p>
          <p className="text-xs font-medium text-ash mt-1">Handed over to client</p>
        </div>
        <div className="rounded-[10px] bg-white p-4 border border-pebble/60 shadow-2xs">
          <span className="text-xs font-semibold text-ash">At Risk / Attention</span>
          <p className="text-2xl font-bold text-delayed-status mt-1">{atRiskCount}</p>
          <p className="text-xs font-medium text-delayed-status mt-1">Needs attention</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-[10px] border border-pebble/60 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { key: "ALL", label: "All Projects" },
            { key: "IN_PROGRESS", label: "In Progress" },
            { key: "AT_RISK", label: "At Risk" },
            { key: "COMPLETED", label: "Completed" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3.5 py-2 rounded-[10px] text-sm font-medium transition cursor-pointer shrink-0 ${
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
            placeholder="Search projects by name, client, manager..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs text-onyx placeholder-ash bg-stone rounded-[10px] border border-pebble outline-none focus:border-onyx focus:bg-white transition"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => {
          const badge = getStatusBadge(item.status);
          const isHandedOverFromSales = Boolean(item.sourceOpportunityId);
          const { linkedQuote: itemQuote, lineItems: itemMaterials } = getProjectQuoteAndMaterials(item, quotes);

          return (
            <div
              key={item.id}
              onClick={() => {
                setSelectedProject(item);
                setProjectModalTab("overview");
              }}
              className={`rounded-[12px] bg-white p-5 border shadow-2xs flex flex-col justify-between hover:shadow-md transition-all group cursor-pointer relative ${
                isHandedOverFromSales ? "border-forest/40 ring-1 ring-forest/20" : "border-pebble/60"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-ash uppercase tracking-wide">
                      {item.id}
                    </span>
                    {isHandedOverFromSales && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-forest/10 text-forest border border-forest/20">
                        <Sparkles className="h-2.5 w-2.5" /> Sales Handover
                      </span>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                </div>

                <h3 className="mt-2 text-heading-h3 font-bold text-onyx group-hover:text-forest transition">
                  {item.name}
                </h3>
                <p className="text-xs text-ash mt-0.5">{item.location}</p>
                <p className="text-[11px] text-onyx mt-1 font-medium">
                  Client: <span className="text-ash">{item.client}</span>
                </p>

                {/* Project Timeline Window */}
                {(item.startDate || item.endDate) && (
                  <div className="mt-2 text-[11px] flex items-center gap-1.5 text-ash bg-stone/60 px-2 py-1 rounded border border-pebble/60">
                    <Calendar className="h-3 w-3 text-forest shrink-0" />
                    <span>
                      Timeline: <strong className="text-onyx">{item.startDate || "Start"}</strong> to{" "}
                      <strong className="text-onyx">{item.endDate || item.due}</strong>
                    </span>
                  </div>
                )}

                {/* Quoted Materials & Quote Indicator */}
                {itemMaterials.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-pebble/60 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-onyx font-medium">
                      <Layers className="h-3.5 w-3.5 text-forest shrink-0" />
                      <span>{itemMaterials.length} Materials Quoted</span>
                    </div>
                    {itemQuote && (
                      <span className="text-forest text-[10px] font-bold bg-forest/10 px-2 py-0.5 rounded-full">
                        #{itemQuote.quoteNo}
                      </span>
                    )}
                  </div>
                )}

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-ash">Completion</span>
                    <span className="font-bold text-onyx">{item.progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-mist overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.status === "COMPLETED"
                          ? "bg-complete-status"
                          : item.status === "AT_RISK"
                          ? "bg-at-risk-status"
                          : "bg-onyx"
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Assignment & Budget Footer */}
              <div className="mt-5 pt-3 border-t border-pebble/60 grid grid-cols-3 gap-1 text-xs">
                <div>
                  <span className="text-[10px] text-ash block">Budget</span>
                  <span className="font-bold text-onyx truncate block">{item.budget}</span>
                </div>
                <div className="text-center min-w-0">
                  <span className="text-[10px] text-ash block">Project Lead</span>
                  <span className="font-medium text-onyx truncate block">
                    {item.lead || "Project Lead"}
                  </span>
                </div>
                <div className="text-right min-w-0">
                  <span className="text-[10px] text-ash block">Site Manager</span>
                  <span
                    className={`font-semibold truncate block ${
                      item.siteManagerName ? "text-forest" : "text-amber-600 font-medium"
                    }`}
                  >
                    {item.siteManagerName || "Unassigned"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 px-6 text-center text-ash text-xs border border-dashed border-pebble rounded-[14px] bg-white">
            <FolderKanban className="h-10 w-10 text-ash/40 mx-auto mb-2" />
            <p className="text-sm font-bold text-onyx">
              {isSM ? "No Projects Assigned to You" : "No projects found"}
            </p>
            <p className="text-xs text-ash mt-1 max-w-md mx-auto">
              {isSM
                ? `You (${currentUser?.name || "Site Manager"}) are currently not assigned to any active projects. Once your Project Manager or Owner assigns a project or site to you, it will appear here.`
                : "No projects match your current filters or search criteria."}
            </p>
          </div>
        )}
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl lg:max-w-3xl bg-white rounded-[20px] shadow-2xl border border-pebble overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-pebble flex items-center justify-between bg-stone/50 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-ash uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-pebble">
                    {selectedProject.id}
                  </span>
                  {selectedProjectQuote && (
                    <span className="text-[10px] font-bold text-forest bg-forest/10 px-2 py-0.5 rounded border border-forest/20 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Quote #{selectedProjectQuote.quoteNo}
                    </span>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-onyx mt-1">{selectedProject.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedProject(null);
                  setProjectModalTab("overview");
                  setShowAddMaterial(false);
                }}
                className="p-1.5 rounded-lg text-ash hover:text-onyx hover:bg-pebble/40 cursor-pointer transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-1 border-b border-pebble px-5 pt-2 bg-stone/20 text-xs shrink-0">
              <button
                type="button"
                onClick={() => setProjectModalTab("overview")}
                className={`px-3.5 py-2 font-bold rounded-t-lg transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
                  projectModalTab === "overview"
                    ? "border-forest text-forest bg-white shadow-2xs"
                    : "border-transparent text-ash hover:text-onyx"
                }`}
              >
                <Briefcase className="h-3.5 w-3.5" />
                <span>Overview</span>
              </button>

              <button
                type="button"
                onClick={() => setProjectModalTab("materials")}
                className={`px-3.5 py-2 font-bold rounded-t-lg transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
                  projectModalTab === "materials"
                    ? "border-forest text-forest bg-white shadow-2xs"
                    : "border-transparent text-ash hover:text-onyx"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Materials &amp; BOQ</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    selectedProjectMaterials.length > 0
                      ? "bg-forest/15 text-forest"
                      : "bg-mist text-ash"
                  }`}
                >
                  {selectedProjectMaterials.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setProjectModalTab("commercial")}
                className={`px-3.5 py-2 font-bold rounded-t-lg transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
                  projectModalTab === "commercial"
                    ? "border-forest text-forest bg-white shadow-2xs"
                    : "border-transparent text-ash hover:text-onyx"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Commercial Quote</span>
                {selectedProjectQuote && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-forest/15 text-forest">
                    Accepted
                  </span>
                )}
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              {/* TAB 1: OVERVIEW */}
              {projectModalTab === "overview" && (
                <div className="space-y-4">
                  {selectedProject.sourceOpportunityId && (
                    <div className="p-3.5 bg-forest/5 rounded-[12px] border border-forest/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-forest">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                        <div>
                          <p className="font-bold">
                            Successfully handed over from Opportunity <strong>#{selectedProject.sourceOpportunityId}</strong>
                          </p>
                          <p className="text-[11px] text-forest/80 mt-0.5">
                            Approved commercial deal transferred to Project Execution.
                          </p>
                        </div>
                      </div>
                      {selectedProjectMaterials.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setProjectModalTab("materials")}
                          className="inline-flex items-center gap-1 text-[11px] font-bold bg-forest text-white px-3 py-1.5 rounded-md hover:bg-forest-hover transition cursor-pointer self-start sm:self-auto shrink-0 shadow-2xs"
                        >
                          <Layers className="h-3 w-3" />
                          <span>View {selectedProjectMaterials.length} Quoted Materials</span>
                        </button>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 bg-stone/40 rounded-[14px] border border-pebble">
                    <div>
                      <span className="text-ash block text-[11px]">Client:</span>
                      <span className="font-bold text-onyx text-sm">{selectedProject.client}</span>
                    </div>
                    <div>
                      <span className="text-ash block text-[11px]">Budget:</span>
                      <span className="font-bold text-forest text-sm">{selectedProject.budget}</span>
                    </div>
                    <div>
                      <span className="text-ash block text-[11px]">Location:</span>
                      <span className="font-medium text-onyx">{selectedProject.location}</span>
                    </div>
                    <div>
                      <span className="text-ash block text-[11px]">Lead Engineer / PM:</span>
                      <span className="font-medium text-onyx">{selectedProject.lead || "Project Lead"}</span>
                    </div>

                    {/* Quoted Materials Summary Row in Overview */}
                    <div className="col-span-1 sm:col-span-2 pt-2.5 border-t border-pebble/60 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-forest" />
                        <div>
                          <span className="text-ash block text-[10px] uppercase font-bold tracking-wider">
                            Quoted Materials &amp; Line Items:
                          </span>
                          <span className="font-bold text-onyx">
                            {selectedProjectMaterials.length} Items Defined
                            {selectedProjectMaterialTotal > 0 && (
                              <span className="text-forest ml-1 font-semibold">
                                (₹{selectedProjectMaterialTotal.toLocaleString("en-IN")})
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setProjectModalTab("materials")}
                        className="text-xs font-bold text-forest hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open Materials BOQ</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Assigned Site Manager Field */}
                    <div className="col-span-1 sm:col-span-2 pt-2.5 border-t border-pebble/70">
                      <span className="text-ash block font-medium">Assigned Site Manager:</span>
                      {canAssignSM ? (
                        <div className="mt-1.5 flex items-center gap-2">
                          <select
                            value={selectedProject.siteManagerName || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              const found = availableSiteManagers.find((m) => m.name === val);
                              const updated = {
                                siteManagerName: val || undefined,
                                siteManagerId: found?.id || undefined,
                              };
                              updateProject(selectedProject.id, updated);
                              setSelectedProject({ ...selectedProject, ...updated });

                              // Sync matching site in useSiteStore
                              try {
                                const pName = selectedProject.name.toLowerCase();
                                const existingSite = useSiteStore.getState().sites.find(
                                  (s) =>
                                    s.projectName.toLowerCase() === pName ||
                                    s.name.toLowerCase() === pName ||
                                    (s.projectName && s.projectName.toLowerCase().includes(pName)) ||
                                    (s.name && s.name.toLowerCase().includes(pName))
                                );
                                if (existingSite) {
                                  useSiteStore.getState().updateSite(existingSite.id, {
                                    siteManagerName: val || "Unassigned",
                                    siteManagerId: found?.id || undefined,
                                    siteManagerPhone: found?.contact,
                                  });
                                } else if (val) {
                                  useSiteStore.getState().addSite({
                                    name: `${selectedProject.name} • Main Site`,
                                    projectName: selectedProject.name,
                                    address: selectedProject.location || "Project Construction Yard",
                                    city: selectedProject.location?.includes(",") ? selectedProject.location.split(",")[0].trim() : "Gurugram",
                                    state: selectedProject.location?.includes(",") ? selectedProject.location.split(",")[1]?.trim() || "Haryana" : "Haryana",
                                    pincode: "122001",
                                    siteManagerName: val,
                                    siteManagerId: found?.id,
                                    siteManagerPhone: found?.contact,
                                    status: "Active",
                                    startDate: "15 Sep 2026",
                                    expectedCompletion: selectedProject.due || "31 Dec 2026",
                                    totalAreaSqFt: "60,000 sq.ft",
                                  });
                                }
                              } catch (err) {
                                console.error("Failed to sync site in siteStore:", err);
                              }
                            }}
                            className="text-xs bg-white border border-pebble rounded-md px-2.5 py-1.5 text-onyx font-medium focus:ring-1 focus:ring-forest outline-none flex-1"
                          >
                            <option value="">-- Unassigned --</option>
                            {availableSiteManagers.map((m) => (
                              <option key={m.id} value={m.name}>
                                {m.name} ({m.role})
                              </option>
                            ))}
                          </select>
                          <span className="text-[11px] text-forest font-semibold shrink-0">
                            {selectedProject.siteManagerName ? "✓ Assigned" : "Select to assign"}
                          </span>
                        </div>
                      ) : (
                        <span className="font-semibold text-forest mt-0.5 block">
                          {selectedProject.siteManagerName || "Unassigned"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1 text-ash">
                      <span>Site Milestone Progress</span>
                      <span className="font-bold text-onyx">{selectedProject.progress}%</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-mist overflow-hidden">
                      <div
                        className="h-full bg-forest rounded-full transition-all"
                        style={{ width: `${selectedProject.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 text-ash border-t border-pebble space-y-1.5">
                    <div className="flex justify-between">
                      <span>Project Duration:</span>
                      <span className="font-semibold text-onyx">
                        {selectedProject.startDate ? `${selectedProject.startDate} → ${selectedProject.endDate || selectedProject.due}` : selectedProject.due}
                      </span>
                    </div>
                    {selectedProject.startDate && selectedProject.endDate && (
                      <div className="text-[11px] text-forest font-medium bg-forest/5 px-2.5 py-1 rounded border border-forest/15 flex items-center justify-between">
                        <span>Sales Manager Window</span>
                        <span>{selectedProject.startDate} to {selectedProject.endDate}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: MATERIALS & BOQ */}
              {projectModalTab === "materials" && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-stone/50 rounded-[12px] border border-pebble flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-forest" />
                        <h4 className="font-bold text-onyx">Quoted Materials &amp; Bill of Quantities (BOQ)</h4>
                      </div>
                      <p className="text-ash text-[11px] mt-0.5">
                        {selectedProjectQuote
                          ? `Materials & scope items quoted and agreed via Quote #${selectedProjectQuote.quoteNo}`
                          : "Bill of materials and requirements allocated for site execution"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {selectedProjectQuote && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setPreviewQuote(selectedProjectQuote)}
                          className="text-[11px] h-7.5 border-forest/40 text-forest hover:bg-forest/10 flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View Quote #{selectedProjectQuote.quoteNo}</span>
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setShowAddMaterial(!showAddMaterial)}
                        className="text-[11px] h-7.5 bg-forest hover:bg-forest-hover text-white flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                        <span>{showAddMaterial ? "Cancel" : "Add Material"}</span>
                      </Button>
                    </div>
                  </div>

                  {/* Add Material Inline Form */}
                  {showAddMaterial && (
                    <div className="p-3.5 bg-forest/5 rounded-[12px] border border-forest/30 space-y-3 animate-in fade-in duration-150">
                      <h5 className="text-xs font-bold text-forest">Add Material Item to Project</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 text-xs">
                        <div className="sm:col-span-3">
                          <Label className="text-[10px] text-ash block mb-1">Item Description / Material Name *</Label>
                          <Input
                            placeholder="e.g. Reinforcement Steel Bars (Fe500D) or Cement"
                            value={newMaterialDesc}
                            onChange={(e) => setNewMaterialDesc(e.target.value)}
                            className="h-8 text-xs bg-white"
                          />
                        </div>
                        <div className="sm:col-span-1">
                          <Label className="text-[10px] text-ash block mb-1">Quantity *</Label>
                          <Input
                            type="number"
                            min="1"
                            placeholder="1"
                            value={newMaterialQty}
                            onChange={(e) => setNewMaterialQty(e.target.value ? Number(e.target.value) : "")}
                            className="h-8 text-xs bg-white"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Label className="text-[10px] text-ash block mb-1">Estimated Unit Rate (₹) *</Label>
                          <Input
                            type="number"
                            min="0"
                            placeholder="50000"
                            value={newMaterialRate}
                            onChange={(e) => setNewMaterialRate(e.target.value ? Number(e.target.value) : "")}
                            className="h-8 text-xs bg-white"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setShowAddMaterial(false)}
                          className="h-7 text-xs"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            if (!newMaterialDesc.trim()) {
                              toast.warning("Please enter item description");
                              return;
                            }
                            const qty = Number(newMaterialQty) || 1;
                            const rate = Number(newMaterialRate) || 0;
                            const newItem: QuoteLineItem = {
                              id: Date.now(),
                              description: newMaterialDesc.trim(),
                              qty,
                              rate,
                              amount: qty * rate,
                            };
                            const updated = [...selectedProjectMaterials, newItem];
                            updateProjectLineItems(selectedProject.id, updated);
                            setSelectedProject({
                              ...selectedProject,
                              lineItems: updated,
                            });
                            setNewMaterialDesc("");
                            setNewMaterialQty(1);
                            setNewMaterialRate("");
                            setShowAddMaterial(false);
                            toast.success(`Added "${newItem.description}" to project materials.`);
                          }}
                          className="h-7 text-xs bg-forest hover:bg-forest-hover text-white"
                        >
                          Save Material
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Table of Materials */}
                  <div className="border border-pebble rounded-[12px] overflow-hidden text-xs shadow-2xs">
                    <table className="w-full text-left">
                      <thead className="bg-stone text-ash font-bold uppercase text-[10px] tracking-wider border-b border-pebble">
                        <tr>
                          <th className="px-3 py-2.5 w-10 text-center">#</th>
                          <th className="px-4 py-2.5">Item Description / Material</th>
                          <th className="px-3 py-2.5 text-center w-20">Qty</th>
                          <th className="px-4 py-2.5 text-right w-28">Rate</th>
                          <th className="px-4 py-2.5 text-right w-32">Amount</th>
                          <th className="px-3 py-2.5 text-center w-12">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-pebble/60 bg-white">
                        {selectedProjectMaterials.map((item, index) => (
                          <tr key={item.id || index} className="hover:bg-stone/30 transition">
                            <td className="px-3 py-2.5 text-center font-bold text-ash text-[11px]">
                              {index + 1}
                            </td>
                            <td className="px-4 py-2.5">
                              <span className="font-semibold text-onyx block">{item.description}</span>
                            </td>
                            <td className="px-3 py-2.5 text-center font-medium text-onyx">
                              <span className="bg-stone px-2 py-0.5 rounded text-[11px] font-semibold">
                                {item.qty}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-right text-ash font-medium">
                              ₹{(item.rate || 0).toLocaleString("en-IN")}
                            </td>
                            <td className="px-4 py-2.5 text-right font-bold text-onyx">
                              ₹{(item.amount || 0).toLocaleString("en-IN")}
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Remove "${item.description}" from materials?`)) {
                                    const updated = selectedProjectMaterials.filter((_, i) => i !== index);
                                    updateProjectLineItems(selectedProject.id, updated);
                                    setSelectedProject({
                                      ...selectedProject,
                                      lineItems: updated,
                                    });
                                    toast.info("Material item removed.");
                                  }
                                }}
                                className="p-1 rounded text-ash hover:text-hazard-text hover:bg-hazard-bg/20 transition cursor-pointer"
                                title="Remove Item"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}

                        {selectedProjectMaterials.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-ash text-xs">
                              <Package className="h-8 w-8 text-ash/40 mx-auto mb-2" />
                              <p className="font-medium text-onyx">No materials recorded for this project yet.</p>
                              <p className="text-[11px] text-ash mt-0.5">
                                Click &ldquo;Add Material&rdquo; above to allocate material requirements.
                              </p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals Summary */}
                  <div className="p-3.5 bg-stone/50 rounded-[12px] border border-pebble flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-ash font-medium">
                        Total Items: <strong className="text-onyx">{selectedProjectMaterials.length}</strong>
                      </span>
                      {selectedProjectQuote && (
                        <span className="text-[11px] text-ash">
                          Quote Ref: <strong className="text-forest">#{selectedProjectQuote.quoteNo}</strong>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-ash uppercase tracking-wider block">
                          Total Material / Quoted Value
                        </span>
                        <span className="text-lg font-bold text-forest">
                          ₹{selectedProjectMaterialTotal.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-pebble">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        toast.success(`Bill of Quantities (BOQ) exported for ${selectedProject.name}!`);
                      }}
                      className="text-xs h-8 border-pebble flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Export BOQ Summary</span>
                    </Button>

                    {selectedProjectQuote && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setPreviewQuote(selectedProjectQuote)}
                        className="text-xs h-8 bg-onyx text-white hover:bg-black flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Preview Commercial Quotation Document</span>
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: COMMERCIAL QUOTE */}
              {projectModalTab === "commercial" && (
                <div className="space-y-4 text-xs">
                  {selectedProjectQuote ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-forest/5 rounded-[12px] border border-forest/20 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-forest uppercase tracking-widest">
                              Commercial Contract
                            </span>
                            <h4 className="text-base font-bold text-onyx">
                              Quote #{selectedProjectQuote.quoteNo}
                            </h4>
                          </div>
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase bg-forest text-white">
                            {selectedProjectQuote.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-forest/20 text-xs">
                          <div>
                            <span className="text-ash block text-[11px]">Billed To:</span>
                            <span className="font-bold text-onyx">{selectedProjectQuote.customerName}</span>
                          </div>
                          <div>
                            <span className="text-ash block text-[11px]">Total Contract Value:</span>
                            <span className="font-bold text-forest text-sm">
                              ₹{selectedProjectQuote.value.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div>
                            <span className="text-ash block text-[11px]">Proposal Date:</span>
                            <span className="font-medium text-onyx">{selectedProjectQuote.createdAt}</span>
                          </div>
                          <div>
                            <span className="text-ash block text-[11px]">Valid Until:</span>
                            <span className="font-medium text-onyx">{selectedProjectQuote.validUntil}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-stone/40 rounded-[12px] border border-pebble space-y-2">
                        <h5 className="font-bold text-onyx">Quotation Scope Summary</h5>
                        <p className="text-ash text-[11px]">
                          This project was awarded based on Commercial Quotation #{selectedProjectQuote.quoteNo} containing{" "}
                          <strong>{selectedProjectQuote.lineItems.length}</strong> specific scope &amp; material line items.
                        </p>
                        <div className="pt-2 flex flex-wrap gap-2">
                          <Button
                            type="button"
                            onClick={() => setPreviewQuote(selectedProjectQuote)}
                            className="bg-forest hover:bg-forest-hover text-white text-xs h-8 flex items-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Open Commercial Quotation Document</span>
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setProjectModalTab("materials")}
                            className="text-xs h-8 cursor-pointer"
                          >
                            View Materials Breakdown ({selectedProjectMaterials.length})
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-ash bg-stone/30 rounded-[12px] border border-pebble">
                      <FileText className="h-8 w-8 text-ash/40 mx-auto mb-2" />
                      <p className="font-semibold text-onyx">No Commercial Quotation Linked</p>
                      <p className="text-xs text-ash mt-1 max-w-sm mx-auto">
                        This project does not have an attached quotation ID. You can still manage materials in the &ldquo;Materials &amp; BOQ&rdquo; tab.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-pebble flex justify-between items-center bg-stone/40 shrink-0">
              {canAssignSM ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (confirm(`Delete project "${selectedProject.name}"?`)) {
                      deleteProject(selectedProject.id);
                      setSelectedProject(null);
                    }
                  }}
                  className="text-xs text-hazard-text hover:bg-hazard-bg/20 border-pebble flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Project</span>
                </Button>
              ) : (
                <div />
              )}
              <Button
                type="button"
                onClick={() => {
                  setSelectedProject(null);
                  setProjectModalTab("overview");
                  setShowAddMaterial(false);
                }}
                className="text-xs bg-onyx text-white hover:bg-black cursor-pointer px-5"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Quote Preview Modal (Matches Quotations Preview) */}
      {previewQuote && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white rounded-[16px] shadow-2xl border border-pebble p-6 space-y-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-pebble pb-4">
              <div>
                <span className="text-[10px] font-bold text-forest uppercase tracking-widest">
                  COMMERCIAL QUOTATION
                </span>
                <h3 className="text-xl font-bold text-onyx mt-0.5">
                  Quote #{previewQuote.quoteNo}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewQuote(null)}
                className="p-1 text-ash hover:text-onyx cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-ash block">Billed To:</span>
                <strong className="text-onyx text-sm">{previewQuote.customerName}</strong>
                <p className="text-ash mt-0.5">Project: {previewQuote.opportunityTitle}</p>
              </div>
              <div className="text-right">
                <span className="text-ash block">Proposal Date:</span>
                <span className="font-semibold text-onyx">{previewQuote.createdAt}</span>
                <span className="text-ash block mt-1">Valid Until:</span>
                <span className="font-semibold text-onyx">{previewQuote.validUntil}</span>
              </div>
            </div>

            <div className="border border-pebble rounded-[10px] overflow-hidden text-xs shadow-2xs">
              <table className="w-full text-left">
                <thead className="bg-stone text-ash font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-2">Item Description</th>
                    <th className="px-4 py-2 text-center">Qty</th>
                    <th className="px-4 py-2 text-right">Rate</th>
                    <th className="px-4 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pebble/60 bg-white">
                  {previewQuote.lineItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2.5 font-medium text-onyx">{item.description}</td>
                      <td className="px-4 py-2.5 text-center text-ash">{item.qty}</td>
                      <td className="px-4 py-2.5 text-right text-ash">₹{item.rate.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-2.5 text-right font-bold text-onyx">₹{item.amount.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-ash">
                Status: <strong className="text-onyx uppercase">{previewQuote.status}</strong>
              </span>
              <div className="text-right">
                <span className="text-xs text-ash block">Total Quoted Value</span>
                <span className="text-xl font-bold text-forest">
                  ₹{(previewQuote.value || 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="border-t border-pebble pt-4 flex justify-between items-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPreviewQuote(null)}
                className="text-xs"
              >
                Close Preview
              </Button>
              <Button
                type="button"
                onClick={() => {
                  toast.success("Quotation PDF generated successfully!");
                }}
                className="bg-forest hover:bg-forest-hover text-white text-xs"
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                <span>Download PDF</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Project Modal (Owners & PMs only) */}
      {showAddModal && canCreateProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-[16px] shadow-2xl border border-pebble overflow-hidden">
            <div className="p-5 border-b border-pebble flex items-center justify-between bg-stone/50">
              <h3 className="text-base font-bold text-onyx">Create New Project</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-ash hover:text-onyx cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-onyx">Project Name *</Label>
                <Input
                  required
                  placeholder="e.g. Skyline Towers Construction"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-onyx">Client Name *</Label>
                <Input
                  required
                  placeholder="e.g. Skyline Real Estate Ltd"
                  value={projectClient}
                  onChange={(e) => setProjectClient(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-onyx">Location</Label>
                  <Input
                    placeholder="e.g. Sector 62, Noida"
                    value={projectLocation}
                    onChange={(e) => setProjectLocation(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-onyx">Budget</Label>
                  <Input
                    placeholder="e.g. 85,00,000"
                    value={projectBudget}
                    onChange={(e) => setProjectBudget(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-onyx">Project Lead (PM)</Label>
                <Input
                  placeholder="e.g. Project Lead"
                  value={projectLead}
                  onChange={(e) => setProjectLead(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-onyx">Start Date</Label>
                  <Input
                    placeholder="e.g. 20 Sep 2026"
                    value={projectStartDate}
                    onChange={(e) => setProjectStartDate(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-onyx">End Date (Due)</Label>
                  <Input
                    placeholder="e.g. 02 Feb 2027"
                    value={projectEndDate}
                    onChange={(e) => {
                      setProjectEndDate(e.target.value);
                      setProjectDue(e.target.value);
                    }}
                    className="text-xs h-9"
                  />
                </div>
              </div>

              {/* Assigned Site Manager Selection */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-onyx">
                  Assigned Site Manager
                </Label>
                <select
                  value={projectSiteManagerName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setProjectSiteManagerName(val);
                    const found = availableSiteManagers.find((m) => m.name === val);
                    setProjectSiteManagerId(found?.id || "");
                  }}
                  className="w-full text-xs h-9 bg-white border border-pebble rounded-md px-2.5 text-onyx font-medium focus:ring-1 focus:ring-forest outline-none"
                >
                  <option value="">-- Select Site Manager (Optional) --</option>
                  {availableSiteManagers.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-ash">
                  The selected site manager will have on-site visibility and dispatch control for this project.
                </p>
              </div>

              <div className="pt-3 border-t border-pebble flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="text-xs h-9 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-forest hover:bg-forest-hover text-white text-xs h-9 font-medium cursor-pointer"
                >
                  Create Project
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      </PermissionGuard>
    </FirmaLayout>
  );
}