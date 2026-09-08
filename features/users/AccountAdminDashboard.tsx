"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { db, type UserRole, type User } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const createUserSchema = z.object({
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

type CreateUserFormData = z.infer<typeof createUserSchema>;

export default function CreateUser() {
  const [users, setUsers] = useState<User[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
  });

  const loadUsers = async () => {
    const data = await db.users.toArray();

    
    const otherUsers = data.filter(
      (user) => user.role !== "ACCOUNT_ADMIN"
    );

    setUsers(otherUsers);
  };

  
  useEffect(() => {
    loadUsers();
  }, []);

  const onSubmit = async (data: CreateUserFormData) => {
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
      role: data.role as UserRole,
      size: 0,
    });

    alert(`${data.role} created successfully`);

    reset();


    loadUsers();
  };

  return (
    <div className="space-y-8">

    
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label>Name</Label>

          <Input {...register("name")} />

          {errors.name && (
            <p className="text-sm text-red-500">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Email</Label>

          <Input
            type="email"
            {...register("email")}
          />

          {errors.email && (
            <p className="text-sm text-red-500">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Password</Label>

          <Input
            type="password"
            {...register("password")}
          />

          {errors.password && (
            <p className="text-sm text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Role</Label>

          <select
            {...register("role")}
            className="w-full rounded-md border px-3 py-2"
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
            <p className="text-sm text-red-500">
              {errors.role.message}
            </p>
          )}
        </div>

        <Button type="submit">
          Create User
        </Button>
      </form>


      {/* Users List */}
      <div className="space-y-4">

        <h2 className="text-xl font-semibold">
          Created Users
        </h2>

        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No users created yet.
          </p>
        ) : (
          <div className="space-y-3">

            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium">
                    {user.name}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {user.email}
                  </p>
                </div>

                <span className="rounded-md bg-muted px-3 py-1 text-sm">
                  {user.role}
                </span>
              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}