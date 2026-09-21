"use client";

import { useEffect, useState, useMemo } from "react";
import { db, type AuditLogRecord } from "@/lib/db";
import { useAuthStore } from "@/store/authStore";
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  Shield,
  ArrowRight,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AuditLogView() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState<string>("ALL");

  const loadLogs = async () => {
    setLoading(true);
    try {
      const companyId = currentUser?.companyId || "ORG-DEFAULT";
      const records = await db.audit_logs
        .where("companyId")
        .equals(companyId)
        .reverse()
        .sortBy("timestamp");
      setLogs(records);
    } catch (e) {
      console.error("Failed to load audit logs:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [currentUser?.companyId]);

  const uniqueModules = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => {
      if (l.module) set.add(l.module);
    });
    return Array.from(set);
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        !searchQuery ||
        log.targetUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.performedByUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.permission.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesModule =
        selectedModule === "ALL" || log.module === selectedModule;

      return matchesSearch && matchesModule;
    });
  }, [logs, searchQuery, selectedModule]);

  const formatDateTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  const renderValueBadge = (val: string) => {
    const upper = (val || "").toUpperCase();
    if (upper === "ALLOW" || upper === "TRUE") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          {val}
        </span>
      );
    }
    if (upper === "DENY" || upper === "FALSE") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          {val}
        </span>
      );
    }
    if (upper.includes("INHERIT")) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-stone text-onyx border border-pebble/70">
          {val}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-stone text-ash border border-pebble">
        {val}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-[12px] border border-pebble shadow-2xs">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ash pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user, admin, or action..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-ash">
            <Filter className="h-3.5 w-3.5" />
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="h-9 rounded-[8px] border border-pebble bg-white px-2.5 text-xs text-onyx outline-none focus:border-forest"
            >
              <option value="ALL">All Modules ({logs.length})</option>
              {uniqueModules.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={loadLogs}
          className="gap-1.5 text-xs self-end sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Logs Table */}
      <div className="rounded-[12px] border border-pebble bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-pebble bg-stone text-ash font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action Performed By</th>
                <th className="py-3 px-4">Target Team Member</th>
                <th className="py-3 px-4">Module / Entity</th>
                <th className="py-3 px-4">Permission / Flag</th>
                <th className="py-3 px-4">Transition</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-pebble/60 text-onyx">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-stone/50 transition">
                  <td className="py-3 px-4 text-ash font-mono whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-ash/80" />
                      <span>{formatDateTime(log.timestamp)}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-breath text-onyx flex items-center justify-center font-bold text-[10px]">
                        {(log.performedByUserName?.charAt(0) || "A").toUpperCase()}
                      </div>
                      <span className="font-semibold text-onyx">{log.performedByUserName}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div>
                      <span className="font-semibold text-onyx">{log.targetUserName}</span>
                      <span className="ml-1.5 text-[10px] text-ash bg-stone px-1.5 py-0.5 rounded border border-pebble/50">
                        {log.targetRole}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-medium text-onyx capitalize">
                      {log.module.replace(/([A-Z])/g, " $1")}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold text-onyx capitalize">
                      {log.permission}
                    </span>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      {renderValueBadge(log.oldValue)}
                      <ArrowRight className="h-3 w-3 text-ash shrink-0" />
                      {renderValueBadge(log.newValue)}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-ash">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-stone flex items-center justify-center text-ash">
                        <FileText className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-semibold text-onyx">No audit records found</p>
                      <p className="text-xs text-ash">
                        {searchQuery || selectedModule !== "ALL"
                          ? "Try clearing your search query or module filters."
                          : "Role modifications and custom permission overrides will appear here in chronological order."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
