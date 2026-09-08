"use client";

import { useEffect, useState } from "react";
import { db, type User } from "@/lib/db";
import FirmaLayout from "@/components/layout/FirmaLayout";
import {
  Users,
  ShieldCheck,
  Search,
  UserPlus,
  Mail,
  Briefcase,
  ChevronDown,
  Filter,
} from "lucide-react";

export default function TeamAndAdmins() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const loadUsers = async () => {
    try {
      const data = await db.users.toArray();
      if (data.length === 0) {
        // Sample baseline data matching the dashboard stats
        const initialUsers: User[] = [
          { name: "Rahul Sharma", email: "rahul@abcsolutions.com", password: "***", role: "OWNER", size: 0 },
          { name: "Pooja Verma", email: "pooja@abcsolutions.com", password: "***", role: "ACCOUNT_ADMIN", size: 0 },
          { name: "Amit Kumar", email: "amit.k@abcsolutions.com", password: "***", role: "SALES_MANAGER", size: 0 },
          { name: "Vikram Singh", email: "vikram@abcsolutions.com", password: "***", role: "SALES_MANAGER", size: 0 },
          { name: "Sneha Reddy", email: "sneha@abcsolutions.com", password: "***", role: "SALES_MANAGER", size: 0 },
          { name: "Rajesh Joshi", email: "rajesh@abcsolutions.com", password: "***", role: "PROJECT_MANAGER", size: 0 },
          { name: "Ananya Roy", email: "ananya@abcsolutions.com", password: "***", role: "PROJECT_MANAGER", size: 0 },
          { name: "Ravi Patel", email: "ravi.p@abcsolutions.com", password: "***", role: "FIELD_WORKER", size: 0 },
          { name: "Suresh Meena", email: "suresh@abcsolutions.com", password: "***", role: "FIELD_WORKER", size: 0 },
          { name: "Deepak Yadav", email: "deepak@abcsolutions.com", password: "***", role: "FIELD_WORKER", size: 0 },
          { name: "Manoj Kumar", email: "manoj@abcsolutions.com", password: "***", role: "FIELD_WORKER", size: 0 },
          { name: "Kavita Nair", email: "kavita@abcsolutions.com", password: "***", role: "FINANCE_MANAGER", size: 0 },
        ];
        setUsers(initialUsers);
      } else {
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const getRoleBadge = (role: User["role"]) => {
    switch (role) {
      case "OWNER":
        return { label: "Owner", color: "bg-[#FEF7E2] text-[#C98A19] border-[#FBECC5]" };
      case "ACCOUNT_ADMIN":
        return { label: "Account Admin", color: "bg-[#E5EDE7] text-[#182E25] border-[#CADBCE]" };
      case "SALES_MANAGER":
        return { label: "Sales Manager", color: "bg-[#E6F4EA] text-[#183D2D] border-[#CBEAD5]" };
      case "PROJECT_MANAGER":
        return { label: "Project Manager", color: "bg-[#EBF3ED] text-[#416C50] border-[#D1E5D8]" };
      case "FIELD_WORKER":
        return { label: "Field Worker", color: "bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]" };
      case "FINANCE_MANAGER":
        return { label: "Finance Manager", color: "bg-[#FFF8E1] text-[#E65100] border-[#FFE082]" };
      default:
        return { label: role, color: "bg-slate-100 text-slate-700 border-slate-200" };
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchText = search.toLowerCase();
    const matchesSearch =
      user.name.toLowerCase().includes(searchText) ||
      user.email.toLowerCase().includes(searchText);

    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const admins = filteredUsers.filter(
    (user) => user.role === "OWNER" || user.role === "ACCOUNT_ADMIN"
  );
  const employees = filteredUsers.filter(
    (user) => user.role !== "OWNER" && user.role !== "ACCOUNT_ADMIN"
  );

  return (
    <FirmaLayout activeNav="Team & Admins">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 pb-2">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            ORGANIZATION
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5 tracking-tight flex items-center gap-2">
            Team &amp; Admins
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your organization workforce, assign roles, and monitor team access.
          </p>
        </div>
      </div>

      {/* 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white p-4 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6F4EA] text-[#2E7D32]">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400">Total Members</span>
            <p className="text-2xl font-extrabold text-slate-900">{users.length}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E5EDE7] text-[#182E25]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400">Administrators</span>
            <p className="text-2xl font-extrabold text-slate-900">
              {users.filter((u) => u.role === "OWNER" || u.role === "ACCOUNT_ADMIN").length}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FEF7E2] text-[#C98A19]">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400">Field &amp; Operations</span>
            <p className="text-2xl font-extrabold text-slate-900">
              {users.filter((u) => u.role !== "OWNER" && u.role !== "ACCOUNT_ADMIN").length}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-white p-4 border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or email address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-[#182E25] focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-xl px-3.5 py-2 pr-8 outline-none focus:border-[#182E25] cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="OWNER">Owner</option>
              <option value="ACCOUNT_ADMIN">Account Admin</option>
              <option value="SALES_MANAGER">Sales Manager</option>
              <option value="PROJECT_MANAGER">Project Manager</option>
              <option value="FIELD_WORKER">Field Worker</option>
              <option value="FINANCE_MANAGER">Finance Manager</option>
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-white border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Team Directory ({filteredUsers.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Loading team members...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No team members matched your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Name</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.map((item, idx) => {
                  const badge = getRoleBadge(item.role);
                  return (
                    <tr key={item.id || idx} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E5EDE7] text-[#182E25] font-bold text-xs">
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-900">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-slate-500 font-medium">
                        {item.email}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="ml-1.5 text-[11px] text-slate-500">Active</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </FirmaLayout>
  );
}