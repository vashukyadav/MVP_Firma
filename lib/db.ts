import Dexie, { type Table } from "dexie";

export type UserRole =
  | "OWNER"
  | "ACCOUNT_ADMIN"
  | "SALES_MANAGER"
  | "PROJECT_MANAGER"
  | "FIELD_WORKER"
  | "FINANCE_MANAGER"
  | "SITE_MANAGER";


export interface User {
  id?: number;
  companyId: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  size: number;
}
export type PlanType =
  | "STARTER"
  | "PROFESSIONAL"
  | "ENTERPRISE";
export interface Company {
  userId: number;
  companyId: string;
  companyName: string;
  industry: string;
  companySize: string;
  website?: string;
  country: string;
  state: string;
  city: string;
  address: string;
}
export type EnquiryStatus =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "QUOTATION"
  | "WON"
  | "LOST";

export interface Enquiry {
  id?: number;
  companyId?: string;

  customerId: number;

  title: string;
  description?: string;

  source: string;

  estimatedValue?: number;

  expectedStartDate?: string;
  expectedEndDate?: string;

  status: EnquiryStatus;

  assignedTo?: number;

  notes?: string;

  createdAt: string;
  updatedAt: string;
}

export interface Onboarding {
  userId: number;
  companyId?: string;
  plan: PlanType;
  companyCompleted: boolean;
  billingCompleted: boolean;
}
export interface Customer {
  id?: number;
  companyId: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
  notes?: string;
}

export type CrewRole = "Field Worker" | "Site Manager" | "Office";
export type CrewStatus = "Active" | "On Leave" | "Inactive";

export interface CrewMemberRecord {
  id?: number;
  companyId: string;
  name: string;
  role: CrewRole;
  contact: string;
  status: CrewStatus;
  trade?: string;
  site?: string;
  email?: string;
  wageRate?: string;
  avatarBg?: string;
  joinedDate?: string;
  createdAt?: string;
}

export function generateCompanyId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomPart = "";
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ORG-${randomPart}`;
}

class FirmaDB extends Dexie {
  users!: Table<User, number>;
  onboarding!: Table<Onboarding, number>;
  company!: Table<Company, number>;
  customer!: Table<Customer, number>;
  enquiry!: Table<Enquiry, number>;
  crew!: Table<CrewMemberRecord, number>;

  constructor() {
    super("MiniFIRMA");

    this.version(2).stores({
      users: "++id,email,size,role",
      onboarding: "userId,plan",
      company: "userId",
      customer: "++id,phone,email,companyName",
      enquiry: "++id,customerId,status,assignedTo,createdAt",
    });

    this.version(3)
      .stores({
        users: "++id,email,companyId,size,role",
        onboarding: "userId,companyId,plan",
        company: "userId,companyId",
        customer: "++id,companyId,phone,email,companyName",
        enquiry: "++id,companyId,customerId,status,assignedTo,createdAt",
      })
      .upgrade(async (tx) => {
        await tx.table("users").toCollection().modify((user: any) => {
          if (!user.companyId) {
            user.companyId = "ORG-DEFAULT";
          }
        });
        await tx.table("company").toCollection().modify((comp: any) => {
          if (!comp.companyId) {
            comp.companyId = "ORG-DEFAULT";
          }
        });
        await tx.table("customer").toCollection().modify((cust: any) => {
          if (!cust.companyId) {
            cust.companyId = "ORG-DEFAULT";
          }
        });
      });

    this.version(4).stores({
      users: "++id,email,companyId,size,role",
      onboarding: "userId,companyId,plan",
      company: "userId,companyId",
      customer: "++id,companyId,phone,email,companyName",
      enquiry: "++id,companyId,customerId,status,assignedTo,createdAt",
      crew: "++id,companyId,name,role,status,trade,site",
    });
  }
}

export const db = new FirmaDB();