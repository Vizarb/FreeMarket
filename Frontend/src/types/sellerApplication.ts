import { User } from "./userType";

export type SellerApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface SellerApplication {
  id: number;
  user: User;
  business_name: string;
  tax_id: string;
  phone_number?: string;
  description?: string;
  website?: string;
  country: string;
  bank_account_number?: string;
  bank_name?: string;
  bank_swift_code?: string;
  national_id?: string;
  status: SellerApplicationStatus;
  submitted_at: string;
  reviewed_at: string | null;
  reviewer: User | null;
}

export interface SellerApplicationCreatePayload {
  business_name: string;
  tax_id: string;
  phone_number?: string;
  description?: string;
  website?: string;
  country: string;
  bank_account_number?: string;
  bank_name?: string;
  bank_swift_code?: string;
  national_id?: string;
}
