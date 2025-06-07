import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks/hooks';
import {
  fetchItemBySlug,
  selectSelectedItem,
  selectSearchLoading,
  selectSearchError,
} from '@/features/item/itemSearchSlice';
import { addToCart } from '@/features/cart/cartSlice';
import { Currency } from '@/types/enums';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DefaultHeader from '@/components/common/DefaultHeader';

const ItemDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const [quantity, setQuantity] = useState(1);

  const item = useAppSelector(selectSelectedItem);
  const loading = useAppSelector(selectSearchLoading);
  const error = useAppSelector(selectSearchError);

  useEffect(() => {
    if (slug) {
      dispatch(fetchItemBySlug(slug));
    }
  }, [dispatch, slug]);

  const handleAddToCart = () => {
    if (item && quantity > 0) {
      dispatch(addToCart({ item_id: item.item_id, quantity: quantity }));
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">Error: {error}</p>;
  if (!item) return <p className="text-center mt-10">Item not found.</p>;

  const imageUrl = item.image
    ? `${import.meta.env.VITE_BACKEND_URL}${item.image}`
    : '/placeholder.jpg';

  return (
    <>
    <DefaultHeader />
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-4">
        <span className="text-blue-600 hover:underline cursor-pointer">Home</span> &gt;{' '}
        <span className="text-blue-600 hover:underline cursor-pointer">Marketplace</span> &gt;{' '}
        <span>{item.name}</span>
      </nav>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Image */}
        <div className="md:w-1/2">
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-96 object-cover rounded-lg shadow"
            onError={(e) => (e.currentTarget.src = '/placeholder.jpg')}
          />
        </div>

        {/* Item Info */}
        <div className="md:w-1/2 space-y-4">
          <h1 className="text-3xl font-bold text-gray-800">{item.name}</h1>
          <p className="text-gray-700">{item.description || 'No description available.'}</p>

          <div className="text-2xl font-semibold text-blue-700">
            ${(item.price_cents / 100).toFixed(2)} {Currency[item.currency]}
          </div>

          <div className="flex gap-2 flex-wrap text-sm text-white">
            {(Array.isArray(item.categories) ? item.categories : [item.categories]).map((cat) => (
              <span key={cat} className="bg-gray-800 px-2 py-1 rounded-full">
                {cat}
              </span>
            ))}
          </div>

          {/* Seller Info */}
          <div className="mt-4 flex items-center gap-3">
            <img
              src="/user-avatar-placeholder.png"
              alt="Seller avatar"
              className="w-10 h-10 rounded-full"
            />
            <p className="text-gray-700 text-sm">
              <span className="font-medium">Sold by:</span> {item.seller}
            </p>
          </div>

          {/* Stock & Service Info */}
          <div className="text-sm text-gray-600">
            {typeof item.quantity === 'number' && <p>Stock: {item.quantity}</p>}
            {typeof item.service_duration === 'number' && (
              <p>Duration: {item.service_duration} hours</p>
            )}
            {item.service_type?.trim() && <p>Type: {item.service_type}</p>}
          </div>

          {/* Quantity + Cart */}
          <div className="flex items-center gap-4 mt-4">
            <Input
              type="number"
              min={1}
              max={item.quantity || 99}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-20"
            />
            <Button onClick={handleAddToCart} disabled={quantity < 1}>
              Add to Cart
            </Button>
          </div>

        </div>
      </div>
    </div>
    </>
  );
};

export default ItemDetailPage;
