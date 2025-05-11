import React from 'react';
import { CartOverviewResponse } from '@/types/apiResponseType';

interface CartItemProps {
  item: CartOverviewResponse;
  onAdd: (itemId: number) => void;
  onDecrement: (item: CartOverviewResponse) => void;
}

const CartItemCard: React.FC<CartItemProps> = ({ item, onAdd, onDecrement }) => {
  const subtotal = ((item.latest_price * item.total_quantity) / 100).toFixed(2);
  const price = (item.latest_price / 100).toFixed(2);

  return (
    <div className="border rounded-xl p-4 shadow flex flex-col bg-white transition-all duration-200 ease-in-out">
      <h3 className="text-lg font-bold mb-1">{item.item_name}</h3>

      <div className="text-sm text-gray-700 mb-1">
        <span className="font-medium">Price:</span>{' '}
        <span className="transition-colors duration-200">{`$${price}`}</span>
      </div>

      <div className="text-sm text-gray-700 mb-1">
        <span className="font-medium">Quantity:</span>{' '}
        <span className="inline-block min-w-[2ch] text-right transition-all duration-200">
          {item.total_quantity}
        </span>
      </div>

      <div className="text-sm text-gray-700 mb-4">
        <span className="font-medium">Subtotal:</span>{' '}
        <span className="inline-block transition-opacity duration-200 ease-in-out">
          ${subtotal}
        </span>
      </div>

      <div className="mt-auto flex gap-2">
        <button
          onClick={() => onAdd(item.item_id)}
          className="bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 px-4 text-sm transition-colors"
        >
          Add More
        </button>
        <button
          onClick={() => onDecrement(item)}
          className="bg-red-600 hover:bg-red-700 text-white rounded-lg py-2 px-4 text-sm transition-colors"
        >
          {item.total_quantity > 1 ? 'Decrease' : 'Remove'}
        </button>
      </div>
    </div>
  );
};

export default CartItemCard;
