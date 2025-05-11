import React, { useState } from 'react';
import { OrderDetailsResponse, OrderItemDetailsResponse } from '@/types/apiResponseType';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface OrderSummaryProps {
  order: OrderDetailsResponse;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ order }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-zinc-900 shadow-md rounded-lg p-6 transition-all">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">
          Order #{order.id}
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm px-2 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 uppercase">
            {order.status}
          </span>
          <button
            className="text-indigo-600 hover:underline flex items-center"
            onClick={() => setIsOpen(prev => !prev)}
            aria-expanded={isOpen}
          >
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <ul className="mb-4 space-y-2">
          {order.order_items.map((item: OrderItemDetailsResponse) => (
            <li
              key={`${item.item_id}-${item.order_id}`}
              className="flex justify-between border-b border-gray-200 dark:border-zinc-700 pb-2"
            >
              <span>{item.item_name}</span>
              <span>Qty: {item.quantity}</span>
              <span>${((item.price_cents * item.quantity) / 100).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex justify-between items-center pt-2 text-sm text-gray-700 dark:text-gray-300">
        <span>Ordered on: {new Date(order.created_at).toLocaleDateString()}</span>
        <span className="text-base font-bold text-black dark:text-white">
          Total: ${(order.total_price_cents / 100).toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default OrderSummary;
