import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "LOST" | "CONVERTED";

export interface Lead {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  estimatedValue: number;
  location: string;
  requirement: string;
  source: string;
  status: LeadStatus;
  notes?: string;
  createdAt: string;
  timeline: {
    event: string;
    timestamp: string;
    completed: boolean;
  }[];
}

export type OpportunityStage = "NEW" | "QUALIFIED" | "PROPOSAL" | "NEGOTIATION" | "WON";

export interface Opportunity {
  id: string;
  title: string;
  leadId?: string;
  customerName: string;
  contactPerson: string;
  estimatedValue: number;
  expectedCloseDate: string;
  actualCloseDate?: string;
  stage: OpportunityStage;
  description?: string;
  owner: string;
  createCustomer?: boolean;
  createContact?: boolean;
  winReason?: string;
  winNotes?: string;
  handedOverToProject?: boolean;
  linkedProjectId?: string;
  createdAt: string;
}

export interface QuoteLineItem {
  id: number;
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

export type QuoteStatus = "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED";

export interface Quote {
  id: string;
  quoteNo: string;
  opportunityId: string;
  opportunityTitle: string;
  customerName: string;
  value: number;
  status: QuoteStatus;
  validUntil: string;
  sentOn?: string;
  lineItems: QuoteLineItem[];
  createdAt: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  location: string;
  client: string;
  budget: string;
  progress: number;
  status: "IN_PROGRESS" | "AT_RISK" | "COMPLETED";
  lead: string;
  due: string;
  sourceOpportunityId?: string;
  siteManagerId?: string;
  siteManagerName?: string;
}

interface LeadFlowState {
  leads: Lead[];
  opportunities: Opportunity[];
  quotes: Quote[];
  projects: ProjectItem[];

  // Lead actions
  addLead: (lead: Omit<Lead, "id" | "createdAt" | "timeline">) => Lead;
  updateLead: (id: string, data: Partial<Lead>) => void;
  deleteLead: (id: string) => void;

  // Conversion action (Step 3 -> 4)
  convertLeadToOpportunity: (
    leadId: string,
    data: {
      opportunityName: string;
      estimatedValue: number;
      expectedCloseDate: string;
      stage?: OpportunityStage;
      description?: string;
      createCustomer?: boolean;
      createContact?: boolean;
    }
  ) => Opportunity;

  // Delete opportunity
  deleteOpportunity: (id: string) => void;

  // Quote actions (Step 6 -> 7)
  createQuote: (
    opportunityId: string,
    data: {
      quoteNo?: string;
      validUntil: string;
      lineItems: QuoteLineItem[];
      status?: QuoteStatus;
    }
  ) => Quote;
  acceptQuote: (quoteId: string) => void;
  updateQuoteStatus: (quoteId: string, status: QuoteStatus) => void;
  deleteQuote: (quoteId: string) => void;

  // Handover action (Step 8)
  handoverToProject: (
    opportunityId: string,
    data?: {
      winReason?: string;
      winNotes?: string;
      projectManager?: string;
      siteManagerId?: string;
      siteManagerName?: string;
    }
  ) => ProjectItem;

  // Generic project actions
  addProject: (project: ProjectItem) => void;
  updateProject: (projectId: string, data: Partial<ProjectItem>) => void;
  deleteProject: (projectId: string) => void;

  // Purge & cleanup
  clearAllDummyData: () => void;
  resetAllLeadFlowData: () => void;
}

const defaultLeads: Lead[] = [];
const defaultOpportunities: Opportunity[] = [];
const defaultQuotes: Quote[] = [];
const defaultProjects: ProjectItem[] = [];

export const useLeadFlowStore = create<LeadFlowState>()(
  persist(
    (set, get) => ({
      leads: defaultLeads,
      opportunities: defaultOpportunities,
      quotes: defaultQuotes,
      projects: defaultProjects,

      addLead: (leadData) => {
        const id = `LEAD-${Math.floor(1000 + Math.random() * 9000)}`;
        const newLead: Lead = {
          ...leadData,
          id,
          createdAt: new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          timeline: [
            {
              event: "Lead created",
              timestamp: new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),
              completed: true,
            },
            { event: "Contacted", timestamp: "Pending", completed: false },
            { event: "Qualified", timestamp: "Pending", completed: false },
          ],
        };
        set((state) => ({ leads: [newLead, ...state.leads] }));
        return newLead;
      },

      updateLead: (id, data) => {
        set((state) => ({
          leads: state.leads.map((lead) =>
            lead.id === id ? { ...lead, ...data } : lead
          ),
        }));
      },

      deleteLead: (id) => {
        set((state) => ({
          leads: state.leads.filter((lead) => lead.id !== id),
        }));
      },

      convertLeadToOpportunity: (leadId, data) => {
        const lead = get().leads.find((l) => l.id === leadId);
        const oppId = `OPP-${Math.floor(100 + Math.random() * 900)}`;

        const newOpp: Opportunity = {
          id: oppId,
          title: data.opportunityName,
          leadId,
          customerName: lead?.companyName || "New Customer",
          contactPerson: lead?.contactPerson || "Lead Contact",
          estimatedValue: data.estimatedValue,
          expectedCloseDate: data.expectedCloseDate,
          stage: data.stage || "QUALIFIED",
          description: data.description || "",
          owner: "Dewald",
          createCustomer: data.createCustomer ?? true,
          createContact: data.createContact ?? true,
          createdAt: new Date().toISOString().split("T")[0],
        };

        set((state) => ({
          opportunities: [newOpp, ...state.opportunities],
          leads: state.leads.map((l) =>
            l.id === leadId
              ? {
                  ...l,
                  status: "CONVERTED",
                  timeline: [
                    ...l.timeline,
                    {
                      event: "Converted to Opportunity",
                      timestamp: new Date().toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                      completed: true,
                    },
                  ],
                }
              : l
          ),
        }));

        return newOpp;
      },

      deleteOpportunity: (id) => {
        set((state) => ({
          opportunities: state.opportunities.filter((o) => o.id !== id),
          quotes: state.quotes.filter((q) => q.opportunityId !== id),
        }));
      },

      createQuote: (opportunityId, data) => {
        const opp = get().opportunities.find((o) => o.id === opportunityId);
        const quoteNo = data.quoteNo || `Q-00${get().quotes.length + 12}`;
        const totalValue = data.lineItems.reduce((sum, item) => sum + item.amount, 0);

        const newQuote: Quote = {
          id: quoteNo,
          quoteNo,
          opportunityId,
          opportunityTitle: opp?.title || "New Opportunity",
          customerName: opp?.customerName || "Customer",
          value: totalValue,
          status: data.status || "SENT",
          validUntil: data.validUntil,
          sentOn: data.status === "SENT" ? new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }) : undefined,
          lineItems: data.lineItems,
          createdAt: new Date().toISOString().split("T")[0],
        };

        set((state) => ({
          quotes: [newQuote, ...state.quotes],
          opportunities: state.opportunities.map((o) =>
            o.id === opportunityId ? { ...o, stage: "PROPOSAL" } : o
          ),
        }));

        return newQuote;
      },

      acceptQuote: (quoteId) => {
        const quote = get().quotes.find((q) => q.id === quoteId);
        if (!quote) return;

        set((state) => ({
          quotes: state.quotes.map((q) =>
            q.id === quoteId ? { ...q, status: "ACCEPTED" } : q
          ),
          opportunities: state.opportunities.map((o) =>
            o.id === quote.opportunityId
              ? {
                  ...o,
                  stage: "WON",
                  actualCloseDate: new Date().toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }),
                  winReason: "Customer accepted quote",
                  winNotes: "Project awarded. Handover to Project Manager for execution.",
                }
              : o
          ),
        }));
      },

      updateQuoteStatus: (quoteId, status) => {
        set((state) => ({
          quotes: state.quotes.map((q) =>
            q.id === quoteId ? { ...q, status } : q
          ),
        }));
      },

      deleteQuote: (quoteId) => {
        set((state) => ({
          quotes: state.quotes.filter((q) => q.id !== quoteId && q.quoteNo !== quoteId),
        }));
      },

      handoverToProject: (opportunityId, data) => {
        const opp = get().opportunities.find((o) => o.id === opportunityId);
        const projectId = `PRJ-${Math.floor(100 + Math.random() * 900)}`;

        const newProject: ProjectItem = {
          id: projectId,
          name: opp?.title || "New Project",
          location: opp?.customerName ? `${opp.customerName} Site` : "Project Site",
          client: opp?.customerName || "Client",
          budget: opp?.estimatedValue
            ? `₹${opp.estimatedValue.toLocaleString("en-IN")}`
            : "₹0",
          progress: 0,
          status: "IN_PROGRESS",
          lead: data?.projectManager || "Project Lead",
          due: opp?.expectedCloseDate || "Ongoing",
          sourceOpportunityId: opportunityId,
          siteManagerId: data?.siteManagerId,
          siteManagerName: data?.siteManagerName,
        };

        set((state) => ({
          projects: [newProject, ...state.projects],
          opportunities: state.opportunities.map((o) =>
            o.id === opportunityId
              ? {
                  ...o,
                  stage: "WON",
                  handedOverToProject: true,
                  linkedProjectId: projectId,
                  winReason: data?.winReason || o.winReason || "Customer accepted quote",
                  winNotes: data?.winNotes || o.winNotes || "Project awarded. Handover to Project Manager for execution.",
                }
              : o
          ),
        }));

        return newProject;
      },

      addProject: (project) => {
        set((state) => ({
          projects: [project, ...state.projects],
        }));
      },

      updateProject: (projectId, data) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, ...data } : p
          ),
        }));
      },

      deleteProject: (projectId) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== projectId),
        }));
      },

      clearAllDummyData: () => {
        set((state) => ({
          leads: state.leads.filter((l) => !isDummyLead(l)),
          opportunities: state.opportunities.filter((o) => !isDummyOpportunity(o)),
          quotes: state.quotes.filter((q) => !isDummyQuote(q)),
          projects: state.projects.filter((p) => !isDummyProject(p)),
        }));
      },

      resetAllLeadFlowData: () => {
        set({
          leads: [],
          opportunities: [],
          quotes: [],
          projects: [],
        });
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem("mini-firma-lead-flow");
          } catch (e) {}
        }
      },
    }),
    {
      name: "mini-firma-lead-flow",
      version: 4,
      migrate: (persistedState: any, version: number) => {
        if (!persistedState) {
          return {
            leads: [],
            opportunities: [],
            quotes: [],
            projects: [],
          };
        }
        return {
          leads: Array.isArray(persistedState.leads)
            ? persistedState.leads.filter((l: any) => !isDummyLead(l))
            : [],
          opportunities: Array.isArray(persistedState.opportunities)
            ? persistedState.opportunities.filter((o: any) => !isDummyOpportunity(o))
            : [],
          quotes: Array.isArray(persistedState.quotes)
            ? persistedState.quotes.filter((q: any) => !isDummyQuote(q))
            : [],
          projects: Array.isArray(persistedState.projects)
            ? persistedState.projects.filter((p: any) => !isDummyProject(p))
            : [],
        };
      },
    }
  )
);

// Dummy detection helper functions (only exact matching specific historical dummy test names)
export const isDummyLead = (l: any): boolean => {
  if (!l) return false;
  const company = (l.companyName || "").trim().toLowerCase();
  const contact = (l.contactPerson || "").trim().toLowerCase();

  const dummyCompanies = [
    "famehouse makers",
    "test4",
    "renovation org",
    "plumbing fixers",
    "philips airline part",
  ];
  if (dummyCompanies.includes(company)) return true;

  const dummyContacts = [
    "jrd_sharma",
    "test4.1",
    "reno_org",
    "dummy_person",
    "mitchell santner",
    "8978455623",
  ];
  if (dummyContacts.includes(contact)) return true;

  return false;
};

export const isDummyOpportunity = (o: any): boolean => {
  if (!o) return false;
  const customer = (o.customerName || "").trim().toLowerCase();

  const dummyCustomers = [
    "famehouse makers",
    "test4",
    "renovation org",
    "plumbing fixers",
    "philips airline part",
  ];
  if (dummyCustomers.includes(customer)) return true;

  return false;
};

export const isDummyQuote = (q: any): boolean => {
  if (!q) return false;
  const customer = (q.customerName || "").trim().toLowerCase();

  const dummyCustomers = [
    "famehouse makers",
    "test4",
    "renovation org",
    "plumbing fixers",
    "philips airline part",
  ];
  if (dummyCustomers.includes(customer)) return true;

  return false;
};

export const isDummyProject = (p: any): boolean => {
  if (!p) return false;
  const client = (p.client || "").trim().toLowerCase();

  const dummyClients = [
    "famehouse makers",
    "test4",
    "renovation org",
    "plumbing fixers",
    "philips airline part",
  ];
  if (dummyClients.includes(client)) return true;

  return false;
};
