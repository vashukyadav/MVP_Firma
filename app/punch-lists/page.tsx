"use client";

import { useState } from "react";
import FirmaLayout from "@/components/layout/FirmaLayout";
import PermissionGuard from "@/components/auth/PermissionGuard";
import {
  ListChecks,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  X,
  MapPin,
  CheckSquare,
} from "lucide-react";

interface PunchItem {
  id: string;
  description: string;
  location: string;
  status: "Open" | "Completed";
  assignee?: string;
  dateAdded?: string;
  notes?: string;
}

const initialPunchList: PunchItem[] = [];

export default function PunchListsPage() {
  const [items, setItems] = useState<PunchItem[]>(initialPunchList);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<PunchItem | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  // Form state
  const [newDesc, setNewDesc] = useState("");
  const [newLoc, setNewLoc] = useState("");
  const [newAssignee, setNewAssignee] = useState("");

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (activeFilter === "Open") return item.status === "Open";
    if (activeFilter === "Completed") return item.status === "Completed";
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc) return;

    const newItem: PunchItem = {
      id: `P-${Math.floor(100 + Math.random() * 900)}`,
      description: newDesc,
      location: newLoc || "Site Area",
      status: "Open",
      assignee: newAssignee || "Site Team",
      dateAdded: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      notes: "Snag noted during site walk inspection.",
    };

    setItems([newItem, ...items]);
    setShowNewModal(false);
    setNewDesc("");
  };

  return (
    <FirmaLayout activeNav="Punch Lists">
      <PermissionGuard module="punchLists" action="view">
        <div className="space-y-6 mt-2">
          {/* Page Header matching screen 13 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-stone border border-pebble px-3 py-1 text-[10px] font-bold tracking-wider text-ash uppercase mb-1">
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                <span>Snagging &amp; Final Defect Clearance</span>
              </div>
              <h1 className="text-display-h1 font-bold text-onyx tracking-tight flex items-center gap-2.5">
                <ListChecks className="h-6 w-6 text-forest" />
                <span>Punch Lists</span>
              </h1>
              <p className="text-xs sm:text-sm text-ash mt-0.5">
                Defects, snagging lists, touch-ups, and completion verification before handover.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowNewModal(true)}
              className="px-4 py-2 rounded-[10px] bg-forest text-white text-xs font-bold hover:bg-forest-hover transition shadow-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Item
            </button>
          </div>

          {/* Filters & Table */}
          <div className="rounded-[16px] bg-white border border-pebble/80 p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {[
                  { label: `All (${items.length})`, key: "All" },
                  { label: `Open (${items.filter((i) => i.status === "Open").length})`, key: "Open" },
                  { label: `Completed (${items.filter((i) => i.status === "Completed").length})`, key: "Completed" },
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
                  placeholder="Search punch list items..."
                  className="bg-transparent w-full outline-none text-xs text-onyx placeholder-ash"
                />
              </div>
            </div>

            {/* Table matching Screen 13 */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-pebble/80 text-ash text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pebble/40">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-stone/50 transition">
                      <td className="py-3 px-3 font-bold font-mono text-ash">{item.id}</td>
                      <td className="py-3 px-3 font-bold text-onyx">{item.description}</td>
                      <td className="py-3 px-3 text-ash font-medium">{item.location}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold ${
                            item.status === "Open"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedItem(item)}
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

        {/* View Item Modal */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-[16px] max-w-md w-full p-6 shadow-2xl border border-pebble relative space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded-[4px] bg-stone border border-pebble text-xs font-mono font-bold text-onyx">
                    {selectedItem.id}
                  </span>
                  <h3 className="text-lg font-bold text-onyx mt-1.5">{selectedItem.description}</h3>
                  <p className="text-xs text-ash">{selectedItem.location} • Added on {selectedItem.dateAdded || "15 Sep 2025"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="h-7 w-7 rounded-full bg-stone hover:bg-pebble/50 flex items-center justify-center text-onyx cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-3.5 rounded-[10px] bg-stone/70 border border-pebble/60 text-xs">
                <span className="text-[10px] text-ash uppercase font-bold block mb-1">Snag Details</span>
                <p className="font-semibold text-onyx">{selectedItem.notes}</p>
              </div>

              <div className="p-3 rounded-[8px] bg-white border border-pebble text-xs">
                <span className="text-[10px] text-ash uppercase font-bold block mb-0.5">Assigned Trade Crew</span>
                <p className="font-medium text-onyx">{selectedItem.assignee || "Trade Team"}</p>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span
                  className={`px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold ${
                    selectedItem.status === "Open" ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {selectedItem.status}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="px-3 py-1.5 rounded-[8px] border border-pebble text-onyx text-xs font-bold hover:bg-stone cursor-pointer"
                  >
                    Close
                  </button>
                  {selectedItem.status === "Open" && (
                    <button
                      type="button"
                      onClick={() => {
                        setItems(
                          items.map((i) => (i.id === selectedItem.id ? { ...i, status: "Completed" } : i))
                        );
                        setSelectedItem(null);
                      }}
                      className="px-4 py-1.5 rounded-[8px] bg-forest text-white text-xs font-bold hover:bg-forest-hover shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Mark Completed
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New Snag Item Modal */}
        {showNewModal && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
            <form
              onSubmit={handleCreate}
              className="bg-white rounded-[16px] max-w-md w-full p-6 shadow-2xl border border-pebble relative space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-onyx flex items-center gap-2">
                  <ListChecks className="h-5 w-5 text-forest" /> Add Punch List Item
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
                <label className="font-bold text-onyx block">Snag Description *</label>
                <input
                  type="text"
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Electrical socket faceplate alignment"
                  className="w-full bg-white border border-pebble rounded-[8px] p-2 text-xs text-onyx outline-none focus:border-forest"
                />
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-onyx block">Location *</label>
                <input
                  type="text"
                  required
                  value={newLoc}
                  onChange={(e) => setNewLoc(e.target.value)}
                  placeholder="e.g. Block A, Room 204"
                  className="w-full bg-white border border-pebble rounded-[8px] p-2 text-xs text-onyx outline-none focus:border-forest"
                />
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-onyx block">Assigned Trade Crew</label>
                <input
                  type="text"
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  placeholder="e.g. Finishing Team or Assigned Contractor"
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
                  Add Snag
                </button>
              </div>
            </form>
          </div>
        )}
      </PermissionGuard>
    </FirmaLayout>
  );
}
