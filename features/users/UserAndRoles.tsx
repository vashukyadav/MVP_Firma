"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FirmaLayout from "@/components/layout/FirmaLayout";

import { db, type User as DbUser } from "@/lib/db";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User as UserIcon,
  Mail,
  Lock,
  Briefcase,
  ChevronDown,
  Eye,
  EyeOff,
  ShieldCheck,
  X,
  UserPlus,
  Plus,
  Users,
  Edit2,
  Trash2,
} from "lucide-react";

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().optional(),
  role: z.enum([
    "SALES_MANAGER",
    "PROJECT_MANAGER",
    "FIELD_WORKER",
    "FINANCE_MANAGER",
  ]),
});

type UserFormData = z.infer<typeof userSchema>;

export default function UsersAndRoles() {
  const [users, setUsers] = useState<DbUser[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<DbUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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
      (user) => user.role !== "OWNER" && user.role !== "ACCOUNT_ADMIN"
    );

    setUsers(employees);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (id: number) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this team member?"
    );

    if (!confirmDelete) return;
    await db.users.delete(id);
    await loadUsers();
  };

  const handleEdit = (user: DbUser) => {
    setEditingUser(user);
    setShowForm(true);

    reset({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role as UserFormData["role"],
    });
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    reset({
      name: "",
      email: "",
      password: "",
      role: "" as unknown as UserFormData["role"],
    });
    setShowForm(true);
  };

  const onSubmit = async (data: UserFormData) => {
    // UPDATE
    if (editingUser?.id) {
      await db.users.update(editingUser.id, {
        name: data.name,
        email: data.email,
        role: data.role,
        ...(data.password ? { password: data.password } : {}),
      });

      alert("User updated successfully!");

      setEditingUser(null);
      setShowForm(false);
      reset();

      await loadUsers();
      return;
    }

    // CREATE
    if (!data.password || data.password.length < 6) {
      alert("Password must be at least 6 characters for a new user.");
      return;
    }

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
      size: 0,
    });

    alert("User created successfully!");

    reset();
    setShowForm(false);

    await loadUsers();
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SALES_MANAGER":
        return {
          label: "Sales Manager",
          color: "bg-clear-bg text-success-text border-pebble/60",
        };
      case "PROJECT_MANAGER":
        return {
          label: "Project Manager",
          color: "bg-breath text-onyx border-pebble/60",
        };
      case "FIELD_WORKER":
        return {
          label: "Field Worker",
          color: "bg-stone text-onyx border-pebble/60",
        };
      case "FINANCE_MANAGER":
        return {
          label: "Finance Manager",
          color: "bg-caution-bg text-caution-text border-pebble/60",
        };
      default:
        return {
          label: role,
          color: "bg-stone text-ash border-pebble/60",
        };
    }
  };

  return (
    <FirmaLayout activeNav="Users & Roles">
      <div className="p-2 sm:p-4 space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-eyebrow font-semibold tracking-wider text-ash uppercase">
              ORGANIZATION
            </span>
            <h1 className="text-display-h1 font-bold text-onyx mt-0.5 tracking-tight">
              Users &amp; Roles
            </h1>
            <p className="text-sm text-ash mt-1">
              Manage employees, assign operational roles, and configure system permissions.
            </p>
          </div>

          <Button
            onClick={handleOpenAdd}
            className="bg-forest hover:bg-forest-hover text-white rounded-[10px] font-medium px-4 py-2.5 text-sm flex items-center gap-2 shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Add User</span>
          </Button>
        </div>

        {/* ADD / EDIT USER FORM */}
        {showForm && (
          <div className="rounded-[16px] bg-white border border-pebble p-6 sm:p-7 shadow-xs animate-in fade-in slide-in-from-top-3 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-pebble/50">
              <div>
                <h2 className="text-lg font-bold text-onyx flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-forest" />
                  <span>{editingUser ? "Edit User Details" : "Add New User"}</span>
                </h2>
                <p className="text-sm text-ash mt-0.5">
                  {editingUser
                    ? "Update employee information and access privileges."
                    : "Fill in the required information to invite a new team member."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  reset();
                  setEditingUser(null);
                  setShowForm(false);
                }}
                className="p-1.5 rounded-[8px] text-ash hover:text-onyx hover:bg-stone transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* NAME */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-onyx">
                    Full Name <span className="text-hazard">*</span>
                  </Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ash pointer-events-none" />
                    <Input
                      {...register("name")}
                      placeholder="e.g. Employee Full Name"
                      className="pl-10"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs font-medium text-hazard mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* EMAIL */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-onyx">
                    Work Email <span className="text-hazard">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ash pointer-events-none" />
                    <Input
                      {...register("email")}
                      placeholder="e.g. employee@company.com"
                      type="email"
                      className="pl-10"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs font-medium text-hazard mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* PASSWORD */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-onyx">
                    {editingUser ? "Password (leave blank to keep current)" : "Password"}{" "}
                    <span className="text-hazard">{editingUser ? "" : "*"}</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ash pointer-events-none" />
                    <Input
                      {...register("password")}
                      placeholder={editingUser ? "••••••••" : "At least 6 characters"}
                      type={showPassword ? "text" : "password"}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ash hover:text-onyx cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs font-medium text-hazard mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* ROLE */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-onyx">
                    Role &amp; Responsibilities <span className="text-hazard">*</span>
                  </Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ash pointer-events-none" />
                    <select
                      {...register("role")}
                      className="h-10 w-full rounded-[10px] border border-pebble bg-white pl-10 pr-9 text-sm text-onyx shadow-2xs outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20 cursor-pointer appearance-none"
                    >
                      <option value="">Select organizational role</option>
                      <option value="SALES_MANAGER">Sales Manager</option>
                      <option value="PROJECT_MANAGER">Project Manager</option>
                      <option value="FIELD_WORKER">Field Worker</option>
                      <option value="FINANCE_MANAGER">Finance Manager</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ash pointer-events-none" />
                  </div>
                  {errors.role && (
                    <p className="text-xs font-medium text-hazard mt-1">
                      Please select a valid role
                    </p>
                  )}
                </div>
              </div>

              {/* Helper notice */}
              <div className="flex items-center gap-2.5 rounded-[10px] border border-clear-bg bg-clear-bg/60 p-3 text-xs text-success-text">
                <ShieldCheck className="h-4 w-4 shrink-0 text-success" />
                <span>
                  Employees will only have access to sections designated by their selected role.
                </span>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-pebble/40">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset();
                    setEditingUser(null);
                    setShowForm(false);
                  }}
                  className="px-4"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-forest hover:bg-forest-hover text-white px-5 shadow-xs"
                >
                  {editingUser ? "Save Changes" : "Create User"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* USERS TABLE */}
        <div className="rounded-[10px] border border-pebble bg-white overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-pebble/60 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-onyx">Team Members Directory</h3>
              <p className="text-xs text-ash mt-0.5">
                {users.length} active employee{users.length === 1 ? "" : "s"} listed
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-pebble bg-stone text-left text-xs font-semibold text-ash uppercase tracking-wider">
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-pebble/70 text-sm text-onyx">
                {users.map((user) => {
                  const badge = getRoleBadge(user.role);
                  const initial = (user.name?.charAt(0) || "U").toUpperCase();

                  return (
                    <tr key={user.id} className="hover:bg-stone/60 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-breath font-bold text-xs text-onyx shrink-0">
                            {initial}
                          </div>
                          <span className="font-semibold text-onyx">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-ash font-medium">{user.email}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(user)}
                            className="gap-1 text-xs"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-ash" />
                            <span>Edit</span>
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => user.id && handleDelete(user.id)}
                            className="gap-1 text-xs"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-ash">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone text-ash">
                          <Users className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-onyx">No team members added yet</p>
                        <p className="text-xs text-ash">
                          Click &quot;+ Add User&quot; above to invite your first employee.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </FirmaLayout>
  );
}