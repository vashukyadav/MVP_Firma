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
      setUsers(data);
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
        return { label: "Owner", color: "bg-sunfleck text-onyx border-pebble" };
      case "ACCOUNT_ADMIN":
        return { label: "Account Admin", color: "bg-breath text-onyx border-pebble" };
      case "SALES_MANAGER":
        return { label: "Sales Manager", color: "bg-clear-bg text-success-text border-pebble" };
      case "PROJECT_MANAGER":
        return { label: "Project Manager", color: "bg-breath text-onyx border-pebble" };
      case "SITE_MANAGER":
        return { label: "Site Manager", color: "bg-emerald-50 text-emerald-800 border-emerald-200" };
      case "FIELD_WORKER":
        return { label: "Field Worker", color: "bg-stone text-onyx border-pebble" };
      case "FINANCE_MANAGER":
        return { label: "Finance Manager", color: "bg-caution-bg text-caution-text border-pebble" };
      default:
        return { label: role, color: "bg-stone text-ash border-pebble" };
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 pb-1">
        <div>
          <span className="text-eyebrow font-semibold tracking-wider text-ash uppercase">
            ORGANIZATION
          </span>
          <h1 className="text-display-h1 font-bold text-onyx mt-0.5 tracking-tight flex items-center gap-2">
            Team &amp; Admins
          </h1>
          <p className="text-sm text-ash mt-1">
            Manage your organization workforce, assign roles, and monitor team access.
          </p>
        </div>
      </div>

      {/* 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-[10px] bg-white p-4.5 border border-pebble flex items-center gap-3.5 shadow-2xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-clear-bg text-success-text">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-ash">Total Members</span>
            <p className="text-2xl font-bold text-onyx">{users.length}</p>
          </div>
        </div>

        <div className="rounded-[10px] bg-white p-4.5 border border-pebble flex items-center gap-3.5 shadow-2xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-breath text-onyx">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-ash">Administrators</span>
            <p className="text-2xl font-bold text-onyx">
              {users.filter((u) => u.role === "OWNER" || u.role === "ACCOUNT_ADMIN").length}
            </p>
          </div>
        </div>

        <div className="rounded-[10px] bg-white p-4.5 border border-pebble flex items-center gap-3.5 shadow-2xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-sunfleck text-onyx">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-ash">Field &amp; Operations</span>
            <p className="text-2xl font-bold text-onyx">
              {users.filter((u) => u.role !== "OWNER" && u.role !== "ACCOUNT_ADMIN").length}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-[10px] bg-white p-4 border border-pebble flex flex-col sm:flex-row gap-3 shadow-2xs">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-ash absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or email address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-3.5 text-sm text-onyx placeholder:text-ash bg-stone rounded-[10px] border border-pebble outline-none focus:border-forest focus:ring-2 focus:ring-forest/20 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none h-10 bg-stone border border-pebble text-onyx text-sm font-medium rounded-[10px] px-3.5 pr-9 outline-none focus:border-forest focus:ring-2 focus:ring-forest/20 cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="OWNER">Owner</option>
              <option value="ACCOUNT_ADMIN">Account Admin</option>
              <option value="SALES_MANAGER">Sales Manager</option>
              <option value="PROJECT_MANAGER">Project Manager</option>
              <option value="SITE_MANAGER">Site Manager</option>
              <option value="FIELD_WORKER">Field Worker</option>
              <option value="FINANCE_MANAGER">Finance Manager</option>
            </select>
            <ChevronDown className="h-4 w-4 text-ash absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-[10px] bg-white border border-pebble overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-pebble flex items-center justify-between">
          <h2 className="text-base font-bold text-onyx">
            Team Directory ({filteredUsers.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-body text-ash">
            Loading team members...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-body text-ash">
            No team members matched your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-pebble bg-stone text-xs font-semibold text-ash uppercase tracking-wider">
                  <th className="px-6 py-3.5">Name</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pebble text-sm">
                {filteredUsers.map((item, idx) => {
                  const badge = getRoleBadge(item.role);
                  return (
                    <tr key={item.id || idx} className="hover:bg-stone/50 transition">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-breath text-onyx font-bold text-xs">
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-onyx">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-ash font-medium">
                        {item.email}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <span className="inline-block h-2 w-2 rounded-full bg-success" />
                        <span className="ml-1.5 text-xs font-medium text-ash">Active</span>
                      </td>
                    </tr>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-ash">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone text-ash">
                          <Users className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-onyx">No team members registered yet</p>
                        <p className="text-xs text-ash">
                          Create user accounts from the Users &amp; Roles section to populate your team.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </FirmaLayout>
  );
}