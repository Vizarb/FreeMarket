// src/features/item/itemSearchSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/apiService';
import { UnifiedItemResult } from '../../types/itemSearchTypes';
import { RootState } from '../../store/rootReducer';
import { handlePagination } from '@/utils/handlePagination';

// ----------------------------------------------------------------------------
// 1) Define the exact shape of the API response for /api/item-search/
//
//    The backend returns a paginated object, e.g.:
//    {
//      results: UnifiedItemResult[],
//      next: string | null,
//      previous: string | null,
//      count: number
//    }
// ----------------------------------------------------------------------------
interface UnifiedItemResultsPayload {
  results: UnifiedItemResult[];
  next: string | null;
  previous: string | null;
  count: number;
}

// ----------------------------------------------------------------------------
// 2) Define the search/filter parameters we’ll accept
// ----------------------------------------------------------------------------
export interface ItemSearchParams {
  append?: boolean;       // whether to append results (infinite scroll)
  search?: string;        // text search
  min_price?: number;     // price >=
  max_price?: number;     // price <=
  category_id?: string;   // filter by category ID
  [key: string]: string | number | boolean | undefined;
}

// ----------------------------------------------------------------------------
// 3) Thunk: fetchUnifiedItemResults
//
//    Returns the full paginated payload (results + next, previous, count).
//    In extraReducers, we hand that to handlePagination(state, payload, meta).
// ----------------------------------------------------------------------------
export const fetchUnifiedItemResults = createAsyncThunk<
  UnifiedItemResultsPayload, // returned payload type
  ItemSearchParams,          // argument type
  { rejectValue: string }
>(
  'itemSearch/fetchUnifiedItemResults',
  async (params: ItemSearchParams, { rejectWithValue }) => {
    try {
      // Build a plain object of only-defined query params:
      const axiosParams: Record<string, string | number | boolean> = {};

      if (params.search !== undefined && params.search !== '') {
        axiosParams.q = params.search;
      }
      if (params.min_price !== undefined) {
        axiosParams.min_price = params.min_price;
      }
      if (params.max_price !== undefined) {
        axiosParams.max_price = params.max_price;
      }
      if (params.category_id !== undefined && params.category_id !== '') {
        axiosParams.category_id = params.category_id;
      }
      if (params.append) {
        axiosParams.append = true;
      }

      // Let Axios build the query string automatically
      const response = await api.get<UnifiedItemResultsPayload>('/api/item-search/', {
        params: axiosParams,
      });

      return response.data;
    } catch (err: unknown) {
      // Narrow the error type
      let message = 'Failed to fetch search results';
      if (typeof err === 'object' && err !== null && 'response' in err) {
        // @ts-expect-error: Axios error type
        message = err.response?.data?.detail ?? message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      return rejectWithValue(message);
    }
  }
);

// ----------------------------------------------------------------------------
// 4) Thunk: fetchAutocompleteSuggestions (unchanged)
// ----------------------------------------------------------------------------
interface Suggestion {
  name: string;
  slug: string;
}

export const fetchAutocompleteSuggestions = createAsyncThunk<Suggestion[], string>(
  'itemSearch/fetchAutocompleteSuggestions',
  async (partial: string) => {
    const response = await api.get<Suggestion[]>(`/api/item-search/autocomplete/`, {
      params: { q: partial },
    });
    return response.data;
  }
);

// ----------------------------------------------------------------------------
// 5) Thunk: fetchItemBySlug (unchanged)
// ----------------------------------------------------------------------------
export const fetchItemBySlug = createAsyncThunk<UnifiedItemResult, string>(
  'itemSearch/fetchBySlug',
  async (slug: string) => {
    const response = await api.get<UnifiedItemResult>(`/api/item-details/${slug}`);
    return response.data;
  }
);

// ----------------------------------------------------------------------------
// 6) Slice definition
// ----------------------------------------------------------------------------
interface ItemSearchState {
  results: UnifiedItemResult[];
  suggestions: Suggestion[];
  loading: boolean;
  error: string | null;
  selectedItem: UnifiedItemResult | null;
  nextPage: string | null;
}

const initialState: ItemSearchState = {
  results: [],
  suggestions: [],
  loading: false,
  error: null,
  selectedItem: null,
  nextPage: null,
};

const itemSearchSlice = createSlice({
  name: 'itemSearch',
  initialState,
  reducers: {
    clearItemSearch(state) {
      state.results = [];
      state.suggestions = [];
      state.error = null;
      state.nextPage = null;
      state.selectedItem = null;
    },
  },
  extraReducers: (builder) => {
    // --- fetchUnifiedItemResults ---
    builder
      .addCase(fetchUnifiedItemResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnifiedItemResults.fulfilled, (state, action) => {
        // handlePagination expects a payload that has at least `{ results: UnifiedItemResult[], next: string | null }`
        handlePagination(state, action.payload, action.meta);
        state.loading = false;
      })
      .addCase(fetchUnifiedItemResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to fetch search results';
      });

    // --- fetchAutocompleteSuggestions ---
    builder.addCase(
      fetchAutocompleteSuggestions.fulfilled,
      (state, action: PayloadAction<Suggestion[]>) => {
        state.suggestions = action.payload;
      }
    );

    // --- fetchItemBySlug ---
    builder
      .addCase(fetchItemBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedItem = null;
      })
      .addCase(fetchItemBySlug.fulfilled, (state, action: PayloadAction<UnifiedItemResult>) => {
        state.selectedItem = action.payload;
        state.loading = false;
      })
      .addCase(fetchItemBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch item by slug';
      });
  },
});

export const { clearItemSearch } = itemSearchSlice.actions;

export const selectItemResults = (state: RootState) => state.itemSearch.results;
export const selectSuggestions = (state: RootState) => state.itemSearch.suggestions;
export const selectSearchLoading = (state: RootState) => state.itemSearch.loading;
export const selectSearchError = (state: RootState) => state.itemSearch.error ?? '';
export const selectSelectedItem = (state: RootState) => state.itemSearch.selectedItem;
export const selectNextPage = (state: RootState) => state.itemSearch.nextPage;

export default itemSearchSlice.reducer;
