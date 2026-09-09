"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { db, type PlanType } from "@/lib/db";
import { OnboardingHeader } from "@/components/onboarding/OnboardingHeader";
import { OnboardingStepper } from "@/components/onboarding/OnboardingStepper";
import {
  Check,
  CreditCard,
  Smartphone,
  Landmark,
  Lock,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

// Reusable input class
const inputCls = `w-full rounded-xl border border-slate-200 bg-[#F9FAFB] px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 shadow-xs outline-none transition focus:border-[#182E25] focus:ring-2 focus:ring-[#182E25]/10 focus:bg-white`;

export default function BillingPage() {
  const router = useRouter();
  const { currentUser } = useAuthStore();

  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "netbanking">("card");
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("STARTER");

  const [cardNumber, setCardNumber] = useState("1234 5678 9012 3456");
  const [expiryDate, setExpiryDate] = useState("08 / 29");
  const [cvv, setCvv] = useState("123");
  const [cardName, setCardName] = useState(currentUser?.name || "Rahul Sharma");
  const [upiId, setUpiId] = useState("rahul@okhdfcbank");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");

  // ── ALL ORIGINAL LOGIC PRESERVED ──────────────────────────────────────
  useEffect(() => {
    async function loadPlan() {
      if (currentUser?.id) {
        const record = await db.onboarding.get(currentUser.id);
        if (record?.plan) {
          setSelectedPlan(record.plan);
        }
      }
    }
    loadPlan();
  }, [currentUser?.id]);

  const planInfo = {
    STARTER: {
      name: "Starter Plan",
      price: "₹4,999",
      period: "/ year",
      payLabel: "Pay ₹4,999",
      features: [
        "Up to 50 team members",
        "Project management",
        "Basic reporting",
        "Email support",
      ],
    },
    PROFESSIONAL: {
      name: "Professional Plan",
      price: "₹9,999",
      period: "/ year",
      payLabel: "Pay ₹9,999",
      features: [
        "Up to 200 team members",
        "Advanced reporting",
        "Role based support",
        "Priority email & chat",
      ],
    },
    ENTERPRISE: {
      name: "Enterprise Plan",
      price: "Custom",
      period: "",
      payLabel: "Proceed with Enterprise",
      features: [
        "Unlimited team members",
        "Advanced security",
        "Dedicated support",
        "Custom features",
      ],
    },
  }[selectedPlan];

  const handlePayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!currentUser?.id) {
      alert("User not found. Please login again.");
      return;
    }

    setLoading(true);

    try {
      await db.onboarding.update(currentUser.id, {
        billingCompleted: true,
      });

      router.push("/onboarding/complete");
    } catch (error) {
      console.error(error);
      alert("Something went wrong with payment processing.");
    } finally {
      setLoading(false);
    }
  };
  // ───────────────────────────────────────────────────────────────────────

  const payMethodBtn = (method: "card" | "upi" | "netbanking", label: string, Icon: React.ElementType) => (
    <button
      type="button"
      onClick={() => setPaymentMethod(method)}
      className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 px-2 text-xs font-semibold transition cursor-pointer ${
        paymentMethod === method
          ? "border-[#182E25] bg-[#E5EDE7]/60 text-[#182E25] ring-1 ring-[#182E25]"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F5F6F5] flex flex-col font-sans antialiased">
      <OnboardingHeader />

      <main className="flex-1 pb-16 pt-4">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <OnboardingStepper currentStep={3} />

          {/* Heading */}
          <div className="my-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#E5EDE7] px-3.5 py-1.5 text-xs font-semibold text-[#182E25] mb-3">
              <CreditCard className="h-3.5 w-3.5" />
              Step 3 of 4
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Complete your payment
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Almost there! Complete your payment to activate your account.
            </p>
          </div>

          {/* 2-Column Billing Grid */}
          <div className="grid gap-5 md:grid-cols-12">

            {/* Left: Plan Summary */}
            <div className="md:col-span-5">
              <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-xs">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Plan Summary
                </h2>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-base font-bold text-slate-900">
                    {planInfo.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => router.push("/onboarding/plan")}
                    className="text-xs font-semibold text-[#182E25] hover:underline cursor-pointer"
                  >
                    Change Plan
                  </button>
                </div>

                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {planInfo.price}
                  </span>
                  {planInfo.period && (
                    <span className="text-xs font-medium text-slate-500">
                      {planInfo.period}
                    </span>
                  )}
                </div>

                <div className="my-4 border-t border-slate-100" />

                <div className="space-y-2.5">
                  {planInfo.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <Check className="h-3.5 w-3.5 text-[#2E7D32] shrink-0 mt-0.5 stroke-[2.5]" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Secure badge */}
                <div className="mt-5 rounded-xl bg-[#E5EDE7]/40 border border-[#C5D5CA]/50 p-3 flex items-center gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-[#182E25] shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Secure Checkout</p>
                    <p className="text-[11px] text-slate-500">256-bit SSL encryption</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Payment Form */}
            <div className="md:col-span-7">
              <div className="rounded-2xl border border-slate-200/60 bg-white p-6 sm:p-7 shadow-xs">
                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {payMethodBtn("card", "Card", CreditCard)}
                    {payMethodBtn("upi", "UPI", Smartphone)}
                    {payMethodBtn("netbanking", "Net Banking", Landmark)}
                  </div>
                </div>

                {/* Form Fields */}
                <form onSubmit={handlePayment} className="mt-5 space-y-4">
                  {paymentMethod === "card" && (
                    <>
                      {/* Card Number */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          Card Number
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="1234 5678 9012 3456"
                            className={inputCls}
                          />
                          <CreditCard className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        </div>
                      </div>

                      {/* Expiry & CVV */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                            placeholder="MM / YY"
                            className={inputCls}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">
                            CVV
                          </label>
                          <div className="relative">
                            <input
                              type="password"
                              maxLength={4}
                              value={cvv}
                              onChange={(e) => setCvv(e.target.value)}
                              placeholder="123"
                              className={inputCls}
                            />
                            <Lock className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                          </div>
                        </div>
                      </div>

                      {/* Name on Card */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          Name on Card
                        </label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="Rahul Sharma"
                          className={inputCls}
                        />
                      </div>
                    </>
                  )}

                  {paymentMethod === "upi" && (
                    <div className="space-y-3 py-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          Virtual Payment Address (UPI ID)
                        </label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="mobile@upi or user@okhdfcbank"
                          className={inputCls}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">
                        A payment request will be sent to your UPI app (Google Pay, PhonePe, Paytm).
                      </p>
                    </div>
                  )}

                  {paymentMethod === "netbanking" && (
                    <div className="space-y-3 py-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          Select Your Bank
                        </label>
                        <select
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className={inputCls}
                        >
                          <option value="HDFC Bank">HDFC Bank</option>
                          <option value="State Bank of India">State Bank of India (SBI)</option>
                          <option value="ICICI Bank">ICICI Bank</option>
                          <option value="Axis Bank">Axis Bank</option>
                          <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Pay Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#182E25] py-3 text-xs font-bold text-white shadow-xs transition hover:bg-[#12231B] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        <>
                          <span>{planInfo.payLabel}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Security Note */}
                  <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] font-medium text-[#2E7D32]">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#2E7D32]" />
                    <span>Secure &amp; Encrypted Payment</span>
                  </div>
                </form>
              </div>
            </div>

          </div>

          {/* Back Button */}
          <div className="mt-8 border-t border-slate-200/60 pt-6">
            <button
              type="button"
              onClick={() => router.push("/onboarding/company")}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}