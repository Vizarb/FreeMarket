// src\types\itemType.ts
import { BaseModel } from "./baseType";
import { Currency } from "./enums";
import { Product } from "./productType";
import { Service } from "./serviceType";

export interface Item extends BaseModel {
  name: string;                 
  description: string | null;
  price_cents: number;             
  currency: Currency;
  seller_id: string;               
}

export type ItemType = Product | Service;
