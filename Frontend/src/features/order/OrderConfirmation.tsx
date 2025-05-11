// src/features/order/OrderConfirmation.tsx
import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { OrderDetailsResponse } from '@/types/apiResponseType';

const OrderConfirmation: React.FC = () => {
  const location = useLocation();
  const order = location.state?.order as OrderDetailsResponse | undefined;

  if (!order) {
    return <Navigate to="/" replace />;
  }

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-zinc-800 shadow-md rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-green-600 mb-4">Order Confirmation</h2>

        <div className="mb-4 text-gray-700 dark:text-gray-300">
          <p><strong>Order ID:</strong> #{order.id}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Total:</strong> ${(order.total_price_cents / 100).toFixed(2)}</p>
        </div>

        <h3 className="text-lg font-medium mb-2">Items:</h3>
        <ul className="space-y-2">
          {order.order_items.map((item) => (
            <li key={item.id} className="flex justify-between border-b border-gray-200 py-2 text-sm text-gray-800 dark:text-gray-200">
              <span>{item.item_name} x {item.quantity}</span>
              <span>${(item.price_cents * item.quantity / 100).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default OrderConfirmation;
