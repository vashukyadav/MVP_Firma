"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import FirmaLayout from "@/components/layout/FirmaLayout";
import { Customer, db } from "@/lib/db";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Building, User, Mail, Phone, MapPin, Briefcase } from "lucide-react";

/* =========================================================
   CUSTOMER VALIDATION
========================================================= */

const customerSchema = z.object({
  companyName: z
    .string()
    .min(2, "Company name must be at least 2 characters"),

  contactPerson: z
    .string()
    .min(2, "Contact person must be at least 2 characters"),

  email: z
    .string()
    .email("Please enter a valid email"),

  phone: z
    .string()
    .min(10, "Please enter a valid phone number"),

  address: z
    .string()
    .min(2, "Address is required"),

  industry: z
    .string()
    .min(2, "Industry is required"),

  notes: z
    .string()
    .optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

/* =========================================================
   CUSTOMERS COMPONENT
========================================================= */

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [showForm, setShowForm] = useState(false);

  const [editingCustomer, setEditingCustomer] =
    useState<Customer | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  });

  /* =======================================================
     READ CUSTOMERS
  ======================================================= */

  const loadCustomers = async () => {
    try {
      const count = await db.customer.count();
      if (count === 0) {
        await db.customer.bulkAdd([
          {
            companyName: "Apex Infra Projects",
            contactPerson: "Rajeshwar Sen",
            email: "rajeshwar@apexinfra.com",
            phone: "+91 98765 43210",
            address: "Delhi NCR",
            industry: "Infrastructure & Highways",
            notes: "National Highway EPC contractor",
          },
          {
            companyName: "BuildCraft Ltd",
            contactPerson: "Ananya Deshmukh",
            email: "ananya@buildcraft.com",
            phone: "+91 98123 45678",
            address: "Mumbai Central",
            industry: "Commercial Construction",
            notes: "Commercial towers contractor",
          },
          {
            companyName: "Horizon EPC Group",
            contactPerson: "Vikramaditya Rao",
            email: "vikram@horizonepc.com",
            phone: "+91 97654 32109",
            address: "Bangalore",
            industry: "Energy & Infrastructure",
            notes: "Metro & Civil engineering works",
          },
        ]);
      }
    } catch (err) {
      console.error("Error seeding customers:", err);
    }
    const data = await db.customer.toArray();

    setCustomers(data);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  /* =======================================================
     DELETE CUSTOMER
  ======================================================= */

  const handleDelete = async (id: number) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmDelete) return;

    await db.customer.delete(id);

    alert("Customer deleted successfully!");

    await loadCustomers();
  };

  /* =======================================================
     EDIT CUSTOMER
  ======================================================= */

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);

    setShowForm(true);

    reset({
      companyName: customer.companyName,
      contactPerson: customer.contactPerson,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      industry: customer.industry,
      notes: customer.notes ?? "",
    });
  };

  /* =======================================================
     CREATE + UPDATE CUSTOMER
  ======================================================= */

  const onSubmit = async (data: CustomerFormData) => {
    /* -------------------------------------------------------
       UPDATE
    ------------------------------------------------------- */

    if (editingCustomer?.id) {
      await db.customer.update(editingCustomer.id, {
        companyName: data.companyName,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        address: data.address,
        industry: data.industry,
        notes: data.notes ?? "",
      });

      alert("Customer updated successfully!");

      setEditingCustomer(null);

      setShowForm(false);

      reset();

      await loadCustomers();

      return;
    }

    /* -------------------------------------------------------
       CHECK DUPLICATE EMAIL
    ------------------------------------------------------- */

    const existingCustomer = await db.customer
      .where("email")
      .equals(data.email)
      .first();

    if (existingCustomer) {
      alert("Customer with this email already exists");

      return;
    }

    /* -------------------------------------------------------
       CREATE
    ------------------------------------------------------- */

    await db.customer.add({
      companyName: data.companyName,
      contactPerson: data.contactPerson,
      email: data.email,
      phone: data.phone,
      address: data.address,
      industry: data.industry,
      notes: data.notes ?? "",
    } as Customer);

    alert("Customer created successfully!");

    reset();

    setShowForm(false);

    await loadCustomers();
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <FirmaLayout activeNav="Customers">
      <div className="p-2 sm:p-4 space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-eyebrow font-semibold tracking-wider text-ash uppercase">
              CLIENT MANAGEMENT
            </span>
            <h1 className="text-display-h1 font-bold text-onyx mt-0.5 tracking-tight">
              Customers &amp; Accounts
            </h1>
            <p className="text-body text-ash mt-1">
              Maintain company records, communication contacts, and client portfolios.
            </p>
          </div>

          <Button
            onClick={() => {
              setEditingCustomer(null);
              reset();
              setShowForm(true);
            }}
            className="bg-forest hover:bg-forest-hover text-white rounded-[10px] px-4.5 py-2.5 text-sm font-medium flex items-center gap-2 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Add Customer</span>
          </Button>
        </div>

        {/* ADD / EDIT CUSTOMER FORM */}
        {showForm && (
          <div className="rounded-[16px] border border-pebble bg-white p-6 sm:p-7 shadow-xs animate-in fade-in slide-in-from-top-3 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-pebble/50">
              <div>
                <h2 className="text-lg font-bold text-onyx">
                  {editingCustomer ? "Edit Customer Details" : "Add New Customer"}
                </h2>
                <p className="text-sm text-ash mt-0.5">
                  Record new client contact information, enterprise domain, and commercial specifications.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  reset();
                  setEditingCustomer(null);
                  setShowForm(false);
                }}
                className="p-1.5 rounded-[8px] text-ash hover:text-onyx hover:bg-stone transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-6 space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* COMPANY NAME */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-onyx">
                    Company Name <span className="text-hazard">*</span>
                  </Label>
                  <Input
                    {...register("companyName")}
                    placeholder="e.g. Larsen & Toubro"
                  />
                  {errors.companyName && (
                    <p className="text-xs font-medium text-hazard mt-1">
                      {errors.companyName.message}
                    </p>
                  )}
                </div>

                {/* CONTACT PERSON */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-onyx">
                    Contact Person <span className="text-hazard">*</span>
                  </Label>
                  <Input
                    {...register("contactPerson")}
                    placeholder="e.g. Ramesh Chandra"
                  />
                  {errors.contactPerson && (
                    <p className="text-xs font-medium text-hazard mt-1">
                      {errors.contactPerson.message}
                    </p>
                  )}
                </div>

                {/* EMAIL */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-onyx">
                    Email Address <span className="text-hazard">*</span>
                  </Label>
                  <Input
                    {...register("email")}
                    placeholder="e.g. ramesh@lt.com"
                    type="email"
                  />
                  {errors.email && (
                    <p className="text-xs font-medium text-hazard mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* PHONE */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-onyx">
                    Phone Number <span className="text-hazard">*</span>
                  </Label>
                  <Input
                    {...register("phone")}
                    placeholder="e.g. +91 98765 43210"
                    type="tel"
                  />
                  {errors.phone && (
                    <p className="text-xs font-medium text-hazard mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                {/* ADDRESS */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-onyx">
                    Physical Address <span className="text-hazard">*</span>
                  </Label>
                  <Input
                    {...register("address")}
                    placeholder="e.g. Powai, Mumbai, MH"
                  />
                  {errors.address && (
                    <p className="text-xs font-medium text-hazard mt-1">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                {/* INDUSTRY */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-onyx">Industry</Label>
                  <Input
                    {...register("industry")}
                    placeholder="e.g. Civil Infrastructure"
                  />
                  {errors.industry && (
                    <p className="text-xs font-medium text-hazard mt-1">
                      {errors.industry.message}
                    </p>
                  )}
                </div>
              </div>

              {/* NOTES */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-onyx">Notes / Comments</Label>
                <Input
                  {...register("notes")}
                  placeholder="Optional background info or client requirements"
                />
              </div>

              {/* BUTTONS */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-pebble/40">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset();
                    setEditingCustomer(null);
                    setShowForm(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-forest hover:bg-forest-hover text-white px-5 shadow-xs"
                >
                  {editingCustomer ? "Update Customer" : "Create Customer"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* CUSTOMERS TABLE */}
        <div className="rounded-[10px] border border-pebble bg-white overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-pebble bg-stone text-eyebrow font-semibold text-ash uppercase tracking-wider">
                <th className="p-4">Company</th>
                <th className="p-4">Contact Person</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Industry</th>
                <th className="p-4">Address</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-pebble text-body text-onyx">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-stone/50 transition">
                  <td className="p-4 font-bold">{customer.companyName}</td>
                  <td className="p-4">{customer.contactPerson}</td>
                  <td className="p-4 text-ash">{customer.email}</td>
                  <td className="p-4 text-ash">{customer.phone}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-eyebrow font-medium bg-breath text-onyx border border-pebble">
                      {customer.industry}
                    </span>
                  </td>
                  <td className="p-4 text-ash text-eyebrow">{customer.address}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-pebble rounded-[6px] text-onyx bg-white hover:bg-mist text-eyebrow"
                        onClick={() => handleEdit(customer)}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        className="rounded-[6px] bg-hazard-bg text-hazard-text border border-pebble hover:bg-hazard hover:text-white text-eyebrow"
                        onClick={() => customer.id && handleDelete(customer.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {customers.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-body text-ash">
                    No customers found
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