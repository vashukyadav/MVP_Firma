"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EnquiriesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/leads");
  }, [router]);

  return (
    <div className="p-8 flex items-center justify-center min-h-[50vh]">
      <p className="text-sm text-ash">Redirecting to Leads...</p>
    </div>
  );
}
