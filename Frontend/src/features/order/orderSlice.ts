// src/features/order/orderSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/apiService';
import { RootState } from '../../store/rootReducer';
import { OrderDetailsResponse } from '../../types/apiResponseType';
import { AxiosError } from 'axios';

// Async thunk for fetching user orders
export const fetchUserOrders = createAsyncThunk(
  'order/fetchUserOrders',
  async (userId: number) => {
    const response = await api.get(`/api/order-details/?user_id=${userId}`);
    return response.data as OrderDetailsResponse[];
  }
);

// Async thunk for creating a new order from the cart
export const createOrderFromCart = createAsyncThunk(
  'order/createOrderFromCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/orders/');
      return response.data as OrderDetailsResponse;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data || 'Failed to create order');
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);

// Async thunk for updating order status
export const updateOrderStatus = createAsyncThunk(
  'order/updateOrderStatus',
  async ({ orderId, status }: { orderId: number; status: string }) => {
    const response = await api.patch(`/api/orders/${orderId}/`, { status });
    return response.data as OrderDetailsResponse;
  }
);

// Slice
const orderSlice = createSlice({
  name: 'order',
  initialState: {
    orders: [] as OrderDetailsResponse[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action: PayloadAction<OrderDetailsResponse[]>) => {
        state.orders = action.payload;
        state.loading = false;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch orders';
      });

    builder
      .addCase(createOrderFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrderFromCart.fulfilled, (state, action: PayloadAction<OrderDetailsResponse>) => {
        state.loading = false;
        state.orders.push(action.payload);
      })
      .addCase(createOrderFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to create order';
      });

    builder
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action: PayloadAction<OrderDetailsResponse>) => {
        state.loading = false;
        const index = state.orders.findIndex((order) => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update order status';
      });
  },
});

// Selectors
export const selectUserOrders = (state: RootState) => state.order.orders;
export const selectOrderLoading = (state: RootState) => state.order.loading;
export const selectOrderError = (state: RootState) => state.order.error;

export const selectOrderTotal = (state: RootState, orderId: number) => {
  const order = state.order.orders.find((order) => order.id === orderId);
  return order ? order.total_price_cents / 100 : 0;
};

export const selectOrderItems = (state: RootState, orderId: number) => {
  const order = state.order.orders.find((order) => order.id === orderId);
  return order ? order.order_items : [];
};

export default orderSlice.reducer;
