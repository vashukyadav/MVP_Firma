"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { db } from "@/lib/db";
import { useAuthStore } from "@/store/authStore";
import { OnboardingHeader } from "@/components/onboarding/OnboardingHeader";
import { OnboardingStepper } from "@/components/onboarding/OnboardingStepper";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";

const companySchema = z.object({
  companyName: z
    .string()
    .min(2, "Company name is required"),

  industry: z
    .string()
    .min(2, "Industry is required"),

  companySize: z
    .string()
    .min(1, "Please select company size"),

  website: z
    .string()
    .optional(),

  country: z
    .string()
    .min(2, "Country is required"),

  state: z
    .string()
    .min(2, "State is required"),

  city: z
    .string()
    .min(2, "City is required"),

  address: z
    .string()
    .min(5, "Address is required"),
});

type CompanyFormData = z.infer<typeof companySchema>;

export default function CompanyPage() {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.currentUser);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      country: "India",
      state: "Uttar Pradesh",
      city: "Noida",
      companySize: "10-50",
    },
  });

  const onSubmit = async (data: CompanyFormData) => {
    if (!currentUser?.id) {
      alert("User not found. Please login again.");
      return;
    }

    await db.company.put({
      userId: currentUser.id,
      ...data,
    });

    await db.onboarding.update(currentUser.id, {
      companyCompleted: true,
    });

    router.push("/onboarding/billing");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <OnboardingHeader />

      {/* Main Container */}
      <main className="flex-1 pb-16 pt-4">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {/* Stepper (Step 2: Company) */}
          <OnboardingStepper currentStep={2} />

          {/* Heading */}
          <div className="my-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Tell us about your company
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              This helps us personalize your experience.
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Row 1: Company Name & Website */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="ABC Solutions Pvt. Ltd."
                    {...register("companyName")}
                    className={`w-full rounded-lg border bg-white px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 shadow-2xs outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 ${
                      errors.companyName ? "border-red-400" : "border-slate-200"
                    }`}
                  />
                  {errors.companyName && (
                    <p className="text-[11px] text-red-500 font-medium">
                      {errors.companyName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Company Website
                  </label>
                  <input
                    type="text"
                    placeholder="https://www.abcsolutions.com"
                    {...register("website")}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 shadow-2xs outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Row 2: Industry & Company Size */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    Industry <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      {...register("industry")}
                      defaultValue="Construction"
                      className={`w-full appearance-none rounded-lg border bg-white px-3.5 py-2 text-xs text-slate-800 shadow-2xs outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 ${
                        errors.industry ? "border-red-400" : "border-slate-200"
                      }`}
                    >
                      <option value="">Select industry</option>
                      <option value="Construction">Construction</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Retail & Wholesale">Retail & Wholesale</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Professional Consulting">Professional Consulting</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  </div>
                  {errors.industry && (
                    <p className="text-[11px] text-red-500 font-medium">
                      {errors.industry.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    Company Size <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      {...register("companySize")}
                      className={`w-full appearance-none rounded-lg border bg-white px-3.5 py-2 text-xs text-slate-800 shadow-2xs outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 ${
                        errors.companySize ? "border-red-400" : "border-slate-200"
                      }`}
                    >
                      <option value="">Select company size</option>
                      <option value="1-10">1 – 10 employees</option>
                      <option value="10-50">10 – 50 employees</option>
                      <option value="51-200">51 – 200 employees</option>
                      <option value="201-500">201 – 500 employees</option>
                      <option value="500+">500+ employees</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  </div>
                  {errors.companySize && (
                    <p className="text-[11px] text-red-500 font-medium">
                      {errors.companySize.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 3: Country, State, City */}
              <div className="grid gap-5 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      {...register("country")}
                      className={`w-full appearance-none rounded-lg border bg-white px-3.5 py-2 text-xs text-slate-800 shadow-2xs outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 ${
                        errors.country ? "border-red-400" : "border-slate-200"
                      }`}
                    >
                      <option value="India">India</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="United Arab Emirates">United Arab Emirates</option>
                      <option value="Singapore">Singapore</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  </div>
                  {errors.country && (
                    <p className="text-[11px] text-red-500 font-medium">
                      {errors.country.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      {...register("state")}
                      className={`w-full appearance-none rounded-lg border bg-white px-3.5 py-2 text-xs text-slate-800 shadow-2xs outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 ${
                        errors.state ? "border-red-400" : "border-slate-200"
                      }`}
                    >
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  </div>
                  {errors.state && (
                    <p className="text-[11px] text-red-500 font-medium">
                      {errors.state.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Noida"
                    {...register("city")}
                    className={`w-full rounded-lg border bg-white px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 shadow-2xs outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 ${
                      errors.city ? "border-red-400" : "border-slate-200"
                    }`}
                  />
                  {errors.city && (
                    <p className="text-[11px] text-red-500 font-medium">
                      {errors.city.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 4: Company Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  Company Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="B-128, Sector 62, Noida, Uttar Pradesh 201309"
                  {...register("address")}
                  className={`w-full rounded-lg border bg-white px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 shadow-2xs outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 ${
                    errors.address ? "border-red-400" : "border-slate-200"
                  }`}
                />
                {errors.address && (
                  <p className="text-[11px] text-red-500 font-medium">
                    {errors.address.message}
                  </p>
                )}
              </div>

              {/* Bottom Buttons */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                <button
                  type="button"
                  onClick={() => router.push("/onboarding/plan")}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 active:scale-[0.99] transition cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
}