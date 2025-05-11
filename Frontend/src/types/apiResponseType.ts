// src/types/apiResponseType.ts

import { Currency } from "./enums";

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ItemDetailsResponse {
  item_id: number;
  name: string;
  description: string | null; 
  price_cents: number;
  currency: Currency;
  seller: string;
  categories: string[];
}


export interface ProductDetailsResponse {
  item_id: number;
  name: string;
  description: string | null;
  price_cents: number;
  currency: Currency;
  seller: string;
  categories: string[];  // ✅ Change to string instead of string[]
  quantity: number;
}
  
export interface ServiceDetailsResponse {
  item_id: number;
  name: string;
  description: string | null;
  price_cents: number;
  currency: Currency;
  seller: string;
  categories: string[];
  service_duration: number;
  service_type: string;
}

export interface CartOverviewResponse {
  cart_item_id: number;
  cart_id: number;
  user_id: number;
  owner: string;
  item_id: number;
  item_name: string;
  total_quantity: number;
  latest_price: number;
  item_type: string;
}

export interface OrderDetailsResponse {
  id: number;
  user_id: number;
  customer: string;
  status: string;
  total_price_cents: number;
  created_at: string;
  updated_at: string;
  order_items: OrderItemDetailsResponse[];
}

export interface OrderItemDetailsResponse {
  id: number;
  order_id: number;
  item_id: number;
  item_name: string;
  quantity: number;
  price_cents: number;
}

