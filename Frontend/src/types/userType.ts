import { BaseModel } from "./baseType";
import { Gender } from "./enums";

export interface User extends BaseModel {
    id: number;
    username: string;
    email: string;
    groups: string[];
    phoneNumber?: string;
    gender?: Gender;
    dateOfBirth?: string;
  }
  