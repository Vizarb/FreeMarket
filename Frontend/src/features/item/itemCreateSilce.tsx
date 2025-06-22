// src/features/item/itemSlice.ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '@/api/apiService';
import { RootState } from '@/store/store';

interface ItemState {
  creatingProduct: boolean;
  creatingService: boolean;
  error: string | null;
}

export interface CreateServicePayload {
  name: string;
  description?: string;
  price_cents: number;
  currency: string;
  service_duration: number;
  service_type: string;
  categories: number[];
  image?: File;
}

const initialState: ItemState = {
  creatingProduct: false,
  creatingService: false,
  error: null,
};

export const createProductThunk = createAsyncThunk<
  unknown,
  FormData,
  { rejectValue: string }
>('item/createProduct', async (formData, { rejectWithValue }) => {
  try {
    const response = await api.post('/api/products/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (err: unknown) {
    return rejectWithValue('Failed to create product');
  }
});

export const createServiceThunk = createAsyncThunk<
  unknown,
  FormData,
  { rejectValue: string }
>('item/createService', async (formData, { rejectWithValue }) => {
  try {
    const response = await api.post('/api/services/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (err: unknown) {
    return rejectWithValue('Failed to create service');
  }
});

const itemSlice = createSlice({
  name: 'item',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createProductThunk.pending, (state) => {
        state.creatingProduct = true;
        state.error = null;
      })
      .addCase(createProductThunk.fulfilled, (state) => {
        state.creatingProduct = false;
      })
      .addCase(createProductThunk.rejected, (state, action) => {
        state.creatingProduct = false;
        state.error = action.payload || 'Unknown error';
      })
      .addCase(createServiceThunk.pending, (state) => {
        state.creatingService = true;
        state.error = null;
      })
      .addCase(createServiceThunk.fulfilled, (state) => {
        state.creatingService = false;
      })
      .addCase(createServiceThunk.rejected, (state, action) => {
        state.creatingService = false;
        state.error = action.payload || 'Unknown error';
      });
  },
});

export const selectItemCreatingProduct = (state: RootState) => state.item.creatingProduct;
export const selectItemCreatingService = (state: RootState) => state.item.creatingService;
export const selectItemError = (state: RootState) => state.item.error;

export default itemSlice.reducer;
