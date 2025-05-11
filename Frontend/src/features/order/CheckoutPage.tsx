// src/features/order/CheckoutPage.tsx

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks/hooks';
import { fetchUserOrders, selectUserOrders, createOrderFromCart, selectOrderLoading, selectOrderError } from './orderSlice';
import { selectIsAuthenticated, selectUserId } from '../auth/authSlice';
import OrderSummary from './OrderSummary';
import useCustomNavigate from '../../store/hooks/useCustomNavigate';

const CheckoutPage: React.FC = () => {
  const dispatch = useAppDispatch();

  // Use custom navigation hook
  const { goToProtectedRoute, redirectToLogin } = useCustomNavigate();

  // Get authentication status and user orders
  const userId = useAppSelector(selectUserId);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const orders = useAppSelector(selectUserOrders);
  const orderLoading = useAppSelector(selectOrderLoading);
  const orderError = useAppSelector(selectOrderError);

  // Fetch user orders dynamically based on authentication status
  useEffect(() => {
    if (isAuthenticated && userId) {
      dispatch(fetchUserOrders(userId));
    }
  }, [dispatch, isAuthenticated, userId]);

  // Handle Checkout (Create Order)
  const handleCheckout = async () => {
    if (isAuthenticated) {
      const resultAction = await dispatch(createOrderFromCart());

      if (createOrderFromCart.fulfilled.match(resultAction)) {
        goToProtectedRoute('/order-confirmation'); // Navigate to order confirmation
      } else {
        alert('Failed to create order. Please try again.');
      }
    } else {
      alert('You need to be logged in to place an order.');
      redirectToLogin(); // Redirect to login if not authenticated
    }
  };

  if (orderLoading) return <p>Processing your order...</p>;
  if (orderError) return <p>Error: {orderError}</p>;

  return (
    <div>
      <h1>Checkout</h1>
      <button onClick={handleCheckout}>Confirm Order</button>
      {orders.length > 0 ? (
        <OrderSummary order={orders[orders.length - 1]} />
      ) : (
        <p>No active orders.</p>
      )}
    </div>
  );
};

export default CheckoutPage;
