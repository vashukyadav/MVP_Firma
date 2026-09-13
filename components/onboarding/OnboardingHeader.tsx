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

  const userName = currentUser?.name || "User";
  const userRole = currentUser?.role ? currentUser.role.replace("_", " ") : "Owner";
  const userInitial = (currentUser?.name?.charAt(0) || "U").toUpperCase();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="w-full border-b border-pebble bg-stone sticky top-0 z-30">
      <div className="container-fluid flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Brand Logo */}
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-onyx text-white shadow-none">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-onyx block leading-tight">
              FIRMA
            </span>
            <p className="text-eyebrow font-medium leading-none text-ash">
              Build Smarter. Together.
            </p>
          </div>
        </div>

        {/* User Profile Pill */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 hover:bg-mist transition cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-onyx text-xs font-bold text-white">
              {userInitial}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-body font-bold text-onyx leading-tight">
                {userName}
              </p>
              <p className="text-eyebrow font-medium text-ash capitalize leading-none">
                {userRole.toLowerCase()}
              </p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-ash ml-0.5" />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-[10px] border border-pebble bg-white py-1.5 shadow-md z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3.5 py-2 border-b border-pebble sm:hidden">
                <p className="text-body font-semibold text-onyx">{userName}</p>
                <p className="text-eyebrow text-ash capitalize">{userRole.toLowerCase()}</p>
              </div>
              {showLogout && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3.5 py-2 text-body font-medium text-hazard-text hover:bg-hazard-bg transition cursor-pointer"
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
