import { BaseModel } from "./baseType";

export interface Category extends BaseModel {
    name: string;
    parent?: Category | null;
  }
  