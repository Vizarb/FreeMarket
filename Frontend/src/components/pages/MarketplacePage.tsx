import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks/hooks';
import {
  fetchUnifiedItemResults,
  selectSearchLoading,
  selectSearchError,
} from '../../features/item/itemSearchSlice';
import SearchBar from '@/components/common/SearchBar';
import ItemList from '../../features/item/ItemList';
import FilterPanel from '@/components/common/FilterPanel';

const defaultFilters = {
  currency: '',
  item_type: '',
  min_price: 0,
  max_price: 10000,
  category_id: ''
};

const MarketplacePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectSearchLoading);
  const error = useAppSelector(selectSearchError);

  const handleFilterChange = (filters: Partial<typeof defaultFilters>) => {
    dispatch(fetchUnifiedItemResults(filters));
  };

  useEffect(() => {
    dispatch(fetchUnifiedItemResults(defaultFilters));
  }, [dispatch]);

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Marketplace</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filter Sidebar */}
        <aside className="md:col-span-1">
          <FilterPanel
            onChange={handleFilterChange}
            defaultValues={defaultFilters}
            categories={[
              { id: '1', name: 'Electronics' },
              { id: '2', name: 'Books' },
              { id: '3', name: 'Home & Garden' },
            ]}
          />
        </aside>

        {/* Item Results */}
        <main className="md:col-span-3">
          <SearchBar onSearch={(q) => dispatch(fetchUnifiedItemResults({ q }))} />
          {loading && <p>Loading marketplace...</p>}
          {error && <p className="text-red-600">Error: {error}</p>}
          {!loading && !error && (
            <section className="mt-6">
              <ItemList />
            </section>
          )}
        </main>
      </div>
    </>
  );
};

export default MarketplacePage;