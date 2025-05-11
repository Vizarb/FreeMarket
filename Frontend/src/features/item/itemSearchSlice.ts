import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/apiService';
import { UnifiedItemResult } from '../../types/itemSearchTypes';
import { RootState } from '../../store/rootReducer';

export const fetchUnifiedItemResults = createAsyncThunk<UnifiedItemResult[], string>(
  'itemSearch/fetchUnifiedItemResults',
  async (query: string) => {
    const response = await api.get(`/api/item-search/?search=${encodeURIComponent(query)}`);
    return response.data.results;
  }
);

export const fetchAutocompleteSuggestions = createAsyncThunk<string[], string>(
  'itemSearch/fetchAutocompleteSuggestions',
  async (partial: string) => {
    const response = await api.get(`/api/item-details/autocomplete/?q=${encodeURIComponent(partial)}`);
    return response.data;
  }
);

interface ItemSearchState {
  results: UnifiedItemResult[];
  suggestions: string[];
  loading: boolean;
  error: string | null;
}

const initialState: ItemSearchState = {
  results: [],
  suggestions: [],
  loading: false,
  error: null,
};

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
      .addCase(fetchUnifiedItemResults.fulfilled, (state, action: PayloadAction<UnifiedItemResult[]>) => {
        state.results = action.payload;
        state.loading = false;
      })
      .addCase(fetchUnifiedItemResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch search results';
      })
      .addCase(fetchAutocompleteSuggestions.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.suggestions = action.payload;
      });
  },
});

export const { clearItemSearch } = itemSearchSlice.actions;

export const selectItemResults = (state: RootState) => state.itemSearch.results;
export const selectSuggestions = (state: RootState) => state.itemSearch.suggestions;
export const selectSearchLoading = (state: RootState) => state.itemSearch.loading;
export const selectSearchError = (state: RootState) => state.itemSearch.error ?? '';

export default itemSearchSlice.reducer;
