"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import UsersAndRoles from "@/features/users/UserAndRoles";

export default function UsersPage() {
  const router = useRouter();
  const { currentUser } = useAuthStore();

  useEffect(() => {
    if (!currentUser) {
      router.replace("/login");
      return;
    }

    if (currentUser.role !== "ACCOUNT_ADMIN" && currentUser.role !== "OWNER") {
      router.replace("/dashboard");
    }
  }, [currentUser, router]);

  if (!currentUser || (currentUser.role !== "ACCOUNT_ADMIN" && currentUser.role !== "OWNER")) {
    return null;
  }

  return <UsersAndRoles />;
}