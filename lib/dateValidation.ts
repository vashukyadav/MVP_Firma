/**
 * Utility functions for robust Date Parsing, Timeline Boundary Validation,
 * and Job Schedule Status calculation across Firma.
 */

// Supported formats: DD-MM-YYYY, DD/MM/YYYY, DD MMM YYYY, YYYY-MM-DD
const MONTH_NAMES: { [key: string]: number } = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

/**
 * Parses any date string commonly used in the app into a normalized Date object (at 00:00:00 local time).
 */
export function parseStandardDate(dateStr?: string | null): Date | null {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  // Handle "Today" / "Tomorrow" strings
  const lower = trimmed.toLowerCase();
  const now = new Date();
  const baseToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (lower === "today" || lower === "now") {
    return baseToday;
  }
  if (lower === "tomorrow") {
    const tmrw = new Date(baseToday);
    tmrw.setDate(tmrw.getDate() + 1);
    return tmrw;
  }
  if (lower === "yesterday") {
    const yest = new Date(baseToday);
    yest.setDate(yest.getDate() - 1);
    return yest;
  }

  // Check for ISO YYYY-MM-DD
  const isoMatch = trimmed.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  // Check for DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  // Check for "DD MMM YYYY" e.g. "20 Sep 2026" or "20 September 2026"
  const textMatch = trimmed.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (textMatch) {
    const day = parseInt(textMatch[1], 10);
    const monthKey = textMatch[2].toLowerCase();
    const year = parseInt(textMatch[3], 10);
    if (MONTH_NAMES[monthKey] !== undefined) {
      const d = new Date(year, MONTH_NAMES[monthKey], day);
      if (!isNaN(d.getTime())) return d;
    }
  }

  // Fallback to native parser
  const native = new Date(trimmed);
  if (!isNaN(native.getTime())) {
    return new Date(native.getFullYear(), native.getMonth(), native.getDate());
  }

  return null;
}

/**
 * Format a Date or date string to display format: "DD MMM YYYY" (e.g. "20 Sep 2026")
 */
export function formatDisplayDate(dateInput?: Date | string | null): string {
  if (!dateInput) return "";
  const d = dateInput instanceof Date ? dateInput : parseStandardDate(dateInput);
  if (!d || isNaN(d.getTime())) return typeof dateInput === "string" ? dateInput : "";

  const day = String(d.getDate()).padStart(2, "0");
  const month = MONTH_SHORT[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Format to standard input/storage format "YYYY-MM-DD"
 */
export function formatIsoDate(dateInput?: Date | string | null): string {
  if (!dateInput) return "";
  const d = dateInput instanceof Date ? dateInput : parseStandardDate(dateInput);
  if (!d || isNaN(d.getTime())) return "";

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  projectWindow?: string;
}

/**
 * Validates a job schedule or tender deadline against the Project Timeline decided by Sales/Management.
 *
 * Rules:
 * 1. Item Start Date cannot be before Project Start Date
 * 2. Item End Date/Deadline cannot be after Project End Date
 * 3. Item End Date cannot be before Item Start Date
 */
export function validateTimelineWithinProject(
  itemStartDateStr?: string,
  itemEndDateStr?: string,
  projectStartDateStr?: string,
  projectEndDateStr?: string
): ValidationResult {
  const pStart = parseStandardDate(projectStartDateStr);
  const pEnd = parseStandardDate(projectEndDateStr);

  const windowText = pStart && pEnd
    ? `${formatDisplayDate(pStart)} to ${formatDisplayDate(pEnd)}`
    : pEnd
    ? `Up to ${formatDisplayDate(pEnd)}`
    : pStart
    ? `From ${formatDisplayDate(pStart)}`
    : undefined;

  const iStart = parseStandardDate(itemStartDateStr);
  const iEnd = parseStandardDate(itemEndDateStr);

  // If item start is after item end
  if (iStart && iEnd && iStart > iEnd) {
    return {
      isValid: false,
      error: `Start Date (${formatDisplayDate(iStart)}) cannot be after End Date (${formatDisplayDate(iEnd)}).`,
      projectWindow: windowText,
    };
  }

  // If item start is before project start
  if (pStart && iStart && iStart < pStart) {
    return {
      isValid: false,
      error: `Date (${formatDisplayDate(iStart)}) is before Project Start Date (${formatDisplayDate(pStart)}). Sales/Project timeline allows dates from ${formatDisplayDate(pStart)}.`,
      projectWindow: windowText,
    };
  }

  // If item end is after project end
  if (pEnd && iEnd && iEnd > pEnd) {
    return {
      isValid: false,
      error: `Date (${formatDisplayDate(iEnd)}) exceeds Project End Date (${formatDisplayDate(pEnd)}). Project execution finishes on ${formatDisplayDate(pEnd)}.`,
      projectWindow: windowText,
    };
  }

  // Single date check (e.g. tender deadline or single job date)
  if (pEnd && iStart && !iEnd && iStart > pEnd) {
    return {
      isValid: false,
      error: `Date (${formatDisplayDate(iStart)}) exceeds Project End Date (${formatDisplayDate(pEnd)}).`,
      projectWindow: windowText,
    };
  }

  return {
    isValid: true,
    projectWindow: windowText,
  };
}

export type ScheduleCategory = "TODAY" | "TOMORROW" | "FUTURE" | "OVERDUE" | "UNKNOWN";

export interface JobScheduleState {
  category: ScheduleCategory;
  daysDiff: number; // positive = future, 0 = today, negative = past
  badgeText: string;
  badgeColor: string;
  allowDirectTravel: boolean;
  scheduledDateFormatted: string;
}

/**
 * Calculates whether a job is for TODAY, TOMORROW, FUTURE, or OVERDUE.
 * Prevents direct "Start Travel" on future jobs.
 */
export function getJobScheduleState(
  jobDateStr?: string,
  referenceDateInput?: Date | string
): JobScheduleState {
  const refDate = referenceDateInput
    ? (referenceDateInput instanceof Date ? referenceDateInput : parseStandardDate(referenceDateInput) || new Date())
    : new Date();

  // Normalize reference date to 00:00:00
  const today = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate());

  const jobDate = parseStandardDate(jobDateStr);

  if (!jobDate) {
    return {
      category: "TODAY",
      daysDiff: 0,
      badgeText: "Today",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      allowDirectTravel: true,
      scheduledDateFormatted: jobDateStr || "Today",
    };
  }

  const diffMs = jobDate.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const formatted = formatDisplayDate(jobDate);

  if (diffDays === 0) {
    return {
      category: "TODAY",
      daysDiff: 0,
      badgeText: "Today",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      allowDirectTravel: true,
      scheduledDateFormatted: formatted,
    };
  }

  if (diffDays === 1) {
    return {
      category: "TOMORROW",
      daysDiff: 1,
      badgeText: `Tomorrow (${formatted})`,
      badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
      allowDirectTravel: false,
      scheduledDateFormatted: formatted,
    };
  }

  if (diffDays > 1) {
    return {
      category: "FUTURE",
      daysDiff: diffDays,
      badgeText: `In ${diffDays} days (${formatted})`,
      badgeColor: "bg-sky-50 text-sky-800 border-sky-200",
      allowDirectTravel: false,
      scheduledDateFormatted: formatted,
    };
  }

  // Past / overdue
  return {
    category: "OVERDUE",
    daysDiff: diffDays,
    badgeText: `Active (${formatted})`,
    badgeColor: "bg-stone text-onyx border-pebble",
    allowDirectTravel: true,
    scheduledDateFormatted: formatted,
  };
}
