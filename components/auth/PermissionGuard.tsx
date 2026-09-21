"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePermissions, type ModuleKey, type PermissionAction, MODULE_DEFINITIONS } from "@/lib/permissions";
import { ShieldAlert, ArrowLeft, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PermissionGuardProps {
  module: ModuleKey;
  action?: PermissionAction;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function PermissionGuard({
  module,
  action = "view",
  children,
  fallback,
}: PermissionGuardProps) {
  const router = useRouter();
  const { hasPermission, loading } = usePermissions();
  const [hasNotified, setHasNotified] = useState(false);

  const allowed = hasPermission(module, action);
  const moduleInfo = MODULE_DEFINITIONS.find((m) => m.key === module);
  const moduleLabel = moduleInfo?.label || module;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest"></div>
      </div>
    );
  }

  if (!allowed) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-[500px] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl bg-white border border-pebble/70 p-8 shadow-sm text-center">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-hazard-bg text-hazard-text flex items-center justify-center mb-5">
            <ShieldAlert className="h-8 w-8 text-rose-600" />
          </div>

          <h2 className="text-xl font-bold text-onyx mb-2">Access Denied</h2>
          <p className="text-sm text-ash mb-6 leading-relaxed">
            You do not have permission to <span className="font-semibold text-onyx">{action}</span> the{" "}
            <span className="font-semibold text-onyx">{moduleLabel}</span> module. Please contact your Account Administrator or Business Owner for permission access.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="w-full sm:w-auto text-xs font-semibold"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Go Back
            </Button>
            <Button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="w-full sm:w-auto bg-forest hover:bg-forest-hover text-white text-xs font-semibold"
            >
              <LayoutDashboard className="h-4 w-4 mr-1.5" />
              Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
