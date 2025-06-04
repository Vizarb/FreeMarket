import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/apiService';
import { UnifiedItemResult } from '../../types/itemSearchTypes';
import { RootState } from '../../store/rootReducer';
import { buildSearchParams } from '@/utils/buildSearchParams';
import { handlePagination } from '@/utils/handlePagination';

export interface ItemSearchParams {
  append?: boolean;
  [key: string]: string | number | boolean | undefined;
}


interface UnifiedItemResultsResponse {
  results: UnifiedItemResult[];
  next: string | null;
}

interface Suggestion {
  name: string;
  slug: string;
}

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

export const fetchUnifiedItemResults = createAsyncThunk<
  UnifiedItemResultsResponse,
  ItemSearchParams
>('itemSearch/fetchUnifiedItemResults', async (filters) => {
  const query = buildSearchParams(
    Object.fromEntries(
      Object.entries(filters).filter(([key]) => key !== 'append')
    ) as Record<string, string | number>
  );
  const response = await api.get(`/api/item-search/?${query}`);

  return {
    results: response.data.results,
    next: response.data.next,
  };
});


export const fetchAutocompleteSuggestions = createAsyncThunk<Suggestion[], string>(
  'itemSearch/fetchAutocompleteSuggestions',
  async (partial: string) => {
    const response = await api.get(`/api/item-search/autocomplete/?q=${encodeURIComponent(partial)}`);
    return response.data;
  }
);

export const fetchItemBySlug = createAsyncThunk<UnifiedItemResult, string>(
  'item/fetchBySlug',
  async (slug: string) => {
    const response = await api.get(`/api/item-details/${slug}`);
    return response.data;
  }
);

const itemSearchSlice = createSlice({
  name: 'itemSearch',
  initialState,
  reducers: {
    clearItemSearch(state) {
      state.results = [];
      state.suggestions = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnifiedItemResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnifiedItemResults.fulfilled, (state, action) => {
        handlePagination(state, action.payload, action.meta);
        state.loading = false;
      })
      .addCase(fetchUnifiedItemResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch search results';
      })
      .addCase(fetchAutocompleteSuggestions.fulfilled, (state, action: PayloadAction<Suggestion[]>) => {
        state.suggestions = action.payload;
      })
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

export default itemSearchSlice.reducer;
