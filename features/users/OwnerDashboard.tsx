"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { db } from "@/lib/db";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


export default function DashboardPage() {
  const currentUser = useAuthStore((state) => state.currentUser);

  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!currentUser) {
    return <p>Please login first.</p>;
  }

 const handleCreateAdmin = async () => {
  if (!name || !email || !password) {
    alert("Please fill all fields");
    return;
  }

  const existingAdmin = await db.users
    .where("role")
    .equals("ACCOUNT_ADMIN")
    .first();

  if (existingAdmin) {
    alert("Account Admin already exists");
    return;
  }

  await db.users.add({
    name,
    email,
    password,
    size: 0,
    role: "ACCOUNT_ADMIN",
  });

  alert("Account Admin created successfully");

  setName("");
  setEmail("");
  setPassword("");

  setOpen(false);
};

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">

        <h1 className="mb-2 text-3xl font-bold">
          Mini FIRMA Dashboard
        </h1>

        <p className="mb-8 text-gray-600">
          Welcome, {currentUser.name}
        </p>

        {currentUser.role === "OWNER" && (
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Owner Dashboard</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="mb-4 text-sm text-gray-600">
                Manage Account Admin
              </p>

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger>
                  <Button>
                    Create Account Admin
                  </Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      Create Account Admin
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">

                    <div>
                      <Label>Name</Label>

                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter name"
                      />
                    </div>

                    <div>
                      <Label>Email</Label>

                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email"
                      />
                    </div>

                    <div>
                      <Label>Password</Label>

                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                      />
                    </div>

                    <Button
                      className="w-full"
                      onClick={handleCreateAdmin}
                    >
                      Create Admin
                    </Button>

                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}

      </div>
    </main>
  );
}