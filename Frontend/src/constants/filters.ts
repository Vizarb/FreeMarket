export interface FilterState {
  search: string;
  currency: string;
  item_type: string;
  min_price: number;
  max_price: number;
  category_id: string;
}

export const defaultFilterState: FilterState = {
  search: '',
  currency: '',
  item_type: '',
  min_price: 0,
  max_price: 10000,
  category_id: '',
};
