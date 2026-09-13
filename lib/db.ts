import Dexie, { type Table } from "dexie";

export type UserRole =
  | "OWNER"
  | "ACCOUNT_ADMIN"
  | "SALES_MANAGER"
  | "PROJECT_MANAGER"
  | "FIELD_WORKER"
  | "FINANCE_MANAGER";


export interface User {
  id?: number;
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
  plan: PlanType;
  companyCompleted: boolean;
  billingCompleted: boolean;
}
export interface Customer {
  id?: number;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
  notes?: string;
}
class FirmaDB extends Dexie {
  users!: Table<User, number>;
  onboarding!: Table<Onboarding, number>;
  company!: Table<Company, number>;
  customer!: Table<Customer, number>;
  enquiry!: Table<Enquiry, number>;
  constructor() {
    super("MiniFIRMA");

    this.version(2).stores({
      users: "++id,email,size,role",
      onboarding: "userId,plan",
      company: "userId",
      customer: "++id,phone,email,companyName",
        enquiry: "++id,customerId,status,assignedTo,createdAt",
    });
  }
}

export const db = new FirmaDB();