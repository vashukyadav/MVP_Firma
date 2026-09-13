"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { db } from "@/lib/db";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Building2, Eye, EyeOff, ArrowRight, Shield } from "lucide-react";

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const setUser = useAuthStore((state) => state.setUser);

    // ── ALL ORIGINAL LOGIC PRESERVED ───────────────────────────────────────
    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        const user = await db.users
            .where("email")
            .equals(data.email)
            .first();

        if (!user || user.password !== data.password) {
            alert("Invalid email or password");
            setIsLoading(false);
            return;
        }

        const { password, ...safeUser } = user;
        setUser(safeUser);

        if (user.role === "OWNER") {
            const onboarding = await db.onboarding.get(user.id!);

            if (!onboarding) {
                router.push("/onboarding/welcome");
                return;
            }

            if (!onboarding.billingCompleted) {
                router.push("/onboarding/billing");
                return;
            }

            router.push("/dashboard");
            return;
        }

        router.push("/dashboard");
    };
    // ───────────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-stone font-sans antialiased flex">
            {/* ============================================================ */}
            {/* LEFT PANEL — Branding & Visual                               */}
            {/* ============================================================ */}
            <div className="hidden lg:flex lg:w-1/2 flex-col relative overflow-hidden bg-onyx">
                {/* Background image */}
                <div className="absolute inset-0">
                    <Image
                        src="/images/landing_hero.jpg"
                        alt="FIRMA Platform"
                        fill
                        sizes="50vw"
                        className="object-cover opacity-20"
                        priority
                    />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full p-12">
                    {/* Logo */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
                        <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-white/15 backdrop-blur-sm border border-white/20">
                            <Building2 className="h-5 w-5 text-breath" />
                        </div>
                        <div>
                            <span className="text-lg font-black tracking-tight text-white block leading-tight">FIRMA</span>
                            <span className="text-[10px] font-medium text-breath block leading-none">Build Smarter. Together.</span>
                        </div>
                    </div>

                    {/* Hero Text */}
                    <div className="flex-1 flex flex-col justify-center">
                        <h2 className="text-display-h1 font-normal text-white leading-tight tracking-tight">
                            Welcome
                            <br />
                            <span className="font-semibold text-sunfleck">back.</span>
                        </h2>
                        <p className="mt-4 text-body text-stone/80 leading-relaxed max-w-sm">
                            Log in to your FIRMA dashboard and continue managing your projects, teams, and business — all in one place.
                        </p>

                        {/* Trust badges */}
                        <div className="mt-10 space-y-3">
                            {[
                                "5,000+ companies trust FIRMA",
                                "Bank-grade data security",
                                "Works across all devices",
                            ].map((item) => (
                                <div key={item} className="flex items-center gap-3">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                                        <Shield className="h-3.5 w-3.5 text-breath" />
                                    </div>
                                    <span className="text-xs font-medium text-stone/90">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom footer text */}
                    <p className="text-[11px] text-stone/40">&copy; 2025 FIRMA. All rights reserved.</p>
                </div>
            </div>

            {/* ============================================================ */}
            {/* RIGHT PANEL — Login Form                                     */}
            {/* ============================================================ */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                {/* Mobile logo */}
                <div
                    className="flex lg:hidden items-center gap-3 mb-8 cursor-pointer"
                    onClick={() => router.push("/")}
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-onyx text-white">
                        <Building2 className="h-5 w-5 text-breath" />
                    </div>
                    <span className="text-lg font-black tracking-tight text-onyx">FIRMA</span>
                </div>

                <div className="w-full max-w-md">
                    {/* Heading */}
                    <div className="mb-8">
                        <h1 className="text-display-h1 font-normal text-onyx tracking-tight">
                            Sign in to your account
                        </h1>
                        <p className="mt-1.5 text-body-sml text-ash">
                            Don&apos;t have an account?{" "}
                            <button
                                type="button"
                                onClick={() => router.push("/signup")}
                                className="font-semibold text-onyx hover:underline cursor-pointer"
                            >
                                Create one free
                            </button>
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="rounded-[20px] bg-white border border-pebble shadow-2xs p-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            {/* Email */}
                            <div className="space-y-1.5">
                                <label htmlFor="email" className="text-xs font-semibold text-onyx">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    {...register("email")}
                                    className="w-full rounded-[10px] border border-pebble bg-white px-4 py-2.5 text-sm text-onyx placeholder-ash outline-none transition focus:border-onyx focus:ring-1 focus:ring-onyx"
                                />
                                {errors.email && (
                                    <p className="text-xs text-hazard flex items-center gap-1 mt-1">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <label htmlFor="password" className="text-xs font-semibold text-onyx">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        {...register("password")}
                                        className="w-full rounded-[10px] border border-pebble bg-white px-4 py-2.5 pr-11 text-sm text-onyx placeholder-ash outline-none transition focus:border-onyx focus:ring-1 focus:ring-onyx"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ash hover:text-onyx transition cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-xs text-hazard flex items-center gap-1 mt-1">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 rounded-[10px] bg-onyx py-3 text-sm font-semibold text-white hover:bg-black active:scale-[0.99] transition shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Signing in...
                                    </span>
                                ) : (
                                    <>
                                        Sign In <ArrowRight className="h-4 w-4 text-breath" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Footer note */}
                    <p className="mt-6 text-center text-xs text-ash">
                        By signing in, you agree to our{" "}
                        <span className="text-onyx font-medium cursor-pointer hover:underline">Terms</span> &amp;{" "}
                        <span className="text-onyx font-medium cursor-pointer hover:underline">Privacy Policy</span>.
                    </p>
                </div>
            </div>
        </div>
    );
}