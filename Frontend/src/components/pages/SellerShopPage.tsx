// src/pages/SellerShopPage.tsx
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks/hooks';
import { fetchUnifiedItemResults } from '@/features/item/itemSearchSlice';
import ItemList from '@/features/item/ItemList';
import { setFilters } from '@/features/item/filterSlice';

const SellerShopPage: React.FC = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (sellerId) {
      dispatch(setFilters({ seller: sellerId }));
      dispatch(fetchUnifiedItemResults({ seller: sellerId }));
    }
  }, [sellerId, dispatch]);

  return (
    <div className="p-6">
      {/* Optional: Customize with seller's banner/logo */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold">Welcome to Seller #{sellerId}'s Shop</h1>
        {/* You can fetch seller details and use username/logo here */}
      </div>

      <ItemList />
    </div>
  );
};

export default SellerShopPage;
