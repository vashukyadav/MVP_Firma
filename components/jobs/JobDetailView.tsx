"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  JobItem,
  JobPhoto,
  useTenderFlowStore,
} from "@/store/tenderFlowStore";
import {
  Briefcase,
  MapPin,
  Calendar,
  ArrowLeftRight,
  Plus,
  CheckCircle2,
  Clock,
  Camera,
  MoreHorizontal,
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
  Filter,
  Eye,
  Trash2,
} from "lucide-react";
import JobPhotoModal from "./JobPhotoModal";

interface JobDetailViewProps {
  job: JobItem;
  onBack: () => void;
  onOpenSchedule?: () => void;
  onOpenReassign?: () => void;
}

type TabKey =
  | "OVERVIEW"
  | "SCHEDULE"
  | "TEAM"
  | "MATERIALS"
  | "PROGRESS"
  | "RFIS"
  | "VARIATIONS"
  | "PHOTOS"
  | "DOCUMENTS"
  | "ACTIVITY";

type PhotoFilterMode = "ALL" | "BY_DATE" | "BY_USER" | "BY_STAGE" | "BY_LOCATION";

export default function JobDetailView({
  job,
  onBack,
  onOpenSchedule,
  onOpenReassign,
}: JobDetailViewProps) {
  const router = useRouter();
  const { toggleJob, addPhotoToJob, deletePhotoFromJob } = useTenderFlowStore();

  const [activeTab, setActiveTab] = useState<TabKey>("PHOTOS");
  const [photoFilter, setPhotoFilter] = useState<PhotoFilterMode>("ALL");

  // Modal inspection state
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // File upload state for dropzone
  const [isUploading, setIsUploading] = useState(false);

  const photos = job.photos || [];

  // Filtered photos according to left sidebar selection
  const filteredPhotos = useMemo(() => {
    if (photoFilter === "ALL") return photos;
    if (photoFilter === "BY_DATE") {
      return [...photos].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    }
    if (photoFilter === "BY_USER") {
      return [...photos].sort((a, b) => a.uploadedBy.localeCompare(b.uploadedBy));
    }
    if (photoFilter === "BY_STAGE") {
      return [...photos].sort((a, b) => (a.stage || "").localeCompare(b.stage || ""));
    }
    if (photoFilter === "BY_LOCATION") {
      return [...photos].sort((a, b) => (a.locationTag || "").localeCompare(b.locationTag || ""));
    }
    return photos;
  }, [photos, photoFilter]);

  // Handle local file drop or file select
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const file = files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        const now = new Date();
        const dateStr = now.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        const timeStr = now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });

        addPhotoToJob(job.id, {
          url: result,
          title: file.name.replace(/\.[^/.]+$/, "") || "Site Progress Photo",
          caption: "Uploaded from field work order",
          locationTag: job.location || "Site Zone 1",
          uploadedBy: "Rahul Kumar",
          initials: "RK",
          role: "Field Worker",
          timestamp: `${dateStr} ${timeStr}`,
          date: dateStr,
          time: timeStr,
          stage: "Site Execution",
          category: "In Progress",
          verified: false,
        });
      }
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 mt-3 pb-16">
      {/* ========================================================================= */}
      {/* 1. BREADCRUMBS                                                            */}
      {/* ========================================================================= */}
      <nav className="flex items-center gap-2 text-xs text-ash">
        <button
          type="button"
          onClick={onBack}
          className="hover:text-forest transition cursor-pointer font-medium"
        >
          Jobs
        </button>
        <span className="text-pebble font-semibold">&gt;</span>
        <span className="font-bold text-onyx">{job.id}</span>
      </nav>

      {/* ========================================================================= */}
      {/* 2. JOB TITLE HEADER & ACTIONS                                             */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-pebble bg-white text-onyx shrink-0 shadow-2xs">
            <Briefcase className="h-5 w-5 text-forest" />
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-onyx tracking-tight">
                {job.id}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300/70">
                {job.status === "Completed" ? "Completed" : "In Progress"}
              </span>
            </div>

            <p className="text-xs font-semibold text-onyx mt-0.5">
              {job.title}
            </p>

            <p className="text-xs text-ash flex items-center gap-1 mt-1">
              <MapPin className="h-3.5 w-3.5 text-ash" />
              <span>{job.location}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons on Right */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => alert("Edit job details dialog")}
            className="px-3.5 py-2 rounded-[8px] bg-white border border-pebble hover:bg-stone text-xs font-semibold text-onyx shadow-2xs transition cursor-pointer"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => {
              if (onOpenSchedule) {
                onOpenSchedule();
              } else {
                router.push(`/scheduling?jobId=${job.id}&openSchedule=true`);
              }
            }}
            className="px-3.5 py-2 rounded-[8px] bg-white border border-pebble hover:bg-stone text-xs font-semibold text-onyx shadow-2xs transition cursor-pointer flex items-center gap-1.5"
          >
            <Calendar className="h-3.5 w-3.5 text-ash" />
            <span>Schedule</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onOpenReassign) onOpenReassign();
            }}
            className="px-3.5 py-2 rounded-[8px] bg-white border border-pebble hover:bg-stone text-xs font-semibold text-onyx shadow-2xs transition cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeftRight className="h-3.5 w-3.5 text-ash" />
            <span>Reassign</span>
          </button>

          <button
            type="button"
            onClick={() => {
              toggleJob(job.id);
            }}
            className="px-4 py-2 rounded-[8px] bg-[#0B4D3C] hover:bg-[#083a2d] text-xs font-bold text-white shadow-xs transition cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{job.completed ? "Mark as In Progress" : "Complete Job"}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. FIVE KPI SUMMARY CARDS (Exactly matching Figma)                        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Contractor */}
        <div className="rounded-[12px] bg-white p-4 border border-pebble shadow-2xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0">
            <HardHat className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-ash block">Contractor</span>
            <p className="text-xs font-bold text-onyx truncate">
              {job.contractorName || job.assignee || "Sharma Electrical Works"}
            </p>
            <span className="text-[10px] text-ash block">Awarded Contractor</span>
          </div>
        </div>

        {/* Card 2: Trade */}
        <div className="rounded-[12px] bg-white p-4 border border-pebble shadow-2xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-amber-50 text-amber-700 border border-amber-200/60 shrink-0">
            <Wrench className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-ash block">Trade</span>
            <p className="text-xs font-bold text-onyx truncate">
              {job.trade || "Electrical"}
            </p>
          </div>
        </div>

        {/* Card 3: Start Date */}
        <div className="rounded-[12px] bg-white p-4 border border-pebble shadow-2xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-sky-50 text-sky-700 border border-sky-200/60 shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-ash block">Start Date</span>
            <p className="text-xs font-bold text-onyx truncate">
              {job.startDate || "15 Sep 2025"}
            </p>
          </div>
        </div>

        {/* Card 4: End Date */}
        <div className="rounded-[12px] bg-white p-4 border border-pebble shadow-2xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200/60 shrink-0">
            <CalendarCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-ash block">End Date</span>
            <p className="text-xs font-bold text-onyx truncate">
              {job.endDate || job.due || "30 Sep 2025"}
            </p>
          </div>
        </div>

        {/* Card 5: Status */}
        <div className="rounded-[12px] bg-white p-4 border border-pebble shadow-2xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0">
            <Activity className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-ash block">Status</span>
            <p className="text-xs font-bold text-emerald-700 truncate">
              {job.status === "Completed" ? "Completed" : "In Progress"}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. HORIZONTAL SUB-NAVIGATION TABS                                         */}
      {/* ========================================================================= */}
      <div className="border-b border-pebble">
        <div className="flex items-center gap-6 overflow-x-auto text-xs no-scrollbar">
          {[
            { key: "OVERVIEW", label: "Overview" },
            { key: "SCHEDULE", label: "Schedule" },
            { key: "TEAM", label: "Team" },
            { key: "MATERIALS", label: "Materials" },
            { key: "PROGRESS", label: "Progress" },
            { key: "RFIS", label: "RFIs (1)" },
            { key: "VARIATIONS", label: "Variations (0)" },
            { key: "PHOTOS", label: `Photos (${photos.length})` },
            { key: "DOCUMENTS", label: "Documents (3)" },
            { key: "ACTIVITY", label: "Activity" },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as TabKey)}
                className={`pb-3 font-semibold transition cursor-pointer whitespace-nowrap relative ${
                  isActive
                    ? "text-[#0B4D3C] font-bold border-b-2 border-[#0B4D3C]"
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
      {/* 5. TAB CONTENT: PHOTOS (Exact Figma Design)                               */}
      {/* ========================================================================= */}
      {activeTab === "PHOTOS" ? (
        <div className="space-y-4">
          {/* Photos Header Row */}
          <div className="rounded-[14px] bg-white p-5 border border-pebble shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-onyx flex items-center gap-2">
                  <Camera className="h-5 w-5 text-onyx" />
                  <span>Site Photos</span>
                </h2>
                <p className="text-xs text-ash mt-0.5">
                  Photos uploaded from site by field workers / contractor team. Visible to Site Manager, Project Manager and authorised team members.
                </p>
              </div>

              {/* Upload Photos Button */}
              <label className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-[#0B4D3C] hover:bg-[#083a2d] text-white text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto shrink-0">
                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>Upload Photos</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Two-Column Section: Left Filter Sidebar & Right Photos Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-2">
              {/* Left Column: Filter Sidebar */}
              <div className="md:col-span-3 space-y-1">
                {[
                  {
                    key: "ALL",
                    label: "All Photos",
                    badge: photos.length,
                    icon: Layers,
                  },
                  {
                    key: "BY_DATE",
                    label: "By Date",
                    icon: Calendar,
                  },
                  {
                    key: "BY_USER",
                    label: "By User",
                    icon: Users,
                  },
                  {
                    key: "BY_STAGE",
                    label: "By Work Stage",
                    icon: CheckCircle2,
                  },
                  {
                    key: "BY_LOCATION",
                    label: "By Location",
                    icon: MapPin,
                  },
                ].map((item) => {
                  const isSelected = photoFilter === item.key;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setPhotoFilter(item.key as PhotoFilterMode)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[8px] text-xs transition cursor-pointer ${
                        isSelected
                          ? "bg-[#E8F3EE] text-[#0B4D3C] font-bold"
                          : "text-onyx hover:bg-stone font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`h-4 w-4 ${
                            isSelected ? "text-[#0B4D3C]" : "text-ash"
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] ${
                            isSelected
                              ? "bg-[#C4E3D4] text-[#0B4D3C] font-bold"
                              : "bg-stone text-ash"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Grid of Photo Cards */}
              <div className="md:col-span-9">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Render Photo Cards */}
                  {filteredPhotos.map((photo, idx) => {
                    const initials =
                      photo.initials ||
                      photo.uploadedBy
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase() ||
                      "RK";

                    return (
                      <div
                        key={photo.id || idx}
                        onClick={() => {
                          setActivePhotoIndex(idx);
                          setShowPhotoModal(true);
                        }}
                        className="rounded-[12px] bg-white border border-pebble/80 shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-md transition cursor-pointer group"
                      >
                        {/* Top Photo with 3-Dots Button */}
                        <div className="h-44 w-full relative overflow-hidden bg-stone">
                          <img
                            src={photo.url}
                            alt={photo.title || "Site Photo"}
                            className="object-cover w-full h-full group-hover:scale-105 transition duration-200"
                          />

                          {/* 3 Dots Menu Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm("Remove this site photo?")) {
                                deletePhotoFromJob(job.id, photo.id);
                              }
                            }}
                            className="absolute top-2.5 right-2.5 h-7 w-7 rounded-[6px] bg-black/50 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer"
                            title="Options"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Middle: Title & Location */}
                        <div className="p-3.5 space-y-0.5">
                          <h3 className="text-xs font-bold text-onyx truncate">
                            {photo.title || photo.caption || "Site Photo"}
                          </h3>
                          <p className="text-[11px] text-ash truncate">
                            {photo.locationTag || job.location || "Site Zone 1"}
                          </p>
                        </div>

                        {/* Bottom: Worker info & Timestamp */}
                        <div className="px-3.5 pb-3.5 pt-2 border-t border-pebble/50 flex items-center justify-between text-xs">
                          {/* Worker Avatar & Name */}
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="h-6 w-6 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold text-onyx truncate leading-tight">
                                {photo.uploadedBy}
                              </p>
                              <p className="text-[10px] text-ash truncate leading-tight">
                                {photo.role || "Field Worker"}
                              </p>
                            </div>
                          </div>

                          {/* Timestamp */}
                          <div className="text-right shrink-0">
                            <p className="text-[10px] text-ash leading-tight">
                              {photo.date || photo.timestamp.split(" ")[0] || "16 Sep 2025"}
                            </p>
                            <p className="text-[10px] text-ash leading-tight">
                              {photo.time || photo.timestamp.split(" ").slice(1).join(" ") || "11:32 AM"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* 6th Card: Upload Photos Dropzone Tile */}
                  <label className="rounded-[12px] border-2 border-dashed border-pebble hover:border-[#0B4D3C] bg-stone/20 hover:bg-breath/40 p-6 flex flex-col items-center justify-center text-center transition cursor-pointer min-h-[260px]">
                    <CloudUpload className="h-10 w-10 text-onyx mb-2 stroke-[1.5]" />
                    <span className="text-xs font-bold text-onyx block">
                      Upload Photos
                    </span>
                    <span className="text-[11px] text-ash mt-1 max-w-[180px]">
                      Drag and drop images here, or click to select
                    </span>
                    <span className="text-[10px] text-ash mt-2 block">
                      Supports JPG, PNG (Max 10MB each)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Info Alert Banner (Matching Figma) */}
          <div className="rounded-[10px] bg-blue-50 border border-blue-200/80 p-3.5 flex items-center gap-2.5 text-xs text-blue-900">
            <Info className="h-4 w-4 text-blue-600 shrink-0" />
            <span>
              All uploaded photos are automatically linked to this job and can be viewed by Site Manager, Project Manager and other authorised users.
            </span>
          </div>
        </div>
      ) : (
        /* Other Tab Placeholders */
        <div className="rounded-[14px] bg-white p-8 border border-pebble shadow-2xs text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone text-ash mx-auto">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-onyx">
            {activeTab.charAt(0) + activeTab.slice(1).toLowerCase()} Details
          </h3>
          <p className="text-xs text-ash max-w-md mx-auto">
            Viewing records and data for {job.id} – {job.title}.
          </p>
          <button
            type="button"
            onClick={() => setActiveTab("PHOTOS")}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-forest text-white text-xs font-bold"
          >
            <Camera className="h-3.5 w-3.5" />
            <span>Back to Photos ({photos.length})</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHOTO INSPECTION MODAL                                                    */}
      {/* ========================================================================= */}
      {showPhotoModal && (
        <JobPhotoModal
          job={job}
          isOpen={showPhotoModal}
          onClose={() => setShowPhotoModal(false)}
          currentUserName="Project Manager"
        />
      )}
    </div>
  );
}
