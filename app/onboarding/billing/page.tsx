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

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <OnboardingHeader />

      {/* Main Content */}
      <main className="flex-1 pb-16 pt-4">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          {/* Stepper (Step 3: Billing) */}
          <OnboardingStepper currentStep={3} />

          {/* Heading */}
          <div className="my-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Complete your payment
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Almost there! Complete your payment to activate your account.
            </p>
          </div>

          {/* 2-Column Billing Grid */}
          <div className="grid gap-6 md:grid-cols-12">
            
            {/* Left Column: Plan Summary (col-span-5) */}
            <div className="md:col-span-5">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
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
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
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

                <div className="my-5 border-t border-slate-100" />

                <div className="space-y-3">
                  {planInfo.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Payment Form (col-span-7) */}
            <div className="md:col-span-7">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs">
                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Payment Method
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`flex items-center justify-center gap-1.5 rounded-lg border py-2.5 px-2 text-xs font-semibold transition cursor-pointer ${
                        paymentMethod === "card"
                          ? "border-blue-600 bg-blue-50/60 text-blue-700 ring-1 ring-blue-600"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      <span>Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("upi")}
                      className={`flex items-center justify-center gap-1.5 rounded-lg border py-2.5 px-2 text-xs font-semibold transition cursor-pointer ${
                        paymentMethod === "upi"
                          ? "border-blue-600 bg-blue-50/60 text-blue-700 ring-1 ring-blue-600"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <Smartphone className="h-3.5 w-3.5" />
                      <span>UPI</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("netbanking")}
                      className={`flex items-center justify-center gap-1.5 rounded-lg border py-2.5 px-2 text-xs font-semibold transition cursor-pointer ${
                        paymentMethod === "netbanking"
                          ? "border-blue-600 bg-blue-50/60 text-blue-700 ring-1 ring-blue-600"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <Landmark className="h-3.5 w-3.5" />
                      <span>Net Banking</span>
                    </button>
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
                            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 pr-10 text-xs text-slate-800 placeholder-slate-400 shadow-2xs outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
                            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 shadow-2xs outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
                              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 pr-9 text-xs text-slate-800 placeholder-slate-400 shadow-2xs outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
                          className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 shadow-2xs outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
                          className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 shadow-2xs outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
                          className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 shadow-2xs outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                    >
                      <span>
                        {loading ? "Processing..." : `${planInfo.payLabel} →`}
                      </span>
                    </button>
                  </div>

                  {/* Security Note */}
                  <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] font-medium text-emerald-700">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Secure &amp; Encrypted Payment</span>
                  </div>
                </form>
              </div>
            </div>

          </div>

          {/* Bottom Back Button */}
          <div className="mt-8 border-t border-slate-200/60 pt-6">
            <button
              type="button"
              onClick={() => router.push("/onboarding/company")}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
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