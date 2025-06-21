import { Currency } from "./enums";

export interface UnifiedItemResult {
  item_id: number;
  name: string;
  description: string | null;
  price_cents: number;
  currency: Currency;
  seller: string;
  seller_slug?: string;
  seller_shop_name?: string;
  item_type: 'product' | 'service';
  categories: string[];
  image?: string;
  slug: string;

  quantity?: number; // product-only
  service_duration?: number; // service-only
  service_type?: string;     // service-only
}
