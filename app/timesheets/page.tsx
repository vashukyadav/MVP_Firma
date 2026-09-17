"use client";

import { useState, useMemo } from "react";
import FirmaLayout from "@/components/layout/FirmaLayout";
import { useAuthStore } from "@/store/authStore";
import { useTenderFlowStore } from "@/store/tenderFlowStore";
import { isJobAssignedToUser } from "@/lib/roleAccess";
import {
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  Send,
  Edit2,
  Eye,
  Briefcase,
} from "lucide-react";
import { toast } from "@/components/ui/toast";

interface TimesheetEntry {
  id: string;
  date: string;
  jobCode: string;
  jobTitle: string;
  hours: number;
  status: "In-Progress" | "Submitted" | "Approved" | "Rejected";
  notes?: string;
}

const initialEntries: TimesheetEntry[] = [];

export default function TimesheetsPage() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const isWorker = currentUser?.role === "FIELD_WORKER";
  const { jobs = [] } = useTenderFlowStore();

  const userJobs = useMemo(() => {
    if (!isWorker) return jobs;
    return jobs.filter((j) => isJobAssignedToUser(j, [], [], currentUser));
  }, [jobs, isWorker, currentUser]);

  const [entries, setEntries] = useState<TimesheetEntry[]>(initialEntries);
  const [currentWeekRange, setCurrentWeekRange] = useState("13 Oct 2025 - 19 Oct 2025");
  const [weekOffset, setWeekOffset] = useState(0);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimesheetEntry | null>(null);
  const [viewingEntry, setViewingEntry] = useState<TimesheetEntry | null>(null);

  // Form State
  const [formDate, setFormDate] = useState("16 Sep 2025");
  const [formJob, setFormJob] = useState("");
  const [formHours, setFormHours] = useState("4");
  const [formNotes, setFormNotes] = useState("");
  const [formStatus, setFormStatus] = useState<"In-Progress" | "Submitted">("Submitted");

  const totalHours = entries.reduce((acc, e) => acc + e.hours, 0);
  const approvedHours = entries
    .filter((e) => e.status === "Approved")
    .reduce((acc, e) => acc + e.hours, 0);
  const pendingHours = entries
    .filter((e) => e.status === "Submitted" || e.status === "In-Progress")
    .reduce((acc, e) => acc + e.hours, 0);

  const handlePrevWeek = () => {
    setWeekOffset(weekOffset - 1);
    setCurrentWeekRange("06 Oct 2025 - 12 Oct 2025");
  };

  const handleNextWeek = () => {
    setWeekOffset(weekOffset + 1);
    setCurrentWeekRange("20 Oct 2025 - 26 Oct 2025");
  };

  const handleOpenAdd = () => {
    setEditingEntry(null);
    setFormDate(new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }));
    setFormJob("");
    setFormHours("4");
    setFormNotes("");
    setFormStatus("Submitted");
    setShowAddModal(true);
  };

  const handleOpenEdit = (entry: TimesheetEntry) => {
    setEditingEntry(entry);
    setFormDate(entry.date);
    setFormJob(`${entry.jobCode} • ${entry.jobTitle}`);
    setFormHours(String(entry.hours));
    setFormNotes(entry.notes || "");
    setFormStatus(entry.status === "In-Progress" ? "In-Progress" : "Submitted");
    setShowAddModal(true);
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const hoursNum = parseFloat(formHours) || 1;
    const [jobCode, jobTitle] = formJob.split(" • ");

    if (editingEntry) {
      setEntries(
        entries.map((item) =>
          item.id === editingEntry.id
            ? {
                ...item,
                date: formDate,
                jobCode: jobCode.trim(),
                jobTitle: jobTitle?.trim() || "Work Order",
                hours: hoursNum,
                status: formStatus,
                notes: formNotes,
              }
            : item
        )
      );
      toast.success("Timesheet entry updated successfully!");
    } else {
      const newEntry: TimesheetEntry = {
        id: `TS-${Date.now().toString().slice(-4)}`,
        date: formDate,
        jobCode: jobCode.trim(),
        jobTitle: jobTitle?.trim() || "Work Order",
        hours: hoursNum,
        status: formStatus,
        notes: formNotes,
      };
      setEntries([newEntry, ...entries]);
      toast.success("Timesheet entry logged!");
    }

    setShowAddModal(false);
  };

  const getStatusBadge = (status: TimesheetEntry["status"]) => {
    switch (status) {
      case "In-Progress":
        return "bg-sky-50 text-sky-800 border-sky-200";
      case "Submitted":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "Approved":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "Rejected":
        return "bg-rose-50 text-rose-800 border-rose-200";
      default:
        return "bg-stone text-ash border-pebble";
    }
  };

  return (
    <FirmaLayout activeNav="Timesheets">
      <div className="space-y-6 mt-2 pb-16 font-sans">
        {/* ========================================================================= */}
        {/* 1. HEADER & WEEK SELECTOR (Screen 5)                                      */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <h1 className="text-display-h1 font-bold text-onyx tracking-tight flex items-center gap-2.5">
              <Clock className="h-6 w-6 text-forest" />
              <span>Timesheets</span>
            </h1>
            <p className="text-xs sm:text-sm text-ash mt-0.5">
              Record daily field hours, track work order attendance, and submit for supervisor approval.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {/* Week Selector `< 13 Oct 2025 - 19 Oct 2025 >` */}
            <div className="flex items-center gap-1.5 rounded-[10px] bg-white border border-pebble/80 px-3 py-1.5 shadow-2xs">
              <button
                type="button"
                onClick={handlePrevWeek}
                className="p-1 hover:bg-stone rounded-md text-ash hover:text-onyx transition cursor-pointer"
                title="Previous Week"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-bold text-onyx px-2 select-none">
                {currentWeekRange}
              </span>
              <button
                type="button"
                onClick={handleNextWeek}
                className="p-1 hover:bg-stone rounded-md text-ash hover:text-onyx transition cursor-pointer"
                title="Next Week"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* + Add Entry Button */}
            <button
              type="button"
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-forest hover:bg-[#083a2d] text-white text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Entry</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. SUMMARY METRIC PILLS                                                  */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-[12px] bg-white border border-pebble/80 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-ash uppercase tracking-wider">
                Total Hours Logged
              </span>
              <p className="text-2xl font-black text-onyx mt-0.5">{totalHours}h</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-breath text-forest">
              <Clock className="h-5 w-5" />
            </div>
          </div>

          <div className="p-4 rounded-[12px] bg-white border border-pebble/80 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                Approved Hours
              </span>
              <p className="text-2xl font-black text-emerald-800 mt-0.5">{approvedHours}h</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>

          <div className="p-4 rounded-[12px] bg-white border border-pebble/80 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
                Pending / In-Progress
              </span>
              <p className="text-2xl font-black text-amber-800 mt-0.5">{pendingHours}h</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-amber-50 text-amber-700">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. TIMESHEET TABLE (Screen 5)                                             */}
        {/* ========================================================================= */}
        <div className="rounded-[16px] bg-white border border-pebble/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone/60 border-b border-pebble/80 text-ash uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4 sm:px-6">Date</th>
                  <th className="py-3 px-4 sm:px-6">Job</th>
                  <th className="py-3 px-4 sm:px-6">Hours</th>
                  <th className="py-3 px-4 sm:px-6">Status</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pebble/60 text-onyx font-medium">
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-ash text-sm">
                      <Clock className="h-9 w-9 text-ash/50 mx-auto mb-2 stroke-[1.5]" />
                      <p className="font-bold text-onyx">No timesheet entries logged yet</p>
                      <p className="text-xs text-ash mt-1">
                        Click &quot;+ Log Hours&quot; above to record your site working hours for this week.
                      </p>
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-stone/30 transition">
                      {/* Date */}
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap font-bold text-onyx">
                        {entry.date}
                      </td>

                      {/* Job */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-[6px] bg-stone font-bold text-onyx border border-pebble text-[11px]">
                            {entry.jobCode}
                          </span>
                          <span className="font-semibold text-onyx truncate max-w-xs">
                            {entry.jobTitle}
                          </span>
                        </div>
                      </td>

                      {/* Hours */}
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap font-bold text-onyx">
                        {entry.hours}h
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(
                            entry.status
                          )}`}
                        >
                          {entry.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                        {entry.status === "In-Progress" ? (
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(entry)}
                            className="px-3 py-1 rounded-[6px] bg-white border border-pebble hover:bg-stone text-onyx text-xs font-semibold shadow-2xs transition cursor-pointer"
                          >
                            Edit
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setViewingEntry(entry)}
                            className="px-3 py-1 rounded-[6px] bg-white border border-pebble hover:bg-stone text-ash hover:text-onyx text-xs font-semibold shadow-2xs transition cursor-pointer"
                          >
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. ADD / EDIT ENTRY MODAL                                                 */}
        {/* ========================================================================= */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-[16px] bg-white border border-pebble p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-pebble/60 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-forest" />
                  <h3 className="text-base font-bold text-onyx">
                    {editingEntry ? "Edit Timesheet Entry" : "Log Hours & Timesheet"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-ash hover:text-onyx cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEntry} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-onyx mb-1">Date</label>
                  <input
                    type="text"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full rounded-[8px] border border-pebble px-3 py-2 text-xs text-onyx focus:outline-forest"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-onyx mb-1">Related Job</label>
                  <select
                    value={formJob}
                    onChange={(e) => setFormJob(e.target.value)}
                    className="w-full rounded-[8px] border border-pebble bg-white px-3 py-2 text-xs font-semibold text-onyx focus:outline-forest"
                  >
                    <option value="">-- Select Assigned Job --</option>
                    {userJobs.length > 0 ? (
                      userJobs.map((j) => (
                        <option key={j.id} value={`${j.id} • ${j.title}`}>
                          {j.id} • {j.title} ({j.projectName})
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No assigned jobs found
                      </option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-onyx mb-1">Hours Worked</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="16"
                    value={formHours}
                    onChange={(e) => setFormHours(e.target.value)}
                    className="w-full rounded-[8px] border border-pebble px-3 py-2 text-xs text-onyx focus:outline-forest"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-onyx mb-1">Task Description / Notes</label>
                  <textarea
                    rows={3}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Work performed, zone, snag clearance..."
                    className="w-full rounded-[8px] border border-pebble px-3 py-2 text-xs text-onyx focus:outline-forest placeholder:text-ash"
                  />
                </div>

                <div>
                  <label className="block font-bold text-onyx mb-1">Submission Status</label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="timesheetStatus"
                        checked={formStatus === "Submitted"}
                        onChange={() => setFormStatus("Submitted")}
                        className="accent-forest"
                      />
                      <span>Submit for Approval</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="timesheetStatus"
                        checked={formStatus === "In-Progress"}
                        onChange={() => setFormStatus("In-Progress")}
                        className="accent-forest"
                      />
                      <span>Keep In-Progress (Draft)</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-pebble/60">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-3.5 py-2 rounded-[8px] bg-stone hover:bg-mist text-ash font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-[8px] bg-forest hover:bg-[#083a2d] text-white font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Save Entry</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. VIEW ENTRY MODAL                                                       */}
        {/* ========================================================================= */}
        {viewingEntry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-[16px] bg-white border border-pebble p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-pebble/60 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-forest" />
                  <h3 className="text-base font-bold text-onyx">
                    Timesheet Details
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingEntry(null)}
                  className="text-ash hover:text-onyx cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-[8px] bg-stone border border-pebble">
                  <div>
                    <span className="text-[10px] text-ash uppercase font-bold">Date</span>
                    <p className="font-bold text-onyx">{viewingEntry.date}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-ash uppercase font-bold">Hours</span>
                    <p className="font-bold text-onyx text-sm">{viewingEntry.hours}h</p>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-ash uppercase font-bold">Job</span>
                  <p className="font-bold text-onyx mt-0.5">
                    {viewingEntry.jobCode} • {viewingEntry.jobTitle}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-ash uppercase font-bold">Status</span>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(
                        viewingEntry.status
                      )}`}
                    >
                      {viewingEntry.status}
                    </span>
                  </div>
                </div>

                {viewingEntry.notes && (
                  <div>
                    <span className="text-[10px] text-ash uppercase font-bold">Notes</span>
                    <p className="text-onyx mt-0.5 leading-relaxed bg-stone/50 p-2.5 rounded-[8px] border border-pebble/60">
                      {viewingEntry.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-pebble/60">
                <button
                  type="button"
                  onClick={() => setViewingEntry(null)}
                  className="px-4 py-2 rounded-[8px] bg-onyx text-white font-bold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </FirmaLayout>
  );
}
