"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { ChevronDown, LogOut, Building2 } from "lucide-react";

interface OnboardingHeaderProps {
  showLogout?: boolean;
}

export function OnboardingHeader({ showLogout = true }: OnboardingHeaderProps) {
  const router = useRouter();
  const { currentUser, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const userName = currentUser?.name || "Rahul Sharma";
  const userRole = currentUser?.role ? currentUser.role.replace("_", " ") : "Owner";
  const userInitial = (userName.charAt(0) || "R").toUpperCase();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="w-full border-b border-slate-100 bg-white sticky top-0 z-30">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
            <Building2 className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-slate-900">
                FIRMA
              </span>
            </div>
            <p className="text-[11px] font-medium leading-none text-slate-400">
              Build Smarter. Together.
            </p>
          </div>
        </div>

        {/* User Profile Pill */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2.5 rounded-full border border-slate-200/80 bg-white py-1 pl-1 pr-3 shadow-xs hover:border-slate-300 transition-colors focus:outline-hidden"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">
              {userInitial}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {userName}
              </p>
              <p className="text-[10px] font-medium text-slate-400 capitalize leading-none">
                {userRole.toLowerCase()}
              </p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-0.5" />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-100 bg-white py-1.5 shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3.5 py-2 border-b border-slate-100 sm:hidden">
                <p className="text-xs font-semibold text-slate-800">{userName}</p>
                <p className="text-[10px] text-slate-400 capitalize">{userRole.toLowerCase()}</p>
              </div>
              {showLogout && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50/60 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
