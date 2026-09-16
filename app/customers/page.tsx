"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/authStore";
import Customers from "@/features/customers/Customers";

export default function CustomersPage() {
  const router = useRouter();
  const { currentUser } = useAuthStore();

  useEffect(() => {
    // User login nahi hai
    if (!currentUser) {
      router.push("/login");
      return;
    }

    // Owner, Account Admin, aur Sales Manager Customers access kar sakte hain
    if (
      currentUser.role !== "SALES_MANAGER" &&
      currentUser.role !== "OWNER" &&
      currentUser.role !== "ACCOUNT_ADMIN"
    ) {
      router.push("/dashboard");
    }
  }, [currentUser, router]);

  // User load hone tak kuch render nahi
  if (!currentUser) {
    return null;
  }

  // Unauthorized user ke liye kuch render nahi
  if (
    currentUser.role !== "SALES_MANAGER" &&
    currentUser.role !== "OWNER" &&
    currentUser.role !== "ACCOUNT_ADMIN"
  ) {
    return null;
  }

  return <Customers />;
}