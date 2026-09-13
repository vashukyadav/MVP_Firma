"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FirmaLayout from "@/components/layout/FirmaLayout";
import { db, type Customer } from "@/lib/db";
import {
  useLeadFlowStore,
  type Lead,
  type LeadStatus,
  type Opportunity,
  type OpportunityStage,
} from "@/store/leadFlowStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Target,
  Plus,
  Search,
  Building,
  Mail,
  Phone,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  X,
  User,
  Trash2,
  Edit2,
  Briefcase,
  Layers,
  MapPin,
  Calendar,
  Sparkles,
  Check,
  CheckSquare,
  Square,
  FileText,
  Activity,
  FolderPlus,
} from "lucide-react";

export default function LeadsPage() {
  const router = useRouter();
  const { leads, addLead, deleteLead, convertLeadToOpportunity } = useLeadFlowStore();

  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"Overview" | "Activities" | "Documents">("Overview");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertedOpportunity, setConvertedOpportunity] = useState<Opportunity | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Add Lead Form State
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newContactPerson, setNewContactPerson] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newEstimatedValue, setNewEstimatedValue] = useState("");
  const [newLocation, setNewLocation] = useState("Delhi NCR");
  const [newRequirement, setNewRequirement] = useState("");
  const [newSource, setNewSource] = useState("Website");
  const [newStatus, setNewStatus] = useState<LeadStatus>("NEW");
  const [newNotes, setNewNotes] = useState("");

  // Customer dropdown & auto-fill state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [isManualCompany, setIsManualCompany] = useState<boolean>(false);
  const [autoFilledCustomerName, setAutoFilledCustomerName] = useState<string | null>(null);

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
      const data = await db.customer.toArray();
      setCustomers(data);
    } catch (err) {
      console.error("Failed to load customers:", err);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (showAddModal) {
      loadCustomers();
    }
  }, [showAddModal]);

  const handleCustomerSelect = (customerIdVal: string) => {
    if (customerIdVal === "__NEW__") {
      setIsManualCompany(true);
      setSelectedCustomerId("__NEW__");
      setAutoFilledCustomerName(null);
      setNewCompanyName("");
      return;
    }

    setSelectedCustomerId(customerIdVal);

    if (!customerIdVal) {
      setAutoFilledCustomerName(null);
      setNewCompanyName("");
      setNewContactPerson("");
      setNewPhone("");
      setNewEmail("");
      setNewLocation("Delhi NCR");
      setNewNotes("");
      return;
    }

    const cust = customers.find((c) => String(c.id) === customerIdVal);
    if (cust) {
      setIsManualCompany(false);
      setNewCompanyName(cust.companyName || "");
      setNewContactPerson(cust.contactPerson || "");
      setNewPhone(cust.phone || "");
      setNewEmail(cust.email || "");
      setNewLocation(cust.address || "Delhi NCR");
      if (cust.notes) {
        setNewNotes(cust.notes);
      }
      if (!newRequirement && cust.industry) {
        setNewRequirement(`${cust.industry} Project`);
      }
      setAutoFilledCustomerName(cust.companyName);
    }
  };

  const resetAddForm = () => {
    setNewCompanyName("");
    setNewContactPerson("");
    setNewPhone("");
    setNewEmail("");
    setNewEstimatedValue("");
    setNewLocation("Delhi NCR");
    setNewRequirement("");
    setNewSource("Website");
    setNewStatus("NEW");
    setNewNotes("");
    setSelectedCustomerId("");
    setAutoFilledCustomerName(null);
    setIsManualCompany(false);
  };

  // Convert Modal Form State
  const [oppName, setOppName] = useState("");
  const [oppValue, setOppValue] = useState("");
  const [oppCloseDate, setOppCloseDate] = useState("2025-11-30");
  const [oppStage, setOppStage] = useState<OpportunityStage>("QUALIFIED");
  const [oppDescription, setOppDescription] = useState("");
  const [chkCreateCustomer, setChkCreateCustomer] = useState(true);
  const [chkCreateContact, setChkCreateContact] = useState(true);
  const [chkLinkOpportunity, setChkLinkOpportunity] = useState(true);

  const selectedLead = leads.find((l) => l.id === selectedLeadId);

  // Filtered Leads list
  const filteredLeads = leads.filter((l) => {
    const matchFilter = filter === "ALL" || l.status === filter;
    const matchSearch =
      l.companyName.toLowerCase().includes(search.toLowerCase()) ||
      l.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      l.location.toLowerCase().includes(search.toLowerCase()) ||
      l.source.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const getStatusBadge = (st: LeadStatus) => {
    switch (st) {
      case "QUALIFIED":
        return {
          label: "Qualified",
          color: "bg-clear-bg text-success-text border-pebble/70",
        };
      case "CONTACTED":
        return {
          label: "Contacted",
          color: "bg-sunfleck/80 text-onyx border-pebble/70",
        };
      case "NEW":
        return {
          label: "New",
          color: "bg-breath text-onyx border-pebble/70",
        };
      case "LOST":
        return {
          label: "Lost",
          color: "bg-hazard-bg text-hazard-text border-pebble/70",
        };
      case "CONVERTED":
        return {
          label: "Converted",
          color: "bg-forest/15 text-forest border-forest/30 font-semibold",
        };
      default:
        return {
          label: st,
          color: "bg-stone text-ash border-pebble/70",
        };
    }
  };

  // Open Convert Modal
  const handleOpenConvertModal = (lead: Lead) => {
    setOppName(`${lead.companyName} Warehouse Project`);
    setOppValue(lead.estimatedValue.toString());
    setOppCloseDate("2025-11-30");
    setOppStage("QUALIFIED");
    setOppDescription(
      `${lead.requirement || "Construction project"} in ${lead.location}. Customer ready for proposal.`
    );
    setChkCreateCustomer(true);
    setChkCreateContact(true);
    setChkLinkOpportunity(true);
    setShowConvertModal(true);
  };

  // Perform Conversion (Step 3 -> Step 4)
  const handlePerformConversion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    const numVal = parseInt(oppValue.replace(/[^0-9]/g, ""), 10) || selectedLead.estimatedValue;
    const opp = convertLeadToOpportunity(selectedLead.id, {
      opportunityName: oppName,
      estimatedValue: numVal,
      expectedCloseDate: oppCloseDate,
      stage: oppStage,
      description: oppDescription,
      createCustomer: chkCreateCustomer,
      createContact: chkCreateContact,
    });

    setConvertedOpportunity(opp);
    setShowConvertModal(false);
    setShowSuccessModal(true);
  };

  // Create New Lead
  const handleCreateNewLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName || !newContactPerson) {
      alert("Please provide Company Name and Contact Person.");
      return;
    }

    const numVal = parseInt(newEstimatedValue.replace(/[^0-9]/g, ""), 10) || 1500000;
    addLead({
      companyName: newCompanyName,
      contactPerson: newContactPerson,
      phone: newPhone || "+91 98765 00000",
      email: newEmail || "contact@client.com",
      estimatedValue: numVal,
      location: newLocation,
      requirement: newRequirement || "Commercial Project",
      source: newSource,
      status: newStatus,
      notes: newNotes,
    });

    setShowAddModal(false);
    resetAddForm();
  };

  return (
    <FirmaLayout activeNav="Leads">
      <div className="space-y-6 mt-2">
        {/* ========================================================================= */}
        {/* 1. LEADS LIST VIEW (Step 1 in Flow)                                       */}
        {/* ========================================================================= */}
        {!selectedLead && (
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
              <div>
                <span className="text-eyebrow font-semibold tracking-wider text-ash uppercase">
                  SALES &amp; PIPELINE
                </span>
                <h1 className="text-display-h1 font-bold text-onyx mt-0.5 tracking-tight flex items-center gap-2.5">
                  <Target className="h-6 w-6 text-forest" />
                  <span>Leads</span>
                </h1>
                <p className="text-sm text-ash mt-1">
                  View and manage all leads with their status.
                </p>
              </div>

              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-forest hover:bg-forest-hover text-white rounded-[10px] px-4.5 py-2.5 text-sm font-medium shadow-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Lead</span>
              </Button>
            </div>

            {/* Filter & Search Bar matching Figma/Step 1 */}
            <div className="rounded-[10px] bg-white p-3 border border-pebble/70 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
              <div className="relative w-full sm:w-80">
                <Search className="h-4 w-4 text-ash absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-9.5 pl-9 pr-3 text-sm text-onyx placeholder:text-ash bg-stone rounded-[8px] border border-pebble outline-none focus:border-forest focus:ring-2 focus:ring-forest/20 transition"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="h-9.5 rounded-[8px] border border-pebble bg-white px-3.5 text-xs font-semibold text-onyx shadow-2xs outline-none transition focus:border-forest cursor-pointer"
                >
                  <option value="ALL">All Status</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="NEW">New</option>
                  <option value="LOST">Lost</option>
                  <option value="CONVERTED">Converted</option>
                </select>
              </div>
            </div>

            {/* Leads Table matching Step 1 layout */}
            <div className="rounded-[10px] bg-white border border-pebble/70 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-onyx">
                  <thead>
                    <tr className="border-b border-pebble bg-stone/70 text-xs font-semibold text-ash uppercase tracking-wider">
                      <th className="py-3 px-4 w-12">#</th>
                      <th className="py-3 px-4">Company / Name</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Value</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pebble/60">
                    {filteredLeads.map((item, idx) => {
                      const badge = getStatusBadge(item.status);
                      return (
                        <tr key={item.id} className="hover:bg-stone/60 transition">
                          <td className="py-3.5 px-4 text-ash font-medium text-xs">
                            {idx + 1}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-onyx">
                            {item.companyName}
                          </td>
                          <td className="py-3.5 px-4 text-ash font-medium">
                            {item.contactPerson}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-onyx">
                            ₹ {item.estimatedValue.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.color}`}
                            >
                              {badge.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedLeadId(item.id)}
                              className="rounded-[6px] border-pebble text-xs font-medium px-3 py-1 hover:bg-breath hover:text-onyx cursor-pointer"
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredLeads.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-ash">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone text-ash">
                              <Target className="h-6 w-6" />
                            </div>
                            <p className="text-sm font-medium text-onyx">No leads found</p>
                            <p className="text-xs text-ash">
                              Click &quot;+ Add Lead&quot; above to capture a new prospect.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="p-3.5 border-t border-pebble/60 flex items-center justify-between text-xs text-ash">
                <span>
                  Showing {filteredLeads.length} of {leads.length} leads
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-forest text-white font-semibold">
                    1
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ========================================================================= */}
        {/* 2. LEAD DETAILS VIEW (Step 2 in Flow)                                     */}
        {/* ========================================================================= */}
        {selectedLead && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Back Button */}
            <button
              type="button"
              onClick={() => setSelectedLeadId(null)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-ash hover:text-onyx transition cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Leads</span>
            </button>

            {/* Header: Company Name, Status, Edit, Convert to Opportunity */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-pebble/60">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-onyx tracking-tight">
                  {selectedLead.companyName}
                </h1>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    getStatusBadge(selectedLead.status).color
                  }`}
                >
                  {getStatusBadge(selectedLead.status).label}
                </span>
              </div>

              <div className="flex items-center gap-2.5 self-start sm:self-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => alert("Edit lead details modal")}
                  className="rounded-[8px] border-pebble text-xs font-medium gap-1.5 px-3 py-2 cursor-pointer"
                >
                  <Edit2 className="h-3.5 w-3.5 text-ash" />
                  <span>Edit</span>
                </Button>

                {selectedLead.status !== "CONVERTED" ? (
                  <Button
                    onClick={() => handleOpenConvertModal(selectedLead)}
                    className="bg-forest hover:bg-forest-hover text-white rounded-[8px] text-xs font-semibold px-4 py-2 flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    <FolderPlus className="h-4 w-4" />
                    <span>Convert to Opportunity</span>
                  </Button>
                ) : (
                  <Button
                    onClick={() => router.push("/pipeline")}
                    className="bg-breath text-onyx rounded-[8px] text-xs font-semibold px-4 py-2 flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4 text-forest" />
                    <span>View in Pipeline</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Tabs: Overview, Activities, Documents */}
            <div className="flex items-center gap-2 border-b border-pebble/60 pb-1">
              {(["Overview", "Activities", "Documents"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-xs font-semibold rounded-[8px] transition cursor-pointer ${
                    activeTab === tab
                      ? "bg-white text-onyx border border-pebble shadow-2xs"
                      : "text-ash hover:text-onyx hover:bg-stone"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content: Grid matching Step 2 */}
            {activeTab === "Overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left (2 cols): Lead Information Card */}
                <div className="lg:col-span-2 rounded-[14px] bg-white border border-pebble/70 p-6 shadow-2xs space-y-6">
                  <h3 className="text-sm font-bold text-onyx uppercase tracking-wider">
                    Lead Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6 text-sm">
                    {/* Company Name */}
                    <div className="flex items-start gap-3">
                      <Building className="h-4 w-4 text-ash mt-0.5 shrink-0" />
                      <div>
                        <span className="text-xs font-medium text-ash block">
                          Company Name
                        </span>
                        <span className="font-semibold text-onyx">
                          {selectedLead.companyName}
                        </span>
                      </div>
                    </div>

                    {/* Contact Person */}
                    <div className="flex items-start gap-3">
                      <User className="h-4 w-4 text-ash mt-0.5 shrink-0" />
                      <div>
                        <span className="text-xs font-medium text-ash block">
                          Contact Person
                        </span>
                        <span className="font-semibold text-onyx">
                          {selectedLead.contactPerson}
                        </span>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-start gap-3">
                      <Phone className="h-4 w-4 text-ash mt-0.5 shrink-0" />
                      <div>
                        <span className="text-xs font-medium text-ash block">
                          Phone
                        </span>
                        <span className="font-semibold text-onyx">
                          {selectedLead.phone}
                        </span>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-start gap-3">
                      <Mail className="h-4 w-4 text-ash mt-0.5 shrink-0" />
                      <div>
                        <span className="text-xs font-medium text-ash block">
                          Email
                        </span>
                        <span className="font-semibold text-onyx">
                          {selectedLead.email}
                        </span>
                      </div>
                    </div>

                    {/* Estimated Value */}
                    <div className="flex items-start gap-3">
                      <span className="text-base font-bold text-forest shrink-0">
                        ₹
                      </span>
                      <div>
                        <span className="text-xs font-medium text-ash block">
                          Estimated Value
                        </span>
                        <span className="font-bold text-onyx text-base">
                          ₹ {selectedLead.estimatedValue.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-ash mt-0.5 shrink-0" />
                      <div>
                        <span className="text-xs font-medium text-ash block">
                          Location
                        </span>
                        <span className="font-semibold text-onyx">
                          {selectedLead.location}
                        </span>
                      </div>
                    </div>

                    {/* Requirement */}
                    <div className="flex items-start gap-3">
                      <Briefcase className="h-4 w-4 text-ash mt-0.5 shrink-0" />
                      <div>
                        <span className="text-xs font-medium text-ash block">
                          Requirement
                        </span>
                        <span className="font-semibold text-onyx">
                          {selectedLead.requirement}
                        </span>
                      </div>
                    </div>

                    {/* Source */}
                    <div className="flex items-start gap-3">
                      <Layers className="h-4 w-4 text-ash mt-0.5 shrink-0" />
                      <div>
                        <span className="text-xs font-medium text-ash block">
                          Source
                        </span>
                        <span className="font-semibold text-onyx">
                          {selectedLead.source}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="pt-4 border-t border-pebble/60">
                    <span className="text-xs font-semibold text-ash block uppercase tracking-wider">
                      Notes
                    </span>
                    <p className="text-sm text-onyx mt-1.5 leading-relaxed bg-stone/70 p-3.5 rounded-[10px] border border-pebble/60">
                      {selectedLead.notes || "No extra notes provided."}
                    </p>
                  </div>
                </div>

                {/* Right (1 col): Status & Timeline Card */}
                <div className="rounded-[14px] bg-white border border-pebble/70 p-6 shadow-2xs space-y-5 self-start">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-onyx uppercase tracking-wider">
                      Status &amp; Timeline
                    </h3>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
                        getStatusBadge(selectedLead.status).color
                      }`}
                    >
                      {getStatusBadge(selectedLead.status).label}
                    </span>
                  </div>

                  {/* Vertical Stepper Timeline */}
                  <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-pebble">
                    {selectedLead.timeline.map((step, idx) => (
                      <div key={idx} className="relative">
                        <div
                          className={`absolute -left-6 top-0.5 h-4 w-4 rounded-full border-2 border-white flex items-center justify-center ${
                            step.completed
                              ? "bg-forest text-white"
                              : "bg-pebble text-ash"
                          }`}
                        >
                          {step.completed && <Check className="h-2.5 w-2.5" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-onyx leading-tight">
                            {step.event}
                          </p>
                          <p className="text-[11px] text-ash mt-0.5">
                            {step.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedLead.status !== "CONVERTED" && (
                    <div className="pt-3 border-t border-pebble/60">
                      <Button
                        onClick={() => handleOpenConvertModal(selectedLead)}
                        className="w-full bg-forest hover:bg-forest-hover text-white rounded-[10px] py-2.5 text-xs font-semibold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        <FolderPlus className="h-4 w-4" />
                        <span>Convert to Opportunity</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "Activities" && (
              <div className="rounded-[14px] bg-white border border-pebble/70 p-6 shadow-2xs text-center text-ash text-sm py-12">
                <Activity className="h-8 w-8 mx-auto text-ash mb-2" />
                <p className="font-semibold text-onyx">Activity Log</p>
                <p className="text-xs text-ash mt-1">
                  Calls, meetings, and follow-ups logged for {selectedLead.companyName}.
                </p>
              </div>
            )}

            {activeTab === "Documents" && (
              <div className="rounded-[14px] bg-white border border-pebble/70 p-6 shadow-2xs text-center text-ash text-sm py-12">
                <FileText className="h-8 w-8 mx-auto text-ash mb-2" />
                <p className="font-semibold text-onyx">Client Documents &amp; Drawings</p>
                <p className="text-xs text-ash mt-1">
                  Site plans, CAD drawings, or BOQs attached to this lead.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. CONVERT TO OPPORTUNITY MODAL (Step 3 in Flow)                          */}
        {/* ========================================================================= */}
        {showConvertModal && selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="relative w-full max-w-xl rounded-[18px] bg-white p-6 sm:p-7 shadow-2xl border border-pebble max-h-[92vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-pebble/60">
                <div>
                  <h2 className="text-lg font-bold text-onyx flex items-center gap-2">
                    <Target className="h-5 w-5 text-forest" />
                    <span>Convert Lead to Opportunity</span>
                  </h2>
                  <p className="text-xs text-ash mt-0.5">
                    Fill details and create opportunity from this lead.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowConvertModal(false)}
                  className="p-1.5 rounded-[8px] text-ash hover:text-onyx hover:bg-stone transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Lead Context Pill */}
              <div className="mt-4 rounded-[10px] bg-stone border border-pebble/70 p-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-breath text-onyx font-bold text-sm shrink-0">
                  <Building className="h-4 w-4 text-forest" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-onyx truncate">
                    {selectedLead.companyName}
                  </h4>
                  <div className="text-[11px] text-ash flex items-center gap-2 mt-0.5 flex-wrap">
                    <span>Contact: {selectedLead.contactPerson}</span>
                    <span>•</span>
                    <span>Value: ₹ {selectedLead.estimatedValue.toLocaleString("en-IN")}</span>
                    <span>•</span>
                    <span className="font-semibold text-success-text">Status: Qualified</span>
                  </div>
                </div>
              </div>

              {/* Form inputs */}
              <form onSubmit={handlePerformConversion} className="mt-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-onyx">
                      Opportunity Name <span className="text-hazard">*</span>
                    </Label>
                    <Input
                      value={oppName}
                      onChange={(e) => setOppName(e.target.value)}
                      placeholder="e.g. ABC Warehouse Project"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-onyx">
                      Estimated Value (₹) <span className="text-hazard">*</span>
                    </Label>
                    <Input
                      value={oppValue}
                      onChange={(e) => setOppValue(e.target.value)}
                      placeholder="e.g. 2000000"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-onyx">
                      Expected Close Date <span className="text-hazard">*</span>
                    </Label>
                    <Input
                      type="date"
                      value={oppCloseDate}
                      onChange={(e) => setOppCloseDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-onyx">
                      Pipeline Stage <span className="text-hazard">*</span>
                    </Label>
                    <select
                      value={oppStage}
                      onChange={(e) => setOppStage(e.target.value as OpportunityStage)}
                      className="h-10 w-full rounded-[10px] border border-pebble bg-white px-3 text-sm text-onyx shadow-2xs outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20 cursor-pointer"
                    >
                      <option value="NEW">New</option>
                      <option value="QUALIFIED">Qualified</option>
                      <option value="PROPOSAL">Proposal</option>
                      <option value="NEGOTIATION">Negotiation</option>
                      <option value="WON">Won</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-onyx">
                    Description
                  </Label>
                  <textarea
                    rows={3}
                    value={oppDescription}
                    onChange={(e) => setOppDescription(e.target.value)}
                    placeholder="Warehouse construction project in Delhi. Customer ready for proposal."
                    className="w-full rounded-[10px] border border-pebble bg-white p-3 text-sm text-onyx placeholder:text-ash shadow-2xs outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20"
                  />
                </div>

                {/* 3 Action Checkboxes matching Step 3 in reference image */}
                <div className="space-y-2 pt-2 border-t border-pebble/60">
                  <label className="flex items-center gap-2.5 text-xs text-onyx font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={chkCreateCustomer}
                      onChange={(e) => setChkCreateCustomer(e.target.checked)}
                      className="h-4 w-4 rounded-[4px] accent-forest cursor-pointer"
                    />
                    <span>Create Customer (if not exists)</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-onyx font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={chkCreateContact}
                      onChange={(e) => setChkCreateContact(e.target.checked)}
                      className="h-4 w-4 rounded-[4px] accent-forest cursor-pointer"
                    />
                    <span>Create Contact (if not exists)</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-onyx font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={chkLinkOpportunity}
                      onChange={(e) => setChkLinkOpportunity(e.target.checked)}
                      className="h-4 w-4 rounded-[4px] accent-forest cursor-pointer"
                    />
                    <span>Link this opportunity with the lead</span>
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-pebble/60">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowConvertModal(false)}
                    className="px-4 text-xs font-medium"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-forest hover:bg-forest-hover text-white px-5 text-xs font-semibold shadow-xs"
                  >
                    Convert
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. CONVERSION SUCCESS MODAL (Step 4 in Flow)                              */}
        {/* ========================================================================= */}
        {showSuccessModal && convertedOpportunity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-md rounded-[20px] bg-white p-7 sm:p-8 shadow-2xl border border-pebble text-center space-y-5">
              {/* Green Circle Check Icon */}
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-clear-bg text-success border border-success/30 shadow-xs">
                <Check className="h-8 w-8 stroke-[3]" />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-onyx tracking-tight">
                  Lead Converted Successfully!
                </h3>
                <p className="text-xs text-ash mt-2 leading-relaxed">
                  Opportunity &quot;
                  <span className="font-semibold text-onyx">
                    {convertedOpportunity.title}
                  </span>
                  &quot; has been created in your pipeline.
                </p>
              </div>

              {/* Action Buttons matching Step 4 */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button
                  onClick={() => router.push("/pipeline")}
                  className="w-full sm:w-auto bg-forest hover:bg-forest-hover text-white rounded-[10px] px-5 py-2.5 text-xs font-semibold shadow-xs cursor-pointer"
                >
                  View Opportunity
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSuccessModal(false);
                    setSelectedLeadId(null);
                  }}
                  className="w-full sm:w-auto rounded-[10px] border-pebble text-xs font-medium px-5 py-2.5 cursor-pointer"
                >
                  Back to Leads
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ADD NEW LEAD MODAL                                                        */}
        {/* ========================================================================= */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="relative w-full max-w-lg rounded-[18px] bg-white p-6 sm:p-7 shadow-2xl border border-pebble">
              <div className="flex items-center justify-between pb-4 border-b border-pebble/60">
                <div>
                  <h2 className="text-lg font-bold text-onyx flex items-center gap-2">
                    <Target className="h-5 w-5 text-forest" />
                    <span>Add New Lead</span>
                  </h2>
                  <p className="text-xs text-ash mt-0.5">
                    Capture inbound project inquiry and prospective client details.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetAddForm();
                  }}
                  className="p-1.5 rounded-[8px] text-ash hover:text-onyx hover:bg-stone transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateNewLead} className="mt-5 space-y-4">
                {/* Auto-fill notification banner */}
                {autoFilledCustomerName && (
                  <div className="flex items-center justify-between rounded-[10px] bg-clear-bg/90 border border-success/30 px-3.5 py-2 text-xs text-success-text animate-in fade-in duration-150">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                      <span>
                        Auto-filled from customer: <strong className="font-bold">{autoFilledCustomerName}</strong> (Contact, Phone, Email, Location)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={resetAddForm}
                      className="text-[11px] font-semibold text-ash hover:text-onyx underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-onyx">
                        Company Name <span className="text-hazard">*</span>
                      </Label>
                      {customers.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const nextManual = !isManualCompany;
                            setIsManualCompany(nextManual);
                            if (nextManual) {
                              setSelectedCustomerId("__NEW__");
                            } else {
                              setSelectedCustomerId("");
                              setAutoFilledCustomerName(null);
                            }
                          }}
                          className="text-[11px] font-medium text-forest hover:underline cursor-pointer"
                        >
                          {isManualCompany ? "📋 Select Customer" : "✏️ Type New"}
                        </button>
                      )}
                    </div>

                    {/* Company Dropdown or Input */}
                    {isManualCompany || customers.length === 0 ? (
                      <Input
                        value={newCompanyName}
                        onChange={(e) => setNewCompanyName(e.target.value)}
                        placeholder="e.g. ABC Construction"
                        required
                        autoFocus
                      />
                    ) : (
                      <select
                        value={selectedCustomerId}
                        onChange={(e) => handleCustomerSelect(e.target.value)}
                        className="h-10 w-full rounded-[10px] border border-pebble bg-white px-3 text-sm text-onyx shadow-2xs outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20 cursor-pointer"
                        required
                      >
                        <option value="">-- Select Customer Company --</option>
                        {customers.map((c) => (
                          <option key={c.id} value={String(c.id)}>
                            {c.companyName} ({c.contactPerson})
                          </option>
                        ))}
                        <option value="__NEW__">➕ Type Other / New Company Manually</option>
                      </select>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-onyx">
                      Contact Person <span className="text-hazard">*</span>
                    </Label>
                    <Input
                      value={newContactPerson}
                      onChange={(e) => setNewContactPerson(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-onyx">
                      Phone Number
                    </Label>
                    <Input
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-onyx">
                      Email Address
                    </Label>
                    <Input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="rahul@abc.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-onyx">
                      Estimated Value (₹)
                    </Label>
                    <Input
                      value={newEstimatedValue}
                      onChange={(e) => setNewEstimatedValue(e.target.value)}
                      placeholder="e.g. 2000000"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-onyx">
                      Location
                    </Label>
                    <Input
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="e.g. Delhi NCR"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-onyx">
                      Requirement
                    </Label>
                    <Input
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      placeholder="e.g. Warehouse project"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-onyx">
                      Source
                    </Label>
                    <select
                      value={newSource}
                      onChange={(e) => setNewSource(e.target.value)}
                      className="h-10 w-full rounded-[10px] border border-pebble bg-white px-3 text-sm text-onyx shadow-2xs outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20 cursor-pointer"
                    >
                      <option value="Website">Website</option>
                      <option value="Referral">Referral</option>
                      <option value="Tender">Tender</option>
                      <option value="Direct">Direct</option>
                      <option value="Architect">Architect</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-onyx">
                    Initial Status
                  </Label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as LeadStatus)}
                    className="h-10 w-full rounded-[10px] border border-pebble bg-white px-3 text-sm text-onyx shadow-2xs outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20 cursor-pointer"
                  >
                    <option value="NEW">New</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="QUALIFIED">Qualified</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-onyx">
                    Notes
                  </Label>
                  <Input
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Customer is interested. Budget confirmed..."
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-pebble/60">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddModal(false);
                      resetAddForm();
                    }}
                    className="px-4 text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-forest hover:bg-forest-hover text-white px-5 text-xs font-semibold shadow-xs"
                  >
                    Create Lead
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </FirmaLayout>
  );
}
