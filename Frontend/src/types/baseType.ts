// src/models/BaseModel.ts
export interface BaseModel {
  id: number;
  created_at: string; // ISO date string (Backend: `created_at`)
  updated_at: string; // ISO date string (Backend: `updated_at`)4
  deleted_at: string | null;
  is_deleted: boolean;
}
