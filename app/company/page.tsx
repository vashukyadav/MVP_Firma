"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { db, type Company } from "@/lib/db";
import FirmaLayout from "@/components/layout/FirmaLayout";
import { toast } from "@/components/ui/toast";
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
        setCompany({
          userId: 1,
          companyId: "ORG-DEFAULT",
          companyName: "",
          industry: "",
          companySize: "",
          website: "",
          country: "India",
          state: "",
          city: "",
          address: "",
        });
        setLoading(false);
        return;
      }

      const companyId = currentUser.companyId || `ORG-${currentUser.id}`;
      // Query company by companyId so both Owner and Account Admin share the exact same company details
      let data = await db.company.where("companyId").equals(companyId).first();
      if (!data) {
        data = await db.company.get(currentUser.id);
      }

      if (data) {
        setCompany({ ...data, companyId: data.companyId || companyId });
      } else {
        setCompany({
          userId: currentUser.id,
          companyId,
          companyName: currentUser?.name ? `${currentUser.name}'s Enterprise` : "",
          industry: "",
          companySize: "",
          website: "",
          country: "India",
          state: "",
          city: "",
          address: "",
        });
      }
      setLoading(false);
    };

    loadCompany();
  }, [currentUser?.id, currentUser?.companyId, currentUser?.name]);

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
    toast.success("Company information updated successfully!");
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
          <span className="text-eyebrow font-semibold tracking-wider text-ash uppercase">
            ORGANIZATION
          </span>
          <h1 className="text-display-h1 font-bold text-onyx mt-0.5 tracking-tight flex items-center gap-2 flex-wrap">
            Company Profile
            <span className="inline-flex items-center gap-1 rounded-full bg-clear-bg px-2.5 py-0.5 text-eyebrow font-bold text-success-text border border-pebble">
              <CheckCircle2 className="h-3 w-3" /> Active
            </span>
            {company?.companyId && (
              <span className="inline-flex items-center gap-1 rounded-full bg-stone px-2.5 py-0.5 text-eyebrow font-mono font-semibold text-onyx border border-pebble">
                Org ID: {company.companyId}
              </span>
            )}
          </h1>
          <p className="text-body text-ash mt-1">
            Manage your registered organization details and headquarters address.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 rounded-[10px] bg-onyx hover:bg-onyx/90 text-white px-4 py-2 text-body font-medium transition cursor-pointer"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit Company</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex items-center gap-1.5 rounded-[10px] border border-pebble bg-white hover:bg-mist text-onyx px-3.5 py-2 text-body font-medium transition cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1.5 rounded-[10px] bg-onyx hover:bg-onyx/90 text-white px-4 py-2 text-body font-medium transition cursor-pointer"
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
            <div className="rounded-[10px] bg-white p-6 border border-pebble">
              <div className="flex items-center gap-3 pb-4 border-b border-pebble">
                <div className="flex h-9 w-9 items-center justify-center rounded-[6px] bg-breath text-onyx">
                  <Building className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-heading-h3 font-bold text-onyx">
                    Basic Information
                  </h2>
                  <p className="text-eyebrow text-ash">
                    Legal company name and industry categorization
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 mt-5">
                <div className="space-y-1.5">
                  <label className="text-eyebrow font-medium text-ash">
                    Company Name
                  </label>
                  <input
                    type="text"
                    disabled={!editing}
                    value={company.companyName}
                    onChange={(e) =>
                      handleChange("companyName", e.target.value)
                    }
                    className="w-full rounded-[10px] border border-pebble bg-stone px-3.5 py-2 text-body text-onyx outline-none transition disabled:bg-stone/50 disabled:text-ash focus:border-onyx"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-eyebrow font-medium text-ash">
                    Industry
                  </label>
                  <input
                    type="text"
                    disabled={!editing}
                    value={company.industry}
                    onChange={(e) => handleChange("industry", e.target.value)}
                    className="w-full rounded-[10px] border border-pebble bg-stone px-3.5 py-2 text-body text-onyx outline-none transition disabled:bg-stone/50 disabled:text-ash focus:border-onyx"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-eyebrow font-medium text-ash">
                    Company Size
                  </label>
                  <input
                    type="text"
                    disabled={!editing}
                    value={company.companySize}
                    onChange={(e) =>
                      handleChange("companySize", e.target.value)
                    }
                    className="w-full rounded-[10px] border border-pebble bg-stone px-3.5 py-2 text-body text-onyx outline-none transition disabled:bg-stone/50 disabled:text-ash focus:border-onyx"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-eyebrow font-medium text-ash">
                    Website URL
                  </label>
                  <input
                    type="text"
                    disabled={!editing}
                    value={company.website ?? ""}
                    placeholder="https://example.com"
                    onChange={(e) => handleChange("website", e.target.value)}
                    className="w-full rounded-[10px] border border-pebble bg-stone px-3.5 py-2 text-body text-onyx outline-none transition disabled:bg-stone/50 disabled:text-ash focus:border-onyx"
                  />
                </div>
              </div>
            </div>

            {/* 2. Location & Address Card */}
            <div className="rounded-[10px] bg-white p-6 border border-pebble">
              <div className="flex items-center gap-3 pb-4 border-b border-pebble">
                <div className="flex h-9 w-9 items-center justify-center rounded-[6px] bg-sunfleck text-onyx">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-heading-h3 font-bold text-onyx">
                    Headquarters Location
                  </h2>
                  <p className="text-eyebrow text-ash">
                    Physical business address and regional office details
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 mt-5">
                <div className="space-y-1.5">
                  <label className="text-eyebrow font-medium text-ash">
                    Country
                  </label>
                  <input
                    type="text"
                    disabled={!editing}
                    value={company.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                    className="w-full rounded-[10px] border border-pebble bg-stone px-3.5 py-2 text-body text-onyx outline-none transition disabled:bg-stone/50 disabled:text-ash focus:border-onyx"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-eyebrow font-medium text-ash">
                    State
                  </label>
                  <input
                    type="text"
                    disabled={!editing}
                    value={company.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    className="w-full rounded-[10px] border border-pebble bg-stone px-3.5 py-2 text-body text-onyx outline-none transition disabled:bg-stone/50 disabled:text-ash focus:border-onyx"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-eyebrow font-medium text-ash">
                    City
                  </label>
                  <input
                    type="text"
                    disabled={!editing}
                    value={company.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className="w-full rounded-[10px] border border-pebble bg-stone px-3.5 py-2 text-body text-onyx outline-none transition disabled:bg-stone/50 disabled:text-ash focus:border-onyx"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1.5">
                  <label className="text-eyebrow font-medium text-ash">
                    Full Address
                  </label>
                  <textarea
                    rows={3}
                    disabled={!editing}
                    value={company.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className="w-full rounded-[10px] border border-pebble bg-stone p-3 text-body text-onyx outline-none transition disabled:bg-stone/50 disabled:text-ash focus:border-onyx"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Summary Cards & Quick Info */}
          <div className="lg:col-span-4 space-y-5">
            {/* Quick Profile Summary Card */}
            <div className="rounded-[10px] bg-white p-6 border border-pebble">
              <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-breath text-onyx font-bold text-lg">
                {company.companyName.charAt(0)}
              </div>
              <h3 className="mt-3 text-heading-h3 font-bold text-onyx">
                {company.companyName}
              </h3>
              <p className="text-eyebrow text-ash mt-0.5">
                {company.industry}
              </p>

              <div className="mt-4 pt-4 border-t border-pebble space-y-3 text-body">
                <div className="flex items-center justify-between">
                  <span className="text-ash">Team Size:</span>
                  <span className="font-semibold text-onyx">
                    {company.companySize}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ash">Headquarters:</span>
                  <span className="font-semibold text-onyx">
                    {company.city}, {company.country}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ash">Verification:</span>
                  <span className="font-semibold text-success-text flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Verified Business
                  </span>
                </div>
              </div>
            </div>

            {/* Business ID Banner */}
            <div className="rounded-[10px] bg-breath p-5 border border-pebble">
              <h4 className="text-eyebrow font-semibold text-onyx uppercase tracking-wider">
                FIRMA Business ID
              </h4>
              <p className="text-xl font-bold text-onyx mt-1">
                ORG-2025-88421
              </p>
              <p className="text-eyebrow text-ash mt-2 leading-relaxed">
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