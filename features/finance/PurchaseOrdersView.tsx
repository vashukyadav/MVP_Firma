"use client";

import { useState, useMemo } from "react";
import {
  useFinanceStore,
  PurchaseOrder,
  CostCategory,
} from "@/store/financeStore";
import { useLeadFlowStore } from "@/store/leadFlowStore";
import { useSiteStore } from "@/store/siteStore";
import { useTenderFlowStore } from "@/store/tenderFlowStore";
import { useAuthStore } from "@/store/authStore";
import { canApprovePurchaseOrder } from "@/lib/roleAccess";
import { toast } from "@/components/ui/toast";
import {
  ClipboardList,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  FileCheck2,
  Building2,
  MapPin,
  Briefcase,
  User,
  Calendar,
  IndianRupee,
  Check,
  XCircle,
  Filter,
} from "lucide-react";

interface PurchaseOrdersViewProps {
  initialJobFilter?: string;
  onOpenCreate?: () => void;
}

export default function PurchaseOrdersView({
  initialJobFilter,
}: PurchaseOrdersViewProps) {
  const {
    purchaseOrders,
    addPurchaseOrder,
    approvePurchaseOrder,
    rejectPurchaseOrder,
    createBillFromPO,
    settings,
    getAllSuppliers,
  } = useFinanceStore();

  const { projects = [] } = useLeadFlowStore();
  const { sites = [] } = useSiteStore();
  const { jobs = [] } = useTenderFlowStore();
  const currentUser = useAuthStore((state) => state.currentUser);
  const userCanApprove = canApprovePurchaseOrder(currentUser);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [projectFilter, setProjectFilter] = useState("ALL");
  const [siteFilter, setSiteFilter] = useState("ALL");
  const [jobFilter, setJobFilter] = useState(initialJobFilter || "ALL");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [showBillModal, setShowBillModal] = useState(false);

  // Create PO Form State
  const [supplierName, setSupplierName] = useState("");
  const [newProjectId, setNewProjectId] = useState(projects[0]?.id || "");
  const [newSiteId, setNewSiteId] = useState("");
  const [newJobId, setNewJobId] = useState(initialJobFilter || "");
  const [newCategory, setNewCategory] = useState<CostCategory>("Materials");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newQty, setNewQty] = useState("1");
  const [newUnitPrice, setNewUnitPrice] = useState("");
  const [newNotes, setNewNotes] = useState("");

  // Generate Bill State
  const [billAmount, setBillAmount] = useState("");
  const [billNumber, setBillNumber] = useState("");

  const suppliersList = useMemo(() => {
    return getAllSuppliers();
  }, [getAllSuppliers]);

  // Cascaded Sites for create form
  const availableSites = useMemo(() => {
    if (!newProjectId) return sites;
    const selectedProj = projects.find((p) => p.id === newProjectId);
    if (!selectedProj) return sites;
    return sites.filter(
      (s) =>
        s.projectName.toLowerCase() === selectedProj.name.toLowerCase() ||
        s.id === selectedProj.id
    );
  }, [newProjectId, projects, sites]);

  // Cascaded Jobs for create form
  const availableJobs = useMemo(() => {
    return jobs.filter((j) => {
      const matchProj =
        !newProjectId ||
        j.projectId === newProjectId ||
        projects.find((p) => p.id === newProjectId)?.name === j.projectName;
      return matchProj;
    });
  }, [newProjectId, projects, jobs]);

  // Filtered PO List
  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter((po) => {
      const matchSearch =
        po.poNumber.toLowerCase().includes(search.toLowerCase()) ||
        po.supplierName.toLowerCase().includes(search.toLowerCase()) ||
        po.projectName.toLowerCase().includes(search.toLowerCase()) ||
        po.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
        po.jobId.toLowerCase().includes(search.toLowerCase()) ||
        po.siteName.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "PENDING" && po.status === "Pending Approval") ||
        (statusFilter === "APPROVED" && po.status === "Approved") ||
        (statusFilter === "BILLED" && po.status === "Billed") ||
        (statusFilter === "REJECTED" && po.status === "Rejected");

      const matchProj =
        projectFilter === "ALL" ||
        po.projectId === projectFilter ||
        po.projectName === projectFilter;

      const matchSite =
        siteFilter === "ALL" ||
        po.siteId === siteFilter ||
        po.siteName === siteFilter;

      const matchJob = jobFilter === "ALL" || po.jobId === jobFilter;

      return matchSearch && matchStatus && matchProj && matchSite && matchJob;
    });
  }, [purchaseOrders, search, statusFilter, projectFilter, siteFilter, jobFilter]);

  const currencySymbol = settings.currencySymbol || "₹";

  const formatCurrency = (val: number) => {
    return `${currencySymbol}${val.toLocaleString("en-IN")}`;
  };

  const getStatusBadge = (status: PurchaseOrder["status"]) => {
    switch (status) {
      case "Approved":
        return {
          label: "Approved",
          color: "bg-clear-bg text-success-text border-pebble",
        };
      case "Billed":
        return {
          label: "Billed",
          color: "bg-breath text-onyx border-pebble",
        };
      case "Pending Approval":
        return {
          label: "Pending Approval",
          color: "bg-caution-bg text-caution-text border-pebble",
        };
      case "Rejected":
        return {
          label: "Rejected",
          color: "bg-hazard-bg text-hazard-text border-pebble",
        };
      default:
        return {
          label: status,
          color: "bg-stone text-ash border-pebble",
        };
    }
  };

  // Approve PO
  const handleApprovePO = (id: string) => {
    approvePurchaseOrder(id, currentUser?.name || "Finance Manager");
    toast.success("Purchase order approved!");
    if (selectedPO?.id === id) {
      setSelectedPO((prev) => (prev ? { ...prev, status: "Approved" } : null));
    }
  };

  // Reject PO
  const handleRejectPO = (id: string) => {
    const reason = prompt("Enter reason for rejection:") || "Budget limit exceeded";
    rejectPurchaseOrder(id, reason);
    toast.warning("Purchase order marked as rejected.");
    if (selectedPO?.id === id) {
      setSelectedPO((prev) => (prev ? { ...prev, status: "Rejected" } : null));
    }
  };

  // Open Generate Bill Modal
  const handleOpenGenerateBill = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setBillAmount(String(po.amount));
    setBillNumber(`BILL-${Date.now().toString().slice(-4)}`);
    setShowBillModal(true);
  };

  // Submit Generate Bill
  const handleCreateBillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO) return;

    const amt = parseFloat(billAmount) || selectedPO.amount;
    const bill = createBillFromPO(selectedPO.id, amt, billNumber.trim());

    if (bill) {
      toast.success(`Supplier Bill ${bill.billNumber} created successfully from PO ${selectedPO.poNumber}!`);
      setShowBillModal(false);
      setSelectedPO(null);
    }
  };

  // Submit Create PO
  const handleCreatePOSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(newQty) || 1;
    const rate = parseFloat(newUnitPrice) || 0;
    const totalAmount = qty * rate;

    if (totalAmount <= 0) {
      toast.warning("Please enter a valid quantity and unit price.");
      return;
    }

    const proj =
      projects.find((p) => p.id === newProjectId) || projects[0];
    const site =
      sites.find((s) => s.id === newSiteId) || sites[0];
    const job =
      jobs.find((j) => j.id === newJobId) || jobs[0];

    if (!supplierName.trim()) {
      toast.warning("Please enter a supplier name.");
      return;
    }

    if (!proj || !site || !job) {
      toast.warning("Please select a valid Project, Site, and Job.");
      return;
    }

    addPurchaseOrder({
      poNumber: "",
      organizationId: currentUser?.companyId || "ORG-DEFAULT",
      supplierId: `SUP-${supplierName.toUpperCase().replace(/\s+/g, "")}`,
      supplierName: supplierName.trim(),
      projectId: proj.id,
      projectName: proj.name,
      siteId: site.id,
      siteName: site.name,
      jobId: job.id,
      jobTitle: job.title,
      amount: totalAmount,
      category: newCategory,
      status: userCanApprove ? "Approved" : "Pending Approval",
      orderDate: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      items: [
        {
          id: `poi-${Date.now()}`,
          description: newItemDesc || "Materials",
          quantity: qty,
          unitPrice: rate,
          amount: totalAmount,
        },
      ],
      notes: newNotes,
      createdBy: currentUser?.name || "Finance Manager",
      createdById: currentUser?.id ? String(currentUser.id) : "user-fm",
      approvedBy: userCanApprove ? currentUser?.name || "Finance Manager" : undefined,
      approvedAt: userCanApprove
        ? new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : undefined,
    });

    toast.success("Purchase Order created successfully!");
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-onyx tracking-tight">
            Purchase Orders (PO)
          </h2>
          <p className="text-body text-ash mt-0.5">
            Manage procurement orders connected directly to jobs, sites, and suppliers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-[10px] bg-forest hover:bg-forest-hover text-white px-4 py-2.5 text-sm font-medium shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Create Purchase Order</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3.5 rounded-[12px] border border-pebble shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {[
              { key: "ALL", label: "All POs" },
              { key: "PENDING", label: "Pending Approval" },
              { key: "APPROVED", label: "Approved" },
              { key: "BILLED", label: "Billed" },
              { key: "REJECTED", label: "Rejected" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-[8px] text-xs font-medium transition cursor-pointer shrink-0 ${
                  statusFilter === tab.key
                    ? "bg-onyx text-white shadow-2xs font-semibold"
                    : "bg-stone text-ash hover:bg-mist hover:text-onyx"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <Search className="h-3.5 w-3.5 text-ash absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search PO, supplier, job, site..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs text-onyx placeholder:text-ash bg-stone rounded-[8px] border border-pebble outline-none focus:border-onyx transition"
            />
          </div>
        </div>

        {/* Cascaded Context Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-pebble/60 text-xs">
          {/* Project Filter */}
          <div className="flex items-center gap-2">
            <span className="text-ash font-medium shrink-0">Project:</span>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full bg-stone border border-pebble rounded-[6px] px-2.5 py-1 text-onyx outline-none focus:border-onyx"
            >
              <option value="ALL">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Site Filter */}
          <div className="flex items-center gap-2">
            <span className="text-ash font-medium shrink-0">Site:</span>
            <select
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
              className="w-full bg-stone border border-pebble rounded-[6px] px-2.5 py-1 text-onyx outline-none focus:border-onyx"
            >
              <option value="ALL">All Sites</option>
              {sites.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Job Filter */}
          <div className="flex items-center gap-2">
            <span className="text-ash font-medium shrink-0">Job:</span>
            <select
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
              className="w-full bg-stone border border-pebble rounded-[6px] px-2.5 py-1 text-onyx outline-none focus:border-onyx"
            >
              <option value="ALL">All Jobs</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.id} - {j.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* PO Contextual Table */}
      <div className="rounded-[12px] bg-white border border-pebble overflow-x-auto shadow-2xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-pebble bg-stone text-eyebrow font-semibold text-ash uppercase tracking-wider">
              <th className="p-3.5">PO #</th>
              <th className="p-3.5">Supplier</th>
              <th className="p-3.5">Project</th>
              <th className="p-3.5">Job Context</th>
              <th className="p-3.5">Site Yard</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5 text-right">Amount</th>
              <th className="p-3.5 text-center">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-pebble text-body text-onyx">
            {filteredPOs.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-12 text-center text-ash text-xs">
                  No purchase orders found matching the selected filters.
                </td>
              </tr>
            ) : (
              filteredPOs.map((po) => {
                const badge = getStatusBadge(po.status);
                return (
                  <tr
                    key={po.id}
                    className="hover:bg-stone/50 transition cursor-pointer group"
                    onClick={() => setSelectedPO(po)}
                  >
                    <td className="p-3.5 font-bold text-onyx">
                      <span className="group-hover:text-forest transition">
                        {po.poNumber}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium">{po.supplierName}</td>
                    <td className="p-3.5 text-ash">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-ash shrink-0" />
                        <span className="truncate max-w-[140px]">
                          {po.projectName}
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-onyx text-xs">
                        {po.jobId}
                      </div>
                      <div className="text-[11px] text-ash truncate max-w-[150px]">
                        {po.jobTitle}
                      </div>
                    </td>
                    <td className="p-3.5 text-ash">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-ash shrink-0" />
                        <span className="truncate max-w-[120px]">
                          {po.siteName}
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-mist border border-pebble text-onyx">
                        {po.category}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-bold text-onyx">
                      {formatCurrency(po.amount)}
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-eyebrow font-semibold border ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div
                        className="flex items-center justify-end gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {po.status === "Approved" && (
                          <button
                            type="button"
                            onClick={() => handleOpenGenerateBill(po)}
                            className="bg-forest hover:bg-forest-hover text-white rounded-[6px] px-2.5 py-1 text-eyebrow font-medium cursor-pointer shadow-2xs transition"
                          >
                            Bill
                          </button>
                        )}
                        {po.status === "Pending Approval" && userCanApprove && (
                          <button
                            type="button"
                            onClick={() => handleApprovePO(po.id)}
                            className="bg-forest hover:bg-forest-hover text-white rounded-[6px] px-2.5 py-1 text-eyebrow font-medium cursor-pointer shadow-2xs transition"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedPO(po)}
                          className="border border-pebble rounded-[6px] px-2.5 py-1 text-eyebrow font-medium text-onyx bg-white hover:bg-mist cursor-pointer transition"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ========================================================================= */}
      {/* PO DETAIL MODAL                                                           */}
      {/* ========================================================================= */}
      {selectedPO && !showBillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-onyx/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-[18px] bg-white p-6 shadow-2xl border border-pebble animate-in zoom-in-95 duration-150 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedPO(null)}
              className="absolute right-4 top-4 rounded-[8px] p-1.5 text-ash hover:bg-mist hover:text-onyx transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="flex items-start justify-between border-b border-pebble pb-4 pr-8">
              <div>
                <span className="text-eyebrow font-semibold tracking-wider text-forest uppercase">
                  PURCHASE ORDER
                </span>
                <h3 className="text-2xl font-black text-onyx mt-0.5">
                  {selectedPO.poNumber}
                </h3>
                <p className="text-xs text-ash mt-1">
                  Supplier:{" "}
                  <strong className="text-onyx">{selectedPO.supplierName}</strong>{" "}
                  • Category: {selectedPO.category}
                </p>
              </div>

              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                  getStatusBadge(selectedPO.status).color
                }`}
              >
                {getStatusBadge(selectedPO.status).label}
              </span>
            </div>

            {/* Context Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
              <div className="p-3 bg-stone rounded-[10px] border border-pebble">
                <span className="text-[10px] font-semibold text-ash uppercase block">
                  PROJECT
                </span>
                <p className="text-xs font-bold text-onyx mt-1 truncate">
                  {selectedPO.projectName}
                </p>
                <span className="text-[10px] text-ash">{selectedPO.projectId}</span>
              </div>

              <div className="p-3 bg-stone rounded-[10px] border border-pebble">
                <span className="text-[10px] font-semibold text-ash uppercase block">
                  SITE YARD
                </span>
                <p className="text-xs font-bold text-onyx mt-1 truncate">
                  {selectedPO.siteName}
                </p>
                <span className="text-[10px] text-ash">{selectedPO.siteId}</span>
              </div>

              <div className="p-3 bg-stone rounded-[10px] border border-pebble">
                <span className="text-[10px] font-semibold text-ash uppercase block">
                  JOB ASSIGNMENT
                </span>
                <p className="text-xs font-bold text-onyx mt-1 truncate">
                  {selectedPO.jobId}
                </p>
                <span className="text-[10px] text-ash truncate block">
                  {selectedPO.jobTitle}
                </span>
              </div>

              <div className="p-3 bg-stone rounded-[10px] border border-pebble">
                <span className="text-[10px] font-semibold text-ash uppercase block">
                  ORDER DATE
                </span>
                <p className="text-xs font-bold text-onyx mt-1">
                  {selectedPO.orderDate}
                </p>
                <span className="text-[10px] text-ash">
                  Created by {selectedPO.createdBy}
                </span>
              </div>
            </div>

            {/* Total Amount Pill */}
            <div className="p-4 bg-mist/60 rounded-[12px] border border-pebble mb-5 flex items-center justify-between">
              <div>
                <span className="text-xs text-ash font-medium block">
                  Total Order Amount
                </span>
                <span className="text-2xl font-black text-onyx mt-0.5 block">
                  {formatCurrency(selectedPO.amount)}
                </span>
              </div>
              {selectedPO.approvedBy && (
                <div className="text-right text-xs">
                  <span className="text-success-text font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Approved
                  </span>
                  <span className="text-ash block text-[11px] mt-0.5">
                    By {selectedPO.approvedBy} on {selectedPO.approvedAt}
                  </span>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="border border-pebble rounded-[10px] overflow-hidden mb-5">
              <table className="w-full text-xs">
                <thead className="bg-stone border-b border-pebble font-semibold text-ash">
                  <tr>
                    <th className="p-2.5 text-left">Item Description</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Unit Price</th>
                    <th className="p-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pebble">
                  {(selectedPO.items || []).map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-medium text-onyx">
                        {it.description}
                      </td>
                      <td className="p-2.5 text-center text-ash">{it.quantity}</td>
                      <td className="p-2.5 text-right text-ash">
                        {formatCurrency(it.unitPrice)}
                      </td>
                      <td className="p-2.5 text-right font-bold text-onyx">
                        {formatCurrency(it.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedPO.notes && (
              <p className="text-xs text-ash italic mb-5">
                Note: {selectedPO.notes}
              </p>
            )}

            {/* Actions Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-pebble">
              <div className="flex items-center gap-2">
                {selectedPO.status === "Pending Approval" && userCanApprove && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleApprovePO(selectedPO.id)}
                      className="px-3 py-1.5 rounded-[8px] bg-forest text-white text-xs font-semibold hover:bg-forest-hover shadow-xs transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Approve PO</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRejectPO(selectedPO.id)}
                      className="px-3 py-1.5 rounded-[8px] border border-hazard text-hazard text-xs font-semibold hover:bg-hazard-bg transition cursor-pointer flex items-center gap-1.5"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Reject</span>
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPO(null)}
                  className="px-4 py-2 rounded-[8px] border border-pebble text-xs font-medium text-onyx hover:bg-stone transition cursor-pointer"
                >
                  Close
                </button>
                {selectedPO.status === "Approved" && (
                  <button
                    type="button"
                    onClick={() => handleOpenGenerateBill(selectedPO)}
                    className="px-4 py-2 rounded-[8px] bg-forest text-white text-xs font-semibold hover:bg-forest-hover shadow-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <FileCheck2 className="h-3.5 w-3.5" />
                    <span>Create Supplier Bill from PO</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GENERATE BILL MODAL                                                       */}
      {/* ========================================================================= */}
      {showBillModal && selectedPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-onyx/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-[18px] bg-white p-6 shadow-2xl border border-pebble animate-in zoom-in-95 duration-150 relative">
            <button
              type="button"
              onClick={() => setShowBillModal(false)}
              className="absolute right-4 top-4 rounded-[8px] p-1.5 text-ash hover:bg-mist hover:text-onyx transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-forest text-xs font-semibold uppercase">
              <FileCheck2 className="h-4 w-4" />
              <span>Record Supplier Bill</span>
            </div>
            <h3 className="text-lg font-bold text-onyx mt-1">
              Bill from PO {selectedPO.poNumber}
            </h3>
            <p className="text-xs text-ash mt-0.5">
              Supplier: {selectedPO.supplierName} • Job: {selectedPO.jobId}
            </p>

            <form onSubmit={handleCreateBillSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-onyx block mb-1">
                  Supplier Invoice / Bill Number *
                </label>
                <input
                  type="text"
                  required
                  value={billNumber}
                  onChange={(e) => setBillNumber(e.target.value)}
                  placeholder="e.g. BILL-001"
                  className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx focus:ring-1 focus:ring-onyx"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-onyx block mb-1">
                  Billed Amount ({currencySymbol}) *
                </label>
                <input
                  type="number"
                  required
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx focus:ring-1 focus:ring-onyx"
                />
                <span className="text-[11px] text-ash mt-1 block">
                  Original PO Amount: {formatCurrency(selectedPO.amount)}
                </span>
              </div>

              <div className="p-3 bg-stone rounded-[8px] border border-pebble text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-ash">Inherited Project:</span>
                  <span className="font-semibold text-onyx">{selectedPO.projectName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ash">Inherited Site:</span>
                  <span className="font-semibold text-onyx">{selectedPO.siteName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ash">Inherited Job:</span>
                  <span className="font-semibold text-onyx">{selectedPO.jobId}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-pebble mt-4">
                <button
                  type="button"
                  onClick={() => setShowBillModal(false)}
                  className="px-4 py-2 rounded-[8px] border border-pebble text-xs font-medium text-onyx hover:bg-stone transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-[8px] bg-forest text-white text-xs font-semibold hover:bg-forest-hover shadow-xs transition cursor-pointer"
                >
                  Generate Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE PO MODAL                                                           */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-onyx/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-[18px] bg-white p-6 shadow-2xl border border-pebble animate-in zoom-in-95 duration-150 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="absolute right-4 top-4 rounded-[8px] p-1.5 text-ash hover:bg-mist hover:text-onyx transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <span className="text-eyebrow font-semibold tracking-wider text-forest uppercase">
                NEW PROCUREMENT
              </span>
              <h3 className="text-lg font-bold text-onyx mt-0.5">
                Create Purchase Order
              </h3>
              <p className="text-xs text-ash mt-0.5">
                Lock in Organization → Project → Site → Job context for supplier procurement.
              </p>
            </div>

            <form onSubmit={handleCreatePOSubmit} className="mt-4 space-y-3.5">
              {/* Supplier */}
              <div>
                <label className="text-xs font-semibold text-onyx block mb-1">
                  Supplier / Vendor Name *
                </label>
                <input
                  type="text"
                  required
                  list="suppliersList"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="Enter supplier name"
                  className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx focus:ring-1 focus:ring-onyx"
                />
                <datalist id="suppliersList">
                  {suppliersList.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>

              {/* Project -> Site -> Job Cascading Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-xs font-semibold text-onyx block mb-1">
                    Project *
                  </label>
                  <select
                    value={newProjectId}
                    onChange={(e) => setNewProjectId(e.target.value)}
                    className="w-full h-9 rounded-[8px] border border-pebble bg-white px-2 text-xs text-onyx outline-none focus:border-onyx"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-onyx block mb-1">
                    Site *
                  </label>
                  <select
                    value={newSiteId}
                    onChange={(e) => setNewSiteId(e.target.value)}
                    className="w-full h-9 rounded-[8px] border border-pebble bg-white px-2 text-xs text-onyx outline-none focus:border-onyx"
                  >
                    {availableSites.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-onyx block mb-1">
                    Job *
                  </label>
                  <select
                    value={newJobId}
                    onChange={(e) => setNewJobId(e.target.value)}
                    className="w-full h-9 rounded-[8px] border border-pebble bg-white px-2 text-xs text-onyx outline-none focus:border-onyx"
                  >
                    {availableJobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.id} - {j.title.slice(0, 15)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-semibold text-onyx block mb-1">
                  Cost Category *
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as CostCategory)}
                  className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
                >
                  <option value="Materials">Materials</option>
                  <option value="Labour">Labour</option>
                  <option value="Subcontractor">Subcontractor</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Item Description */}
              <div>
                <label className="text-xs font-semibold text-onyx block mb-1">
                  Item Description *
                </label>
                <input
                  type="text"
                  required
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  placeholder="e.g. 25mm PVC Conduit Pipes"
                  className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
                />
              </div>

              {/* Quantity & Unit Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-onyx block mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    value={newQty}
                    onChange={(e) => setNewQty(e.target.value)}
                    placeholder="e.g. 150"
                    className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-onyx block mb-1">
                    Unit Price ({currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newUnitPrice}
                    onChange={(e) => setNewUnitPrice(e.target.value)}
                    placeholder="e.g. 2000"
                    className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
                  />
                </div>
              </div>

              {/* Calculated Total */}
              <div className="p-3 bg-mist/60 rounded-[8px] border border-pebble text-right">
                <span className="text-xs text-ash block">Total Order Amount:</span>
                <span className="text-lg font-black text-onyx block">
                  {formatCurrency(
                    (parseFloat(newQty) || 0) * (parseFloat(newUnitPrice) || 0)
                  )}
                </span>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-onyx block mb-1">
                  Procurement Notes
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Delivery needed by end of week"
                  className="w-full h-9 rounded-[8px] border border-pebble bg-white px-3 text-xs text-onyx outline-none focus:border-onyx"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-pebble">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-[8px] border border-pebble text-xs font-medium text-onyx hover:bg-stone transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-[8px] bg-forest text-white text-xs font-semibold hover:bg-forest-hover shadow-xs transition cursor-pointer"
                >
                  Create Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
