import { BaseModel } from "./baseType";
import { Gender } from "./enums";

export interface User extends BaseModel {
    id: number;
    username: string;
    email: string;
    groups: string[];
    phoneNumber?: string;
    gender?: Gender;
    date_of_birth?: string;
    seller_slug?: string;
  }


export interface SimpleUser {
  id: number;
  username: string;
  roles: string[];
}