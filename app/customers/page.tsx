"use client";

import Customers from "@/features/customers/Customers";
import PermissionGuard from "@/components/auth/PermissionGuard";

export default function CustomersPage() {
  return (
    <PermissionGuard module="customers" action="view">
      <Customers />
    </PermissionGuard>
  );
}