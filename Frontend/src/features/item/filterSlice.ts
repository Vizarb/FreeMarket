import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store/rootReducer';

export type FilterState = {
    search?: string;        // text search
    min_price: number;     // price >=
    max_price: number;     // price <=
    category_id?: string;   // filter by category ID
    item_type?: string;
    ordering?: string;
    seller?: string;
}


export const initialState: FilterState = {
  item_type: '',
  min_price: 0,
  max_price: 100000,
  category_id: '',
  ordering: '-price_cents',
  search: '',
  seller: '',
};

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<FilterState>>) {
      return { ...state, ...action.payload };
    },
    resetFilters() {
      return initialState;
    },
    resetFiltersExceptSeller(state) {
      return {
        ...initialState,
        seller: state.seller,
      };
    },
  },
});

export const { setFilters, resetFilters, resetFiltersExceptSeller } = filterSlice.actions;

export const selectFilters = (state: RootState) => state.filters;

export default filterSlice.reducer;
