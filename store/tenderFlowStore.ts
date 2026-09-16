import { create } from "zustand";
import { persist } from "zustand/middleware";

export type OpportunityStage = "Won" | "Proposal" | "Negotiation" | "Lost" | "Open";

export interface ProjectOpportunity {
  id: string;
  projectName: string;
  client: string;
  value: number;
  stage: OpportunityStage;
  location: string;
  expectedStart: string;
  description: string;
}

export interface SupplierItem {
  id: string;
  name: string;
  trade: string;
  email: string;
  phone?: string;
  selected: boolean;
}

export interface BidItem {
  id: string;
  tenderId: string;
  supplierId: string;
  supplierName: string;
  quotationAmount: number;
  deliveryTime: string;
  paymentTerms: string;
  remarks: string;
  submittedOn: string;
  status: "Received" | "Shortlisted" | "Awarded" | "Rejected";
  isRecommended?: boolean;
}

export type TenderStatus = "Draft" | "Open" | "Awarded" | "Cancelled";

export interface TenderItem {
  id: string;
  opportunityId: string;
  projectName: string;
  title: string;
  category: string;
  description: string;
  estimatedValue: number;
  submissionDeadline: string;
  status: TenderStatus;
  rfqSuppliers: string[]; // supplier ids
  awardedSupplierId?: string;
  awardedSupplierName?: string;
  awardedAmount?: number;
  awardDate?: string;
  budgetAllocated?: boolean;
  createdAt: string;
}

export type TenderFlowStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface AwardedContractor {
  id: string; // e.g. "CON-SUP-01"
  supplierId: string;
  name: string;
  trade: string;
  email: string;
  phone: string;
  tenderId: string;
  tenderTitle: string;
  projectName: string;
  opportunityId?: string;
  awardedAmount: number;
  awardDate: string;
  deliveryTime?: string;
  paymentTerms?: string;
  status: "Awarded" | "Mobilized" | "Active" | "Completed";
  assignedJobsCount: number;
}

export interface JobPhoto {
  id: string;
  url: string;
  title?: string;
  caption?: string;
  locationTag?: string;
  uploadedBy: string;
  initials?: string;
  role?: string;
  timestamp: string;
  date?: string;
  time?: string;
  stage?: string;
  category?: "In Progress" | "Completed / Inspection" | "Issue / Snag" | "Safety";
  verified?: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
}

export const sampleJobPhotos: JobPhoto[] = [
  {
    id: "photo-figma-1",
    title: "Cable tray installation",
    locationTag: "Level 2 – Electrical Room",
    uploadedBy: "Rahul Kumar",
    initials: "RK",
    role: "Field Worker",
    timestamp: "16 Sep 2025 11:32 AM",
    date: "16 Sep 2025",
    time: "11:32 AM",
    stage: "Cable Tray & Containment",
    category: "In Progress",
    verified: true,
    verifiedBy: "PM_Dinesh",
    verifiedAt: "16 Sep 2025 12:00 PM",
    url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
    caption: "Cable tray installation along ceiling in Level 2 Electrical Room.",
  },
  {
    id: "photo-figma-2",
    title: "Main distribution panel",
    locationTag: "Electrical Room",
    uploadedBy: "Rahul Kumar",
    initials: "RK",
    role: "Field Worker",
    timestamp: "16 Sep 2025 11:28 AM",
    date: "16 Sep 2025",
    time: "11:28 AM",
    stage: "Distribution Panel",
    category: "In Progress",
    verified: true,
    verifiedBy: "PM_Dinesh",
    verifiedAt: "16 Sep 2025 11:45 AM",
    url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
    caption: "Main distribution panel wiring and busbar terminations completed.",
  },
  {
    id: "photo-figma-3",
    title: "Conduit work",
    locationTag: "Level 1 – Corridor",
    uploadedBy: "Amit Singh",
    initials: "AS",
    role: "Contractor Worker",
    timestamp: "15 Sep 2025 04:15 PM",
    date: "15 Sep 2025",
    time: "04:15 PM",
    stage: "Conduit & Piping",
    category: "In Progress",
    verified: false,
    url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
    caption: "Conduit pipe bending and saddle installations along Level 1 Corridor ceiling.",
  },
  {
    id: "photo-figma-4",
    title: "Socket installation",
    locationTag: "Office Area – Zone B",
    uploadedBy: "Amit Singh",
    initials: "AS",
    role: "Contractor Worker",
    timestamp: "15 Sep 2025 03:50 PM",
    date: "15 Sep 2025",
    time: "03:50 PM",
    stage: "Second Fix Sockets",
    category: "Completed / Inspection",
    verified: false,
    url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
    caption: "Twin 13A switched sockets installed on Office Area – Zone B wall.",
  },
  {
    id: "photo-figma-5",
    title: "Light fitting installation",
    locationTag: "Main Hall",
    uploadedBy: "Rahul Kumar",
    initials: "RK",
    role: "Field Worker",
    timestamp: "14 Sep 2025 02:10 PM",
    date: "14 Sep 2025",
    time: "02:10 PM",
    stage: "Lighting Fixtures",
    category: "In Progress",
    verified: false,
    url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    caption: "Linear industrial lighting fixtures installed and suspended in Main Hall.",
  },
];

export interface JobItem {
  id: string; // e.g. "JOB-401"
  title: string;
  projectName: string;
  location: string;
  assignee: string;
  contractorId?: string;
  contractorName?: string;
  trade?: string;
  isContractorJob: boolean;
  priority: "High" | "Medium" | "Low";
  priorityColor: string;
  startDate?: string;
  endDate?: string;
  due: string;
  completed: boolean;
  status: "Scheduled" | "In Progress" | "Completed";
  description?: string;
  assignedDate: string;
  tenderId?: string;
  photos?: JobPhoto[];
}

interface TenderFlowState {
  currentStep: TenderFlowStep;
  activeOpportunityId: string;
  activeTenderId: string;

  opportunities: ProjectOpportunity[];
  tenders: TenderItem[];
  suppliers: SupplierItem[];
  bids: BidItem[];
  contractors: AwardedContractor[];
  jobs: JobItem[];

  // Navigation actions
  setStep: (step: TenderFlowStep) => void;
  setActiveOpportunity: (id: string) => void;
  setActiveTender: (id: string) => void;
  completeTenderFlow: () => void;

  // Flow actions
  createOpportunity: (opp: Omit<ProjectOpportunity, "id">) => string;
  createTender: (data: {
    opportunityId: string;
    projectName: string;
    title: string;
    category: string;
    description: string;
    estimatedValue: number;
    submissionDeadline: string;
  }) => string;
  addSupplier: (data: { name: string; trade: string; email: string; phone?: string }) => string;
  toggleSupplierSelection: (supplierId: string) => void;
  sendRfqToSelectedSuppliers: (tenderId: string) => void;
  awardTenderToSupplier: (tenderId: string, supplierId: string) => void;
  assignJobToContractor: (data: {
    title: string;
    projectName: string;
    location: string;
    contractorId: string;
    contractorName: string;
    trade?: string;
    priority: "High" | "Medium" | "Low";
    due: string;
    description?: string;
    tenderId?: string;
    photos?: JobPhoto[];
  }) => string;
  toggleJob: (id: string) => void;
  updateJobStatus: (id: string, status: "Scheduled" | "In Progress" | "Completed") => void;
  addPhotoToJob: (
    jobId: string,
    photo: Omit<JobPhoto, "id" | "timestamp"> & { timestamp?: string }
  ) => void;
  deletePhotoFromJob: (jobId: string, photoId: string) => void;
  verifyJobPhoto: (
    jobId: string,
    photoId: string,
    verified: boolean,
    verifiedBy?: string
  ) => void;
  addContractor: (data: {
    name: string;
    trade: string;
    email: string;
    phone?: string;
    projectName: string;
    tenderTitle?: string;
    awardedAmount: number;
    deliveryTime?: string;
  }) => string;
  seedSampleProjectBidders: () => void;
  resetFlowToDefault: () => void;
}

const defaultOpportunities: ProjectOpportunity[] = [];
const defaultSuppliers: SupplierItem[] = [];
const defaultTenders: TenderItem[] = [];
const defaultBids: BidItem[] = [];
const defaultContractors: AwardedContractor[] = [];

export const defaultJobs: JobItem[] = [];

export const useTenderFlowStore = create<TenderFlowState>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      activeOpportunityId: "",
      activeTenderId: "",

      opportunities: defaultOpportunities,
      tenders: defaultTenders,
      suppliers: defaultSuppliers,
      bids: defaultBids,
      contractors: defaultContractors,
      jobs: defaultJobs,

      setStep: (step) => set({ currentStep: step }),

      setActiveOpportunity: (id) => {
        set({ activeOpportunityId: id });
      },

      setActiveTender: (id) => {
        set({ activeTenderId: id });
      },

      createOpportunity: (data) => {
        const id = `OPP-00${get().opportunities.length + 1}`;
        const newOpp: ProjectOpportunity = {
          ...data,
          id,
        };
        set((state) => ({
          opportunities: [newOpp, ...state.opportunities],
          activeOpportunityId: id,
        }));
        return id;
      },

      createTender: (data) => {
        const id = `T-00${get().tenders.length + 1}`;
        const newTender: TenderItem = {
          id,
          opportunityId: data.opportunityId,
          projectName: data.projectName,
          title: data.title,
          category: data.category,
          description: data.description,
          estimatedValue: data.estimatedValue,
          submissionDeadline: data.submissionDeadline,
          status: "Draft",
          rfqSuppliers: [],
          createdAt: new Date().toISOString().split("T")[0],
        };
        set((state) => ({
          tenders: [newTender, ...state.tenders],
          activeTenderId: id,
          currentStep: 4,
        }));
        return id;
      },

      addSupplier: (data) => {
        const id = `SUP-${String(get().suppliers.length + 1).padStart(2, "0")}`;
        const newSupplier: SupplierItem = {
          id,
          name: data.name,
          trade: data.trade,
          email: data.email,
          selected: true,
        };
        set((state) => ({
          suppliers: [...state.suppliers, newSupplier],
        }));
        return id;
      },

      toggleSupplierSelection: (supplierId) => {
        set((state) => ({
          suppliers: state.suppliers.map((s) =>
            s.id === supplierId ? { ...s, selected: !s.selected } : s
          ),
        }));
      },

      sendRfqToSelectedSuppliers: (tenderId) => {
        const selectedSuppliers = get().suppliers.filter((s) => s.selected);
        const selectedSupplierIds = selectedSuppliers.map((s) => s.id);
        const tender = get().tenders.find((t) => t.id === tenderId);
        const estValue = tender ? tender.estimatedValue : 250000;

        // Automatically prepare received bids for selected suppliers
        const existingBids = get().bids.filter((b) => b.tenderId === tenderId);
        let newBids = [...get().bids];

        if (existingBids.length === 0 && selectedSuppliers.length > 0) {
          const generatedBids: BidItem[] = selectedSuppliers.map((sup, idx) => {
            // Price variance: first is close to estimate, second is best value, third is slightly higher
            const variance = idx === 0 ? 1 : idx === 1 ? 0.88 : 1.08;
            const quotationAmount = Math.round((estValue * variance) / 1000) * 1000;
            return {
              id: `BID-${Date.now()}-${idx + 1}`,
              tenderId,
              supplierId: sup.id,
              supplierName: sup.name,
              quotationAmount,
              deliveryTime: `${20 + idx * 5} days`,
              paymentTerms: idx === 1 ? "20% advance" : "30% advance",
              remarks: idx === 1 ? "Best value" : idx === 0 ? "Good" : "Higher cost",
              submittedOn: new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
              status: "Received",
              isRecommended: idx === 1 || selectedSuppliers.length === 1,
            };
          });
          newBids = [...newBids, ...generatedBids];
        }

        set((state) => ({
          tenders: state.tenders.map((t) =>
            t.id === tenderId
              ? {
                  ...t,
                  status: "Open",
                  rfqSuppliers: selectedSupplierIds,
                }
              : t
          ),
          bids: newBids,
          currentStep: 6,
        }));
      },

      awardTenderToSupplier: (tenderId, supplierId) => {
        const tender = get().tenders.find((t) => t.id === tenderId);
        const bid = get().bids.find(
          (b) => b.tenderId === tenderId && b.supplierId === supplierId
        );
        const supplier = get().suppliers.find((s) => s.id === supplierId);

        const awardAmount = bid ? bid.quotationAmount : tender?.estimatedValue || 0;
        const supplierName = supplier ? supplier.name : "Contractor Partner";

        const todayFormatted = new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        const contractorId = `CON-${supplierId}`;
        const newContractor: AwardedContractor = {
          id: contractorId,
          supplierId,
          name: supplierName,
          trade: supplier?.trade || tender?.category || "Specialty Contractor",
          email:
            supplier?.email ||
            `${supplierName.toLowerCase().replace(/\s+/g, ".")}@crew-firma.com`,
          phone: supplier?.phone || "+91 98102 34567",
          tenderId,
          tenderTitle: tender?.title || "Tender Work Package",
          projectName: tender?.projectName || "Project Site",
          opportunityId: tender?.opportunityId || "",
          awardedAmount: awardAmount,
          awardDate: todayFormatted,
          deliveryTime: bid?.deliveryTime || "20 days",
          paymentTerms: bid?.paymentTerms || "20% advance",
          status: "Awarded",
          assignedJobsCount: 0,
        };

        const existingContractors = (get().contractors || []).filter(
          (c) => !(c.tenderId === tenderId && c.supplierId === supplierId)
        );

        set((state) => ({
          tenders: state.tenders.map((t) =>
            t.id === tenderId
              ? {
                  ...t,
                  status: "Awarded",
                  awardedSupplierId: supplierId,
                  awardedSupplierName: supplierName,
                  awardedAmount: awardAmount,
                  awardDate: todayFormatted,
                  budgetAllocated: true,
                }
              : t
          ),
          bids: state.bids.map((b) =>
            b.tenderId === tenderId
              ? {
                  ...b,
                  status: b.supplierId === supplierId ? "Awarded" : "Rejected",
                }
              : b
          ),
          contractors: [newContractor, ...existingContractors],
          currentStep: 8,
        }));
      },

      assignJobToContractor: (data) => {
        const nextNum = (get().jobs || []).length + 401;
        const jobId = `JOB-${nextNum}`;
        const priorityColors = {
          High: "bg-hazard-bg text-hazard-text border-pebble",
          Medium: "bg-caution-bg text-caution-text border-pebble",
          Low: "bg-clear-bg text-success-text border-pebble",
        };

        const newJob: JobItem = {
          id: jobId,
          title: data.title,
          projectName: data.projectName,
          location: data.location,
          assignee: data.contractorName,
          contractorId: data.contractorId,
          contractorName: data.contractorName,
          trade: data.trade,
          isContractorJob: true,
          priority: data.priority,
          priorityColor: priorityColors[data.priority] || priorityColors.Medium,
          due: data.due || "Next Week",
          completed: false,
          status: "Scheduled",
          description: data.description,
          assignedDate: new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          tenderId: data.tenderId,
          photos: data.photos || sampleJobPhotos,
        };

        set((state) => ({
          jobs: [newJob, ...(state.jobs || [])],
          contractors: (state.contractors || []).map((c) =>
            c.id === data.contractorId
              ? { ...c, assignedJobsCount: (c.assignedJobsCount || 0) + 1, status: "Active" }
              : c
          ),
        }));

        return jobId;
      },

      toggleJob: (id) => {
        set((state) => ({
          jobs: (state.jobs || []).map((j) =>
            j.id === id
              ? {
                  ...j,
                  completed: !j.completed,
                  status: !j.completed ? "Completed" : "In Progress",
                }
              : j
          ),
        }));
      },

      updateJobStatus: (id, status) => {
        set((state) => ({
          jobs: (state.jobs || []).map((j) =>
            j.id === id
              ? {
                  ...j,
                  status,
                  completed: status === "Completed",
                }
              : j
          ),
        }));
      },

      addPhotoToJob: (jobId, photoData) => {
        const photoId = `PHOTO-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        const now = new Date();
        const timeFormatted = `${now.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        })}, ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;

        const newPhoto: JobPhoto = {
          id: photoId,
          url: photoData.url,
          caption: photoData.caption || "Site execution progress update",
          uploadedBy: photoData.uploadedBy || "Amit Verma (Field Worker)",
          role: photoData.role || "Field Worker",
          timestamp: photoData.timestamp || timeFormatted,
          category: photoData.category || "In Progress",
          verified: false,
          notes: photoData.notes || "",
        };

        set((state) => ({
          jobs: (state.jobs || []).map((j) =>
            j.id === jobId
              ? {
                  ...j,
                  photos: [newPhoto, ...(j.photos || [])],
                }
              : j
          ),
        }));
      },

      deletePhotoFromJob: (jobId, photoId) => {
        set((state) => ({
          jobs: (state.jobs || []).map((j) =>
            j.id === jobId
              ? {
                  ...j,
                  photos: (j.photos || []).filter((p) => p.id !== photoId),
                }
              : j
          ),
        }));
      },

      verifyJobPhoto: (jobId, photoId, verified, verifiedBy) => {
        const now = new Date();
        const timeFormatted = `${now.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        })}, ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;

        set((state) => ({
          jobs: (state.jobs || []).map((j) =>
            j.id === jobId
              ? {
                  ...j,
                  photos: (j.photos || []).map((p) =>
                    p.id === photoId
                      ? {
                          ...p,
                          verified,
                          verifiedBy: verified ? verifiedBy || "Project Manager" : undefined,
                          verifiedAt: verified ? timeFormatted : undefined,
                        }
                      : p
                  ),
                }
              : j
          ),
        }));
      },

      addContractor: (data) => {
        const id = `CON-${Date.now()}`;
        const supId = `SUP-${Date.now()}`;
        const newContractor: AwardedContractor = {
          id,
          supplierId: supId,
          name: data.name,
          trade: data.trade,
          email: data.email,
          phone: data.phone || "+91 98102 34567",
          tenderId: `T-DIR-${Date.now().toString().slice(-4)}`,
          tenderTitle: data.tenderTitle || `${data.trade} Work Package`,
          projectName: data.projectName,
          awardedAmount: data.awardedAmount,
          awardDate: new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          deliveryTime: data.deliveryTime || "20 days",
          status: "Awarded",
          assignedJobsCount: 0,
        };

        const newSupplier: SupplierItem = {
          id: supId,
          name: data.name,
          trade: data.trade,
          email: data.email,
          phone: data.phone || "+91 98102 34567",
          selected: false,
        };

        set((state) => ({
          contractors: [newContractor, ...(state.contractors || [])],
          suppliers: state.suppliers.some(
            (s) => s.name.toLowerCase() === data.name.toLowerCase()
          )
            ? state.suppliers
            : [...state.suppliers, newSupplier],
        }));

        return id;
      },

      seedSampleProjectBidders: () => {
        const opp = get().opportunities[0] || {
          id: "OPP-001",
          projectName: "Skyline Corporate Tower",
          client: "Skyline Realty Ltd",
          value: 5000000,
          stage: "Won" as const,
          location: "Sector 62, Noida",
          expectedStart: "01 Oct 2026",
          description: "High-rise commercial construction project.",
        };

        const tenderId = "T-001";
        const tender: TenderItem = {
          id: tenderId,
          opportunityId: opp.id,
          projectName: opp.projectName,
          title: "Electrical & Lighting Work Package",
          category: "Electrical",
          description: "Full HT/LT substation, conduits, distribution panels and smart lighting.",
          estimatedValue: 1250000,
          submissionDeadline: "30 Sep 2026",
          status: "Open",
          rfqSuppliers: ["SUP-01", "SUP-02", "SUP-03"],
          createdAt: "10 Sep 2026",
        };

        const sampleSuppliers: SupplierItem[] = [
          { id: "SUP-01", name: "Sharma Electrical Works", trade: "Electrical", email: "sharma.elec@gmail.com", selected: true },
          { id: "SUP-02", name: "Apex Power Solutions", trade: "Electrical", email: "contact@apexpower.in", selected: true },
          { id: "SUP-03", name: "Modern Wire & Cables Co", trade: "Electrical", email: "sales@modernwire.com", selected: true },
          { id: "SUP-04", name: "QuickFix Plumbing Services", trade: "Plumbing", email: "info@quickfixplumbing.com", selected: false },
        ];

        const sampleBids: BidItem[] = [
          {
            id: "BID-101",
            tenderId,
            supplierId: "SUP-01",
            supplierName: "Sharma Electrical Works",
            quotationAmount: 1180000,
            deliveryTime: "25 days",
            paymentTerms: "20% advance, balance on milestones",
            remarks: "Best value & experienced site team",
            submittedOn: "12 Sep 2026",
            status: "Received",
            isRecommended: true,
          },
          {
            id: "BID-102",
            tenderId,
            supplierId: "SUP-02",
            supplierName: "Apex Power Solutions",
            quotationAmount: 1240000,
            deliveryTime: "30 days",
            paymentTerms: "25% advance",
            remarks: "Standard industry pricing",
            submittedOn: "13 Sep 2026",
            status: "Received",
          },
          {
            id: "BID-103",
            tenderId,
            supplierId: "SUP-03",
            supplierName: "Modern Wire & Cables Co",
            quotationAmount: 1320000,
            deliveryTime: "35 days",
            paymentTerms: "30% advance",
            remarks: "Premium grade copper cabling",
            submittedOn: "14 Sep 2026",
            status: "Received",
          },
        ];

        set((state) => ({
          opportunities: state.opportunities.length > 0 ? state.opportunities : [opp],
          tenders: state.tenders.length > 0 ? state.tenders : [tender],
          suppliers: state.suppliers.length > 0 ? state.suppliers : sampleSuppliers,
          bids: state.bids.length > 0 ? state.bids : sampleBids,
        }));
      },

      completeTenderFlow: () => {
        set({
          currentStep: 1,
          activeOpportunityId: "",
          activeTenderId: "",
        });
      },

      resetFlowToDefault: () => {
        set((state) => ({
          currentStep: 1,
          activeOpportunityId: "",
          activeTenderId: "",
          suppliers: (state.suppliers || []).map((s) => ({
            ...s,
            selected: false,
          })),
        }));
      },
    }),
    {
      name: "mini-firma-tender-flow-v3",
      storage: {
        getItem: (name: string) => {
          if (typeof window === "undefined") return null;
          try {
            const localVal = localStorage.getItem(name);
            if (localVal) return JSON.parse(localVal);
            // Fallback to legacy sessionStorage if user had session data
            const sessionVal =
              sessionStorage.getItem("mini-firma-tender-flow-v2") ||
              sessionStorage.getItem(name);
            if (sessionVal) {
              try {
                localStorage.setItem(name, sessionVal);
                return JSON.parse(sessionVal);
              } catch {
                return JSON.parse(sessionVal);
              }
            }
          } catch (e) {
            console.error("Failed to read tender store:", e);
          }
          return null;
        },
        setItem: (name: string, value: unknown) => {
          if (typeof window === "undefined") return;
          try {
            localStorage.setItem(name, JSON.stringify(value));
          } catch (e) {
            console.error("Failed to save tender store:", e);
          }
        },
        removeItem: (name: string) => {
          if (typeof window === "undefined") return;
          try {
            localStorage.removeItem(name);
          } catch (e) {
            console.error("Failed to remove tender store:", e);
          }
        },
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (!state.jobs) {
          state.jobs = [];
        } else {
          // Remove any legacy dummy mock jobs
          const dummyJobIds = new Set([
            "JOB-401",
            "JOB-402",
            "JOB-403",
            "JOB-404",
            "JOB-405",
            "JOB-406",
          ]);
          state.jobs = state.jobs.filter(
            (j) => !dummyJobIds.has(j.id) || j.isContractorJob
          ).map((j) => {
            return {
              ...j,
              startDate: j.startDate || "15 Sep 2025",
              endDate: j.endDate || "30 Sep 2025",
              photos: (!j.photos || j.photos.length < 5) ? sampleJobPhotos : j.photos,
            };
          });
        }
        if (state.tenders && state.tenders.length > 0) {
          const awardedTenders = state.tenders.filter(
            (t) => t.status === "Awarded" && t.awardedSupplierId
          );
          const currentTenderIds = new Set(
            (state.contractors || []).map((c) => c.tenderId)
          );
          const missing: AwardedContractor[] = [];

          for (const tender of awardedTenders) {
            if (!currentTenderIds.has(tender.id)) {
              const supplier = (state.suppliers || []).find(
                (s) => s.id === tender.awardedSupplierId
              );
              const bid = (state.bids || []).find(
                (b) =>
                  b.tenderId === tender.id &&
                  b.supplierId === tender.awardedSupplierId
              );
              missing.push({
                id: `CON-${tender.awardedSupplierId}`,
                supplierId: tender.awardedSupplierId!,
                name:
                  tender.awardedSupplierName ||
                  supplier?.name ||
                  "Contractor Partner",
                trade: supplier?.trade || tender.category || "Specialty Trade",
                email:
                  supplier?.email ||
                  `${(tender.awardedSupplierName || "contractor")
                    .toLowerCase()
                    .replace(/\s+/g, ".")}@crew-firma.com`,
                phone: supplier?.phone || "+91 98102 34567",
                tenderId: tender.id,
                tenderTitle: tender.title,
                projectName: tender.projectName,
                opportunityId: tender.opportunityId,
                awardedAmount: tender.awardedAmount || tender.estimatedValue,
                awardDate: tender.awardDate || "14 Sep 2026",
                deliveryTime: bid?.deliveryTime || "20 days",
                paymentTerms: bid?.paymentTerms || "20% advance",
                status: "Awarded",
                assignedJobsCount: (state.jobs || []).filter(
                  (j) => j.contractorId === `CON-${tender.awardedSupplierId}`
                ).length,
              });
            }
          }

          if (missing.length > 0) {
            state.contractors = [...missing, ...(state.contractors || [])];
          }
        }
      },
    }
  )
);
