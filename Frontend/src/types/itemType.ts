import { BaseModel } from './baseType';
import { Currency } from './enums';
import { Product } from './productType';
import { Service } from './serviceType';

export interface Item extends BaseModel {
  name: string;
  description: string | null;
  price_cents: number;
  currency: Currency;
  slug: string;
  image: string | null;
  seller_id: number;
  search_vector?: string;
  is_deleted: boolean;
  metadata?: Record<string, string | number | boolean | null | string[] | number[]>;
  categories?: number[];

  // View-only extensions
  display_seller_name?: string;
  category_names?: string[];
}

export type ItemType = Product | Service;
