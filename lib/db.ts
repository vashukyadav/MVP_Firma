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


export interface Onboarding {
  userId: number;
  plan: PlanType;
  companyCompleted: boolean;
  billingCompleted: boolean;
}


class FirmaDB extends Dexie {
  users!: Table<User, number>;
  onboarding!: Table<Onboarding, number>;
  company!:Table<Company,number>;
  constructor() {
    super("MiniFIRMA");

    this.version(2).stores({
      users: "++id,email,size,role",
      onboarding: "userId,plan",
      company:"userId",
    });
  }
}

export const db = new FirmaDB();