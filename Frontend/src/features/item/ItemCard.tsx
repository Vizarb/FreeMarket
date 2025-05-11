import React from 'react';
import { useAppDispatch } from '../../store/hooks/hooks';
import { addToCart } from '../cart/cartSlice';
import { Currency } from '../../types/enums';
import { UnifiedItemResult } from '../../types/itemSearchTypes';

export interface ItemProps {
  item: UnifiedItemResult;
}

const ItemCard: React.FC<ItemProps> = ({ item }) => {
  const dispatch = useAppDispatch();

  const handleAddToCart = () => {
    dispatch(addToCart({ item_id: item.id, quantity: 1 }));
  };

  const imageUrl = item.image
    ? `${import.meta.env.VITE_BACKEND_URL}${item.image}`
    : '/placeholder.jpg'; // ✅ fallback if missing

  return (
    <div className="border rounded-xl p-4 shadow flex flex-col bg-white">
      <img
        src={imageUrl}
        alt={item.name}
        className="w-full h-48 object-cover rounded-lg mb-4"
        onError={(e) => (e.currentTarget.src = '/placeholder.jpg')}
      />
      <h3 className="text-lg font-bold">{item.name}</h3>
      <p className="text-sm text-gray-700">{item.description || 'No description available'}</p>
      <p className="font-semibold mt-2">
        ${(item.price_cents / 100).toFixed(2)} {Currency[item.currency]}
      </p>
      <p className="text-sm">Seller: {item.seller}</p>
      <p className="text-sm">Categories: {Array.isArray(item.categories) ? item.categories.join(', ') : item.categories}</p>
      {typeof item.quantity === 'number' && <p>Stock: {item.quantity}</p>}
      {typeof item.service_duration === 'number' && <p>Duration: {item.service_duration} hours</p>}
      {item.service_type?.trim() && <p>Type: {item.service_type}</p>}

      <button
        onClick={handleAddToCart}
        className="mt-auto bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 px-4"
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ItemCard;
