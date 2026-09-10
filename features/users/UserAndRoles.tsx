"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FirmaLayout from "@/components/layout/FirmaLayout";

import { db, type User } from "@/lib/db";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { User } from "lucide-react";

const userSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum([
        "SALES_MANAGER",
        "PROJECT_MANAGER",
        "FIELD_WORKER",
        "FINANCE_MANAGER",
    ]),
});

type UserFormData = z.infer<typeof userSchema>;

export default function UsersAndRoles() {
    const [users, setUsers] = useState<User[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
    });

    const loadUsers = async () => {
        const data = await db.users.toArray();

        const employees = data.filter(
            (user) =>
                user.role !== "OWNER" &&
                user.role !== "ACCOUNT_ADMIN"
        );

        setUsers(employees);
    };

    useEffect(() => {
        loadUsers();
    }, []);


    const handleDelete = async (id: number) => {
        const confirmDelete = confirm(
            "Are You sure you want to delete this user?"
        )

        if (!confirmDelete) return;
        await db.users.delete(id);

        alert("User Deleted Successfully");


    }
    const handleEdit = (user: User) => {
        setEditingUser(user);
        setShowForm(true);

        reset({
            name: user.name,
            email: user.email,
            password: "",
            role: user.role as UserFormData["role"],
        });
    };

    const onSubmit = async (data: UserFormData) => {
        // UPDATE
        if (editingUser?.id) {
            await db.users.update(editingUser.id, {
                name: data.name,
                email: data.email,
                role: data.role,
                ...(data.password
                    ? { password: data.password }
                    : {}),
            });

            alert("User updated successfully!");

            setEditingUser(null);
            setShowForm(false);
            reset();

            await loadUsers();

            return;
        }

        // CREATE
        const existingUser = await db.users
            .where("email")
            .equals(data.email)
            .first();

        if (existingUser) {
            alert("User with this email already exists");
            return;
        }

        await db.users.add({
            name: data.name,
            email: data.email,
            password: data.password,
            role: data.role,
            size: 0
        });

        alert("User created successfully!");

        reset();
        setShowForm(false);

        await loadUsers();
    };

    return (
         <FirmaLayout activeNav="Users & Roles">
             <div className="p-6">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold">
                        Users & Roles
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Manage employees and their roles
                    </p>
                </div>

                <Button onClick={() => setShowForm(true)}>
                    + Add User
                </Button>
            </div>

            {/* ADD USER FORM */}
            {showForm && (
                <div className="mb-6 rounded-lg border p-6">
                    <h2 className="text-lg font-semibold mb-4">
                        {editingUser ? "Edit User" : "Add New User"}
                    </h2>

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4 max-w-md"
                    >
                        {/* NAME */}
                        <div>
                            <Label>Name</Label>

                            <Input
                                {...register("name")}
                                placeholder="Enter user name"
                            />

                            {errors.name && (
                                <p className="text-sm text-red-500 mt-1">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        {/* EMAIL */}
                        <div>
                            <Label>Email</Label>

                            <Input
                                {...register("email")}
                                placeholder="Enter email"
                                type="email"
                            />

                            {errors.email && (
                                <p className="text-sm text-red-500 mt-1">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        {/* PASSWORD */}
                        <div>
                            <Label>Password</Label>

                            <Input
                                {...register("password")}
                                placeholder="Enter password"
                                type="password"
                            />

                            {errors.password && (
                                <p className="text-sm text-red-500 mt-1">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* ROLE */}
                        <div>
                            <Label>Role</Label>

                            <select
                                {...register("role")}
                                className="w-full border rounded-md px-3 py-2 mt-1"
                            >
                                <option value="">
                                    Select role
                                </option>

                                <option value="SALES_MANAGER">
                                    Sales Manager
                                </option>

                                <option value="PROJECT_MANAGER">
                                    Project Manager
                                </option>

                                <option value="FIELD_WORKER">
                                    Field Worker
                                </option>

                                <option value="FINANCE_MANAGER">
                                    Finance Manager
                                </option>
                            </select>

                            {errors.role && (
                                <p className="text-sm text-red-500 mt-1">
                                    Please select a role
                                </p>
                            )}
                        </div>

                        {/* BUTTONS */}
                        <div className="flex gap-3">
                            <Button type="submit">
                                Create User
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    reset();
                                    setShowForm(false);
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* USERS TABLE */}
            <div className="rounded-lg border">
                <table className="w-full">
                    <thead>
                        <tr className="border-b text-left">
                            <th className="p-4">Name</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-b">
                                <td className="p-4">{user.name}</td>

                                <td className="p-4">
                                    {user.email}
                                </td>

                                <td className="p-4">
                                    {user.role}
                                </td>

                                <td className="p-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEdit(user)}
                                    >
                                        Edit
                                    </Button>

                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="ml-2"
                                        onClick={() => user.id && handleDelete(user.id)}
                                    >
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}

                        {users.length === 0 && (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="p-8 text-center text-muted-foreground"
                                >
                                    No employees found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
         </FirmaLayout>
       
    );
}