import React, { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks/hooks';
import {
  fetchUnifiedItemResults,
  selectSearchLoading,
  selectSearchError,
} from '@/features/item/itemSearchSlice';
import SearchBar from '@/components/common/SearchBar';
import ItemList from '@/features/item/ItemList';
import FilterPanel from '@/components/common/FilterPanel';

const defaultFilters = {
  currency: '',
  item_type: '',
  min_price: 0,
  max_price: 10000,
  category_id: '',
};

const MarketplacePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectSearchLoading);
  const error = useAppSelector(selectSearchError);
  const nextPage = useAppSelector((state) => state.itemSearch.nextPage);

  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    dispatch(fetchUnifiedItemResults(defaultFilters));
  }, [dispatch]);

  const loadNextPage = useCallback(() => {
    if (!nextPage) return;
    const url = new URL(nextPage);
    const params = Object.fromEntries(url.searchParams.entries()) as Record<string, string | number>;

    dispatch(fetchUnifiedItemResults({ ...params, append: true }));
  }, [dispatch, nextPage]);


  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextPage && !loading) {
          loadNextPage();
        }
      },
      { threshold: 1.0 }
    );

    const current = observerRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [loadNextPage, nextPage, loading]);

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Marketplace</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="md:col-span-1">
          <FilterPanel
            onChange={(filters) => dispatch(fetchUnifiedItemResults(filters))}
            defaultValues={defaultFilters}
            categories={[
              { id: '1', name: 'Electronics' },
              { id: '2', name: 'Books' },
              { id: '3', name: 'Home & Garden' },
            ]}
          />
        </aside>

        <main className="md:col-span-3 space-y-4">
          <SearchBar onSearch={(q) => dispatch(fetchUnifiedItemResults({ q }))} />

          {error && <p className="text-red-600">Error: {error}</p>}
          <ItemList />
          <div ref={observerRef} className="h-8" />
          {loading && <p className="text-center text-gray-500">Loading more items...</p>}
        </main>
      </div>
    </>
  );
};

export default MarketplacePage;
