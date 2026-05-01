// src/app/dashboard/housekeeping/page.tsx  (Next.js page)
"use client";

import HousekeepingPage from "@/components/housekeeping/updates/HousekeepingPage";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";

export default function HousekeepingRoute() {
  const { user, isAuthenticated, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Let middleware handle redirect
  }

  // ✅ No props needed — HousekeepingPage reads from store directly
  return <HousekeepingPage />;
}
