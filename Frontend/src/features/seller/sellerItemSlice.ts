import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/api/apiService';
import { RootState } from '@/store/rootReducer';
import { Item } from '@/types/itemType';

export interface SellerItemState {
  items: Item[];
  loading: boolean;
  error: string | null;
}

const initialState: SellerItemState = {
  items: [],
  loading: false,
  error: null,
};

// ✅ Thunk to fetch seller's items from /api/items/
export const fetchSellerItems = createAsyncThunk<Item[], void, { rejectValue: string }>(
  'sellerItems/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<Item[]>('/api/items/mine/');
      return response.data;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch seller items';
      return rejectWithValue(message);
    }
  }
);

const sellerItemSlice = createSlice({
  name: 'sellerItems',
  initialState,
  reducers: {
    clearSellerItems(state) {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSellerItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellerItems.fulfilled, (state, action: PayloadAction<Item[]>) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchSellerItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error';
      });
  },
});

export const { clearSellerItems } = sellerItemSlice.actions;

export const selectSellerItems = (state: RootState) => state.sellerItems.items;
export const selectSellerItemsLoading = (state: RootState) => state.sellerItems.loading;
export const selectSellerItemsError = (state: RootState) => state.sellerItems.error;

export default sellerItemSlice.reducer;
