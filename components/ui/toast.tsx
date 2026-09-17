"use client";

import * as React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant =
  | "success"
  | "warning"
  | "danger"
  | "error"
  | "info"
  | "neutral"
  | "default"
  | "loading";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastData {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  duration?: number; // ms, default: 4500
  action?: ToastAction;
  icon?: React.ReactNode;
  onDismiss?: () => void;
  createdAt: number;
}

export type ToastOptions = Omit<ToastData, "id" | "createdAt">;

type ToastListener = (toasts: ToastData[]) => void;

class ToastStore {
  private toasts: ToastData[] = [];
  private listeners: Set<ToastListener> = new Set();
  private toastCounter = 0;

  subscribe(listener: ToastListener) {
    this.listeners.add(listener);
    listener(this.toasts);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener([...this.toasts]);
    }
  }

  add(options: ToastOptions): string {
    const id = `toast-${Date.now()}-${++this.toastCounter}`;
    const newToast: ToastData = {
      ...options,
      id,
      variant: options.variant || "default",
      duration: options.duration !== undefined ? options.duration : 4500,
      createdAt: Date.now(),
    };

    // Keep maximum 4 toasts visible at a time
    this.toasts = [newToast, ...this.toasts.slice(0, 3)];
    this.notify();
    return id;
  }

  dismiss(id?: string) {
    if (id) {
      const target = this.toasts.find((t) => t.id === id);
      if (target?.onDismiss) target.onDismiss();
      this.toasts = this.toasts.filter((t) => t.id !== id);
    } else {
      this.toasts = [];
    }
    this.notify();
  }

  update(id: string, updates: Partial<ToastOptions>) {
    this.toasts = this.toasts.map((t) =>
      t.id === id ? { ...t, ...updates } : t
    );
    this.notify();
  }
}

export const toastStore = new ToastStore();

export function toast(
  title: React.ReactNode,
  options?: Omit<ToastOptions, "title">
): string {
  return toastStore.add({
    title,
    ...options,
  });
}

toast.success = (
  title: React.ReactNode,
  options?: Omit<ToastOptions, "title" | "variant">
) => {
  return toastStore.add({
    title,
    variant: "success",
    ...options,
  });
};

toast.warning = (
  title: React.ReactNode,
  options?: Omit<ToastOptions, "title" | "variant">
) => {
  return toastStore.add({
    title,
    variant: "warning",
    ...options,
  });
};

toast.error = (
  title: React.ReactNode,
  options?: Omit<ToastOptions, "title" | "variant">
) => {
  return toastStore.add({
    title,
    variant: "danger",
    ...options,
  });
};

toast.danger = toast.error;

toast.info = (
  title: React.ReactNode,
  options?: Omit<ToastOptions, "title" | "variant">
) => {
  return toastStore.add({
    title,
    variant: "info",
    ...options,
  });
};

toast.loading = (
  title: React.ReactNode,
  options?: Omit<ToastOptions, "title" | "variant">
) => {
  return toastStore.add({
    title,
    variant: "loading",
    duration: 0, // do not auto dismiss loading
    ...options,
  });
};

toast.promise = async <T,>(
  promise: Promise<T>,
  messages: {
    loading: React.ReactNode;
    success: React.ReactNode | ((data: T) => React.ReactNode);
    error: React.ReactNode | ((error: unknown) => React.ReactNode);
  }
): Promise<T> => {
  const id = toast.loading(messages.loading);
  try {
    const data = await promise;
    const successMsg =
      typeof messages.success === "function"
        ? messages.success(data)
        : messages.success;
    toastStore.update(id, {
      title: successMsg,
      variant: "success",
      duration: 4500,
    });
    return data;
  } catch (err) {
    const errorMsg =
      typeof messages.error === "function"
        ? messages.error(err)
        : messages.error;
    toastStore.update(id, {
      title: errorMsg,
      variant: "danger",
      duration: 5000,
    });
    throw err;
  }
};

toast.dismiss = (id?: string) => {
  toastStore.dismiss(id);
};

export function useToast() {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);

  React.useEffect(() => {
    return toastStore.subscribe(setToasts);
  }, []);

  return {
    toasts,
    toast,
    dismiss: toast.dismiss,
  };
}

/**
 * Visual styling tokens mapping directly to Firma Design System:
 * - Success: clear-bg (#e1efde), success-text (#072d20), success (#009300)
 * - Warning/Caution: caution-bg (#faf0df), caution-text (#412311), caution (#f59e0b)
 * - Danger/Hazard: hazard-bg (#f9e7e5), hazard-text (#4a1212), hazard (#ef4444)
 * - Neutral/Info: stone/mist (#faf9f7 / #e6e6e6), onyx (#181b19), pebble (#cdcdcd)
 */
export function ToastItem({ toast: t }: { toast: ToastData }) {
  const [isExiting, setIsExiting] = React.useState(false);
  const [paused, setPaused] = React.useState(false);
  const [progress, setProgress] = React.useState(100);

  const duration = t.duration ?? 4500;
  const isPermanent = duration <= 0;

  const handleDismiss = React.useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      toastStore.dismiss(t.id);
    }, 200);
  }, [t.id]);

  React.useEffect(() => {
    if (isPermanent) return;

    const startTime = Date.now();
    let animFrame: number;

    const tick = () => {
      if (!paused) {
        const elapsed = Date.now() - startTime;
        const remainingRatio = Math.max(0, 1 - elapsed / duration);
        setProgress(remainingRatio * 100);

        if (elapsed >= duration) {
          handleDismiss();
          return;
        }
      }
      animFrame = requestAnimationFrame(tick);
    };

    animFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame);
  }, [duration, isPermanent, paused, handleDismiss]);

  const variant = t.variant || "default";

  // Configuration for tokens, icons, and colors
  let containerStyles = "";
  let iconNode = t.icon;
  let progressBarColor = "";
  let closeBtnColor = "";
  let actionBtnStyles = "";

  switch (variant) {
    case "success":
      containerStyles =
        "bg-[#e1efde] text-[#072d20] border-[#b2d8ad] shadow-[0_8px_20px_rgba(7,45,32,0.12)]";
      iconNode = iconNode || (
        <CheckCircle2 className="size-5 shrink-0 text-[#009300]" />
      );
      progressBarColor = "bg-[#009300]";
      closeBtnColor =
        "text-[#072d20]/60 hover:text-[#072d20] hover:bg-[#072d20]/10";
      actionBtnStyles =
        "bg-[#009300] text-white hover:bg-[#007a00] shadow-xs active:scale-95";
      break;

    case "warning":
      containerStyles =
        "bg-[#faf0df] text-[#412311] border-[#edd3a9] shadow-[0_8px_20px_rgba(65,35,17,0.12)]";
      iconNode = iconNode || (
        <AlertTriangle className="size-5 shrink-0 text-[#f59e0b]" />
      );
      progressBarColor = "bg-[#f59e0b]";
      closeBtnColor =
        "text-[#412311]/60 hover:text-[#412311] hover:bg-[#412311]/10";
      actionBtnStyles =
        "bg-[#f59e0b] text-white hover:bg-[#d97706] shadow-xs active:scale-95";
      break;

    case "danger":
    case "error":
      containerStyles =
        "bg-[#f9e7e5] text-[#4a1212] border-[#f5b5b0] shadow-[0_8px_20px_rgba(74,18,18,0.12)]";
      iconNode = iconNode || (
        <AlertCircle className="size-5 shrink-0 text-[#ef4444]" />
      );
      progressBarColor = "bg-[#ef4444]";
      closeBtnColor =
        "text-[#4a1212]/60 hover:text-[#4a1212] hover:bg-[#4a1212]/10";
      actionBtnStyles =
        "bg-[#ef4444] text-white hover:bg-[#dc2626] shadow-xs active:scale-95";
      break;

    case "loading":
      containerStyles =
        "bg-white text-[#181b19] border-[#cdcdcd] shadow-[0_8px_20px_rgba(24,27,25,0.1)]";
      iconNode = (
        <Loader2 className="size-5 shrink-0 animate-spin text-[#0e382b]" />
      );
      progressBarColor = "bg-[#0e382b]";
      closeBtnColor =
        "text-[#919191] hover:text-[#181b19] hover:bg-[#e6e6e6]/60";
      actionBtnStyles =
        "bg-[#0e382b] text-white hover:bg-[#09281e] shadow-xs active:scale-95";
      break;

    case "info":
    case "neutral":
      containerStyles =
        "bg-[#faf9f7] text-[#181b19] border-[#cdcdcd] shadow-[0_8px_20px_rgba(24,27,25,0.1)]";
      iconNode = iconNode || (
        <Info className="size-5 shrink-0 text-[#0e382b]" />
      );
      progressBarColor = "bg-[#0e382b]";
      closeBtnColor =
        "text-[#919191] hover:text-[#181b19] hover:bg-[#e6e6e6]/60";
      actionBtnStyles =
        "bg-[#0e382b] text-white hover:bg-[#09281e] shadow-xs active:scale-95";
      break;

    default:
      containerStyles =
        "bg-white text-[#181b19] border-[#cdcdcd] shadow-[0_8px_20px_rgba(24,27,25,0.1)]";
      iconNode = iconNode || (
        <Info className="size-5 shrink-0 text-[#0e382b]" />
      );
      progressBarColor = "bg-[#0e382b]";
      closeBtnColor =
        "text-[#919191] hover:text-[#181b19] hover:bg-[#e6e6e6]/60";
      actionBtnStyles =
        "bg-[#0e382b] text-white hover:bg-[#09281e] shadow-xs active:scale-95";
      break;
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={cn(
        "group relative flex w-full max-w-[390px] items-start gap-3 rounded-[10px] border p-3.5 px-4 overflow-hidden select-none transition-all duration-200 pointer-events-auto",
        containerStyles,
        isExiting ? "animate-toast-out" : "animate-toast-in"
      )}
    >
      {/* Icon */}
      <div className="mt-0.5 shrink-0">{iconNode}</div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="text-[13.5px] font-semibold tracking-tight leading-snug font-heading">
          {t.title}
        </div>
        {t.description && (
          <div className="mt-1 text-[12.5px] leading-relaxed opacity-85 break-words font-normal">
            {t.description}
          </div>
        )}
        {t.action && (
          <div className="mt-2.5">
            <button
              type="button"
              onClick={() => {
                t.action?.onClick();
                handleDismiss();
              }}
              className={cn(
                "inline-flex items-center justify-center px-2.5 py-1 text-[11.5px] font-semibold rounded-[6px] transition cursor-pointer",
                actionBtnStyles
              )}
            >
              {t.action.label}
            </button>
          </div>
        )}
      </div>

      {/* Close button */}
      <button
        type="button"
        aria-label="Close notification"
        onClick={handleDismiss}
        className={cn(
          "shrink-0 p-1 rounded-full transition-colors cursor-pointer -mr-1 -mt-0.5",
          closeBtnColor
        )}
      >
        <X className="size-4" />
      </button>

      {/* Subtle Progress Bar */}
      {!isPermanent && (
        <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-black/5 overflow-hidden">
          <div
            className={cn(
              "h-full transition-[width] duration-75 ease-linear",
              progressBarColor
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
