import React from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks/hooks';
import { addToCart } from '@/features/cart/cartSlice';
import { Currency } from '@/types/enums';
import { UnifiedItemResult } from '@/types/itemSearchTypes';

export interface ItemProps {
  item: UnifiedItemResult;
}

const ItemCard: React.FC<ItemProps> = ({ item }) => {
  const dispatch = useAppDispatch();

  const handleAddToCart = () => {
    dispatch(addToCart({ item_id: item.item_id, quantity: 1 }))
  };
  
  const imageUrl = item.image
    ? `${import.meta.env.VITE_BACKEND_URL}${item.image}`
    : '/placeholder.jpg'; // ✅ fallback if missing

  return (
    <div className="border rounded-xl p-4 shadow flex flex-col bg-white h-full min-h-[460px] max-h-[460px]">
      <img
        src={imageUrl}
        alt={item.name}
        className="w-full h-40 sm:h-48 object-cover rounded-lg mb-3"
        onError={(e) => (e.currentTarget.src = '/placeholder.jpg')}
      />
      <Link to={`/items/${item.slug}`} className="text-lg font-bold text-blue-600 hover:underline">
        {item.name}
      </Link>
      <p className="text-sm sm:text-base text-gray-700 line-clamp-2 break-words overflow-hidden">
        {item.description || 'No description available'}</p>
      <p className="font-semibold mt-2">
        ${(item.price_cents / 100).toFixed(2)} {Currency[item.currency]}
      </p>
      <p className="text-sm">
        Seller:{' '}
        <Link
          to={`/shop/${item.seller_slug}`}
          className="text-blue-600 hover:underline"
        >
          {item.seller_shop_name || item.seller}
        </Link>
      </p>
      <p className="text-sm">Categories: {Array.isArray(item.categories) ? item.categories.join(', ') : item.categories}</p>
      {typeof item.quantity === 'number' && <p>Stock: {item.quantity}</p>}
      {typeof item.service_duration === 'number' && <p>Duration: {item.service_duration} hours</p>}
      {item.service_type?.trim() && <p>Type: {item.service_type}</p>}

      <button
        onClick={handleAddToCart}
        className="mt-auto bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 px-4 text-sm sm:text-base"
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ItemCard;
