"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTenderFlowStore } from "@/store/tenderFlowStore";
import { useAuthStore } from "@/store/authStore";

export default function OpportunitiesPage() {
  const router = useRouter();
  const { setStep } = useTenderFlowStore();
  const currentUser = useAuthStore((state) => state.currentUser);

  useEffect(() => {
    setStep(1);
    router.replace("/tenders");
  }, [router, setStep]);

  return (
    <div className="min-h-screen bg-stone flex items-center justify-center">
      <p className="text-xs text-ash">Opening Opportunities &amp; Tender Flow...</p>
    </div>
  );
}
