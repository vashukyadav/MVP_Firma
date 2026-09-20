"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { db, type PlanType } from "@/lib/db";
import { toast } from "@/components/ui/toast";
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
const inputCls = `w-full rounded-[10px] border border-pebble bg-stone px-3.5 py-2.5 text-body text-onyx placeholder:text-ash outline-none transition focus:border-onyx`;

export default function BillingPage() {
  const router = useRouter();
  const { currentUser } = useAuthStore();

  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "netbanking">("card");
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("STARTER");

  const [cardNumber, setCardNumber] = useState("1234 5678 9012 3456");
  const [expiryDate, setExpiryDate] = useState("08 / 29");
  const [cvv, setCvv] = useState("123");
  const [cardName, setCardName] = useState(currentUser?.name || "");
  const [upiId, setUpiId] = useState("");
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
      toast.error("User not found. Please login again.");
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
      toast.error("Something went wrong with payment processing.");
    } finally {
      setLoading(false);
    }
  };
  // ───────────────────────────────────────────────────────────────────────

  const payMethodBtn = (method: "card" | "upi" | "netbanking", label: string, Icon: React.ElementType) => (
    <button
      type="button"
      onClick={() => setPaymentMethod(method)}
      className={`flex items-center justify-center gap-1.5 rounded-[10px] border py-2.5 px-2 text-body font-semibold transition cursor-pointer ${
        paymentMethod === method
          ? "border-onyx bg-breath text-onyx ring-1 ring-onyx"
          : "border-pebble bg-stone text-ash hover:bg-mist hover:text-onyx"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-stone flex flex-col font-sans antialiased">
      <OnboardingHeader />

      <main className="flex-1 pb-16 pt-4">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <OnboardingStepper currentStep={3} />

          {/* Heading */}
          <div className="my-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-breath px-3.5 py-1.5 text-eyebrow font-semibold text-onyx border border-pebble mb-3">
              <CreditCard className="h-3.5 w-3.5" />
              Step 3 of 4
            </div>
            <h1 className="text-display-h1 font-bold tracking-tight text-onyx">
              Complete your payment
            </h1>
            <p className="mt-1.5 text-body text-ash">
              Almost there! Complete your payment to activate your account.
            </p>
          </div>

          {/* 2-Column Billing Grid */}
          <div className="grid gap-5 md:grid-cols-12">

            {/* Left: Plan Summary */}
            <div className="md:col-span-5">
              <div className="rounded-[20px] border border-pebble bg-white p-6 shadow-none">
                <h2 className="text-eyebrow font-semibold uppercase tracking-wider text-ash">
                  Plan Summary
                </h2>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-heading-h3 font-bold text-onyx">
                    {planInfo.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => router.push("/onboarding/plan")}
                    className="text-eyebrow font-semibold text-onyx hover:underline cursor-pointer"
                  >
                    Change Plan
                  </button>
                </div>

                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-onyx">
                    {planInfo.price}
                  </span>
                  {planInfo.period && (
                    <span className="text-eyebrow font-medium text-ash">
                      {planInfo.period}
                    </span>
                  )}
                </div>

                <div className="my-4 border-t border-pebble" />

                <div className="space-y-2.5">
                  {planInfo.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2.5 text-body text-onyx">
                      <Check className="h-3.5 w-3.5 text-complete-status shrink-0 mt-0.5 stroke-[2.5]" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Secure badge */}
                <div className="mt-5 rounded-[10px] bg-breath border border-pebble p-3 flex items-center gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-onyx shrink-0" />
                  <div>
                    <p className="text-body font-bold text-onyx">Secure Checkout</p>
                    <p className="text-eyebrow text-ash">256-bit SSL encryption</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Payment Form */}
            <div className="md:col-span-7">
              <div className="rounded-[20px] border border-pebble bg-white p-6 sm:p-7 shadow-none">
                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <label className="text-eyebrow font-medium text-ash">
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
                        <label className="text-eyebrow font-medium text-ash">
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
                          <CreditCard className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ash" />
                        </div>
                      </div>

                      {/* Expiry & CVV */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-eyebrow font-medium text-ash">
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
                          <label className="text-eyebrow font-medium text-ash">
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
                            <Lock className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ash" />
                          </div>
                        </div>
                      </div>

                      {/* Name on Card */}
                      <div className="space-y-1.5">
                        <label className="text-eyebrow font-medium text-ash">
                          Name on Card
                        </label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="Name on card"
                          className={inputCls}
                        />
                      </div>
                    </>
                  )}

                  {paymentMethod === "upi" && (
                    <div className="space-y-3 py-2">
                      <div className="space-y-1.5">
                        <label className="text-eyebrow font-medium text-ash">
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
                      <p className="text-eyebrow text-ash">
                        A payment request will be sent to your UPI app (Google Pay, PhonePe, Paytm).
                      </p>
                    </div>
                  )}

                  {paymentMethod === "netbanking" && (
                    <div className="space-y-3 py-2">
                      <div className="space-y-1.5">
                        <label className="text-eyebrow font-medium text-ash">
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
                      className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-onyx py-3 text-body font-bold text-white transition hover:bg-onyx/90 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
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
                  <div className="flex items-center justify-center gap-1.5 pt-1 text-eyebrow font-medium text-success-text">
                    <ShieldCheck className="h-3.5 w-3.5 text-complete-status" />
                    <span>Secure &amp; Encrypted Payment</span>
                  </div>
                </form>
              </div>
            </div>

          </div>

          {/* Back Button */}
          <div className="mt-8 border-t border-pebble pt-6">
            <button
              type="button"
              onClick={() => router.push("/onboarding/company")}
              className="flex items-center gap-2 rounded-[10px] border border-pebble bg-stone px-4 py-2 text-body font-semibold text-onyx hover:bg-mist transition cursor-pointer"
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