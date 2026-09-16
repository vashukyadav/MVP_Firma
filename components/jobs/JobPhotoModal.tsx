"use client";

import { useState } from "react";
import {
  JobItem,
  JobPhoto,
  useTenderFlowStore,
} from "@/store/tenderFlowStore";
import {
  X,
  Camera,
  CheckCircle2,
  Clock,
  HardHat,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Upload,
  Download,
  Trash2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Eye,
  Plus,
  FileCheck,
} from "lucide-react";

interface JobPhotoModalProps {
  job: JobItem;
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
  currentUserName?: string;
}

const PRESET_SAMPLE_PHOTOS = [
  {
    title: "Distribution Board Wiring",
    url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80",
    caption: "Main distribution board MCB wiring and feeder cable terminations completed.",
    category: "In Progress" as const,
  },
  {
    title: "Zone 1 Conduit Chasing",
    url: "https://images.unsplash.com/photo-1541888946425-d0fbb1861564?auto=format&fit=crop&w=1200&q=80",
    caption: "Conduit pipe wall chasing & copper earthing tape installed on corridor.",
    category: "Completed / Inspection" as const,
  },
  {
    title: "HVAC & Electrical Risers",
    url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
    caption: "Cable trays and cable ties secured along electrical riser shafts.",
    category: "In Progress" as const,
  },
  {
    title: "Site Quality Sign-off",
    url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    caption: "Site engineer joint inspection completed for switchboard insulation testing.",
    category: "Completed / Inspection" as const,
  },
];

export default function JobPhotoModal({
  job,
  isOpen,
  onClose,
  currentUserName = "Project Manager",
}: JobPhotoModalProps) {
  const { addPhotoToJob, deletePhotoFromJob, verifyJobPhoto } =
    useTenderFlowStore();

  const photos = job.photos || [];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showUploadForm, setShowUploadForm] = useState(photos.length === 0);

  // New photo form state
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newPhotoCaption, setNewPhotoCaption] = useState("");
  const [newPhotoCategory, setNewPhotoCategory] = useState<
    "In Progress" | "Completed / Inspection" | "Issue / Snag" | "Safety"
  >("In Progress");
  const [newWorkerName, setNewWorkerName] = useState(
    job.assignee || "Amit Verma (Field Worker)"
  );
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const currentPhoto: JobPhoto | undefined = photos[selectedIndex];

  // Handle local image file picker
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setNewPhotoUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit new photo
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl) {
      alert("Please select or paste a photo.");
      return;
    }

    setIsUploading(true);
    addPhotoToJob(job.id, {
      url: newPhotoUrl,
      caption: newPhotoCaption || "Site execution progress update",
      uploadedBy: newWorkerName || "Field Worker",
      role: "Field Worker",
      category: newPhotoCategory,
      verified: false,
      notes: "Submitted from field work order",
    });

    setIsUploading(false);
    setNewPhotoUrl("");
    setNewPhotoCaption("");
    setShowUploadForm(false);
    setSelectedIndex(0);
  };

  const handleNext = () => {
    if (photos.length > 0) {
      setSelectedIndex((prev) => (prev + 1) % photos.length);
    }
  };

  const handlePrev = () => {
    if (photos.length > 0) {
      setSelectedIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-onyx/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-5xl rounded-[18px] bg-white shadow-2xl border border-pebble flex flex-col max-h-[92vh] overflow-hidden relative animate-in zoom-in-95 duration-150">
        {/* ========================================================================= */}
        {/* MODAL HEADER                                                              */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-pebble bg-stone/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-forest text-white shrink-0 shadow-xs">
              <Camera className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-eyebrow font-bold text-ash uppercase">
                  {job.id}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${job.priorityColor}`}
                >
                  {job.priority} Priority
                </span>
                {job.trade && (
                  <span className="text-[10px] font-semibold text-ash bg-white px-2 py-0.5 rounded-md border border-pebble">
                    {job.trade}
                  </span>
                )}
                <span className="text-[10px] font-bold text-forest bg-breath px-2 py-0.5 rounded-full border border-forest/20">
                  📸 {photos.length} {photos.length === 1 ? "Photo" : "Photos"} Received
                </span>
              </div>

              <h2 className="text-sm sm:text-base font-bold text-onyx truncate mt-0.5">
                {job.title}
              </h2>
              <p className="text-xs text-ash flex items-center gap-1.5 truncate">
                <MapPin className="h-3 w-3 shrink-0 text-forest" />
                <span>{job.location}</span>
                {job.projectName && (
                  <>
                    <span className="text-pebble">•</span>
                    <span className="font-semibold text-onyx">{job.projectName}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-3">
            <button
              type="button"
              onClick={() => setShowUploadForm(!showUploadForm)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-bold transition cursor-pointer ${
                showUploadForm
                  ? "bg-stone border border-pebble text-onyx"
                  : "bg-forest text-white hover:bg-forest-hover shadow-xs"
              }`}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{showUploadForm ? "View Photos" : "+ Add Photo"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-[8px] p-2 text-ash hover:bg-stone hover:text-onyx transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MODAL CONTENT: VIEWER OR UPLOADER                                         */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto">
          {showUploadForm ? (
            /* --------------------------------------------------------------------- */
            /* UPLOAD / ATTACH NEW PHOTO VIEW                                        */
            /* --------------------------------------------------------------------- */
            <div className="p-6 max-w-2xl mx-auto space-y-5">
              <div className="text-center pb-2">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-breath text-forest mb-2">
                  <Upload className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-onyx">
                  Submit Field Worker Site Photo
                </h3>
                <p className="text-xs text-ash mt-1 max-w-md mx-auto">
                  Upload photos taken on site by field workers or trade contractors to document execution progress, quality, and milestone sign-off.
                </p>
              </div>

              {/* Quick preset selector for instant testing */}
              <div className="rounded-[12px] bg-stone/60 border border-pebble p-3.5 space-y-2">
                <span className="text-[11px] font-bold text-ash uppercase flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-forest" />
                  <span>One-Click Test: Pick a Construction Site Photo Preset</span>
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_SAMPLE_PHOTOS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setNewPhotoUrl(preset.url);
                        setNewPhotoCaption(preset.caption);
                        setNewPhotoCategory(preset.category);
                      }}
                      className={`p-2 rounded-[8px] border text-left transition cursor-pointer text-xs ${
                        newPhotoUrl === preset.url
                          ? "border-forest bg-white shadow-xs font-bold text-forest"
                          : "border-pebble bg-white hover:border-forest/40 text-onyx"
                      }`}
                    >
                      <div className="h-14 w-full rounded-[6px] overflow-hidden mb-1.5 bg-stone">
                        <img
                          src={preset.url}
                          alt={preset.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <p className="text-[11px] font-bold leading-tight truncate">
                        {preset.title}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                {/* Upload File Input */}
                <div>
                  <label className="block text-xs font-bold text-onyx mb-1.5">
                    Select Photo File or Camera Capture
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 border-2 border-dashed border-pebble hover:border-forest rounded-[10px] p-4 text-center cursor-pointer transition bg-stone/20 hover:bg-breath/30">
                      <Camera className="h-6 w-6 text-forest mx-auto mb-1.5" />
                      <span className="text-xs font-bold text-onyx block">
                        Click to browse file or take photo
                      </span>
                      <span className="text-[10px] text-ash">
                        PNG, JPG, WebP supported
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Photo Preview if selected */}
                {newPhotoUrl && (
                  <div className="rounded-[10px] border border-pebble p-2.5 bg-stone/30 flex items-center gap-3">
                    <div className="h-16 w-20 rounded-[8px] overflow-hidden bg-black/10 shrink-0">
                      <img
                        src={newPhotoUrl}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-onyx">Photo Attached</p>
                      <p className="text-[11px] text-ash truncate">
                        {newPhotoUrl.startsWith("data:")
                          ? "Uploaded from local device"
                          : newPhotoUrl}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewPhotoUrl("")}
                      className="p-1.5 text-ash hover:text-red-600 rounded-md transition cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Category & Worker Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-onyx mb-1">
                      Execution Category
                    </label>
                    <select
                      value={newPhotoCategory}
                      onChange={(e) =>
                        setNewPhotoCategory(
                          e.target.value as
                            | "In Progress"
                            | "Completed / Inspection"
                            | "Issue / Snag"
                            | "Safety"
                        )
                      }
                      className="w-full px-3 py-2 text-xs bg-stone rounded-[8px] border border-pebble outline-none focus:border-forest text-onyx"
                    >
                      <option value="In Progress">In Progress Execution</option>
                      <option value="Completed / Inspection">
                        Milestone Completed &amp; Inspection
                      </option>
                      <option value="Issue / Snag">Issue / Snag Raised</option>
                      <option value="Safety">Safety &amp; PPE Compliance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-onyx mb-1">
                      Field Worker / Contractor Name
                    </label>
                    <input
                      type="text"
                      value={newWorkerName}
                      onChange={(e) => setNewWorkerName(e.target.value)}
                      placeholder="e.g. Amit Verma (Apex Power)"
                      className="w-full px-3 py-2 text-xs bg-stone rounded-[8px] border border-pebble outline-none focus:border-forest text-onyx"
                    />
                  </div>
                </div>

                {/* Caption / Site Note */}
                <div>
                  <label className="block text-xs font-bold text-onyx mb-1">
                    Worker Note / Description of Work
                  </label>
                  <textarea
                    rows={3}
                    value={newPhotoCaption}
                    onChange={(e) => setNewPhotoCaption(e.target.value)}
                    placeholder="Describe what has been completed, any tests conducted, or notes for the Project Manager..."
                    className="w-full px-3 py-2 text-xs bg-stone rounded-[8px] border border-pebble outline-none focus:border-forest text-onyx resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-pebble">
                  {photos.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowUploadForm(false)}
                      className="px-4 py-2 rounded-[8px] text-xs font-bold border border-pebble bg-white text-ash hover:text-onyx transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isUploading || !newPhotoUrl}
                    className="px-5 py-2 rounded-[8px] text-xs font-bold bg-forest hover:bg-forest-hover text-white shadow-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload &amp; Notify Project Manager</span>
                  </button>
                </div>
              </form>
            </div>
          ) : photos.length === 0 ? (
            /* --------------------------------------------------------------------- */
            /* EMPTY STATE                                                           */
            /* --------------------------------------------------------------------- */
            <div className="p-12 text-center space-y-3">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-stone text-ash">
                <Camera className="h-7 w-7 text-ash/70" />
              </div>
              <h3 className="text-sm font-bold text-onyx">No Site Photos Yet</h3>
              <p className="text-xs text-ash max-w-sm mx-auto">
                No photos have been submitted for this work order yet. Field technicians can send photos using the field dashboard or you can attach evidence directly.
              </p>
              <button
                type="button"
                onClick={() => setShowUploadForm(true)}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-[8px] bg-forest hover:bg-forest-hover text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Attach First Field Photo</span>
              </button>
            </div>
          ) : (
            /* --------------------------------------------------------------------- */
            /* PHOTO GALLERY & VERIFICATION VIEW                                     */
            /* --------------------------------------------------------------------- */
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
              {/* Left Column: Large Image & Carousel (7 cols) */}
              <div className="lg:col-span-7 bg-black/95 flex flex-col items-center justify-between p-4 relative select-none">
                {/* Image display container */}
                <div className="relative w-full flex-1 flex items-center justify-center min-h-[320px] max-h-[460px]">
                  {currentPhoto && (
                    <img
                      src={currentPhoto.url}
                      alt={currentPhoto.caption || "Site Photo"}
                      className="max-h-[440px] max-w-full object-contain rounded-[8px] shadow-lg"
                    />
                  )}

                  {/* Watermark & GPS Location Stamp Overlay */}
                  <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-[6px] text-white text-[11px] flex items-center gap-2 border border-white/10">
                    <MapPin className="h-3.5 w-3.5 text-forest" />
                    <span>
                      {job.location} • {currentPhoto?.timestamp}
                    </span>
                  </div>

                  {/* Category Pill Tag Overlay */}
                  <div className="absolute top-3 left-3">
                    <span className="bg-forest/90 backdrop-blur-md text-white font-bold text-[10px] px-2.5 py-1 rounded-full border border-forest shadow-xs">
                      {currentPhoto?.category || "In Progress"}
                    </span>
                  </div>

                  {/* Verification Pill Overlay */}
                  <div className="absolute top-3 right-3">
                    {currentPhoto?.verified ? (
                      <span className="bg-success text-white font-bold text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Quality Verified</span>
                      </span>
                    ) : (
                      <span className="bg-caution-bg text-caution-text font-bold text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 border border-pebble shadow-xs">
                        <Clock className="h-3 w-3" />
                        <span>Awaiting PM Sign-off</span>
                      </span>
                    )}
                  </div>

                  {/* Next / Prev Navigation Buttons */}
                  {photos.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center backdrop-blur-sm transition cursor-pointer"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center backdrop-blur-sm transition cursor-pointer"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Horizontal Thumbnail Strip */}
                {photos.length > 1 && (
                  <div className="w-full flex items-center justify-center gap-2 overflow-x-auto pt-3 border-t border-white/10 mt-3">
                    {photos.map((p, idx) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedIndex(idx)}
                        className={`h-12 w-16 rounded-[6px] overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                          selectedIndex === idx
                            ? "border-forest scale-105 shadow-md"
                            : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={p.url}
                          alt="thumb"
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Worker Info, Field Notes & PM Verification (5 cols) */}
              <div className="lg:col-span-5 p-5 flex flex-col justify-between space-y-4 bg-white">
                <div className="space-y-4">
                  {/* Photo Index Tracker */}
                  <div className="flex items-center justify-between text-xs text-ash pb-2 border-b border-pebble">
                    <span className="font-semibold text-onyx">
                      Photo {selectedIndex + 1} of {photos.length}
                    </span>
                    <span className="text-[11px]">{currentPhoto?.timestamp}</span>
                  </div>

                  {/* Worker Attribution Card */}
                  <div className="rounded-[12px] bg-stone/50 border border-pebble p-3.5 space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-onyx text-white font-bold text-xs shrink-0">
                        <HardHat className="h-4 w-4 text-forest" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-onyx">
                            {currentPhoto?.uploadedBy || "Field Technician"}
                          </span>
                          <span className="text-[9px] font-bold bg-white border border-pebble text-forest px-1.5 py-0.5 rounded-full">
                            {currentPhoto?.role || "Field Worker"}
                          </span>
                        </div>
                        <p className="text-[10px] text-ash">
                          Contractor: {job.contractorName || "Apex Power Solutions"}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-pebble/60">
                      <span className="text-[10px] font-bold text-ash uppercase tracking-wider block">
                        Field Note / Site Message
                      </span>
                      <p className="text-xs text-onyx mt-1 italic font-medium leading-relaxed bg-white p-2.5 rounded-[8px] border border-pebble/70">
                        &quot;{currentPhoto?.caption || "No description provided."}&quot;
                      </p>
                    </div>
                  </div>

                  {/* PM Quality Verification Status Box */}
                  <div
                    className={`rounded-[12px] p-4 border transition ${
                      currentPhoto?.verified
                        ? "bg-clear-bg border-success/40 text-success-text"
                        : "bg-caution-bg/40 border-caution/30 text-onyx"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {currentPhoto?.verified ? (
                        <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-caution-text shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="text-xs font-bold">
                          {currentPhoto?.verified
                            ? "Quality Sign-off Verified ✓"
                            : "Awaiting Project Manager Sign-Off"}
                        </p>
                        <p className="text-[11px] text-ash mt-0.5">
                          {currentPhoto?.verified
                            ? `Approved by ${currentPhoto.verifiedBy || currentUserName} on ${
                                currentPhoto.verifiedAt || "16 Sep 2026"
                              }. Work meets execution standards.`
                            : "Review the site photo proof and click below to approve quality verification for this job."}
                        </p>
                      </div>
                    </div>

                    {/* PM Verification Toggle Action */}
                    <div className="mt-3.5 pt-3 border-t border-black/10 flex items-center gap-2">
                      {currentPhoto?.verified ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (currentPhoto) {
                              verifyJobPhoto(
                                job.id,
                                currentPhoto.id,
                                false,
                                currentUserName
                              );
                            }
                          }}
                          className="px-3 py-1.5 rounded-[8px] text-xs font-semibold bg-white border border-pebble text-ash hover:text-onyx transition cursor-pointer"
                        >
                          Revoke Verification
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (currentPhoto) {
                              verifyJobPhoto(
                                job.id,
                                currentPhoto.id,
                                true,
                                currentUserName
                              );
                            }
                          }}
                          className="w-full py-2 px-4 rounded-[8px] text-xs font-bold bg-success hover:bg-emerald-600 text-white shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
                        >
                          <FileCheck className="h-4 w-4" />
                          <span>Approve &amp; Verify Quality</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions Bar */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-pebble">
                  <div className="flex items-center gap-1.5">
                    {currentPhoto && (
                      <a
                        href={currentPhoto.url}
                        download={`job-${job.id}-photo.jpg`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-ash hover:text-onyx hover:bg-stone rounded-[8px] border border-pebble text-xs flex items-center gap-1 transition"
                        title="Download full resolution photo"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span className="text-[11px] font-semibold hidden sm:inline">
                          Download
                        </span>
                      </a>
                    )}
                    {currentPhoto && (
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            confirm("Are you sure you want to remove this field photo?")
                          ) {
                            deletePhotoFromJob(job.id, currentPhoto.id);
                            setSelectedIndex(0);
                          }
                        }}
                        className="p-2 text-ash hover:text-red-600 hover:bg-red-50 rounded-[8px] border border-pebble text-xs transition cursor-pointer"
                        title="Delete photo"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowUploadForm(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-[8px] bg-forest hover:bg-forest-hover text-white text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Attach Another Photo</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
