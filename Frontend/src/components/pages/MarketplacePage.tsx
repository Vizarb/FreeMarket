import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks/hooks';
import {
  fetchUnifiedItemResults,
  selectSearchLoading,
  selectSearchError,
  ItemSearchParams,
} from '@/features/item/itemSearchSlice';
import { fetchCategories } from '@/features/category/categorySlice';
import ItemList from '@/features/item/ItemList';
import Header from '@/components/common/Header';
import { selectFilters, setFilters } from '@/features/item/filterSlice';

const MarketplacePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectFilters);
  const loading = useAppSelector(selectSearchLoading);
  const error = useAppSelector(selectSearchError);

  const {
    items: categories,
    loading: catLoading,
    error: catError,
  } = useAppSelector((state) => state.categories);

  useEffect(() => {
    dispatch(fetchUnifiedItemResults(filters as ItemSearchParams));
    dispatch(fetchCategories());
  }, [dispatch, filters]);

  const handleSearch = (query: string) => {
    dispatch(setFilters({ search: query }));
  };

  const handleFilterChange = (filters: Partial<ItemSearchParams>) => {
    dispatch(setFilters(filters));
  };

  return (
    <>
      <Header
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        categories={(categories || []).map((cat) => ({
          id: cat.id.toString(),
          name: cat.full_path,
        }))}
      />

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-2xl font-bold mb-4">Marketplace</h2>

        {catLoading && <p>Loading categories…</p>}
        {catError && <p className="text-red-600">Category error: {catError}</p>}
        {error && <p className="text-red-600">Error: {error}</p>}

        <ItemList />

        {loading && <p className="text-center text-gray-500">Loading more items...</p>}
      </div>
    </>
  );
};

export default MarketplacePage;
