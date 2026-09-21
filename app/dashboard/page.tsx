"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { db } from "@/lib/db";
import FirmaLayout from "@/components/layout/FirmaLayout";
import OwnerDashboard from "@/features/users/OwnerDashboard";
import SalesManagerDashboard from "@/features/users/SalesManagerDashboard";
import ProjectManagerDashboard from "@/features/users/ProjectManagerDashboard";
import FinanceManagerDashboard from "@/features/users/FinanceManagerDashboard";
import FieldWorkerDashboard from "@/features/users/FieldWorkerDashboard";
import SiteManagerDashboard from "@/features/users/SiteManagerDashboard";

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser } = useAuthStore();

  const [companyName, setCompanyName] = useState("");
  const [currentPlan, setCurrentPlan] = useState("Starter");
  const [hasAdmin, setHasAdmin] = useState(false);
  const [teamCount, setTeamCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);

  const [roleCounts, setRoleCounts] = useState({
    SALES_MANAGER: 0,
    PROJECT_MANAGER: 0,
    SITE_MANAGER: 0,
    FIELD_WORKER: 0,
    FINANCE_MANAGER: 0,
    ACCOUNT_ADMIN: 0,
    OWNER: 0,
  });

  useEffect(() => {
    async function checkAdminStatus() {
      try {
        const companyId = currentUser?.companyId || "ORG-DEFAULT";
        const count = await db.users
          .where("companyId")
          .equals(companyId)
          .filter((u) => u.role === "ACCOUNT_ADMIN")
          .count();
        setHasAdmin(count > 0);
      } catch {
        setHasAdmin(false);
      }
    }
    checkAdminStatus();

    const handleAdminCreated = () => {
      setHasAdmin(true);
    };
    window.addEventListener("admin-created", handleAdminCreated);
    return () => {
      window.removeEventListener("admin-created", handleAdminCreated);
    };
  }, [currentUser?.role, currentUser?.companyId]);

  useEffect(() => {
    async function loadData() {
      try {
        const companyId = currentUser?.companyId || "ORG-DEFAULT";
        const allUsers = await db.users
          .where("companyId")
          .equals(companyId)
          .toArray();
        setTeamCount(allUsers.length);

        const counts = {
          SALES_MANAGER: 0,
          PROJECT_MANAGER: 0,
          SITE_MANAGER: 0,
          FIELD_WORKER: 0,
          FINANCE_MANAGER: 0,
          ACCOUNT_ADMIN: 0,
          OWNER: 0,
        };

        for (const u of allUsers) {
          if (counts[u.role as keyof typeof counts] !== undefined) {
            counts[u.role as keyof typeof counts]++;
          }
        }
        setRoleCounts(counts);

        const customers = await db.customer
          .where("companyId")
          .equals(companyId)
          .count();
        setCustomerCount(customers);
      } catch {
        setTeamCount(0);
      }

      if (currentUser?.id) {
        const comp = await db.company.get(currentUser.id);
        if (comp?.companyName) {
          setCompanyName(comp.companyName);
        } else if (currentUser.name) {
          setCompanyName(`${currentUser.name}'s Enterprise`);
        }

        const onboard = await db.onboarding.get(currentUser.id);
        if (onboard?.plan) {
          const planFormatted =
            onboard.plan.charAt(0) + onboard.plan.slice(1).toLowerCase();
          setCurrentPlan(planFormatted);
        }
      }
    }
    loadData();
  }, [currentUser?.id, currentUser?.name, currentUser?.companyId]);

  const userRole = currentUser?.role;

  return (
    <FirmaLayout activeNav="Dashboard">
      {/* Route Dashboard dynamically based on authenticated role */}
      {userRole === "SALES_MANAGER" && (
        <SalesManagerDashboard
          companyName={companyName}
          customerCount={customerCount}
        />
      )}

      {userRole === "PROJECT_MANAGER" && (
        <ProjectManagerDashboard companyName={companyName} />
      )}

      {userRole === "FINANCE_MANAGER" && (
        <FinanceManagerDashboard companyName={companyName} />
      )}

      {userRole === "FIELD_WORKER" && (
        <FieldWorkerDashboard companyName={companyName} />
      )}

      {userRole === "SITE_MANAGER" && (
        <SiteManagerDashboard companyName={companyName} />
      )}

      {(userRole === "OWNER" || userRole === "ACCOUNT_ADMIN" || !userRole) && (
        <OwnerDashboard
          companyName={companyName}
          currentPlan={currentPlan}
          hasAdmin={hasAdmin}
          teamCount={teamCount}
          roleCounts={roleCounts}
        />
      )}
    </FirmaLayout>
  );
}