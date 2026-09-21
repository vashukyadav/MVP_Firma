"use client";

import UsersAndRoles from "@/features/users/UserAndRoles";
import PermissionGuard from "@/components/auth/PermissionGuard";

export default function UsersPage() {
  return (
    <PermissionGuard module="userManagement" action="view">
      <UsersAndRoles />
    </PermissionGuard>
  );
}