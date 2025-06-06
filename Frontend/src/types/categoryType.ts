import { BaseModel } from "./baseType";

export interface Category extends BaseModel {
    name: string;
    parent: string | null;
    full_path: string; 
  }
  