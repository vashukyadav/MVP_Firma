"use client";

import { useState, useEffect, useMemo } from "react";
import FirmaLayout from "@/components/layout/FirmaLayout";
import {
  useLeadFlowStore,
  type ProjectItem,
} from "@/store/leadFlowStore";
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
} from "lucide-react";

export default function ProjectsPage() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const { projects, addProject, updateProject, deleteProject } = useLeadFlowStore();
  const sites = useSiteStore((state) => state.sites) || [];
  const crewMembers = useCrewStore((state) => state.members) || [];

  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  // Available Site Managers from DB + CrewStore
  const [dbManagers, setDbManagers] = useState<
    { id: string; name: string; contact?: string; role: string }[]
  >([]);

  useEffect(() => {
    setMounted(true);
    async function loadManagers() {
      try {
        const users = await db.users.toArray();
        const siteMgrs = users
          .filter(
            (u) =>
              u.role === "SITE_MANAGER" ||
              u.role === "PROJECT_MANAGER" ||
              u.role === "OWNER" ||
              u.role === "ACCOUNT_ADMIN"
          )
          .map((u) => ({
            id: `user-${u.id}`,
            name: u.name,
            role: u.role === "SITE_MANAGER" ? "Site Manager" : u.role.replace("_", " "),
            contact: "+91 98000 00000",
          }));
        setDbManagers(siteMgrs);
      } catch (err) {
        console.error("Failed to load managers:", err);
      }
    }
    loadManagers();
  }, []);

  const availableSiteManagers = useMemo(() => {
    const list = [...dbManagers];
    const managersFromCrew = crewMembers.filter((m) => m.role === "Site Manager");
    for (const m of managersFromCrew) {
      if (!list.some((x) => x.name.toLowerCase() === m.name.toLowerCase())) {
        list.push({
          id: m.id,
          name: m.name,
          role: m.role,
          contact: m.contact,
        });
      }
    }
    // Always provide default Site Manager option if not present
    if (!list.some((x) => x.name.toLowerCase() === "site manager")) {
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

  // New Project Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectClient, setProjectClient] = useState("");
  const [projectLocation, setProjectLocation] = useState("");
  const [projectBudget, setProjectBudget] = useState("");
  const [projectLead, setProjectLead] = useState("");
  const [projectDue, setProjectDue] = useState("");
  const [projectSiteManagerId, setProjectSiteManagerId] = useState("");
  const [projectSiteManagerName, setProjectSiteManagerName] = useState("");

  const isSM = isSiteManager(currentUser);
  const canCreateProject = !isSM; // Only PM / Owner create projects
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
      due: projectDue || "Ongoing",
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
        startDate: "15 Sep 2026",
        expectedCompletion: projectDue || "31 Dec 2026",
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

          return (
            <div
              key={item.id}
              onClick={() => setSelectedProject(item)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-[16px] shadow-2xl border border-pebble overflow-hidden">
            <div className="p-5 border-b border-pebble flex items-center justify-between bg-stone/50">
              <div>
                <span className="text-[10px] font-bold text-ash uppercase tracking-wider">
                  {selectedProject.id}
                </span>
                <h3 className="text-lg font-bold text-onyx">{selectedProject.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="p-1 rounded-md text-ash hover:text-onyx cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {selectedProject.sourceOpportunityId && (
                <div className="p-3 bg-forest/5 rounded-[10px] border border-forest/20 flex items-center gap-2 text-forest">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>
                    Successfully handed over from Opportunity <strong>#{selectedProject.sourceOpportunityId}</strong>
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 p-4 bg-stone/40 rounded-[12px] border border-pebble">
                <div>
                  <span className="text-ash block">Client:</span>
                  <span className="font-bold text-onyx">{selectedProject.client}</span>
                </div>
                <div>
                  <span className="text-ash block">Budget:</span>
                  <span className="font-bold text-onyx">{selectedProject.budget}</span>
                </div>
                <div>
                  <span className="text-ash block">Location:</span>
                  <span className="font-medium text-onyx">{selectedProject.location}</span>
                </div>
                <div>
                  <span className="text-ash block">Lead Engineer / PM:</span>
                  <span className="font-medium text-onyx">{selectedProject.lead || "Project Lead"}</span>
                </div>

                {/* Assigned Site Manager Field */}
                <div className="col-span-2 pt-2 border-t border-pebble/70">
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
                    className="h-full bg-forest rounded-full"
                    style={{ width: `${selectedProject.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between pt-2 text-ash border-t border-pebble">
                <span>Target Completion:</span>
                <span className="font-semibold text-onyx">{selectedProject.due}</span>
              </div>
            </div>

            <div className="p-4 border-t border-pebble flex justify-between items-center bg-stone/40">
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
                onClick={() => setSelectedProject(null)}
                className="text-xs bg-onyx text-white cursor-pointer"
              >
                Close
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-onyx">Project Lead (PM)</Label>
                  <Input
                    placeholder="e.g. Project Lead"
                    value={projectLead}
                    onChange={(e) => setProjectLead(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-onyx">Due Date</Label>
                  <Input
                    placeholder="e.g. 30 Dec 2026"
                    value={projectDue}
                    onChange={(e) => setProjectDue(e.target.value)}
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
    </FirmaLayout>
  );
}