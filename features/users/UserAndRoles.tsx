"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FirmaLayout from "@/components/layout/FirmaLayout";
import { useAuthStore } from "@/store/authStore";

import { db, type User as DbUser, type CrewRole, type UserRole } from "@/lib/db";
import {
  MODULE_DEFINITIONS,
  ROLE_DEFAULT_TEMPLATES,
  ACTION_LABELS,
  recordPermissionAuditLog,
  canDemoteOrRemoveAccountAdmin,
  type ModuleKey,
  type PermissionAction,
  type OverrideState,
  type UserModuleOverrides,
} from "@/lib/permissions";
import AuditLogView from "./AuditLogView";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import {
  User as UserIcon,
  Mail,
  Lock,
  Briefcase,
  ChevronDown,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  X,
  UserPlus,
  Plus,
  Users,
  Edit2,
  Trash2,
  Sliders,
  RotateCcw,
  CheckCircle2,
  Shield,
  FileText,
  Search,
} from "lucide-react";

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().optional(),
  role: z.enum([
    "SALES_MANAGER",
    "PROJECT_MANAGER",
    "SITE_MANAGER",
    "FIELD_WORKER",
    "FINANCE_MANAGER",
    "ACCOUNT_ADMIN",
  ]),
});

type UserFormData = z.infer<typeof userSchema>;

export default function UsersAndRoles() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const [activeTab, setActiveTab] = useState<"team" | "audit">("team");
  const [users, setUsers] = useState<DbUser[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<DbUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Permission Matrix state
  const [isAccountAdmin, setIsAccountAdmin] = useState(false);
  const [userOverrides, setUserOverrides] = useState<UserModuleOverrides>({} as UserModuleOverrides);
  const [originalOverrides, setOriginalOverrides] = useState<UserModuleOverrides>({} as UserModuleOverrides);
  const [matrixCategoryFilter, setMatrixCategoryFilter] = useState<string>("ALL");
  const [matrixSearch, setMatrixSearch] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: "SALES_MANAGER",
    },
  });

  const selectedRole = watch("role") as UserRole;

  const loadUsers = async () => {
    const companyId = currentUser?.companyId || "ORG-DEFAULT";
    const data = await db.users.where("companyId").equals(companyId).toArray();
    setUsers(data);
  };

  useEffect(() => {
    loadUsers();
  }, [currentUser?.companyId]);

  const loadUserOverrides = async (userId: number) => {
    const companyId = currentUser?.companyId || "ORG-DEFAULT";
    try {
      const records = await db.user_permissions
        .where({ companyId, userId })
        .toArray();

      const mapped: UserModuleOverrides = {} as UserModuleOverrides;
      records.forEach((r) => {
        mapped[r.module] = { ...r.overrides };
      });
      setUserOverrides(mapped);
      setOriginalOverrides(JSON.parse(JSON.stringify(mapped)));
    } catch (e) {
      console.error("Failed to load user permissions:", e);
      setUserOverrides({} as UserModuleOverrides);
      setOriginalOverrides({} as UserModuleOverrides);
    }
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setIsAccountAdmin(false);
    setUserOverrides({} as UserModuleOverrides);
    setOriginalOverrides({} as UserModuleOverrides);
    reset({
      name: "",
      email: "",
      password: "",
      role: "SALES_MANAGER",
    });
    setShowForm(true);
  };

  const handleEdit = async (user: DbUser) => {
    setEditingUser(user);
    const adminStatus = user.role === "ACCOUNT_ADMIN" || user.isAccountAdmin === true;
    setIsAccountAdmin(adminStatus);

    reset({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role as UserFormData["role"],
    });

    if (user.id) {
      await loadUserOverrides(user.id);
    } else {
      setUserOverrides({} as UserModuleOverrides);
      setOriginalOverrides({} as UserModuleOverrides);
    }

    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    const companyId = currentUser?.companyId || "ORG-DEFAULT";
    const userToDelete = users.find((u) => u.id === id);
    if (!userToDelete) return;

    if (userToDelete.role === "OWNER") {
      toast.error("The Primary Business Owner account cannot be deleted.");
      return;
    }

    // SAFEGUARD: Check if deleting last Account Administrator
    const isTargetAdmin =
      userToDelete.role === "ACCOUNT_ADMIN" || userToDelete.isAccountAdmin === true;

    if (isTargetAdmin) {
      const safeguard = await canDemoteOrRemoveAccountAdmin(id, companyId);
      if (!safeguard.allowed) {
        toast.error(safeguard.reason || "Cannot delete the last Account Administrator.");
        return;
      }
    }

    const confirmDelete = confirm(
      `Are you sure you want to delete ${userToDelete.name}? This will remove all their system access and custom overrides.`
    );
    if (!confirmDelete) return;

    // Delete overrides
    await db.user_permissions.where("userId").equals(id).delete();

    // Delete user
    await db.users.delete(id);

    // Also remove from db.crew if matching email
    if (userToDelete?.email) {
      try {
        const crewRec = await db.crew
          .where("email")
          .equals(userToDelete.email.toLowerCase())
          .first();
        if (crewRec?.id) {
          await db.crew.delete(crewRec.id);
        }
      } catch (e) {}
    }

    // Audit log
    if (currentUser) {
      await recordPermissionAuditLog({
        companyId,
        performer: currentUser,
        targetUser: userToDelete,
        module: "userManagement",
        permission: "delete_user",
        oldValue: "Active",
        newValue: "Deleted",
      });
    }

    window.dispatchEvent(new Event("permissions-updated"));
    await loadUsers();
    toast.success("Team member deleted successfully!");
  };

  const handleCellOverrideChange = (
    moduleKey: ModuleKey,
    action: PermissionAction,
    value: OverrideState
  ) => {
    setUserOverrides((prev) => {
      const updated = { ...prev };
      if (!updated[moduleKey]) {
        updated[moduleKey] = {};
      }
      updated[moduleKey] = {
        ...updated[moduleKey],
        [action]: value,
      };
      return updated;
    });
  };

  const handleResetAllOverrides = () => {
    setUserOverrides({} as UserModuleOverrides);
    toast.info("All permissions have been reset to role defaults.");
  };

  const onSubmit = async (data: UserFormData) => {
    const companyId = currentUser?.companyId || "ORG-DEFAULT";
    const cleanEmail = data.email.trim().toLowerCase();

    // SAFEGUARD: If modifying an existing Account Administrator and demoting them
    if (editingUser?.id) {
      const wasAdmin =
        editingUser.role === "ACCOUNT_ADMIN" || editingUser.isAccountAdmin === true;
      const willBeAdmin = data.role === "ACCOUNT_ADMIN" || isAccountAdmin;

      if (wasAdmin && !willBeAdmin) {
        const safeguard = await canDemoteOrRemoveAccountAdmin(editingUser.id, companyId);
        if (!safeguard.allowed) {
          toast.error(safeguard.reason || "Cannot demote the last Account Administrator.");
          return;
        }
      }

      // Update User in DB
      await db.users.update(editingUser.id, {
        name: data.name,
        email: cleanEmail,
        role: data.role,
        isAccountAdmin: data.role === "ACCOUNT_ADMIN" || isAccountAdmin,
        ...(data.password ? { password: data.password } : {}),
      });

      const targetId = editingUser.id;

      // Update in db.crew if exists
      try {
        const crewRec = await db.crew
          .where("email")
          .equals(editingUser.email.toLowerCase())
          .first();
        if (crewRec?.id) {
          const roleLabel: CrewRole =
            data.role === "SITE_MANAGER" ? "Site Manager" : "Field Worker";
          await db.crew.update(crewRec.id, {
            name: data.name,
            email: cleanEmail,
            role: roleLabel,
          });
        }
      } catch (e) {}

      // Save permission overrides to db.user_permissions
      await db.user_permissions.where("userId").equals(targetId).delete();

      if (!isAccountAdmin && data.role !== "ACCOUNT_ADMIN") {
        for (const modDef of MODULE_DEFINITIONS) {
          const modKey = modDef.key;
          const modOverrides = userOverrides[modKey];
          if (modOverrides) {
            const cleanActions: Record<string, OverrideState> = {};
            let hasAny = false;

            for (const action of modDef.supportedActions) {
              const state = modOverrides[action];
              if (state && state !== "INHERIT") {
                cleanActions[action] = state;
                hasAny = true;
              }
            }

            if (hasAny) {
              await db.user_permissions.add({
                companyId,
                userId: targetId,
                module: modKey,
                overrides: cleanActions as any,
              });
            }
          }
        }
      }

      // Record Audit Logs
      if (currentUser) {
        // Role change audit
        if (editingUser.role !== data.role) {
          await recordPermissionAuditLog({
            companyId,
            performer: currentUser,
            targetUser: { ...editingUser, name: data.name, role: data.role },
            module: "userManagement",
            permission: "role_assignment",
            oldValue: editingUser.role,
            newValue: data.role,
          });
        }

        // Account admin status change audit
        if (wasAdmin !== willBeAdmin) {
          await recordPermissionAuditLog({
            companyId,
            performer: currentUser,
            targetUser: { ...editingUser, name: data.name, role: data.role },
            module: "userManagement",
            permission: "account_administrator_privileges",
            oldValue: wasAdmin ? "Granted" : "Revoked",
            newValue: willBeAdmin ? "Granted" : "Revoked",
          });
        }

        // Overrides audit
        for (const modDef of MODULE_DEFINITIONS) {
          const modKey = modDef.key;
          for (const action of modDef.supportedActions) {
            const oldState = originalOverrides[modKey]?.[action] || "INHERIT";
            const newState = userOverrides[modKey]?.[action] || "INHERIT";
            if (oldState !== newState) {
              await recordPermissionAuditLog({
                companyId,
                performer: currentUser,
                targetUser: { ...editingUser, name: data.name, role: data.role },
                module: modDef.label,
                permission: `${ACTION_LABELS[action]} Action`,
                oldValue: oldState,
                newValue: newState,
              });
            }
          }
        }
      }

      toast.success("User and permissions updated successfully!");
      setEditingUser(null);
      setShowForm(false);
      reset();
      window.dispatchEvent(new Event("permissions-updated"));
      await loadUsers();
      return;
    }

    // CREATE NEW USER
    if (!data.password || data.password.length < 6) {
      toast.warning("Password must be at least 6 characters for a new user.");
      return;
    }

    const existingUser = await db.users
      .where("email")
      .equals(cleanEmail)
      .first();

    if (existingUser) {
      toast.error("User with this email already exists");
      return;
    }

    const newUserId = await db.users.add({
      companyId,
      name: data.name,
      email: cleanEmail,
      password: data.password,
      role: data.role,
      isAccountAdmin: data.role === "ACCOUNT_ADMIN" || isAccountAdmin,
      size: 0,
    });

    // Save initial permission overrides if not account admin
    if (!isAccountAdmin && data.role !== "ACCOUNT_ADMIN") {
      for (const modDef of MODULE_DEFINITIONS) {
        const modKey = modDef.key;
        const modOverrides = userOverrides[modKey];
        if (modOverrides) {
          const cleanActions: Record<string, OverrideState> = {};
          let hasAny = false;

          for (const action of modDef.supportedActions) {
            const state = modOverrides[action];
            if (state && state !== "INHERIT") {
              cleanActions[action] = state;
              hasAny = true;
            }
          }

          if (hasAny) {
            await db.user_permissions.add({
              companyId,
              userId: Number(newUserId),
              module: modKey,
              overrides: cleanActions as any,
            });
          }
        }
      }
    }

    // Crew record
    if (data.role === "FIELD_WORKER" || data.role === "SITE_MANAGER") {
      const roleLabel: CrewRole =
        data.role === "SITE_MANAGER" ? "Site Manager" : "Field Worker";
      try {
        await db.crew.add({
          companyId,
          name: data.name,
          role: roleLabel,
          contact: "+91 98000 00000",
          email: cleanEmail,
          status: "Active",
          trade:
            roleLabel === "Field Worker"
              ? "General Construction"
              : "Site Operations",
          site: "Main Site",
          avatarBg:
            roleLabel === "Field Worker"
              ? "bg-emerald-100 text-emerald-800"
              : "bg-purple-100 text-purple-800",
          joinedDate: new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          createdAt: new Date().toISOString(),
        });
      } catch (e) {}
    }

    // Audit log
    if (currentUser) {
      await recordPermissionAuditLog({
        companyId,
        performer: currentUser,
        targetUser: {
          id: Number(newUserId),
          name: data.name,
          email: cleanEmail,
          role: data.role,
          size: 0,
        },
        module: "userManagement",
        permission: "create_user",
        oldValue: "None",
        newValue: `Created as ${data.role}${isAccountAdmin ? " (Account Admin)" : ""}`,
      });
    }

    toast.success("User created successfully with role and permissions!");
    reset();
    setShowForm(false);
    window.dispatchEvent(new Event("permissions-updated"));
    await loadUsers();
  };

  const getRoleBadge = (user: DbUser) => {
    if (user.role === "OWNER") {
      return {
        label: "Primary Owner",
        color: "bg-forest/10 text-forest border-forest/30 font-bold",
      };
    }
    if (user.role === "ACCOUNT_ADMIN") {
      return {
        label: "Account Admin",
        color: "bg-purple-50 text-purple-800 border-purple-200 font-bold",
      };
    }
    switch (user.role) {
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
      case "SITE_MANAGER":
        return {
          label: "Site Manager",
          color: "bg-emerald-50 text-emerald-800 border-emerald-200",
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
          label: user.role,
          color: "bg-stone text-ash border-pebble/60",
        };
    }
  };

  const isFullAdminMode =
    isAccountAdmin || selectedRole === "ACCOUNT_ADMIN" || editingUser?.role === "OWNER";

  const matrixCategories = [
    "ALL",
    "Commercial",
    "Field & Execution",
    "Build Management",
    "Financial",
    "Databases",
    "Administration",
  ];

  const filteredModules = useMemo(() => {
    return MODULE_DEFINITIONS.filter((mod) => {
      const matchCat =
        matrixCategoryFilter === "ALL" || mod.category === matrixCategoryFilter;
      const matchSearch =
        !matrixSearch ||
        mod.label.toLowerCase().includes(matrixSearch.toLowerCase()) ||
        mod.description.toLowerCase().includes(matrixSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [matrixCategoryFilter, matrixSearch]);

  const activeOverridesCount = useMemo(() => {
    let count = 0;
    Object.values(userOverrides).forEach((actions) => {
      Object.values(actions).forEach((state) => {
        if (state && state !== "INHERIT") count++;
      });
    });
    return count;
  }, [userOverrides]);

  return (
    <FirmaLayout activeNav="Users & Roles">
      <div className="space-y-6 mt-4 max-w-7xl mx-auto">
        {/* HEADER & TABS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-eyebrow font-semibold tracking-wider text-ash uppercase">
              ORGANIZATION &amp; SECURITY
            </span>
            <h1 className="text-display-h1 font-bold text-onyx mt-0.5 tracking-tight flex items-center gap-2.5">
              <span>Users &amp; Permission Matrix</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-forest/10 text-forest border border-forest/20">
                Two-Tier RBAC
              </span>
            </h1>
            <p className="text-sm text-ash mt-1">
              Configure team members, designate Account Administrators, and manage granular module permission overrides.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            {/* View Switcher Tabs */}
            <div className="inline-flex rounded-[10px] bg-stone p-1 border border-pebble">
              <button
                type="button"
                onClick={() => setActiveTab("team")}
                className={`px-3 py-1.5 rounded-[8px] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "team"
                    ? "bg-white text-onyx shadow-2xs"
                    : "text-ash hover:text-onyx"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Team Members</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("audit")}
                className={`px-3 py-1.5 rounded-[8px] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "audit"
                    ? "bg-white text-onyx shadow-2xs"
                    : "text-ash hover:text-onyx"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Audit Trail</span>
              </button>
            </div>

            {activeTab === "team" && (
              <Button
                onClick={handleOpenAdd}
                className="bg-forest hover:bg-forest-hover text-white rounded-[10px] font-medium px-4 py-2 text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add User</span>
              </Button>
            )}
          </div>
        </div>

        {/* AUDIT LOG TAB */}
        {activeTab === "audit" && <AuditLogView />}

        {/* TEAM MEMBERS TAB */}
        {activeTab === "team" && (
          <>
            {/* ADD / EDIT USER FORM WITH PERMISSION MATRIX */}
            {showForm && (
              <div className="rounded-[16px] bg-white border border-pebble p-6 sm:p-7 shadow-xs animate-in fade-in slide-in-from-top-3 duration-200">
                <div className="flex items-center justify-between pb-4 border-b border-pebble/50">
                  <div>
                    <h2 className="text-lg font-bold text-onyx flex items-center gap-2">
                      <UserPlus className="h-5 w-5 text-forest" />
                      <span>{editingUser ? `Edit ${editingUser.name}'s Access & Permissions` : "Add New User & Configure Permissions"}</span>
                    </h2>
                    <p className="text-xs text-ash mt-0.5">
                      Set user credentials, assign base role, and apply granular custom module overrides.
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

                <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
                  {/* BASE INFO GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* NAME */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-onyx">
                        Full Name <span className="text-hazard">*</span>
                      </Label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ash pointer-events-none" />
                        <Input
                          {...register("name")}
                          placeholder="e.g. Rahul Sharma"
                          className="pl-9 h-9 text-xs"
                        />
                      </div>
                      {errors.name && (
                        <p className="text-[11px] font-medium text-hazard">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* EMAIL */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-onyx">
                        Work Email <span className="text-hazard">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ash pointer-events-none" />
                        <Input
                          {...register("email")}
                          placeholder="rahul@company.com"
                          type="email"
                          className="pl-9 h-9 text-xs"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-[11px] font-medium text-hazard">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* PASSWORD */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-onyx">
                        {editingUser ? "New Password (optional)" : "Password"}{" "}
                        <span className="text-hazard">{editingUser ? "" : "*"}</span>
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ash pointer-events-none" />
                        <Input
                          {...register("password")}
                          placeholder={editingUser ? "Leave blank to keep current" : "Min 6 characters"}
                          type={showPassword ? "text" : "password"}
                          className="pl-9 pr-8 h-9 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ash hover:text-onyx cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-[11px] font-medium text-hazard">
                          {errors.password.message}
                        </p>
                      )}
                    </div>

                    {/* ROLE */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-onyx">
                        Assigned Role <span className="text-hazard">*</span>
                      </Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ash pointer-events-none" />
                        <select
                          {...register("role")}
                          className="h-9 w-full rounded-[10px] border border-pebble bg-white pl-9 pr-8 text-xs text-onyx shadow-2xs outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20 cursor-pointer appearance-none"
                        >
                          <option value="SALES_MANAGER">Sales Manager</option>
                          <option value="PROJECT_MANAGER">Project Manager</option>
                          <option value="SITE_MANAGER">Site Manager</option>
                          <option value="FIELD_WORKER">Field Worker</option>
                          <option value="FINANCE_MANAGER">Finance Manager</option>
                          <option value="ACCOUNT_ADMIN">Account Administrator</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ash pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* ACCOUNT ADMINISTRATOR ELEVATION TOGGLE */}
                  <div className="rounded-[12px] border border-pebble/80 bg-stone/40 p-4 transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center shrink-0 mt-0.5">
                          <Shield className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Label
                              htmlFor="admin-toggle"
                              className="text-xs font-bold text-onyx cursor-pointer"
                            >
                              Account Administrator Privileges
                            </Label>
                            {isAccountAdmin && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                                Full Organization Access
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-ash mt-0.5 leading-relaxed">
                            Grants unrestricted access across every module, action, and user management capability, identical to the Primary Business Owner.
                          </p>
                        </div>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          id="admin-toggle"
                          type="checkbox"
                          checked={isAccountAdmin || selectedRole === "ACCOUNT_ADMIN"}
                          disabled={selectedRole === "ACCOUNT_ADMIN" || editingUser?.role === "OWNER"}
                          onChange={(e) => setIsAccountAdmin(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-pebble peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-pebble after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-700"></div>
                      </label>
                    </div>
                  </div>

                  {/* PERMISSION MATRIX SECTION */}
                  <div className="rounded-[14px] border border-pebble bg-white p-5 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-pebble/60">
                      <div>
                        <div className="flex items-center gap-2">
                          <Sliders className="h-4 w-4 text-forest" />
                          <h3 className="text-sm font-bold text-onyx">
                            Custom Permission Matrix &amp; Overrides
                          </h3>
                          {activeOverridesCount > 0 && !isFullAdminMode && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {activeOverridesCount} Custom Override{activeOverridesCount === 1 ? "" : "s"}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-ash mt-0.5">
                          {isFullAdminMode
                            ? "Account Administrators inherently possess unrestricted permissions across all modules."
                            : `Default permissions are driven by the ${selectedRole.replace("_", " ")} role template. Set specific actions to Allow or Deny to override.`}
                        </p>
                      </div>

                      {!isFullAdminMode && (
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleResetAllOverrides}
                            className="gap-1 text-xs h-8 text-ash hover:text-onyx"
                          >
                            <RotateCcw className="h-3 w-3" />
                            <span>Reset to Defaults</span>
                          </Button>
                        </div>
                      )}
                    </div>

                    {isFullAdminMode ? (
                      <div className="rounded-[10px] border border-purple-200 bg-purple-50/70 p-4 text-center">
                        <ShieldCheck className="h-6 w-6 text-purple-700 mx-auto mb-1.5" />
                        <h4 className="text-xs font-bold text-purple-900">
                          Unrestricted Access Active
                        </h4>
                        <p className="text-[11px] text-purple-700 mt-0.5 max-w-lg mx-auto">
                          This user is designated as an Account Administrator or Owner. They have universal View, Create, Edit, Archive, Delete, Approve, Send, and Void/Credit rights on all modules.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Filters & Legend */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          {/* Category Filter Pills */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            {matrixCategories.map((cat) => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => setMatrixCategoryFilter(cat)}
                                className={`px-2.5 py-1 rounded-[6px] text-[11px] font-medium transition cursor-pointer ${
                                  matrixCategoryFilter === cat
                                    ? "bg-forest text-white shadow-2xs font-semibold"
                                    : "bg-stone text-ash hover:text-onyx border border-pebble/60"
                                }`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>

                          {/* Legend */}
                          <div className="flex items-center gap-3 text-[11px] text-ash shrink-0">
                            <span className="flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded-full bg-pebble border border-ash/40"></span>
                              <span>Inherit Default</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                              <span>Allow Override</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                              <span>Deny Override</span>
                            </span>
                          </div>
                        </div>

                        {/* MATRIX TABLE */}
                        <div className="overflow-x-auto rounded-[10px] border border-pebble max-h-[460px] overflow-y-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead className="sticky top-0 z-10 bg-stone shadow-2xs">
                              <tr className="border-b border-pebble text-ash font-semibold uppercase text-[10px] tracking-wider">
                                <th className="py-2.5 px-3 w-56">Module</th>
                                <th className="py-2.5 px-2 text-center w-28">View</th>
                                <th className="py-2.5 px-2 text-center w-28">Create</th>
                                <th className="py-2.5 px-2 text-center w-28">Edit</th>
                                <th className="py-2.5 px-2 text-center w-28">Archive</th>
                                <th className="py-2.5 px-2 text-center w-28">Delete</th>
                                <th className="py-2.5 px-2 text-center w-28">Approve</th>
                                <th className="py-2.5 px-2 text-center w-28">Send</th>
                                <th className="py-2.5 px-2 text-center w-28">Void / Credit</th>
                              </tr>
                            </thead>

                            <tbody className="divide-y divide-pebble/60 text-onyx">
                              {filteredModules.map((mod) => {
                                const roleDefaults =
                                  ROLE_DEFAULT_TEMPLATES[selectedRole]?.[mod.key] || {};

                                return (
                                  <tr
                                    key={mod.key}
                                    className="hover:bg-stone/40 transition"
                                  >
                                    <td className="py-2 px-3">
                                      <div>
                                        <span className="font-bold text-onyx text-xs block">
                                          {mod.label}
                                        </span>
                                        <span className="text-[10px] text-ash line-clamp-1">
                                          {mod.description}
                                        </span>
                                      </div>
                                    </td>

                                    {(
                                      [
                                        "view",
                                        "create",
                                        "edit",
                                        "archive",
                                        "delete",
                                        "approve",
                                        "send",
                                        "voidCredit",
                                      ] as PermissionAction[]
                                    ).map((action) => {
                                      const isSupported = mod.supportedActions.includes(action);
                                      if (!isSupported) {
                                        return (
                                          <td
                                            key={action}
                                            className="py-2 px-2 text-center text-ash/40"
                                          >
                                            —
                                          </td>
                                        );
                                      }

                                      const defaultVal = Boolean(roleDefaults[action]);
                                      const overrideVal: OverrideState =
                                        userOverrides[mod.key]?.[action] || "INHERIT";

                                      let selectBg = "bg-stone/50 text-onyx border-pebble/70";
                                      if (overrideVal === "ALLOW") {
                                        selectBg = "bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold";
                                      } else if (overrideVal === "DENY") {
                                        selectBg = "bg-rose-50 text-rose-800 border-rose-300 font-semibold";
                                      }

                                      return (
                                        <td key={action} className="py-2 px-1 text-center">
                                          <select
                                            value={overrideVal}
                                            onChange={(e) =>
                                              handleCellOverrideChange(
                                                mod.key,
                                                action,
                                                e.target.value as OverrideState
                                              )
                                            }
                                            className={`h-7 px-1.5 py-0.5 rounded-[6px] border text-[10px] outline-none transition cursor-pointer ${selectBg}`}
                                          >
                                            <option value="INHERIT">
                                              Inherit ({defaultVal ? "Yes" : "No"})
                                            </option>
                                            <option value="ALLOW">Allow (Force)</option>
                                            <option value="DENY">Deny (Force)</option>
                                          </select>
                                        </td>
                                      );
                                    })}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </div>

                  {/* FORM ACTION BUTTONS */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-pebble/40">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        reset();
                        setEditingUser(null);
                        setShowForm(false);
                      }}
                      className="px-4 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-forest hover:bg-forest-hover text-white px-5 text-xs shadow-xs"
                    >
                      {editingUser ? "Save Changes & Permissions" : "Create User & Apply Matrix"}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* USERS TABLE */}
            <div className="rounded-[10px] border border-pebble bg-white overflow-hidden shadow-2xs">
              <div className="p-4 border-b border-pebble/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-onyx">Team Members Directory</h3>
                  <p className="text-xs text-ash mt-0.5">
                    {users.length} registered user{users.length === 1 ? "" : "s"} in your organization
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-ash">
                  <ShieldCheck className="h-4 w-4 text-forest" />
                  <span>Safeguard Active: Minimum 1 Account Administrator strictly enforced</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-pebble bg-stone text-left text-xs font-semibold text-ash uppercase tracking-wider">
                      <th className="py-3.5 px-4">Member Name</th>
                      <th className="py-3.5 px-4">Work Email</th>
                      <th className="py-3.5 px-4">Role &amp; Elevation</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-pebble/70 text-sm text-onyx">
                    {users.map((user) => {
                      const badge = getRoleBadge(user);
                      const initial = (user.name?.charAt(0) || "U").toUpperCase();
                      const isUserAdmin =
                        user.role === "ACCOUNT_ADMIN" || user.isAccountAdmin === true;
                      const isOwner = user.role === "OWNER";

                      return (
                        <tr key={user.id} className="hover:bg-stone/60 transition">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-breath font-bold text-xs text-onyx shrink-0">
                                {initial}
                              </div>
                              <div>
                                <span className="font-semibold text-onyx block">{user.name}</span>
                                {isOwner && (
                                  <span className="text-[10px] text-forest font-medium">
                                    Primary Business Account
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-ash font-medium">{user.email}</td>

                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.color}`}
                              >
                                {badge.label}
                              </span>

                              {isUserAdmin && !isOwner && user.role !== "ACCOUNT_ADMIN" && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                  <Shield className="h-3 w-3" />
                                  <span>Account Admin Flag</span>
                                </span>
                              )}
                            </div>
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
                                <span>{isOwner ? "View" : "Edit & Permissions"}</span>
                              </Button>

                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={isOwner}
                                onClick={() => user.id && handleDelete(user.id)}
                                className={`gap-1 text-xs ${isOwner ? "opacity-40 cursor-not-allowed" : ""}`}
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
          </>
        )}
      </div>
    </FirmaLayout>
  );
}