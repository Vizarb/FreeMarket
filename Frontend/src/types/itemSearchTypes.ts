import { Currency } from "./enums";

export interface UnifiedItemResult {
  id: number;
  name: string;
  description: string | null;
  price_cents: number;
  currency: Currency;
  seller: string;
  item_type: 'product' | 'service';
  categories: string[];
  image?: string;

  quantity?: number; // product-only
  service_duration?: number; // service-only
  service_type?: string;     // service-only
}
