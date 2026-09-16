"use client";

import { useState, useEffect } from "react";
import FirmaLayout from "@/components/layout/FirmaLayout";
import {
  useLeadFlowStore,
  type ProjectItem,
} from "@/store/leadFlowStore";
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
} from "lucide-react";

export default function ProjectsPage() {
  const { projects, addProject, deleteProject, clearAllDummyData } = useLeadFlowStore();

  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  // New Project Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectClient, setProjectClient] = useState("");
  const [projectLocation, setProjectLocation] = useState("");
  const [projectBudget, setProjectBudget] = useState("");
  const [projectLead, setProjectLead] = useState("");
  const [projectDue, setProjectDue] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const projectList = mounted ? projects : [];

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
      p.id.toLowerCase().includes(search.toLowerCase());
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
      lead: projectLead,
      due: projectDue,
    };

    addProject(newProj);
    setShowAddModal(false);
    setProjectName("");
    setProjectClient("");
    setProjectLocation("");
    setProjectBudget("");
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

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-[10px] bg-forest hover:bg-forest-hover text-white px-4.5 py-2.5 text-sm font-medium shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 text-breath" />
          <span>New Project</span>
        </button>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-[10px] bg-white p-4 border border-pebble/60 shadow-2xs">
          <span className="text-xs font-semibold text-ash">Total Projects</span>
          <p className="text-2xl font-bold text-onyx mt-1">{totalCount}</p>
          <p className="text-xs font-medium text-complete-status mt-1">Across all sites</p>
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
            placeholder="Search projects by name, client..."
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

              <div className="mt-5 pt-3 border-t border-pebble/60 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-ash block">Budget</span>
                  <span className="font-bold text-onyx">{item.budget}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-ash block">Project Lead</span>
                  <span className="font-medium text-onyx">{item.lead}</span>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-ash text-xs border border-dashed border-pebble rounded-[12px] bg-white">
            No projects found matching current filter.
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
                className="p-1 rounded-md text-ash hover:text-onyx"
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
                  <span className="text-ash block">Lead Engineer:</span>
                  <span className="font-medium text-onyx">{selectedProject.lead}</span>
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
              <Button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="text-xs bg-onyx text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-[16px] shadow-2xl border border-pebble overflow-hidden">
            <div className="p-5 border-b border-pebble flex items-center justify-between bg-stone/50">
              <h3 className="text-base font-bold text-onyx">Create New Project</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-ash hover:text-onyx"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="p-5 space-y-3.5">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-onyx">Project Name *</Label>
                <Input
                  required
                  placeholder="e.g. Skyline Logistics Hub Phase 2"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-onyx">Client / Developer *</Label>
                <Input
                  required
                  placeholder="e.g. Skyline Freight Solutions"
                  value={projectClient}
                  onChange={(e) => setProjectClient(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-onyx">Location</Label>
                  <Input
                    placeholder="e.g. Manesar, Haryana"
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
                  <Label className="text-xs font-semibold text-onyx">Project Lead</Label>
                  <Input
                    placeholder="e.g. Project Lead / PM"
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

              <div className="pt-3 border-t border-pebble flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="text-xs h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-forest hover:bg-forest-hover text-white text-xs h-9 font-medium"
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