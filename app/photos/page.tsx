"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import FirmaLayout from "@/components/layout/FirmaLayout";
import {
  Camera,
  Plus,
  Search,
  Filter,
  X,
  UploadCloud,
  CheckCircle2,
  Maximize2,
  Calendar,
  User,
  Layers,
  ChevronRight,
} from "lucide-react";

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

const initialPhotos: PhotoItem[] = [
  {
    id: "p1",
    title: "Cable tray installation",
    time: "16 Sep 2025 • 11:32 AM",
    date: "16 Sep 2025",
    author: "Rahul Kumar",
    role: "Field Worker",
    avatarBg: "bg-emerald-700",
    url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
    stage: "Containment",
    jobId: "J-004",
    jobTitle: "Electrical Installation",
  },
  {
    id: "p2",
    title: "DB panel setup",
    time: "16 Sep 2025 • 02:15 PM",
    date: "16 Sep 2025",
    author: "Amit Singh",
    role: "Contractor Worker",
    avatarBg: "bg-blue-700",
    url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
    stage: "Distribution Panel",
    jobId: "J-004",
    jobTitle: "Electrical Installation",
  },
  {
    id: "p3",
    title: "Conduit work",
    time: "15 Sep 2025 • 04:15 PM",
    date: "15 Sep 2025",
    author: "Rahul Kumar",
    role: "Field Worker",
    avatarBg: "bg-emerald-700",
    url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
    stage: "Conduit Piping",
    jobId: "J-004",
    jobTitle: "Electrical Installation",
  },
  {
    id: "p4",
    title: "Socket installation",
    time: "15 Sep 2025 • 05:30 PM",
    date: "15 Sep 2025",
    author: "Amit Singh",
    role: "Contractor Worker",
    avatarBg: "bg-blue-700",
    url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
    stage: "Second Fix",
    jobId: "J-004",
    jobTitle: "Electrical Installation",
  },
  {
    id: "p5",
    title: "Ceiling wiring",
    time: "14 Sep 2025 • 02:10 PM",
    date: "14 Sep 2025",
    author: "Sunil Yadav",
    role: "Field Worker",
    avatarBg: "bg-amber-700",
    url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    stage: "Cabling",
    jobId: "J-004",
    jobTitle: "Electrical Installation",
  },
];

export default function PhotosPage() {
  const router = useRouter();
  const [photos, setPhotos] = useState<PhotoItem[]>(initialPhotos);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [filterMode, setFilterMode] = useState("All Photos (5)");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredPhotos = useMemo(() => {
    let list = [...photos];
    if (search) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.author.toLowerCase().includes(search.toLowerCase()) ||
          p.stage.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filterMode === "By Date") {
      list.sort((a, b) => b.date.localeCompare(a.date));
    } else if (filterMode === "By User") {
      list.sort((a, b) => a.author.localeCompare(b.author));
    } else if (filterMode === "By Work Stage") {
      list.sort((a, b) => a.stage.localeCompare(b.stage));
    }
    return list;
  }, [photos, search, filterMode]);

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
              <span>Job Photos (Within Job)</span>
            </h1>
            <p className="text-xs sm:text-sm text-ash mt-0.5">
              Live field execution photos uploaded by crew and contractors with timestamps and stage tags.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="px-4 py-2 rounded-[10px] bg-forest text-white text-xs font-bold hover:bg-forest-hover transition shadow-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Upload Photos
          </button>
        </div>

        {/* Sub tabs matching Screen 6 */}
        <div className="rounded-[16px] bg-white border border-pebble/80 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-pebble/60 pb-2.5">
            <div className="flex items-center gap-4 text-xs font-semibold overflow-x-auto">
              <span className="text-ash hover:text-onyx cursor-pointer" onClick={() => router.push("/scheduling")}>
                Schedule
              </span>
              <span className="text-ash hover:text-onyx cursor-pointer" onClick={() => router.push("/crew")}>
                Crew
              </span>
              <span className="text-ash hover:text-onyx cursor-pointer">Materials</span>
              <span className="text-forest font-bold border-b-2 border-forest pb-2.5 -mb-2.5">
                Photos ({photos.length})
              </span>
              <span className="text-ash hover:text-onyx cursor-pointer" onClick={() => router.push("/variations")}>
                Variations (0)
              </span>
              <span className="text-ash hover:text-onyx cursor-pointer" onClick={() => router.push("/documents")}>
                Documents
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-[8px] bg-stone px-3 py-1.5 border border-pebble text-xs w-56">
              <Search className="h-3.5 w-3.5 text-ash shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search photos..."
                className="bg-transparent w-full outline-none text-xs text-onyx placeholder-ash"
              />
            </div>
          </div>

          {/* Body: Left Sidebar + Photo Grid matching Screen 6 */}
          <div className="flex flex-col md:flex-row gap-5 pt-2">
            {/* Left Filter Sidebar */}
            <div className="md:w-36 shrink-0 space-y-1 text-xs">
              <span className="text-[10px] font-bold text-ash uppercase tracking-wider block mb-2">
                Filter Mode
              </span>
              {["All Photos (5)", "By Date", "By User", "By Work Stage"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilterMode(item)}
                  className={`w-full text-left px-3 py-2 rounded-[8px] font-semibold transition cursor-pointer text-xs ${
                    filterMode === item
                      ? "bg-forest/10 text-forest font-bold"
                      : "text-ash hover:text-onyx hover:bg-stone"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Photo Cards Grid */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPhotos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo)}
                  className="rounded-[12px] border border-pebble/80 overflow-hidden bg-white hover:shadow-lg transition cursor-pointer group flex flex-col justify-between"
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
                      <span className="text-[10px] text-ash block mt-0.5">{photo.time}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-pebble/40 text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`h-6 w-6 rounded-full ${photo.avatarBg} text-white flex items-center justify-center text-[10px] font-bold shrink-0`}>
                          {photo.author.charAt(0)}
                        </span>
                        <div className="truncate">
                          <span className="text-xs font-bold text-onyx block truncate">{photo.author}</span>
                          <span className="text-[10px] text-ash block -mt-0.5 truncate">{photo.role}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-forest bg-forest/10 px-2 py-0.5 rounded-[4px] shrink-0">
                        {photo.jobId}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
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
                <p className="text-xs text-ash">{selectedPhoto.time} • {selectedPhoto.stage} ({selectedPhoto.jobId})</p>
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
              <Image src={selectedPhoto.url} alt={selectedPhoto.title} fill unoptimized className="object-contain" />
            </div>
            <div className="p-4 bg-stone/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`h-6 w-6 rounded-full ${selectedPhoto.avatarBg} text-white flex items-center justify-center text-xs font-bold`}>
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
          <div className="bg-white rounded-[16px] max-w-md w-full p-6 shadow-2xl border border-pebble relative space-y-4">
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

            <div className="border-2 border-dashed border-pebble rounded-[12px] p-8 text-center bg-stone/40 hover:bg-stone/80 transition cursor-pointer">
              <Camera className="h-10 w-10 text-ash mx-auto mb-2" />
              <p className="text-xs font-bold text-onyx">Click to choose or drag &amp; drop photos</p>
              <p className="text-[10px] text-ash mt-1">Direct upload from mobile camera or field device</p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-onyx block">Attach to Job</label>
              <select className="w-full bg-white border border-pebble rounded-[8px] p-2 text-xs text-onyx">
                <option>J-004 Electrical Installation (Riverside Apartments)</option>
                <option>J-001 Site Preparation</option>
                <option>J-002 Structural Work</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUploadOpen(false)}
                className="px-3 py-1.5 rounded-[8px] border border-pebble text-onyx text-xs font-bold hover:bg-stone cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  alert("Photo uploaded successfully! Linked to job J-004.");
                  setUploadOpen(false);
                }}
                className="px-4 py-1.5 rounded-[8px] bg-forest text-white text-xs font-bold hover:bg-forest-hover shadow-xs cursor-pointer"
              >
                Upload Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </FirmaLayout>
  );
}
