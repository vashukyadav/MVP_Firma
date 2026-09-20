"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useToast, ToastItem, toast } from "./toast";
import { cn } from "@/lib/utils";

export type ToasterPosition =
  | "top-right"
  | "top-left"
  | "top-center"
  | "bottom-right"
  | "bottom-left"
  | "bottom-center";

export interface ToasterProps {
  position?: ToasterPosition;
  className?: string;
}

const positionClasses: Record<ToasterPosition, string> = {
  "top-right": "top-4 right-4 items-end",
  "top-left": "top-4 left-4 items-start",
  "top-center": "top-4 left-1/2 -translate-x-1/2 items-center",
  "bottom-right": "bottom-4 right-4 items-end",
  "bottom-left": "bottom-4 left-4 items-start",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 items-center",
};

export function Toaster({
  position = "top-right",
  className,
}: ToasterProps) {
  const { toasts } = useToast();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);

    // Global interceptor: replace native browser alert() dialogs with Firma Toasts
    if (typeof window !== "undefined") {
      const originalAlert = window.alert;
      window.alert = (msg?: unknown) => {
        const text = String(msg ?? "");
        if (/success|saved|created|updated|approved|recorded|exported|awarded/i.test(text)) {
          toast.success(text);
        } else if (/error|failed|invalid|not found|already exists/i.test(text)) {
          toast.error(text);
        } else if (/please|required|warning|must be|select/i.test(text)) {
          toast.warning(text);
        } else {
          toast.info(text);
        }
      };

      return () => {
        window.alert = originalAlert;
      };
    }
  }, []);

  if (!mounted || toasts.length === 0) {
    return null;
  }

  const content = (
    <div
      data-firma-toaster
      aria-label="Notifications"
      className={cn(
        "fixed z-[999999] flex flex-col gap-2.5 pointer-events-none max-w-[420px] w-full p-3 sm:p-4",
        positionClasses[position],
        className
      )}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(content, document.body)
    : null;
}
