"use client";

import { useState } from "react";
import FirmaLayout from "@/components/layout/FirmaLayout";
import {
  FileText,
  Plus,
  Search,
  Sun,
  CloudSun,
  CloudRain,
  Users,
  CheckCircle2,
  X,
  Camera,
  MapPin,
  Calendar,
} from "lucide-react";

import { useSiteStore } from "@/store/siteStore";

interface SiteReportItem {
  id: string;
  date: string;
  weather: "Sunny" | "Cloudy" | "Rainy";
  workers: number;
  keyActivities: string;
  siteName: string;
  notes?: string;
  safetyObservations?: string;
}

const initialReports: SiteReportItem[] = [];

export default function SiteReportsPage() {
  const { sites = [] } = useSiteStore();
  const [reports, setReports] = useState<SiteReportItem[]>(initialReports);
  const [search, setSearch] = useState("");
  const [selectedReport, setSelectedReport] = useState<SiteReportItem | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  // New report form state
  const [reportDate, setReportDate] = useState(
    new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  );
  const [reportWeather, setReportWeather] = useState<"Sunny" | "Cloudy" | "Rainy">("Sunny");
  const [reportWorkers, setReportWorkers] = useState("0");
  const [reportActivities, setReportActivities] = useState("");
  const [reportNotes, setReportNotes] = useState("");

  const filteredReports = reports.filter(
    (r) =>
      r.date.toLowerCase().includes(search.toLowerCase()) ||
      r.keyActivities.toLowerCase().includes(search.toLowerCase()) ||
      r.siteName.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportActivities) return;

    const newReport: SiteReportItem = {
      id: `SR-${100 + reports.length + 1}`,
      date: reportDate,
      weather: reportWeather,
      workers: parseInt(reportWorkers, 10) || 0,
      keyActivities: reportActivities,
      siteName: sites[0]?.name || "Main Site Area",
      notes: reportNotes || "Daily site report logged by Site Manager.",
      safetyObservations: "Zero safety incidents recorded.",
    };

    setReports([newReport, ...reports]);
    setShowNewModal(false);
    setReportActivities("");
    setReportNotes("");
  };

  return (
    <FirmaLayout activeNav="Site Reports">
      <div className="space-y-6 mt-2">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-stone border border-pebble px-3 py-1 text-[10px] font-bold tracking-wider text-ash uppercase mb-1">
              <span className="h-2 w-2 rounded-full bg-forest" />
              <span>Daily Site Logs</span>
            </div>
            <h1 className="text-display-h1 font-bold text-onyx tracking-tight flex items-center gap-2.5">
              <FileText className="h-6 w-6 text-forest" />
              <span>Site Reports</span>
            </h1>
            <p className="text-xs sm:text-sm text-ash mt-0.5">
              Daily site logs, weather conditions, on-site worker headcounts, and key activity tracking.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2 rounded-[10px] bg-forest text-white text-xs font-bold hover:bg-forest-hover transition shadow-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="h-4 w-4" /> New Report
          </button>
        </div>

        {/* Reports Container */}
        <div className="rounded-[16px] bg-white border border-pebble/80 p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs">
              <span className="font-bold text-onyx">Total Reports: {reports.length}</span>
              <span className="text-ash">•</span>
              <span className="text-ash">Site: Riverside Apartments</span>
            </div>

            <div className="flex items-center gap-2 rounded-[8px] bg-stone px-3 py-1.5 border border-pebble text-xs w-full sm:w-64">
              <Search className="h-3.5 w-3.5 text-ash shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reports by date, activity..."
                className="bg-transparent w-full outline-none text-xs text-onyx placeholder-ash"
              />
            </div>
          </div>

          {/* Table matching Screen 11 */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-pebble/80 text-ash text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Weather</th>
                  <th className="py-2.5 px-3">Workers</th>
                  <th className="py-2.5 px-3">Key Activities</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pebble/40">
                {filteredReports.map((r) => (
                  <tr key={r.id} className="hover:bg-stone/50 transition">
                    <td className="py-3 px-3 font-bold text-onyx">{r.date}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 font-medium text-onyx">
                        {r.weather === "Sunny" && <Sun className="h-3.5 w-3.5 text-amber-500" />}
                        {r.weather === "Cloudy" && <CloudSun className="h-3.5 w-3.5 text-slate-500" />}
                        {r.weather === "Rainy" && <CloudRain className="h-3.5 w-3.5 text-blue-500" />}
                        <span>{r.weather}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-forest bg-forest/10 px-2 py-0.5 rounded-[4px]">
                        {r.workers}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-onyx">{r.keyActivities}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedReport(r)}
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

      {/* View Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-[16px] max-w-lg w-full p-6 shadow-2xl border border-pebble relative space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded-[4px] bg-stone border border-pebble text-xs font-mono font-bold text-onyx">
                  {selectedReport.id}
                </span>
                <h3 className="text-lg font-bold text-onyx mt-1.5">Site Report – {selectedReport.date}</h3>
                <p className="text-xs text-ash">{selectedReport.siteName}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="h-7 w-7 rounded-full bg-stone hover:bg-pebble/50 flex items-center justify-center text-onyx cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 rounded-[10px] bg-stone/70 border border-pebble/60 text-xs">
              <div>
                <span className="text-ash text-[10px] uppercase font-bold block">Weather Condition</span>
                <span className="font-bold text-onyx flex items-center gap-1 mt-0.5">
                  <Sun className="h-3.5 w-3.5 text-amber-500" /> {selectedReport.weather}
                </span>
              </div>
              <div>
                <span className="text-ash text-[10px] uppercase font-bold block">Workers On Site</span>
                <span className="font-bold text-forest text-base">{selectedReport.workers} personnel</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-[8px] bg-white border border-pebble text-onyx">
                <p className="font-semibold text-ash text-[10px] uppercase mb-1">Key Activities Executed</p>
                <p className="font-medium">{selectedReport.notes}</p>
              </div>

              <div className="p-3 rounded-[8px] bg-white border border-pebble text-onyx">
                <p className="font-semibold text-ash text-[10px] uppercase mb-1">Health &amp; Safety Observations</p>
                <p className="font-medium text-emerald-800">{selectedReport.safetyObservations}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="px-4 py-1.5 rounded-[8px] bg-forest text-white text-xs font-bold hover:bg-forest-hover shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Report Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <form
            onSubmit={handleCreateReport}
            className="bg-white rounded-[16px] max-w-md w-full p-6 shadow-2xl border border-pebble relative space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-onyx flex items-center gap-2">
                <FileText className="h-5 w-5 text-forest" /> Log Daily Site Report
              </h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="h-7 w-7 rounded-full bg-stone hover:bg-pebble/50 flex items-center justify-center text-onyx cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-onyx block">Date *</label>
                <input
                  type="text"
                  required
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="w-full bg-white border border-pebble rounded-[8px] p-2 text-xs text-onyx"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-onyx block">Weather *</label>
                <select
                  value={reportWeather}
                  onChange={(e) => setReportWeather(e.target.value as any)}
                  className="w-full bg-white border border-pebble rounded-[8px] p-2 text-xs text-onyx"
                >
                  <option value="Sunny">Sunny</option>
                  <option value="Cloudy">Cloudy</option>
                  <option value="Rainy">Rainy</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-onyx block">Worker Count On Site *</label>
              <input
                type="number"
                required
                value={reportWorkers}
                onChange={(e) => setReportWorkers(e.target.value)}
                className="w-full bg-white border border-pebble rounded-[8px] p-2 text-xs text-onyx"
              />
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-onyx block">Key Activities Summary *</label>
              <input
                type="text"
                required
                value={reportActivities}
                onChange={(e) => setReportActivities(e.target.value)}
                placeholder="e.g. Electrical, Plumbing, Painting"
                className="w-full bg-white border border-pebble rounded-[8px] p-2 text-xs text-onyx"
              />
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-onyx block">Notes &amp; Observations</label>
              <textarea
                rows={3}
                value={reportNotes}
                onChange={(e) => setReportNotes(e.target.value)}
                placeholder="Details of materials installed, inspections done..."
                className="w-full bg-white border border-pebble rounded-[8px] p-2 text-xs text-onyx"
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
                Submit Report
              </button>
            </div>
          </form>
        </div>
      )}
    </FirmaLayout>
  );
}
