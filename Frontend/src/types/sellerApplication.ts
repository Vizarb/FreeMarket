import { BaseModel } from "./baseType";
import { SimpleUser } from "./userType";

export enum SellerApplicationStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}
export interface SellerApplication extends BaseModel {
  id: number;
  user: SimpleUser;
  business_name: string;                // Required, max 255
  tax_id: string;                       // Required, 9–15 alphanumeric
  phone_number?: string | null;        // Optional, E.164 format
  description?: string | null;         // Optional
  website?: string | null;             // Optional, must be valid URL if present
  country: string;                     // Required, max 100
  bank_account_number?: string | null; // Optional, max 100
  bank_name?: string | null;           // Optional, max 100
  bank_swift_code?: string | null;     // Optional, 8 or 11 uppercase alphanumeric
  national_id?: string | null;         // Optional, 9–15 alphanumeric
  status: SellerApplicationStatus;
  submitted_at: string;
  reviewed_at: string | null;
  reviewer: SimpleUser | null;
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

