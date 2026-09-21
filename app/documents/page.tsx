"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import FirmaLayout from "@/components/layout/FirmaLayout";
import PermissionGuard from "@/components/auth/PermissionGuard";
import {
  FileText,
  Search,
  Eye,
  Download,
  X,
  FileCode,
  Shield,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { toast } from "@/components/ui/toast";

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  category: "Drawings" | "Specs" | "Safety" | "Others";
  date: string;
  size: string;
  previewUrl: string;
  description: string;
}

const initialDocuments: DocumentItem[] = [];

type CategoryFilter = "All" | "Drawings" | "Specs" | "Safety" | "Others";

export default function DocumentsPage() {
  const [documents] = useState<DocumentItem[]>(initialDocuments);
  const [activeTab, setActiveTab] = useState<CategoryFilter>("All");
  const [search, setSearch] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      if (activeTab !== "All" && doc.category !== activeTab) return false;
      if (search.trim()) {
        const query = search.toLowerCase();
        return (
          doc.name.toLowerCase().includes(query) ||
          doc.category.toLowerCase().includes(query) ||
          doc.type.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [documents, activeTab, search]);

  return (
    <FirmaLayout activeNav="Documents">
      <PermissionGuard module="documents" action="view">
        <div className="space-y-6 mt-2 pb-16 font-sans">
        {/* ========================================================================= */}
        {/* 1. HEADER SECTION (Screen 8)                                              */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <h1 className="text-display-h1 font-bold text-onyx tracking-tight flex items-center gap-2.5">
              <FileText className="h-6 w-6 text-forest" />
              <span>Documents</span>
            </h1>
            <p className="text-xs sm:text-sm text-ash mt-0.5">
              Access architectural drawings, engineering specifications, and safety manuals on-site.
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. FILTER TABS & SEARCH BAR (Screen 8)                                    */}
        {/* ========================================================================= */}
        <div className="rounded-[16px] bg-white border border-pebble/80 p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {(
                ["All", "Drawings", "Specs", "Safety", "Others"] as CategoryFilter[]
              ).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveTab(cat)}
                  className={`px-3.5 py-1.5 rounded-[8px] text-xs font-bold transition cursor-pointer shrink-0 ${
                    activeTab === cat
                      ? "bg-forest text-white shadow-2xs"
                      : "bg-stone text-ash hover:text-onyx hover:bg-mist/70"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 rounded-[8px] bg-stone px-3 py-1.5 border border-pebble text-xs w-full sm:w-64">
              <Search className="h-3.5 w-3.5 text-ash shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search documents..."
                className="bg-transparent w-full outline-none text-xs text-onyx placeholder-ash"
              />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. DOCUMENTS TABLE (Screen 8: Name | Type | Date | Actions)                */}
          {/* ========================================================================= */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-pebble/80 text-ash text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pebble/40">
                {filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-ash text-sm">
                      <FileText className="h-9 w-9 text-ash/50 mx-auto mb-2 stroke-[1.5]" />
                      <p className="font-bold text-onyx">No site documents found</p>
                      <p className="text-xs text-ash mt-1">
                        Technical drawings, safety specifications, and site guidelines will appear here when uploaded.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-stone/50 transition">
                      {/* Name */}
                      <td className="py-3.5 px-3 font-bold text-onyx">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-stone border border-pebble text-forest shrink-0">
                            <FileText className="h-4 w-4" />
                          </div>
                          <span>{doc.name}</span>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-[4px] bg-stone font-bold text-onyx border border-pebble text-[10px]">
                          {doc.type}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-3 text-ash font-medium">
                        {doc.date}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedDoc(doc)}
                          className="px-3 py-1 rounded-[6px] bg-stone hover:bg-forest hover:text-white border border-pebble text-onyx font-bold transition text-xs cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. DOCUMENT PREVIEW MODAL                                                 */}
        {/* ========================================================================= */}
        {selectedDoc && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-[16px] max-w-lg w-full p-6 shadow-2xl border border-pebble relative space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded-[4px] bg-stone border border-pebble text-xs font-mono font-bold text-onyx">
                    {selectedDoc.type} • {selectedDoc.size}
                  </span>
                  <h3 className="text-base font-bold text-onyx mt-1.5">
                    {selectedDoc.name}
                  </h3>
                  <p className="text-xs text-ash">Uploaded: {selectedDoc.date}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDoc(null)}
                  className="p-1 text-ash hover:text-onyx cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Preview Thumbnail */}
              <div className="relative h-48 w-full rounded-[10px] overflow-hidden bg-stone border border-pebble">
                <Image
                  src={selectedDoc.previewUrl}
                  alt={selectedDoc.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-onyx/30 flex items-center justify-center">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-onyx shadow-md flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-forest" />
                    <span>Document Ready</span>
                  </span>
                </div>
              </div>

              <p className="text-xs text-ash leading-relaxed bg-stone/50 p-3 rounded-[10px] border border-pebble/60">
                {selectedDoc.description}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-pebble">
                <button
                  type="button"
                  onClick={() => setSelectedDoc(null)}
                  className="px-3.5 py-2 rounded-[8px] bg-stone hover:bg-mist text-ash text-xs font-bold transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toast.success(`Opening ${selectedDoc.name} in document viewer.`);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-forest hover:bg-[#083a2d] text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download / Print</span>
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </PermissionGuard>
    </FirmaLayout>
  );
}
