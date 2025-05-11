// src/features/order/OrderHistory.tsx

import React from 'react';
import { useAppSelector } from '@/store/hooks/hooks';
import { selectUserOrders } from '@/features/order/orderSlice';
import { OrderDetailsResponse } from '@/types/apiResponseType';
import OrderSummary from './OrderSummary';

const OrderHistory: React.FC = () => {
  const orders = useAppSelector(selectUserOrders);

  return (
    <section className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6">Order History</h2>

      {orders.length === 0 ? (
        <div className="text-center text-gray-600 dark:text-gray-300 mt-12">
          <p className="text-lg">You haven't placed any orders yet.</p>
          <p className="text-sm mt-1">Browse the marketplace and find something you'll love!</p>
        </div>
      ) : (
        <ul className="space-y-6">
          {orders.map((order: OrderDetailsResponse) => (
            <li key={order.id} className="bg-white dark:bg-zinc-800 shadow-md rounded-xl p-6">
              <OrderSummary order={order} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default OrderHistory;
