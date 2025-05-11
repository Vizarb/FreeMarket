// src/features/cart/cartSlice.ts

import { createSlice, createAsyncThunk, isAnyOf } from '@reduxjs/toolkit';
import api from '../../api/apiService';
import { RootState } from '../../store/rootReducer';
import { CartOverviewResponse, PaginatedResponse } from '../../types/apiResponseType';
import { getAccessToken } from '@/utils/tokenManager';
import { toast } from 'sonner';
import axios from 'axios';
import type { AppDispatch } from '../../store';

// Shared Thunk API type
export type ThunkApiConfig = {
  dispatch: AppDispatch;
  state: RootState;
  rejectValue: string;
};

// Fetch Cart Overview
export const fetchCartOverview = createAsyncThunk<
  CartOverviewResponse[],
  void,
  ThunkApiConfig
>(
  'cart/fetchCartOverview',
  async (_, { getState, rejectWithValue }) => {
    const state = getState();
    const userId = state.auth.user?.id;

    if (!userId) return rejectWithValue("User not authenticated.");

    try {
      const res = await api.get<PaginatedResponse<CartOverviewResponse>>('/api/cart-overview/');
      const userItems = res.data.results.filter(item => item.user_id === userId);
      return userItems;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.detail || err.message || "Failed to fetch cart.");
      }
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Failed to fetch cart.");
    }
  }
);

// Refresh Cart if needed
export const refreshCart = () => async (dispatch: AppDispatch) => {
  return await dispatch(fetchCartOverview());
};

// Add Item to Cart (returns full CartOverviewResponse)
export const addToCart = createAsyncThunk<
  CartOverviewResponse,
  { item_id: number; quantity: number },
  ThunkApiConfig
>(
  'cart/addToCart',
  async ({ item_id, quantity }, { rejectWithValue }) => {
    if (!getAccessToken()) {
      toast.error('You must be logged in to use the cart');
      return rejectWithValue("Authentication required.");
    }

    try {
      const res = await api.post<CartOverviewResponse>('/api/cart-items/', { item_id, quantity });
      return res.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data || "Failed to add item.");
      }
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Failed to add item.");
    }
  }
);

// Update Cart Item
export const updateCartItem = createAsyncThunk<
  CartOverviewResponse,
  { cart_item_id: number; quantity: number },
  ThunkApiConfig
>(
  'cart/updateCartItem',
  async ({ cart_item_id, quantity }, { rejectWithValue }) => {
    try {
      const res = await api.put<CartOverviewResponse>(`/api/cart-items/${cart_item_id}/`, { quantity });
      return res.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data || 'Failed to update cart item');
      }
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue('Failed to update cart item');
    }
  }
);


// Remove Item from Cart
export const removeFromCart = createAsyncThunk<
  number,
  number,
  ThunkApiConfig
>(
  'cart/removeFromCart',
  async (cart_item_id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/cart-items/${cart_item_id}/`);
      return cart_item_id;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.detail || 'Failed to remove item');
      }
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue('Failed to remove item');
    }
  }
);

// Clear Entire Cart
export const clearCart = createAsyncThunk<
  void,
  void,
  ThunkApiConfig
>(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      await api.delete('/api/cart/');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data || "Failed to clear cart.");
      }
      if (err instanceof Error) return rejectWithValue(err.message);
      return rejectWithValue("Failed to clear cart.");
    }
  }
);

const initialState = {
  cart: [] as CartOverviewResponse[],
  loading: false,
  error: null as string | null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ✅ Fulfilled cases
      .addCase(fetchCartOverview.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.loading = false;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        const newItem = action.payload;
        const existing = state.cart.find(item => item.cart_item_id === newItem.cart_item_id);

        if (existing) {
          existing.total_quantity = newItem.total_quantity;
        } else {
          state.cart.push(newItem);
        }

        state.cart.sort((a, b) => a.item_name.localeCompare(b.item_name));
        state.loading = false;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        const updatedItem = action.payload;
        const existing = state.cart.find(item => item.cart_item_id === updatedItem.cart_item_id);

        if (existing) {
          Object.assign(existing, updatedItem); // Safely replace all fields
        } else {
          state.cart.push(updatedItem); // Fallback (shouldn't happen)
        }

        state.cart.sort((a, b) => a.item_name.localeCompare(b.item_name));
        state.loading = false;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.cart = state.cart.filter(item => item.cart_item_id !== action.payload);
        state.loading = false;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.cart = [];
        state.loading = false;
      })

      // ❌ Rejected
      .addMatcher(
        isAnyOf(
          fetchCartOverview.rejected,
          addToCart.rejected,
          updateCartItem.rejected,
          removeFromCart.rejected,
          clearCart.rejected
        ),
        (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
        }
      )

      // 🔄 Pending
      .addMatcher(
        isAnyOf(
          fetchCartOverview.pending,
          addToCart.pending,
          updateCartItem.pending,
          removeFromCart.pending,
          clearCart.pending
        ),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      );
  },
});

export const selectCart = (state: RootState) => state.cart.cart;
export const selectCartLoading = (state: RootState) => state.cart.loading;
export const selectCartError = (state: RootState) => state.cart.error;

export default cartSlice.reducer;
