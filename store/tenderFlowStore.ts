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

export const sampleJobPhotos: JobPhoto[] = [];

export interface JobMaterial {
  id: string;
  name: string;
  quantity: string;
}

export interface JobNote {
  id: string;
  text: string;
  author: string;
  time: string;
}

export interface CrewMemberAssignment {
  id: string;
  name: string;
  role: string;
  contact: string;
  status: "On Site" | "Not Started" | "Travelling" | "Off Site";
  avatar?: string;
  initials: string;
}

export interface JobRFI {
  id: string;
  rfiNumber: string;
  title: string;
  raisedBy: string;
  date: string;
  priority: "High" | "Medium" | "Low";
  status: "Open" | "In Review" | "Resolved";
  response?: string;
}

export interface JobVariation {
  id: string;
  variationNumber: string;
  title: string;
  amount: number;
  date: string;
  status: "Approved" | "Pending PM Approval" | "Draft";
  impact: string;
}

export interface JobDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedDate: string;
  category: "Drawings" | "Specifications" | "Permits" | "Manuals";
  url?: string;
}

export interface JobSafetyItem {
  id: string;
  title: string;
  type: "PPE" | "Clearance" | "Incident" | "Hazard";
  status: "Compliant" | "Pending Check" | "Reported";
  details: string;
  date: string;
}

export interface JobPunchItem {
  id: string;
  title: string;
  location: string;
  severity: "High" | "Medium" | "Low";
  status: "Open" | "In Progress" | "Resolved";
  reportedDate: string;
}

export interface JobTimesheetEntry {
  id: string;
  workerName: string;
  role: string;
  date: string;
  hours: number;
  description: string;
}

export interface JobItem {
  id: string; // e.g. "JOB-401" or "J-001"
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
  timeSlot?: string;
  due: string;
  completed: boolean;
  status: "Scheduled" | "Travelling" | "On-site" | "In Progress" | "Completed" | "Upcoming" | "Cancelled";
  description?: string;
  assignedDate: string;
  tenderId?: string;
  photos?: JobPhoto[];
  siteManagerId?: string;
  siteManagerName?: string;
  client?: string;
  siteContact?: string;
  siteContactPhone?: string;
  safetyNotes?: string;
  materials?: JobMaterial[];
  notes?: JobNote[];
  crew?: CrewMemberAssignment[];
  rfis?: JobRFI[];
  variations?: JobVariation[];
  documents?: JobDocument[];
  safety?: JobSafetyItem[];
  punchLists?: JobPunchItem[];
  timesheets?: JobTimesheetEntry[];
  scopeOfWork?: string[];
  expectedDuration?: string;
  block?: string;
  progressPercent?: number;
  tasksCompletedCount?: number;
  tasksTotalCount?: number;
  hoursLogged?: number;
}

interface TenderFlowState {
  currentStep: TenderFlowStep;
  activeOpportunityId: string;
  activeTenderId: string;
  completeTenderFlow: () => void;

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
  awardTenderToSupplier: (tenderId: string, supplierId: string, awardAmount?: number) => void;
  assignJobToContractor: (data: {
    id?: string;
    jobId?: string;
    title: string;
    projectName: string;
    location: string;
    contractorId?: string;
    contractorName?: string;
    trade?: string;
    priority: "High" | "Medium" | "Low";
    due: string;
    description?: string;
    tenderId?: string;
    photos?: JobPhoto[];
    siteManagerId?: string;
    siteManagerName?: string;
  }) => string;
  toggleJob: (id: string) => void;
  updateJobStatus: (
    id: string,
    status: "Scheduled" | "Travelling" | "On-site" | "In Progress" | "Completed" | "Upcoming" | "Cancelled"
  ) => void;
  updateJob: (id: string, data: Partial<JobItem>) => void;
  addMaterialToJob: (jobId: string, material: { name: string; quantity: string }) => void;
  addNoteToJob: (jobId: string, note: { text: string; author: string }) => void;
  addCrewToJob: (jobId: string, crew: CrewMemberAssignment) => void;
  updateCrewStatus: (jobId: string, crewId: string, status: CrewMemberAssignment["status"]) => void;
  removeCrewFromJob: (jobId: string, crewId: string) => void;
  addRfiToJob: (jobId: string, rfi: Omit<JobRFI, "id">) => void;
  addVariationToJob: (jobId: string, variation: Omit<JobVariation, "id">) => void;
  addDocumentToJob: (jobId: string, doc: Omit<JobDocument, "id">) => void;
  addSafetyItemToJob: (jobId: string, item: Omit<JobSafetyItem, "id">) => void;
  addPunchItemToJob: (jobId: string, item: Omit<JobPunchItem, "id">) => void;
  addTimesheetToJob: (jobId: string, entry: Omit<JobTimesheetEntry, "id">) => void;
  requestSelfAssignment: (jobId: string, workerName: string, reason?: string) => void;
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
        const jobId = data.id || data.jobId || `JOB-${nextNum}`;
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
          assignee: data.contractorName || "Site Team",
          contractorId: data.contractorId,
          contractorName: data.contractorName,
          trade: data.trade,
          isContractorJob: Boolean(data.contractorId),
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
          photos: data.photos || [],
          siteManagerId: data.siteManagerId,
          siteManagerName: data.siteManagerName,
        };

        set((state) => ({
          jobs: [newJob, ...(state.jobs || []).filter((j) => j.id !== jobId)],
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
        set((state) => {
          const currentJobs = state.jobs || [];
          const exists = currentJobs.some((j) => j.id === id);
          if (exists) {
            return {
              jobs: currentJobs.map((j) =>
                j.id === id
                  ? {
                      ...j,
                      status,
                      completed: status === "Completed",
                    }
                  : j
              ),
            };
          } else {
            const newJob: JobItem = {
              id,
              title: "Site Execution Work",
              projectName: "FameHouse Makers Warehouse Project",
              location: "Site Zone 1",
              assignee: "Field Worker",
              isContractorJob: false,
              priority: "High",
              priorityColor: "bg-caution-bg text-caution-text border-pebble",
              due: "16 Sep 2026",
              completed: status === "Completed",
              status,
              assignedDate: "16 Sep 2026",
              photos: [],
              materials: [],
              notes: [],
            };
            return { jobs: [newJob, ...currentJobs] };
          }
        });
      },

      updateJob: (id, data) => {
        set((state) => ({
          jobs: (state.jobs || []).map((j) =>
            j.id === id ? { ...j, ...data } : j
          ),
        }));
      },

      addMaterialToJob: (jobId, material) => {
        const newMat = { id: `mat-${Date.now()}`, ...material };
        set((state) => {
          const currentJobs = state.jobs || [];
          const exists = currentJobs.some((j) => j.id === jobId);
          if (exists) {
            return {
              jobs: currentJobs.map((j) =>
                j.id === jobId
                  ? {
                      ...j,
                      materials: [...(j.materials || []), newMat],
                    }
                  : j
              ),
            };
          } else {
            const newJob: JobItem = {
              id: jobId,
              title: "Site Execution Work",
              projectName: "FameHouse Makers Warehouse Project",
              location: "Site Zone 1",
              assignee: "Field Worker",
              isContractorJob: false,
              priority: "High",
              priorityColor: "bg-caution-bg text-caution-text border-pebble",
              due: "16 Sep 2026",
              completed: false,
              status: "In Progress",
              assignedDate: "16 Sep 2026",
              photos: [],
              materials: [newMat],
              notes: [],
            };
            return { jobs: [newJob, ...currentJobs] };
          }
        });
      },

      addNoteToJob: (jobId, note) => {
        const newNoteItem = {
          id: `note-${Date.now()}`,
          text: note.text,
          author: note.author,
          time: new Date().toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        set((state) => {
          const currentJobs = state.jobs || [];
          const exists = currentJobs.some((j) => j.id === jobId);
          if (exists) {
            return {
              jobs: currentJobs.map((j) =>
                j.id === jobId
                  ? {
                      ...j,
                      notes: [...(j.notes || []), newNoteItem],
                    }
                  : j
              ),
            };
          } else {
            const newJob: JobItem = {
              id: jobId,
              title: "Site Execution Work",
              projectName: "FameHouse Makers Warehouse Project",
              location: "Site Zone 1",
              assignee: note.author || "Field Worker",
              isContractorJob: false,
              priority: "High",
              priorityColor: "bg-caution-bg text-caution-text border-pebble",
              due: "16 Sep 2026",
              completed: false,
              status: "In Progress",
              assignedDate: "16 Sep 2026",
              photos: [],
              materials: [],
              notes: [newNoteItem],
            };
            return { jobs: [newJob, ...currentJobs] };
          }
        });
      },

      addCrewToJob: (jobId, crew) => {
        set((state) => ({
          jobs: (state.jobs || []).map((j) =>
            j.id === jobId ? { ...j, crew: [...(j.crew || []), crew] } : j
          ),
        }));
      },

      updateCrewStatus: (jobId, crewId, status) => {
        set((state) => ({
          jobs: (state.jobs || []).map((j) =>
            j.id === jobId
              ? {
                  ...j,
                  crew: (j.crew || []).map((c) =>
                    c.id === crewId ? { ...c, status } : c
                  ),
                }
              : j
          ),
        }));
      },

      removeCrewFromJob: (jobId, crewId) => {
        set((state) => ({
          jobs: (state.jobs || []).map((j) =>
            j.id === jobId
              ? { ...j, crew: (j.crew || []).filter((c) => c.id !== crewId) }
              : j
          ),
        }));
      },

      addRfiToJob: (jobId, rfi) => {
        const newRfi: JobRFI = { id: `rfi-${Date.now()}`, ...rfi };
        set((state) => ({
          jobs: (state.jobs || []).map((j) =>
            j.id === jobId ? { ...j, rfis: [...(j.rfis || []), newRfi] } : j
          ),
        }));
      },

      addVariationToJob: (jobId, variation) => {
        const newVar: JobVariation = { id: `var-${Date.now()}`, ...variation };
        set((state) => ({
          jobs: (state.jobs || []).map((j) =>
            j.id === jobId
              ? { ...j, variations: [...(j.variations || []), newVar] }
              : j
          ),
        }));
      },

      addDocumentToJob: (jobId, doc) => {
        const newDoc: JobDocument = { id: `doc-${Date.now()}`, ...doc };
        set((state) => ({
          jobs: (state.jobs || []).map((j) =>
            j.id === jobId
              ? { ...j, documents: [...(j.documents || []), newDoc] }
              : j
          ),
        }));
      },

      addSafetyItemToJob: (jobId, item) => {
        const newSafety: JobSafetyItem = { id: `safe-${Date.now()}`, ...item };
        set((state) => ({
          jobs: (state.jobs || []).map((j) =>
            j.id === jobId ? { ...j, safety: [...(j.safety || []), newSafety] } : j
          ),
        }));
      },

      addPunchItemToJob: (jobId, item) => {
        const newPunch: JobPunchItem = { id: `punch-${Date.now()}`, ...item };
        set((state) => ({
          jobs: (state.jobs || []).map((j) =>
            j.id === jobId
              ? { ...j, punchLists: [...(j.punchLists || []), newPunch] }
              : j
          ),
        }));
      },

      addTimesheetToJob: (jobId, entry) => {
        const newTs: JobTimesheetEntry = { id: `ts-${Date.now()}`, ...entry };
        set((state) => ({
          jobs: (state.jobs || []).map((j) =>
            j.id === jobId
              ? {
                  ...j,
                  timesheets: [...(j.timesheets || []), newTs],
                  hoursLogged: (j.hoursLogged || 0) + entry.hours,
                }
              : j
          ),
        }));
      },

      requestSelfAssignment: (jobId, workerName, reason) => {
        set((state) => ({
          jobs: (state.jobs || []).map((j) =>
            j.id === jobId
              ? {
                  ...j,
                  assignee: workerName,
                  notes: [
                    ...(j.notes || []),
                    {
                      id: `req-${Date.now()}`,
                      text: `Self-assignment requested by ${workerName}. Reason: ${reason || "Available to take on site tasks."} (Pending PM approval)`,
                      author: workerName,
                      time: new Date().toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                    },
                  ],
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
          title: photoData.title || photoData.caption || "Site Execution Photo",
          caption: photoData.caption || "Site execution progress update",
          locationTag: photoData.locationTag || "Site Zone 1",
          uploadedBy: photoData.uploadedBy || "Field Worker",
          initials: photoData.initials,
          role: photoData.role || "Field Worker",
          timestamp: photoData.timestamp || timeFormatted,
          date: photoData.date,
          time: photoData.time,
          stage: photoData.stage || "Progress",
          category: photoData.category || "In Progress",
          verified: false,
          notes: photoData.notes || "",
        };

        set((state) => {
          const currentJobs = state.jobs || [];
          const exists = currentJobs.some((j) => j.id === jobId);
          if (exists) {
            return {
              jobs: currentJobs.map((j) =>
                j.id === jobId
                  ? {
                      ...j,
                      photos: [newPhoto, ...(j.photos || [])],
                    }
                  : j
              ),
            };
          } else {
            const newJob: JobItem = {
              id: jobId,
              title: "Site Execution Work",
              projectName: "Site Execution Project",
              location: photoData.locationTag || "Site Location",
              assignee: photoData.uploadedBy || "Field Worker",
              isContractorJob: false,
              priority: "High",
              priorityColor: "bg-caution-bg text-caution-text border-pebble",
              due: "",
              completed: false,
              status: "In Progress",
              assignedDate: new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
              photos: [newPhoto],
              materials: [],
              notes: [],
            };
            return { jobs: [newJob, ...currentJobs] };
          }
        });
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
            const raw =
              localStorage.getItem(name) ||
              sessionStorage.getItem(name) ||
              sessionStorage.getItem("mini-firma-tender-flow-v2");
            if (raw) {
              const parsed = JSON.parse(raw);
              if (parsed?.state?.jobs && Array.isArray(parsed.state.jobs)) {
                // Keep all real user jobs
                parsed.state.jobs = parsed.state.jobs.filter(
                  (j: JobItem) => j && j.id && j.id !== "dummy-test-seed"
                );
              }
              return parsed;
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
          state.jobs = state.jobs
            .filter((j) => j && j.id && j.id !== "dummy-test-seed" && j.id !== "JOB-403")
            .map((j) => {
              return {
                ...j,
                photos: j.photos || [],
                materials: j.materials || [],
                notes: j.notes || [],
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
