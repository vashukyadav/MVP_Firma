"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  JobItem,
  JobPhoto,
  useTenderFlowStore,
} from "@/store/tenderFlowStore";
import { useAuthStore } from "@/store/authStore";
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
  ShieldCheck,
  Navigation,
  Send,
  HelpCircle,
  Package,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import JobPhotoModal from "./JobPhotoModal";

interface JobDetailViewProps {
  job: JobItem;
  onBack: () => void;
  onOpenSchedule?: () => void;
  onOpenReassign?: () => void;
}

type TabKey =
  | "OVERVIEW"
  | "PHOTOS"
  | "MATERIALS"
  | "NOTES"
  | "TIMESHEET"
  | "RFIS"
  | "VARIATIONS"
  | "SCHEDULE"
  | "TEAM"
  | "DOCUMENTS";

type PhotoCategory = "ALL" | "BEFORE" | "PROGRESS" | "AFTER";

export default function JobDetailView({
  job,
  onBack,
  onOpenSchedule,
  onOpenReassign,
}: JobDetailViewProps) {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.currentUser);
  const isWorker = currentUser?.role === "FIELD_WORKER";

  // Strictly protect this flow for Field Worker role
  useEffect(() => {
    if (currentUser && currentUser.role !== "FIELD_WORKER") {
      onBack();
    }
  }, [currentUser, onBack]);

  const {
    toggleJob,
    updateJobStatus,
    addPhotoToJob,
    deletePhotoFromJob,
    addMaterialToJob,
    addNoteToJob,
  } = useTenderFlowStore();

  const [activeTab, setActiveTab] = useState<TabKey>("OVERVIEW");
  const [photoCategory, setPhotoCategory] = useState<PhotoCategory>("ALL");
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  if (currentUser && currentUser.role !== "FIELD_WORKER") {
    return null;
  }

  // Material form state
  const [materialName, setMaterialName] = useState("");
  const [materialQty, setMaterialQty] = useState("");
  const [showMaterialForm, setShowMaterialForm] = useState(false);

  // Note form state
  const [noteText, setNoteText] = useState("");

  // Modal inspection state
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const photos = job.photos || [];
  const materials = job.materials || [];
  const notes = job.notes || [];

  // Filter photos by category tab
  const filteredPhotos = useMemo(() => {
    if (photoCategory === "ALL") return photos;
    return photos.filter((p) => {
      const stage = (p.stage || p.category || "").toUpperCase();
      return stage.includes(photoCategory);
    });
  }, [photos, photoCategory]);

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

        const authorName = currentUser?.name || job.assignee || "Field Worker";
        const authorInitials =
          authorName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "FW";
        const authorRole =
          currentUser?.role === "SITE_MANAGER" ? "Site Manager" : "Field Worker";

        addPhotoToJob(job.id, {
          url: result,
          title: file.name.replace(/\.[^/.]+$/, "") || "Site Progress Photo",
          caption: "Uploaded from field work order",
          locationTag: job.location || "Site Zone 1",
          uploadedBy: authorName,
          initials: authorInitials,
          role: authorRole,
          timestamp: `${dateStr} ${timeStr}`,
          date: dateStr,
          time: timeStr,
          stage: photoCategory === "ALL" ? "Progress" : photoCategory === "BEFORE" ? "Before" : photoCategory === "AFTER" ? "After" : "Progress",
          category: "In Progress",
          verified: false,
        });

        toast.success("Site photo uploaded successfully!");
      }
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleStatusChange = (newStatus: JobItem["status"]) => {
    updateJobStatus(job.id, newStatus);
    setShowStatusMenu(false);
    toast.success(`Job status updated to: ${newStatus}`);
  };

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialName.trim() || !materialQty.trim()) return;
    addMaterialToJob(job.id, {
      name: materialName.trim(),
      quantity: materialQty.trim(),
    });
    setMaterialName("");
    setMaterialQty("");
    setShowMaterialForm(false);
    toast.success("Material record added to work order!");
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    addNoteToJob(job.id, {
      text: noteText.trim(),
      author: currentUser?.name || "Rahul Kumar",
    });
    setNoteText("");
    toast.success("Site technician note recorded!");
  };

  // Status badge styling helper
  const getStatusBadge = (status: JobItem["status"]) => {
    switch (status) {
      case "Travelling":
        return "bg-purple-50 text-purple-800 border-purple-200";
      case "On-site":
      case "In Progress":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "Completed":
        return "bg-green-100 text-green-900 border-green-300";
      case "Upcoming":
        return "bg-stone text-ash border-pebble";
      default:
        return "bg-sky-50 text-sky-800 border-sky-200";
    }
  };

  return (
    <div className="space-y-6 mt-3 pb-16 font-sans">
      {/* ========================================================================= */}
      {/* 1. BREADCRUMBS & TOP NAV                                                  */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-xs text-ash">
          <button
            type="button"
            onClick={onBack}
            className="hover:text-forest transition cursor-pointer font-medium"
          >
            {isWorker ? "My Jobs" : "Jobs"}
          </button>
          <span className="text-pebble font-semibold">&gt;</span>
          <span className="text-ash truncate max-w-[150px]">
            {job.projectName || "Riverside Apartments"}
          </span>
          <span className="text-pebble font-semibold">&gt;</span>
          <span className="font-bold text-onyx">{job.id}</span>
        </nav>

        <button
          type="button"
          onClick={onBack}
          className="text-xs font-semibold text-ash hover:text-onyx cursor-pointer"
        >
          &larr; Back to List
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. JOB HEADER & STATUS ACTION (Screen 3)                                  */}
      {/* ========================================================================= */}
      <div className="rounded-[16px] bg-white border border-pebble/80 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-onyx tracking-tight">
                {job.id} – {job.title}
              </h1>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(
                  job.status
                )}`}
              >
                {job.status}
              </span>
            </div>

            <p className="text-xs text-ash mt-1.5 flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-onyx">
                {job.projectName || "Riverside Apartments"}
              </span>
              <span>&bull;</span>
              <span>Block A</span>
              <span>&bull;</span>
              <span className="text-forest font-semibold">
                {job.trade || "Electrical"}
              </span>
            </p>
          </div>

          {/* Right Action: Update Status (Field Worker) or Actions (Manager) */}
          <div className="flex items-center gap-2.5 relative">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="flex items-center gap-2 px-4 py-2 rounded-[10px] bg-forest hover:bg-[#083a2d] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <span>Update Status</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {/* Status Dropdown Menu */}
              {showStatusMenu && (
                <div className="absolute right-0 top-full mt-1.5 w-44 rounded-[12px] bg-white border border-pebble p-1.5 shadow-xl z-30 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-ash tracking-wider">
                    Change Status
                  </div>
                  {(["Scheduled", "Travelling", "On-site", "Completed"] as JobItem["status"][]).map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleStatusChange(st)}
                        className={`w-full text-left px-3 py-2 rounded-[8px] text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                          job.status === st
                            ? "bg-breath text-onyx font-bold"
                            : "text-onyx hover:bg-stone"
                        }`}
                      >
                        <span>{st}</span>
                        {job.status === st && <Check className="h-3.5 w-3.5 text-forest" />}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. NAVIGATION TABS (Screen 3: Overview, Photos, Materials, Notes, etc.)    */}
      {/* ========================================================================= */}
      <div className="border-b border-pebble/80">
        <div className="flex items-center gap-6 overflow-x-auto text-xs no-scrollbar">
          {[
            { key: "OVERVIEW", label: "Overview" },
            { key: "PHOTOS", label: `Photos (${photos.length})` },
            { key: "MATERIALS", label: `Materials (${materials.length})` },
            { key: "NOTES", label: `Notes (${notes.length})` },
            { key: "TIMESHEET", label: "Timesheet" },
            { key: "RFIS", label: "RFIs (1)" },
            { key: "VARIATIONS", label: "Variations (1)" },
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
      {/* 4. TAB CONTENT: OVERVIEW (Screen 3)                                       */}
      {/* ========================================================================= */}
      {activeTab === "OVERVIEW" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Job Spec & Details (7 cols) */}
          <div className="lg:col-span-7 rounded-[16px] bg-white border border-pebble/80 p-5 sm:p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-onyx tracking-tight">
              Job Specifications
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pb-4 border-b border-pebble/60 text-xs">
              <div className="p-3 rounded-[10px] bg-stone/50 border border-pebble/70">
                <span className="text-[11px] font-semibold text-ash block">
                  Date &amp; Time
                </span>
                <p className="font-bold text-onyx mt-1">
                  {job.due || "16 Sep 2025"}
                </p>
                <p className="text-[11px] text-ash">
                  {job.timeSlot || "08:00 AM - 10:00 AM"}
                </p>
              </div>

              <div className="p-3 rounded-[10px] bg-stone/50 border border-pebble/70">
                <span className="text-[11px] font-semibold text-ash block">
                  Client
                </span>
                <p className="font-bold text-onyx mt-1">
                  {job.client || "ABC Construction"}
                </p>
                <p className="text-[11px] text-ash">Main Contractor</p>
              </div>

              <div className="p-3 rounded-[10px] bg-stone/50 border border-pebble/70">
                <span className="text-[11px] font-semibold text-ash block">
                  Site Contact
                </span>
                <p className="font-bold text-onyx mt-1">
                  {job.siteContact || "Mr. Sharma (98765 43210)"}
                </p>
                <a
                  href={`tel:${job.siteContactPhone || "9876543210"}`}
                  className="inline-flex items-center gap-1 text-[11px] text-forest font-bold mt-1 hover:underline"
                >
                  <Phone className="h-3 w-3" />
                  <span>Call Contact</span>
                </a>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-onyx block">Description</span>
              <p className="text-xs text-ash leading-relaxed">
                {job.description ||
                  "Install electrical wiring, DB switches and sockets as per drawings."}
              </p>
            </div>

            {/* Location */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-onyx block">Location</span>
              <p className="text-xs text-onyx font-medium">
                {job.location || "Block A - 2nd Floor, Riverside Apartments"}
              </p>
            </div>

            {/* Safety Notes */}
            <div className="rounded-[12px] bg-amber-50/60 border border-amber-200/80 p-3.5 flex items-start gap-3 text-xs">
              <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-950 block">Safety Notes</span>
                <p className="text-amber-900 mt-0.5">
                  {job.safetyNotes || "Wear PPE. Follow site safety guidelines."}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Map Card (Screen 3) (5 cols) */}
          <div className="lg:col-span-5 rounded-[16px] bg-white border border-pebble/80 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-onyx tracking-tight mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-forest" />
                <span>Site Location Map</span>
              </h2>

              {/* Map Illustration / Visual Canvas */}
              <div className="relative h-52 w-full rounded-[12px] overflow-hidden border border-pebble bg-stone flex items-center justify-center">
                {/* Stylized Map Grid Background */}
                <div
                  className="absolute inset-0 opacity-40"
                  style={{
                    backgroundImage:
                      "radial-gradient(#0B4D3C 0.75px, transparent 0.75px), radial-gradient(#1c2e26 0.75px, #f4f3ef 0.75px)",
                    backgroundSize: "24px 24px",
                    backgroundPosition: "0 0, 12px 12px",
                  }}
                />

                {/* Map Road Graphics */}
                <svg
                  className="absolute inset-0 h-full w-full opacity-30"
                  viewBox="0 0 300 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M-20 40 Q 150 70 320 20"
                    stroke="#1c2e26"
                    strokeWidth="12"
                  />
                  <path
                    d="M80 -20 Q 110 120 160 220"
                    stroke="#1c2e26"
                    strokeWidth="16"
                  />
                  <path
                    d="M20 180 Q 150 140 320 170"
                    stroke="#0B4D3C"
                    strokeWidth="8"
                  />
                </svg>

                {/* Center Pin Indicator */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest text-white shadow-lg animate-bounce">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="mt-1 rounded-md bg-onyx px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
                    {job.location || "Riverside Apartments"}
                  </div>
                  <span className="text-[10px] font-medium text-ash mt-0.5">
                    Block A, Delhi
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-pebble/60 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold text-onyx truncate">
                  Riverside Apartments
                </p>
                <p className="text-[11px] text-ash truncate">Block A, Delhi</p>
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  job.location || "Riverside Apartments Block A Delhi"
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] bg-onyx hover:bg-black text-white text-xs font-bold transition shadow-2xs shrink-0"
              >
                <Navigation className="h-3.5 w-3.5" />
                <span>Open in Maps</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB CONTENT: PHOTOS (Screen 4)                                         */}
      {/* ========================================================================= */}
      {activeTab === "PHOTOS" && (
        <div className="space-y-4">
          <div className="rounded-[16px] bg-white border border-pebble/80 p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Category Filter Chips (Screen 4) */}
              <div className="flex items-center gap-2 overflow-x-auto text-xs">
                {(
                  [
                    { key: "ALL", label: `All Photos (${photos.length})` },
                    { key: "BEFORE", label: "Before" },
                    { key: "PROGRESS", label: "Progress" },
                    { key: "AFTER", label: "After" },
                  ] as { key: PhotoCategory; label: string }[]
                ).map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setPhotoCategory(cat.key)}
                    className={`px-3.5 py-1.5 rounded-full font-bold transition cursor-pointer text-xs ${
                      photoCategory === cat.key
                        ? "bg-forest text-white shadow-2xs"
                        : "bg-stone text-ash hover:text-onyx"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Upload Button */}
              <label className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-forest hover:bg-[#083a2d] text-white text-xs font-bold transition shadow-2xs cursor-pointer self-start sm:self-auto shrink-0">
                <Plus className="h-3.5 w-3.5" />
                <span>Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Photo Grid matching Screen 4 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {filteredPhotos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => setShowPhotoModal(true)}
                  className="rounded-[12px] border border-pebble/80 bg-white overflow-hidden shadow-2xs hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
                >
                  <div className="relative h-44 w-full bg-stone overflow-hidden">
                    <Image
                      src={photo.url}
                      alt={photo.title || "Site photo"}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition duration-200"
                    />
                    <div className="absolute top-2.5 right-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-onyx/80 text-white backdrop-blur-xs">
                        {photo.stage || photo.category || "Progress"}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5">
                    <p className="text-xs font-bold text-onyx truncate group-hover:text-forest transition">
                      {photo.title || photo.caption || "Site progress photo"}
                    </p>
                    <p className="text-[11px] text-ash mt-0.5">
                      {photo.timestamp || photo.date || "16 Sep 2025, 09:12 AM"}
                    </p>
                  </div>
                </div>
              ))}

              {/* Upload Photo Dropzone Card Tile */}
              <label className="rounded-[12px] border-2 border-dashed border-pebble hover:border-forest bg-stone/20 hover:bg-breath/40 p-6 flex flex-col items-center justify-center text-center transition cursor-pointer min-h-[220px]">
                <CloudUpload className="h-9 w-9 text-forest mb-2 stroke-[1.5]" />
                <span className="text-xs font-bold text-onyx block">
                  Upload Photo
                </span>
                <span className="text-[11px] text-ash mt-1 max-w-[180px]">
                  Drag and drop photo here, or click to browse
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
      )}

      {/* ========================================================================= */}
      {/* 6. TAB CONTENT: MATERIALS                                                 */}
      {/* ========================================================================= */}
      {activeTab === "MATERIALS" && (
        <div className="rounded-[16px] bg-white border border-pebble/80 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-onyx tracking-tight">
                Materials Used on Site
              </h2>
              <p className="text-xs text-ash mt-0.5">
                Log quantities of electrical hardware, wiring, and fixtures installed.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowMaterialForm(!showMaterialForm)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] bg-forest text-white text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Log Material</span>
            </button>
          </div>

          {/* Inline Add Material Form */}
          {showMaterialForm && (
            <form
              onSubmit={handleAddMaterial}
              className="p-4 rounded-[12px] bg-stone/60 border border-pebble space-y-3 animate-in fade-in duration-150"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-onyx mb-1">
                    Material Item Name
                  </label>
                  <input
                    type="text"
                    value={materialName}
                    onChange={(e) => setMaterialName(e.target.value)}
                    placeholder="e.g. 20mm PVC Conduit Pipes"
                    className="w-full rounded-[8px] border border-pebble px-3 py-2 text-xs text-onyx bg-white focus:outline-forest"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-onyx mb-1">Quantity</label>
                  <input
                    type="text"
                    value={materialQty}
                    onChange={(e) => setMaterialQty(e.target.value)}
                    placeholder="e.g. 15 pcs or 60 meters"
                    className="w-full rounded-[8px] border border-pebble px-3 py-2 text-xs text-onyx bg-white focus:outline-forest"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowMaterialForm(false)}
                  className="px-3 py-1.5 rounded-[6px] bg-stone text-ash font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-[6px] bg-forest text-white font-bold text-xs shadow-2xs"
                >
                  Save Material
                </button>
              </div>
            </form>
          )}

          {/* Materials Table */}
          <div className="divide-y divide-pebble/60 border border-pebble/80 rounded-[12px] overflow-hidden">
            {materials.length === 0 ? (
              <p className="text-xs text-ash p-6 text-center">
                No materials logged yet for this work order. Click &quot;Log Material&quot; to add.
              </p>
            ) : (
              materials.map((mat) => (
                <div
                  key={mat.id}
                  className="flex items-center justify-between p-3.5 bg-white hover:bg-stone/30 transition text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Package className="h-4 w-4 text-forest" />
                    <span className="font-bold text-onyx">{mat.name}</span>
                  </div>
                  <span className="font-semibold text-onyx bg-stone px-2.5 py-1 rounded-[6px] border border-pebble">
                    {mat.quantity}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. TAB CONTENT: NOTES                                                     */}
      {/* ========================================================================= */}
      {activeTab === "NOTES" && (
        <div className="rounded-[16px] bg-white border border-pebble/80 p-5 sm:p-6 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-onyx tracking-tight">
            Site Notes &amp; Observations
          </h2>

          <form onSubmit={handleAddNote} className="space-y-2">
            <textarea
              rows={2}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add observation, snag detail, or site condition note..."
              className="w-full rounded-[10px] border border-pebble px-3.5 py-2.5 text-xs text-onyx focus:outline-forest placeholder:text-ash"
              required
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-forest text-white text-xs font-bold transition shadow-2xs cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Add Note</span>
              </button>
            </div>
          </form>

          <div className="space-y-2.5 pt-2">
            {notes.length === 0 ? (
              <p className="text-xs text-ash py-4 text-center">No notes recorded yet.</p>
            ) : (
              notes.map((n) => (
                <div
                  key={n.id}
                  className="p-3.5 rounded-[10px] bg-stone/40 border border-pebble/70 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between text-[11px] text-ash">
                    <span className="font-bold text-onyx">{n.author}</span>
                    <span>{n.time}</span>
                  </div>
                  <p className="text-onyx">{n.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. TAB CONTENT: TIMESHEET (Screen 5 quick view)                           */}
      {/* ========================================================================= */}
      {activeTab === "TIMESHEET" && (
        <div className="rounded-[16px] bg-white border border-pebble/80 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-onyx tracking-tight">
                Timesheet Entries for {job.id}
              </h2>
              <p className="text-xs text-ash mt-0.5">
                Hours recorded against this specific job order.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/timesheets")}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] bg-forest text-white text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Open Full Timesheet</span>
            </button>
          </div>

          <div className="border border-dashed border-pebble/80 rounded-[12px] p-8 text-center bg-stone/20">
            <Clock className="h-8 w-8 text-ash/60 mx-auto mb-2" />
            <p className="text-xs font-bold text-onyx">No timesheet logs for this job yet</p>
            <p className="text-[11px] text-ash mt-0.5">
              Clock-in on-site or submit hours from the Timesheets page.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. TAB CONTENT: RFIS & VARIATIONS QUICK LINKS                             */}
      {/* ========================================================================= */}
      {activeTab === "RFIS" && (
        <div className="rounded-[16px] bg-white border border-pebble/80 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-onyx tracking-tight">
                RFIs for {job.id}
              </h2>
              <p className="text-xs text-ash mt-0.5">
                Technical queries or site clarifications submitted for this job.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/rfis")}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] bg-forest text-white text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Raise New RFI</span>
            </button>
          </div>

          <div className="border border-dashed border-pebble/80 rounded-[12px] p-8 text-center bg-stone/20">
            <FileText className="h-8 w-8 text-ash/60 mx-auto mb-2" />
            <p className="text-xs font-bold text-onyx">No RFIs raised for {job.id}</p>
            <p className="text-[11px] text-ash mt-0.5">
              Need technical clarification or site instruction? Click &quot;Raise New RFI&quot; above.
            </p>
          </div>
        </div>
      )}

      {activeTab === "VARIATIONS" && (
        <div className="rounded-[16px] bg-white border border-pebble/80 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-onyx tracking-tight">
                Variations for {job.id}
              </h2>
              <p className="text-xs text-ash mt-0.5">
                Site scope adjustments or additional work claims.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/variations")}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] bg-forest text-white text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Raise Variation</span>
            </button>
          </div>

          <div className="border border-dashed border-pebble/80 rounded-[12px] p-8 text-center bg-stone/20">
            <Layers className="h-8 w-8 text-ash/60 mx-auto mb-2" />
            <p className="text-xs font-bold text-onyx">No variations recorded for {job.id}</p>
            <p className="text-[11px] text-ash mt-0.5">
              Scope deviations or additional client requests can be submitted via &quot;Raise Variation&quot;.
            </p>
          </div>
        </div>
      )}

      {/* Photo inspection modal */}
      {showPhotoModal && (
        <JobPhotoModal
          job={job}
          isOpen={showPhotoModal}
          onClose={() => setShowPhotoModal(false)}
          currentUserName={currentUser?.name || "Rahul Kumar"}
        />
      )}
    </div>
  );
}
