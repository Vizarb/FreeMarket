// src/features/category/categorySlice.ts

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/apiService';
import { Category } from '@/types/categoryType';


export interface CategoryState {
  items: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  items: [],
  loading: false,
  error: null,
};


export const fetchCategories = createAsyncThunk<Category[], void, { rejectValue: string }>(
  'categories/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      // If your API is under /api/, ensure baseURL is set accordingly in apiService
      const response = await api.get<Category[]>('/api/category/');
      return response.data;
    } catch (err: unknown) {
      let message = `Failed to fetch categories error:${String(err)}`;
      // Narrow the unknown error
      if (typeof err === 'object' && err !== null && 'response' in err) {
        // @ts-expect-error: AxiosError has `response.data.detail`
        message = err.response?.data?.detail ?? message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      return rejectWithValue(message);
    }
  }
);


const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCategoryError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unknown error';
      });
  },
});

export const { clearCategoryError } = categorySlice.actions;
export default categorySlice.reducer;
