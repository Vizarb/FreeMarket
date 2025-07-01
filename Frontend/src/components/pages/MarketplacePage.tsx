// src/pages/MarketplacePage.tsx
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks/hooks';
import {
  fetchUnifiedItemResults,
  selectSearchLoading,
  selectSearchError,
  ItemSearchParams,
} from '@/features/item/itemSearchSlice';
import { selectFilters } from '@/features/item/filterSlice';
import Header from '@/components/common/Header';
import ItemList from '@/features/item/ItemList';
import { useHeaderConfig } from '@/store/hooks/useHeaderConfig';

const MarketplacePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectFilters);
  const loading = useAppSelector(selectSearchLoading);
  const error = useAppSelector(selectSearchError);

  const { onSearch, onFilterChange, categories } = useHeaderConfig();

  useEffect(() => {
    dispatch(fetchUnifiedItemResults(filters as ItemSearchParams));
  }, [dispatch, filters]);

  return (
    <>
      <Header
        onSearch={onSearch}
        onFilterChange={onFilterChange}
        categories={categories}
      />

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-2xl font-bold mb-4">Marketplace</h2>

        {error && <p className="text-red-600">Error: {error}</p>}

        <ItemList />

        {loading && <p className="text-center text-gray-500">Loading more items...</p>}
      </div>
    </>
  );
};

export default MarketplacePage;
