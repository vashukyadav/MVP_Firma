"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import FirmaLayout from "@/components/layout/FirmaLayout";
import {
  Camera,
  Plus,
  Search,
  X,
  UploadCloud,
} from "lucide-react";

import { useTenderFlowStore } from "@/store/tenderFlowStore";
import { useSchedulingStore } from "@/store/schedulingStore";
import { useAuthStore } from "@/store/authStore";
import { isFieldWorker, isJobAssignedToUser } from "@/lib/roleAccess";
import { toast } from "@/components/ui/toast";

interface PhotoItem {
  id: string;
  title: string;
  time: string;
  date: string;
  author: string;
  role: string;
  avatarBg: string;
  url: string;
  stage: string;
  jobId: string;
  jobTitle: string;
}

export default function PhotosPage() {
  const router = useRouter();
  const { jobs = [], addPhotoToJob } = useTenderFlowStore();
  const { scheduledJobs = [] } = useSchedulingStore();
  const currentUser = useAuthStore((state) => state.currentUser);
  const isWorker = isFieldWorker(currentUser);

  // Available jobs for current user (filtered for field workers)
  const userJobs = useMemo(() => {
    if (!isWorker) return jobs;
    return jobs.filter((j) => isJobAssignedToUser(j, [], [], currentUser));
  }, [jobs, isWorker, currentUser]);

  const realPhotos = useMemo(() => {
    const list: PhotoItem[] = [];
    const seenIds = new Set<string>();
    const targetJobs = isWorker ? userJobs : jobs;
    const uName = (currentUser?.name || "").trim().toLowerCase();

    // Helper to push a photo into the list if not already added
    const pushPhoto = (p: { id: string; title?: string; caption?: string; timestamp?: string; time?: string; date?: string; uploadedBy?: string; role?: string; url: string; stage?: string; category?: string }, jobId: string, jobTitle: string) => {
      if (seenIds.has(p.id)) return;
      seenIds.add(p.id);
      const pAuthor = (p.uploadedBy || "").trim().toLowerCase();
      // If field worker, only include photos they uploaded
      if (isWorker && pAuthor) {
        const matchAuthor =
          pAuthor === uName ||
          pAuthor.includes(uName) ||
          uName.includes(pAuthor);
        if (!matchAuthor) return;
      }
      list.push({
        id: p.id,
        title: p.title || p.caption || "Site Photo",
        time: p.timestamp || p.time || "",
        date: p.date || "",
        author: p.uploadedBy || currentUser?.name || "Field Worker",
        role: p.role || (isWorker ? "Field Worker" : "Site Team"),
        avatarBg: "bg-emerald-700",
        url: p.url,
        stage: p.stage || (p.category as string) || "In Progress",
        jobId,
        jobTitle,
      });
    };

    // Photos from tenderFlowStore jobs
    targetJobs.forEach((j) => {
      (j.photos || []).forEach((p) => pushPhoto(p, j.id, j.title));
    });

    // Photos from schedulingStore scheduledJobs (in case field worker uploaded to a scheduled-only job)
    if (!isWorker) {
      // Managers see all scheduled job photos
      scheduledJobs.forEach((sj) => {
        (sj.photos || []).forEach((p) => pushPhoto(p, sj.id, sj.title));
      });
    } else {
      // Field worker sees only their own scheduled job photos
      const workerName = uName;
      scheduledJobs
        .filter((sj) => (sj.worker || "").trim().toLowerCase() === workerName)
        .forEach((sj) => {
          (sj.photos || []).forEach((p) => pushPhoto(p, sj.id, sj.title));
        });
    }

    return list;
  }, [jobs, scheduledJobs, userJobs, isWorker, currentUser]);

  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [filterMode, setFilterMode] = useState("All Photos");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [uploadJobId, setUploadJobId] = useState<string>("");
  const [uploadStage, setUploadStage] = useState<string>("In Progress");
  const [uploadCaption, setUploadCaption] = useState<string>("");

  const filteredPhotos = useMemo(() => {
    let list = [...realPhotos];
    if (search) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.author.toLowerCase().includes(search.toLowerCase()) ||
          p.stage.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filterMode === "Before") {
      list = list.filter((p) => p.stage.toLowerCase().includes("before"));
    } else if (filterMode === "Progress") {
      list = list.filter((p) => p.stage.toLowerCase().includes("progress"));
    } else if (filterMode === "After") {
      list = list.filter(
        (p) =>
          p.stage.toLowerCase().includes("after") ||
          p.stage.toLowerCase().includes("complete")
      );
    } else if (filterMode === "By Date") {
      list.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    } else if (filterMode === "By User") {
      list.sort((a, b) => a.author.localeCompare(b.author));
    }
    return list;
  }, [realPhotos, search, filterMode]);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetJobId = uploadJobId || userJobs[0]?.id;
    if (!targetJobId) {
      toast.error("Please select a job to attach the photo to.");
      return;
    }

    if (addPhotoToJob) {
      addPhotoToJob(targetJobId, {
        url: "/images/field_engineer.jpg",
        caption: uploadCaption || "Field site inspection photo",
        stage: uploadStage,
        uploadedBy: currentUser?.name || "Field Worker",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      });
    }

    toast.success("Photo uploaded successfully!");
    setUploadOpen(false);
    setUploadCaption("");
  };

  return (
    <FirmaLayout activeNav="Photos">
      <div className="space-y-6 mt-2">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-stone border border-pebble px-3 py-1 text-[10px] font-bold tracking-wider text-ash uppercase mb-1">
              <span className="h-2 w-2 rounded-full bg-forest" />
              <span>Live Visual Proof</span>
            </div>
            <h1 className="text-display-h1 font-bold text-onyx tracking-tight flex items-center gap-2.5">
              <Camera className="h-6 w-6 text-forest" />
              <span>{isWorker ? "My Job Photos" : "Job Photos (Site Execution)"}</span>
            </h1>
            <p className="text-xs sm:text-sm text-ash mt-0.5">
              {isWorker
                ? "Your field photos uploaded for assigned work packages and inspections."
                : "Live field execution photos uploaded by crew and contractors with timestamps and stage tags."}
            </p>
          </div>

          {isWorker && (
            <button
              type="button"
              onClick={() => setUploadOpen(true)}
              className="px-4 py-2 rounded-[10px] bg-forest text-white text-xs font-bold hover:bg-forest-hover transition shadow-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Upload Photos
            </button>
          )}
        </div>

        {/* Photos Container */}
        <div className="rounded-[16px] bg-white border border-pebble/80 p-5 shadow-2xs space-y-4">
          {/* Clean Photos Toolbar (No redundant tab leaks) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pebble/60 pb-3.5">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-onyx">
                {isWorker ? "Your Assigned Job Photos" : "All Photos Gallery"}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-forest/10 text-forest border border-forest/20">
                {realPhotos.length}
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-[8px] bg-stone px-3 py-1.5 border border-pebble text-xs w-full sm:w-64">
              <Search className="h-3.5 w-3.5 text-ash shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search photos by title or stage..."
                className="bg-transparent w-full outline-none text-xs text-onyx placeholder-ash"
              />
            </div>
          </div>

          {/* Body: Left Sidebar + Photo Grid */}
          <div className="flex flex-col md:flex-row gap-5 pt-2">
            {/* Left Filter Sidebar */}
            <div className="md:w-40 shrink-0 space-y-1 text-xs">
              <span className="text-[10px] font-bold text-ash uppercase tracking-wider block mb-2">
                Filter Stage
              </span>
              {[
                { label: `All Photos (${realPhotos.length})`, key: "All Photos" },
                { label: "Before", key: "Before" },
                { label: "Progress", key: "Progress" },
                { label: "After", key: "After" },
                { label: "By Date", key: "By Date" },
                { label: "By User", key: "By User" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFilterMode(item.key)}
                  className={`w-full text-left px-3 py-2 rounded-[8px] font-semibold transition cursor-pointer text-xs ${
                    filterMode === item.key
                      ? "bg-forest/10 text-forest font-bold"
                      : "text-ash hover:text-onyx hover:bg-stone"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Photo Cards Grid / Empty State */}
            <div className="flex-1">
              {filteredPhotos.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Upload Photo Dropzone Tile */}
                  <label
                    onClick={() => setUploadOpen(true)}
                    className="rounded-[12px] border-2 border-dashed border-pebble hover:border-forest bg-stone/20 hover:bg-breath/40 p-6 flex flex-col items-center justify-center text-center transition cursor-pointer min-h-[220px]"
                  >
                    <UploadCloud className="h-9 w-9 text-forest mb-2 stroke-[1.5]" />
                    <span className="text-xs font-bold text-onyx block">
                      Upload Photo
                    </span>
                    <span className="text-[11px] text-ash mt-1 max-w-[180px]">
                      Drag and drop site photos here or click to browse
                    </span>
                  </label>

                  <div className="sm:col-span-1 lg:col-span-2 rounded-[12px] border border-pebble/70 bg-stone/10 p-8 flex flex-col items-center justify-center text-center min-h-[220px]">
                    <Camera className="h-10 w-10 text-ash/50 mb-2 stroke-[1.5]" />
                    <h3 className="text-sm font-bold text-onyx">No site photos found</h3>
                    <p className="text-xs text-ash mt-1 max-w-sm">
                      {isWorker
                        ? "You haven't uploaded any photos for your assigned jobs yet. Click Upload Photos to capture your work on site."
                        : "No photos found matching your current filter. Upload photos to start logging visual verification."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => setSelectedPhoto(photo)}
                      className="rounded-[12px] border border-pebble/80 overflow-hidden bg-white hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="relative aspect-video bg-stone overflow-hidden">
                        <Image
                          src={photo.url}
                          alt={photo.title}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-[4px] bg-black/60 text-white text-[10px] font-bold backdrop-blur-xs">
                          {photo.stage}
                        </div>
                      </div>

                      <div className="p-3 space-y-2">
                        <div>
                          <h4 className="text-xs font-bold text-onyx truncate group-hover:text-forest transition">
                            {photo.title}
                          </h4>
                          <span className="text-[10px] text-ash block mt-0.5">
                            {photo.time} {photo.date ? `• ${photo.date}` : ""}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-pebble/40 text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-6 w-6 rounded-full ${photo.avatarBg} text-white flex items-center justify-center text-[10px] font-bold shrink-0`}
                            >
                              {photo.author.charAt(0)}
                            </span>
                            <div className="truncate">
                              <span className="text-xs font-bold text-onyx block truncate">
                                {photo.author}
                              </span>
                              <span className="text-[10px] text-ash block -mt-0.5 truncate">
                                {photo.role}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold text-forest bg-forest/10 px-2 py-0.5 rounded-[4px] shrink-0">
                            {photo.jobId}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Upload Dropzone Tile */}
                  <label
                    onClick={() => setUploadOpen(true)}
                    className="rounded-[12px] border-2 border-dashed border-pebble hover:border-forest bg-stone/20 hover:bg-breath/40 p-6 flex flex-col items-center justify-center text-center transition cursor-pointer min-h-[220px]"
                  >
                    <UploadCloud className="h-9 w-9 text-forest mb-2 stroke-[1.5]" />
                    <span className="text-xs font-bold text-onyx block">
                      Upload Photo
                    </span>
                    <span className="text-[11px] text-ash mt-1 max-w-[180px]">
                      Drag and drop site photos here or click to browse
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-[16px] max-w-2xl w-full overflow-hidden shadow-2xl border border-pebble relative">
            <div className="p-4 border-b border-pebble flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-onyx">{selectedPhoto.title}</h3>
                <p className="text-xs text-ash">
                  {selectedPhoto.time} • {selectedPhoto.stage} ({selectedPhoto.jobId})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="h-8 w-8 rounded-full bg-stone hover:bg-pebble/50 flex items-center justify-center text-onyx cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="relative aspect-video bg-black">
              <Image
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                fill
                unoptimized
                className="object-contain"
              />
            </div>
            <div className="p-4 bg-stone/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={`h-6 w-6 rounded-full ${selectedPhoto.avatarBg} text-white flex items-center justify-center text-xs font-bold`}
                >
                  {selectedPhoto.author.charAt(0)}
                </span>
                <div>
                  <span className="font-bold text-onyx block">{selectedPhoto.author}</span>
                  <span className="text-ash text-[10px] block">{selectedPhoto.role}</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-[6px] bg-emerald-100 text-emerald-800 font-bold text-xs">
                Verified On-Site
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {uploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <form
            onSubmit={handleUploadSubmit}
            className="bg-white rounded-[16px] max-w-md w-full p-6 shadow-2xl border border-pebble relative space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-onyx flex items-center gap-2">
                <UploadCloud className="h-5 w-5 text-forest" /> Upload Site Photos
              </h3>
              <button
                type="button"
                onClick={() => setUploadOpen(false)}
                className="h-7 w-7 rounded-full bg-stone hover:bg-pebble/50 flex items-center justify-center text-onyx cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="border-2 border-dashed border-pebble rounded-[12px] p-6 text-center bg-stone/40 hover:bg-stone/80 transition cursor-pointer">
              <Camera className="h-8 w-8 text-ash mx-auto mb-2" />
              <p className="text-xs font-bold text-onyx">Click to choose or drag &amp; drop photos</p>
              <p className="text-[10px] text-ash mt-1">Direct upload from mobile camera or field device</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-onyx block mb-1">Attach to Job Order</label>
                <select
                  value={uploadJobId}
                  onChange={(e) => setUploadJobId(e.target.value)}
                  className="w-full bg-white border border-pebble rounded-[8px] p-2 text-xs text-onyx"
                  required
                >
                  {userJobs.length > 0 ? (
                    userJobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.id} - {j.title} ({j.projectName})
                      </option>
                    ))
                  ) : (
                    <option value="">No assigned jobs found</option>
                  )}
                </select>
              </div>

              <div>
                <label className="font-bold text-onyx block mb-1">Execution Stage</label>
                <select
                  value={uploadStage}
                  onChange={(e) => setUploadStage(e.target.value)}
                  className="w-full bg-white border border-pebble rounded-[8px] p-2 text-xs text-onyx"
                >
                  <option value="Before">Before Starting Work</option>
                  <option value="In Progress">In Progress</option>
                  <option value="After">After / Work Completed</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-onyx block mb-1">Photo Caption (Optional)</label>
                <input
                  type="text"
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  placeholder="e.g. Conduit termination completed in Block A"
                  className="w-full bg-white border border-pebble rounded-[8px] p-2 text-xs text-onyx"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-pebble/60">
              <button
                type="button"
                onClick={() => setUploadOpen(false)}
                className="px-3.5 py-1.5 rounded-[8px] border border-pebble text-onyx text-xs font-bold hover:bg-stone cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={userJobs.length === 0}
                className="px-4 py-1.5 rounded-[8px] bg-forest text-white text-xs font-bold hover:bg-forest-hover shadow-xs cursor-pointer disabled:opacity-50"
              >
                Upload Photo
              </button>
            </div>
          </form>
        </div>
      )}
    </FirmaLayout>
  );
}
