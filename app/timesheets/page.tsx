"use client";

import FirmaLayout from "@/components/layout/FirmaLayout";
import { Clock } from "lucide-react";

export default function TimesheetsPage() {
  return (
    <FirmaLayout activeNav="Timesheets">
      <div className="space-y-6 mt-2">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <span className="text-eyebrow font-semibold tracking-wider text-ash uppercase">
              PROJECT MANAGEMENT
            </span>
            <h1 className="text-display-h1 font-bold text-onyx mt-0.5 tracking-tight flex items-center gap-2.5">
              <Clock className="h-6 w-6 text-forest" />
              <span>Timesheets</span>
            </h1>
            <p className="text-sm text-ash mt-1">
              Daily worker attendance logs, overtime tracking, and supervisor approvals.
            </p>
          </div>
        </div>

        {/* Empty Page Container */}
        <div className="rounded-[14px] bg-white border border-pebble/70 p-12 shadow-2xs text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-breath/60 text-onyx mb-3">
            <Clock className="h-7 w-7 text-forest" />
          </div>
          <h3 className="text-base font-bold text-onyx">No Timesheets Recorded</h3>
          <p className="text-xs text-ash mt-1 max-w-sm mx-auto">
            Daily labour logs, hours worked, and overtime submissions will be displayed here.
          </p>
        </div>
      </div>
    </FirmaLayout>
  );
}
