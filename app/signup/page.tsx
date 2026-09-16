"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { db, generateCompanyId } from "@/lib/db";
import {
    Building2,
    Eye,
    EyeOff,
    ArrowRight,
    CheckCircle2,
    Users,
    FolderKanban,
    BarChart3,
} from "lucide-react";

const signupSchema = z
    .object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        size: z.number().min(1, "Company size must be at least 2"),
        email: z.string().email("Please enter a valid email"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type SignupFormData = z.infer<typeof signupSchema>;

const highlights = [
    { icon: FolderKanban, label: "Unlimited project tracking" },
    { icon: Users, label: "Team & role management" },
    { icon: BarChart3, label: "Real-time analytics" },
];

export default function SignupPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
    });

    // ── MULTI-TENANT SIGNUP LOGIC ──────────────────────────────────────────
    const onSubmit = async (data: SignupFormData) => {
        setIsLoading(true);
        try {
            const existingUser = await db.users
                .where("email")
                .equals(data.email)
                .first();

            if (existingUser) {
                alert("A user with this email already exists. Please log in.");
                setIsLoading(false);
                return;
            }

            // Each new signup creates an independent tenant (OWNER) with a unique companyId
            const companyId = generateCompanyId();

            const userId = await db.users.add({
                companyId,
                name: data.name,
                email: data.email,
                password: data.password,
                size: data.size,
                role: "OWNER",
            });

            // Pre-seed company profile for this organization
            await db.company.put({
                userId: Number(userId),
                companyId,
                companyName: `${data.name}'s Company`,
                industry: "Construction",
                companySize: `${data.size}`,
                country: "India",
                state: "",
                city: "",
                address: "",
            });

            router.push("/login");
        } catch (err) {
            console.error("Signup failed:", err);
            alert("Signup failed. Please try again.");
            setIsLoading(false);
        }
    };
    // ───────────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-stone font-sans antialiased flex">
            {/* ============================================================ */}
            {/* LEFT PANEL — Branding & Visual                               */}
            {/* ============================================================ */}
            <div className="hidden lg:flex lg:w-5/12 flex-col relative overflow-hidden bg-onyx">
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
                            Start managing
                            <br />
                            your business
                            <br />
                            <span className="font-semibold text-sunfleck">smarter.</span>
                        </h2>
                        <p className="mt-4 text-body text-stone/80 leading-relaxed max-w-xs">
                            Create your FIRMA account and unlock the complete construction management platform in minutes.
                        </p>

                        {/* Feature highlights */}
                        <div className="mt-10 space-y-4">
                            {highlights.map((h) => {
                                const Icon = h.icon;
                                return (
                                    <div key={h.label} className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-white/10">
                                            <Icon className="h-4 w-4 text-breath" />
                                        </div>
                                        <span className="text-xs font-medium text-stone/90">{h.label}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Social proof */}
                        <div className="mt-10 rounded-[10px] bg-white/10 backdrop-blur-sm border border-white/15 p-4">
                            <div className="flex items-center gap-1 mb-1">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className="text-sunfleck text-xs">★</span>
                                ))}
                            </div>
                            <p className="text-xs text-stone/80 leading-relaxed italic">
                                &ldquo;FIRMA transformed how we manage our construction projects. Absolutely essential.&rdquo;
                            </p>
                            <p className="mt-2 text-[11px] font-semibold text-breath">— Vikram Rathore, MD, Horizon Infra</p>
                        </div>
                    </div>

                    <p className="text-[11px] text-stone/40">&copy; 2025 FIRMA. All rights reserved.</p>
                </div>
            </div>

            {/* ============================================================ */}
            {/* RIGHT PANEL — Signup Form                                    */}
            {/* ============================================================ */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto">
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

                <div className="w-full max-w-lg">
                    {/* Heading */}
                    <div className="mb-7">
                        <h1 className="text-display-h1 font-normal text-onyx tracking-tight">
                            Create your account
                        </h1>
                        <p className="mt-1.5 text-body-sml text-ash">
                            Already have an account?{" "}
                            <button
                                type="button"
                                onClick={() => router.push("/login")}
                                className="font-semibold text-onyx hover:underline cursor-pointer"
                            >
                                Sign in
                            </button>
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="rounded-[20px] bg-white border border-pebble shadow-2xs p-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            {/* Name + Company Size Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Name */}
                                <div className="space-y-1.5">
                                    <label htmlFor="name" className="text-xs font-semibold text-onyx">
                                        Full Name <span className="text-hazard">*</span>
                                    </label>
                                    <input
                                        id="name"
                                        placeholder="Full Name"
                                        {...register("name")}
                                        className="w-full rounded-[10px] border border-pebble bg-white px-4 py-2.5 text-sm text-onyx placeholder-ash outline-none transition focus:border-onyx focus:ring-1 focus:ring-onyx"
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-hazard mt-1">{errors.name.message}</p>
                                    )}
                                </div>

                                {/* Company Size */}
                                <div className="space-y-1.5">
                                    <label htmlFor="size" className="text-xs font-semibold text-onyx">
                                        Company Size <span className="text-hazard">*</span>
                                    </label>
                                    <input
                                        id="size"
                                        type="number"
                                        min={1}
                                        placeholder="e.g. 25"
                                        {...register("size", { valueAsNumber: true })}
                                        className="w-full rounded-[10px] border border-pebble bg-white px-4 py-2.5 text-sm text-onyx placeholder-ash outline-none transition focus:border-onyx focus:ring-1 focus:ring-onyx"
                                    />
                                    {errors.size && (
                                        <p className="text-xs text-hazard mt-1">{errors.size.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <label htmlFor="email" className="text-xs font-semibold text-onyx">
                                    Email Address <span className="text-hazard">*</span>
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    {...register("email")}
                                    className="w-full rounded-[10px] border border-pebble bg-white px-4 py-2.5 text-sm text-onyx placeholder-ash outline-none transition focus:border-onyx focus:ring-1 focus:ring-onyx"
                                />
                                {errors.email && (
                                    <p className="text-xs text-hazard mt-1">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Password + Confirm Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Password */}
                                <div className="space-y-1.5">
                                    <label htmlFor="password" className="text-xs font-semibold text-onyx">
                                        Password <span className="text-hazard">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
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
                                        <p className="text-xs text-hazard mt-1">{errors.password.message}</p>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-1.5">
                                    <label htmlFor="confirmPassword" className="text-xs font-semibold text-onyx">
                                        Confirm Password <span className="text-hazard">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="confirmPassword"
                                            type={showConfirm ? "text" : "password"}
                                            placeholder="••••••••"
                                            {...register("confirmPassword")}
                                            className="w-full rounded-[10px] border border-pebble bg-white px-4 py-2.5 pr-11 text-sm text-onyx placeholder-ash outline-none transition focus:border-onyx focus:ring-1 focus:ring-onyx"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ash hover:text-onyx transition cursor-pointer"
                                        >
                                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="text-xs text-hazard mt-1">{errors.confirmPassword.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Password hints */}
                            <div className="rounded-[10px] bg-stone border border-pebble/60 p-3.5">
                                <p className="text-[11px] font-semibold text-onyx mb-2">Password requirements:</p>
                                <div className="flex flex-wrap gap-x-4 gap-y-1">
                                    {["Minimum 6 characters", "Mix of letters & numbers recommended"].map((hint) => (
                                        <span key={hint} className="flex items-center gap-1.5 text-[11px] text-ash">
                                            <CheckCircle2 className="h-3 w-3 text-complete-status shrink-0" />
                                            {hint}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 rounded-[10px] bg-onyx py-3 text-sm font-semibold text-white hover:bg-black active:scale-[0.99] transition shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Creating account...
                                    </span>
                                ) : (
                                    <>
                                        Create Account <ArrowRight className="h-4 w-4 text-breath" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Footer note */}
                    <p className="mt-6 text-center text-xs text-ash">
                        By creating an account, you agree to our{" "}
                        <span className="text-onyx font-medium cursor-pointer hover:underline">Terms of Service</span> &amp;{" "}
                        <span className="text-onyx font-medium cursor-pointer hover:underline">Privacy Policy</span>.
                    </p>
                </div>
            </div>
        </div>
    );
}