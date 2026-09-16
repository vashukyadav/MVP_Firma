"use client";

import { useState } from "react";
import FirmaLayout from "@/components/layout/FirmaLayout";
import {
  HelpCircle,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  X,
  FileText,
  User,
  Layers,
  Send,
} from "lucide-react";

interface RfiItem {
  id: string;
  subject: string;
  relatedJob: string;
  raisedBy: string;
  date: string;
  status: "Open" | "In Progress" | "Closed";
  description?: string;
}

const initialRfis: RfiItem[] = [
  {
    id: "R-001",
    subject: "Drawing clarification",
    relatedJob: "J-004",
    raisedBy: "Sharma Electrical",
    date: "15 Sep 2025",
    status: "Open",
    description: "Clarification required on ceiling conduit routing for Block B 2nd floor lighting circuit.",
  },
  {
    id: "R-002",
    subject: "Conduit route change",
    relatedJob: "J-002",
    raisedBy: "Metro Builders",
    date: "14 Sep 2025",
    status: "In Progress",
    description: "Proposed alternate penetration route due to structural beam collision at Grid C-4.",
  },
  {
    id: "R-003",
    subject: "Socket height confirm",
    relatedJob: "J-004",
    raisedBy: "Site Manager",
    date: "12 Sep 2025",
    status: "Open",
    description: "Architectural drawings indicate 450mm AFF whereas client brief requested 300mm AFF.",
  },
];

export default function RfisPage() {
  const [rfis, setRfis] = useState<RfiItem[]>(initialRfis);
  const [activeFilter, setActiveFilter] = useState("All (3)");
  const [search, setSearch] = useState("");
  const [selectedRfi, setSelectedRfi] = useState<RfiItem | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  // New RFI form state
  const [newSubject, setNewSubject] = useState("");
  const [newJob, setNewJob] = useState("J-004");
  const [newDesc, setNewDesc] = useState("");

  const filteredRfis = rfis.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.subject.toLowerCase().includes(search.toLowerCase()) ||
      r.relatedJob.toLowerCase().includes(search.toLowerCase()) ||
      r.raisedBy.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (activeFilter === "Open (2)" || activeFilter === "Open") return r.status === "Open";
    if (activeFilter === "In Progress (1)" || activeFilter === "In Progress") return r.status === "In Progress";
    if (activeFilter === "Closed (0)" || activeFilter === "Closed") return r.status === "Closed";
    return true;
  });

  const handleCreateRfi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject) return;

    const newId = `R-00${rfis.length + 1}`;
    const newItem: RfiItem = {
      id: newId,
      subject: newSubject,
      relatedJob: newJob,
      raisedBy: "Site Manager",
      date: "16 Sep 2025",
      status: "Open",
      description: newDesc || "Site technical query logged.",
    };

    setRfis([newItem, ...rfis]);
    setShowNewModal(false);
    setNewSubject("");
    setNewDesc("");
  };

  return (
    <FirmaLayout activeNav="RFIs">
      <div className="space-y-6 mt-2">
        {/* Page Header matching screen 8 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-stone border border-pebble px-3 py-1 text-[10px] font-bold tracking-wider text-ash uppercase mb-1">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span>Technical Queries &amp; Approvals</span>
            </div>
            <h1 className="text-display-h1 font-bold text-onyx tracking-tight flex items-center gap-2.5">
              <HelpCircle className="h-6 w-6 text-forest" />
              <span>RFIs (Updated)</span>
            </h1>
            <p className="text-xs sm:text-sm text-ash mt-0.5">
              Request for Information management between site engineers, contractors and PM.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2 rounded-[10px] bg-forest text-white text-xs font-bold hover:bg-forest-hover transition shadow-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="h-4 w-4" /> New RFI
          </button>
        </div>

        {/* Filter Pills & Search */}
        <div className="rounded-[16px] bg-white border border-pebble/80 p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { label: `All (${rfis.length})`, key: "All (3)" },
                { label: `Open (${rfis.filter((r) => r.status === "Open").length})`, key: "Open (2)" },
                { label: `In Progress (${rfis.filter((r) => r.status === "In Progress").length})`, key: "In Progress (1)" },
                { label: `Closed (${rfis.filter((r) => r.status === "Closed").length})`, key: "Closed (0)" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-[8px] text-xs font-bold transition cursor-pointer shrink-0 ${
                    activeFilter === tab.key
                      ? "bg-forest text-white shadow-2xs"
                      : "bg-stone text-ash hover:text-onyx hover:bg-mist/70"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 rounded-[8px] bg-stone px-3 py-1.5 border border-pebble text-xs w-full sm:w-64">
              <Search className="h-3.5 w-3.5 text-ash shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search RFIs..."
                className="bg-transparent w-full outline-none text-xs text-onyx placeholder-ash"
              />
            </div>
          </div>

          {/* Table matching Screen 8 */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-pebble/80 text-ash text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Related Job</th>
                  <th className="py-2.5 px-3">Raised By</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pebble/40">
                {filteredRfis.map((r) => (
                  <tr key={r.id} className="hover:bg-stone/50 transition">
                    <td className="py-3 px-3 font-bold font-mono text-ash">{r.id}</td>
                    <td className="py-3 px-3 font-bold text-onyx">{r.subject}</td>
                    <td className="py-3 px-3 font-bold text-forest">{r.relatedJob}</td>
                    <td className="py-3 px-3 text-ash font-medium">{r.raisedBy}</td>
                    <td className="py-3 px-3 text-ash">{r.date}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold ${
                          r.status === "Open"
                            ? "bg-rose-100 text-rose-800"
                            : r.status === "In Progress"
                            ? "bg-teal-100 text-teal-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedRfi(r)}
                        className="px-3 py-1 rounded-[6px] bg-stone hover:bg-forest hover:text-white border border-pebble text-onyx font-bold transition text-xs cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RFI Detail Modal */}
      {selectedRfi && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-[16px] max-w-lg w-full p-6 shadow-2xl border border-pebble relative space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded-[4px] bg-stone border border-pebble text-xs font-mono font-bold text-onyx">
                  {selectedRfi.id}
                </span>
                <h3 className="text-lg font-bold text-onyx mt-1.5">{selectedRfi.subject}</h3>
                <p className="text-xs text-ash">Related Job: {selectedRfi.relatedJob} • Raised on {selectedRfi.date}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRfi(null)}
                className="h-7 w-7 rounded-full bg-stone hover:bg-pebble/50 flex items-center justify-center text-onyx cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-[10px] bg-stone/70 border border-pebble/60 text-xs text-onyx">
              <p className="font-semibold text-ash text-[10px] uppercase mb-1">Query Details</p>
              <p>{selectedRfi.description}</p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-onyx block">Site Manager Response / Technical Directive</label>
              <textarea
                rows={3}
                placeholder="Type response to contractor or route to PM..."
                className="w-full bg-white border border-pebble rounded-[8px] p-2.5 text-xs text-onyx outline-none focus:border-forest"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <span
                className={`px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold ${
                  selectedRfi.status === "Open"
                    ? "bg-rose-100 text-rose-800"
                    : "bg-teal-100 text-teal-800"
                }`}
              >
                Status: {selectedRfi.status}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRfi(null)}
                  className="px-3 py-1.5 rounded-[8px] border border-pebble text-onyx text-xs font-bold hover:bg-stone cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert("RFI status updated and dispatched to Project Manager & Contractor.");
                    setSelectedRfi(null);
                  }}
                  className="px-4 py-1.5 rounded-[8px] bg-forest text-white text-xs font-bold hover:bg-forest-hover shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" /> Submit Directive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New RFI Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <form
            onSubmit={handleCreateRfi}
            className="bg-white rounded-[16px] max-w-md w-full p-6 shadow-2xl border border-pebble relative space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-onyx flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-forest" /> Create New RFI
              </h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="h-7 w-7 rounded-full bg-stone hover:bg-pebble/50 flex items-center justify-center text-onyx cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-onyx block">Subject / Query Title *</label>
              <input
                type="text"
                required
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="e.g. Cable route elevation conflict"
                className="w-full bg-white border border-pebble rounded-[8px] p-2 text-xs text-onyx outline-none focus:border-forest"
              />
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-onyx block">Related Job</label>
              <select
                value={newJob}
                onChange={(e) => setNewJob(e.target.value)}
                className="w-full bg-white border border-pebble rounded-[8px] p-2 text-xs text-onyx"
              >
                <option value="J-004">J-004 Electrical Installation</option>
                <option value="J-001">J-001 Site Preparation</option>
                <option value="J-002">J-002 Structural Work</option>
                <option value="J-003">J-003 Plumbing Installation</option>
              </select>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-onyx block">Detailed Description / Drawing Reference</label>
              <textarea
                rows={3}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Explain the discrepancy or clarification requested..."
                className="w-full bg-white border border-pebble rounded-[8px] p-2 text-xs text-onyx outline-none focus:border-forest"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-3 py-1.5 rounded-[8px] border border-pebble text-onyx text-xs font-bold hover:bg-stone cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-[8px] bg-forest text-white text-xs font-bold hover:bg-forest-hover shadow-xs cursor-pointer"
              >
                Raise RFI
              </button>
            </div>
          </form>
        </div>
      )}
    </FirmaLayout>
  );
}
