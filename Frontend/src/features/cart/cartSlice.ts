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

// Fetch Cart Overview (filtered by user)
export const fetchCartOverview = createAsyncThunk<
  CartOverviewResponse[],
  void,
  ThunkApiConfig
>(
  'cart/fetchCartOverview',
  async (_, { getState, rejectWithValue }) => {
    const state = getState();
    const loggedInUserId = state.auth.user?.id;

    if (!loggedInUserId) {
      return rejectWithValue("User not authenticated.");
    }

    try {
      const response = await api.get<PaginatedResponse<CartOverviewResponse>>('/api/cart-overview/');
      const userCartItems = response.data.results.filter(cart => cart.user_id === loggedInUserId);
      if (!userCartItems.length) {
        return rejectWithValue("No cart found for the current user.");
      }
      return userCartItems;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.detail || error.message || "Failed to fetch cart.");
      }
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to fetch cart.");
    }
  }
);

// Helper to refresh the cart
export const refreshCart = () => async (dispatch: AppDispatch) => {
  return await dispatch(fetchCartOverview());
};

// Add Item to Cart
export const addToCart = createAsyncThunk<
  void,
  { item_id: number; quantity: number },
  ThunkApiConfig
>(
  'cart/addToCart',
  async ({ item_id, quantity }, { dispatch, rejectWithValue }) => {
    if (!getAccessToken()) {
      toast.error('You must be logged in to use the cart');
      return rejectWithValue("Authentication required.");
    }

    try {
      await api.post('/api/cart-items/', { item_id, quantity });
      await dispatch(refreshCart());
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || "Failed to add item to cart.");
      }
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to add item to cart.");
    }
  }
);

// Update Cart Item
export const updateCartItem = createAsyncThunk<
  void,
  { cart_item_id: number; quantity: number },
  ThunkApiConfig
>(
  'cart/updateCartItem',
  async ({ cart_item_id, quantity }, { dispatch, rejectWithValue }) => {
    try {
      await api.put(`/api/cart-items/${cart_item_id}/`, { quantity });
      await dispatch(fetchCartOverview());
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || 'Failed to update cart item');
      }
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to update cart item');
    }
  }
);

// Remove Item from Cart
export const removeFromCart = createAsyncThunk<
  void,
  number,
  ThunkApiConfig
>(
  'cart/removeFromCart',
  async (cart_item_id, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`/api/cart-items/${cart_item_id}/`);
      await dispatch(fetchCartOverview());
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.detail || 'Failed to remove cart item');
      }
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to remove cart item');
    }
  }
);

// Clear Cart
export const clearCart = createAsyncThunk<
  void,
  void,
  ThunkApiConfig
>(
  'cart/clearCart',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await api.delete('/api/cart/');
      await dispatch(refreshCart());
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || "Failed to clear cart.");
      }
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
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
      .addCase(fetchCartOverview.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.loading = false;
      })
      .addCase(fetchCartOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
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
      )
      .addMatcher(
        isAnyOf(
          addToCart.fulfilled,
          updateCartItem.fulfilled,
          removeFromCart.fulfilled,
          clearCart.fulfilled
        ),
        (state) => {
          state.loading = false;
        }
      )
      .addMatcher(
        isAnyOf(
          addToCart.rejected,
          updateCartItem.rejected,
          removeFromCart.rejected,
          clearCart.rejected
        ),
        (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
        }
      );
  }
});

export const selectCart = (state: RootState) => state.cart.cart;
export const selectCartLoading = (state: RootState) => state.cart.loading;
export const selectCartError = (state: RootState) => state.cart.error;

export default cartSlice.reducer;
