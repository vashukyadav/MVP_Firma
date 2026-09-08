"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });
    const setUser = useAuthStore((state) => state.setUser);
    const onSubmit = async (data: LoginFormData) => {
        const user = await db.users
            .where("email")
            .equals(data.email)
            .first();

        if (!user || user.password !== data.password) {
            alert("Invalid email or password");
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
    return (
        <div className="flex min-h-screen items-center justify-center">
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>
                        Login to your Mini FIRMA account
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>

                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                {...register("email")}
                            />

                            {errors.email && (
                                <p className="text-sm text-red-500">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>

                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                {...register("password")}
                            />

                            {errors.password && (
                                <p className="text-sm text-red-500">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <Button type="submit" className="w-full">
                            Login
                        </Button>

                    </form>
                </CardContent>
            </Card>
        </div>
    );
}