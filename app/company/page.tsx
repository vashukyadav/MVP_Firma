"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { db, type Company } from "@/lib/db";
import FirmaLayout from "@/components/layout/FirmaLayout";
import {
  Building,
  MapPin,
  Globe,
  Briefcase,
  Users,
  CheckCircle2,
  Edit3,
  Save,
  X,
  Building2,
} from "lucide-react";

export default function CompanyPage() {
  const { currentUser } = useAuthStore();

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const loadCompany = async () => {
      if (!currentUser?.id) {
        // Fallback demo data if user is not logged in
        setCompany({
          userId: 1,
          companyName: "ABC Solutions Pvt. Ltd.",
          industry: "Construction & Infrastructure",
          companySize: "10-50 employees",
          website: "https://abcsolutions.com",
          country: "India",
          state: "Maharashtra",
          city: "Mumbai",
          address: "Unit 402, Trade Tower, Bandra Kurla Complex",
        });
        setLoading(false);
        return;
      }

      const data = await db.company.get(currentUser.id);
      if (data) {
        setCompany(data);
      } else {
        setCompany({
          userId: currentUser.id,
          companyName: "ABC Solutions Pvt. Ltd.",
          industry: "Construction & Infrastructure",
          companySize: "10-50 employees",
          website: "https://abcsolutions.com",
          country: "India",
          state: "Maharashtra",
          city: "Mumbai",
          address: "Unit 402, Trade Tower, Bandra Kurla Complex",
        });
      }
      setLoading(false);
    };

    loadCompany();
  }, [currentUser?.id]);

  const handleChange = (field: keyof Company, value: string) => {
    if (!company) return;
    setCompany({
      ...company,
      [field]: value,
    });
  };

  const handleSave = async () => {
    if (!company) return;
    await db.company.put(company);
    setEditing(false);
    alert("Company information updated successfully!");
  };

  if (loading) {
    return (
      <FirmaLayout activeNav="Company">
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-xs font-medium text-slate-400">
            Loading company information...
          </p>
        </div>
      </FirmaLayout>
    );
  }

  return (
    <FirmaLayout activeNav="Company">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 pb-2">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            ORGANIZATION
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5 tracking-tight flex items-center gap-2">
            Company Profile
            <span className="inline-flex items-center gap-1 rounded-full bg-[#E6F4EA] px-2.5 py-0.5 text-[10px] font-bold text-[#2E7D32]">
              <CheckCircle2 className="h-3 w-3" /> Active
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your registered organization details and headquarters address.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 rounded-xl bg-[#182E25] hover:bg-[#12231B] text-white px-4 py-2 text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit Company</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 text-xs font-semibold shadow-2xs transition cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1.5 rounded-xl bg-[#182E25] hover:bg-[#12231B] text-white px-4 py-2 text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Changes</span>
              </button>
            </>
          )}
        </div>
      </div>

      {company && (
        <div className="grid gap-5 lg:grid-cols-12">
          {/* Left Column (8 cols): Basic Info & Location Cards */}
          <div className="lg:col-span-8 space-y-5">
            {/* 1. Basic Information Card */}
            <div className="rounded-2xl bg-white p-6 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E6F4EA] text-[#2E7D32]">
                  <Building className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Basic Information
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Legal company name and industry categorization
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 mt-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Company Name
                  </label>
                  <input
                    type="text"
                    disabled={!editing}
                    value={company.companyName}
                    onChange={(e) =>
                      handleChange("companyName", e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 outline-none transition disabled:bg-slate-50 disabled:text-slate-600 focus:border-[#182E25] focus:ring-2 focus:ring-slate-100 shadow-2xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Industry
                  </label>
                  <input
                    type="text"
                    disabled={!editing}
                    value={company.industry}
                    onChange={(e) => handleChange("industry", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 outline-none transition disabled:bg-slate-50 disabled:text-slate-600 focus:border-[#182E25] focus:ring-2 focus:ring-slate-100 shadow-2xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Company Size
                  </label>
                  <input
                    type="text"
                    disabled={!editing}
                    value={company.companySize}
                    onChange={(e) =>
                      handleChange("companySize", e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 outline-none transition disabled:bg-slate-50 disabled:text-slate-600 focus:border-[#182E25] focus:ring-2 focus:ring-slate-100 shadow-2xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Website URL
                  </label>
                  <input
                    type="text"
                    disabled={!editing}
                    value={company.website ?? ""}
                    placeholder="https://example.com"
                    onChange={(e) => handleChange("website", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 outline-none transition disabled:bg-slate-50 disabled:text-slate-600 focus:border-[#182E25] focus:ring-2 focus:ring-slate-100 shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* 2. Location & Address Card */}
            <div className="rounded-2xl bg-white p-6 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FEF7E2] text-[#C98A19]">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Headquarters Location
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Physical business address and regional office details
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 mt-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Country
                  </label>
                  <input
                    type="text"
                    disabled={!editing}
                    value={company.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 outline-none transition disabled:bg-slate-50 disabled:text-slate-600 focus:border-[#182E25] focus:ring-2 focus:ring-slate-100 shadow-2xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    State
                  </label>
                  <input
                    type="text"
                    disabled={!editing}
                    value={company.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 outline-none transition disabled:bg-slate-50 disabled:text-slate-600 focus:border-[#182E25] focus:ring-2 focus:ring-slate-100 shadow-2xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    City
                  </label>
                  <input
                    type="text"
                    disabled={!editing}
                    value={company.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 outline-none transition disabled:bg-slate-50 disabled:text-slate-600 focus:border-[#182E25] focus:ring-2 focus:ring-slate-100 shadow-2xs"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Full Address
                  </label>
                  <textarea
                    rows={3}
                    disabled={!editing}
                    value={company.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 outline-none transition disabled:bg-slate-50 disabled:text-slate-600 focus:border-[#182E25] focus:ring-2 focus:ring-slate-100 shadow-2xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Summary Cards & Quick Info */}
          <div className="lg:col-span-4 space-y-5">
            {/* Quick Profile Summary Card */}
            <div className="rounded-2xl bg-white p-6 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E5EDE7] text-[#182E25] font-black text-lg shadow-2xs">
                {company.companyName.charAt(0)}
              </div>
              <h3 className="mt-3 text-base font-bold text-slate-900">
                {company.companyName}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {company.industry}
              </p>

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Team Size:</span>
                  <span className="font-semibold text-slate-800">
                    {company.companySize}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Headquarters:</span>
                  <span className="font-semibold text-slate-800">
                    {company.city}, {company.country}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Verification:</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Verified Business
                  </span>
                </div>
              </div>
            </div>

            {/* Need Changes Guidance */}
            <div className="rounded-2xl bg-[#EBE7DF] p-5 relative overflow-hidden">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                FIRMA Business ID
              </h4>
              <p className="text-sm font-extrabold text-slate-900 mt-1">
                ORG-2025-88421
              </p>
              <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                This business ID is used across your contracts, invoices, and
                quotation documents.
              </p>
            </div>
          </div>
        </div>
      )}
    </FirmaLayout>
  );
}