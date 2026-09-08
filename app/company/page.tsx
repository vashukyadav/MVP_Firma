"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { db, type Company } from "@/lib/db";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CompanyPage() {
  const { currentUser } = useAuthStore();

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const loadCompany = async () => {
      if (!currentUser?.id) return;

      const data = await db.company.get(currentUser.id);

      setCompany(data ?? null);
      setLoading(false);
    };

    loadCompany();
  }, [currentUser?.id]);

  const handleChange = (
    field: keyof Company,
    value: string
  ) => {
    if (!company) return;

    setCompany({
      ...company,
      [field]: value,
    });
  };

  const handleSave = async () => {
    if (!company) return;

    await db.company.put(company);

    setEditing(false);

    alert("Company information updated successfully!");
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">
          Loading company information...
        </p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="font-medium">
              Company information not found.
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Please complete company onboarding first.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] p-6">

      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#919191]">
            Company
          </p>

          <h1 className="mt-1 text-2xl font-medium text-[#181b19]">
            Company Information
          </h1>

          <p className="mt-1 text-sm text-[#919191]">
            Manage your organization's company information.
          </p>
        </div>

        {!editing && (
          <Button
            onClick={() => setEditing(true)}
            className="bg-[#181b19] text-white hover:bg-[#5e4040]"
          >
            Edit Company
          </Button>
        )}

      </div>

      {/* Company Details */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Basic Information */}
        <Card className="rounded-[10px] border-[#cdcdcd] bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-[#181b19]">
              Basic Information
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">

            <div className="space-y-2">
              <Label>Company Name</Label>

              <Input
                value={company.companyName}
                disabled={!editing}
                onChange={(e) =>
                  handleChange(
                    "companyName",
                    e.target.value
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Industry</Label>

              <Input
                value={company.industry}
                disabled={!editing}
                onChange={(e) =>
                  handleChange(
                    "industry",
                    e.target.value
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Company Size</Label>

              <Input
                value={company.companySize}
                disabled={!editing}
                onChange={(e) =>
                  handleChange(
                    "companySize",
                    e.target.value
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Website</Label>

              <Input
                value={company.website ?? ""}
                disabled={!editing}
                placeholder="https://example.com"
                onChange={(e) =>
                  handleChange(
                    "website",
                    e.target.value
                  )
                }
              />
            </div>

          </CardContent>
        </Card>

        {/* Location */}
        <Card className="rounded-[10px] border-[#cdcdcd] bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-[#181b19]">
              Location
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">

            <div className="grid gap-4 sm:grid-cols-2">

              <div className="space-y-2">
                <Label>Country</Label>

                <Input
                  value={company.country}
                  disabled={!editing}
                  onChange={(e) =>
                    handleChange(
                      "country",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>State</Label>

                <Input
                  value={company.state}
                  disabled={!editing}
                  onChange={(e) =>
                    handleChange(
                      "state",
                      e.target.value
                    )
                  }
                />
              </div>

            </div>

            <div className="space-y-2">
              <Label>City</Label>

              <Input
                value={company.city}
                disabled={!editing}
                onChange={(e) =>
                  handleChange(
                    "city",
                    e.target.value
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Address</Label>

              <textarea
                value={company.address}
                disabled={!editing}
                onChange={(e) =>
                  handleChange(
                    "address",
                    e.target.value
                  )
                }
                className="min-h-[110px] w-full rounded-[6px] border border-[#cdcdcd] bg-white px-3 py-2 text-sm text-[#181b19] outline-none focus:ring-2 focus:ring-[#dae4de] disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

          </CardContent>
        </Card>

      </div>

      {/* Edit Actions */}
      {editing && (
        <div className="mt-6 flex justify-end gap-3">

          <Button
            variant="outline"
            onClick={() => setEditing(false)}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSave}
            className="bg-[#181b19] text-white hover:bg-[#5e4040]"
          >
            Save Changes
          </Button>

        </div>
      )}

    </div>
  );
}