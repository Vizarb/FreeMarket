import React, { useEffect, useRef, useCallback, useState } from 'react';
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

const defaultFilters: ItemSearchParams = {
  search: '',
  min_price: 0,
  max_price: 10000,
  category_id: '',
};

const MarketplacePage: React.FC = () => {
  const dispatch = useAppDispatch();

  const loading = useAppSelector(selectSearchLoading);
  const error = useAppSelector(selectSearchError);
  const nextPage = useAppSelector((state) => state.itemSearch.nextPage);

  const [activeFilters, setActiveFilters] = useState<Partial<ItemSearchParams>>(defaultFilters);
  const listRef = useRef<HTMLDivElement | null>(null);

  const {
    items: categories,
    loading: catLoading,
    error: catError,
  } = useAppSelector((state) => state.categories);

  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    dispatch(fetchUnifiedItemResults(defaultFilters));
    dispatch(fetchCategories());
  }, [dispatch]);

  const loadNextPage = useCallback(() => {
    if (!nextPage) return;
    dispatch(fetchUnifiedItemResults({ ...activeFilters, append: true }));
  }, [dispatch, nextPage, activeFilters]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && nextPage && !loading) {
        loadNextPage();
      }
    }, { threshold: 1.0 });

    const current = observerRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [loadNextPage, nextPage, loading]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeFilters]);

  const handleSearch = (query: string) => {
    const filters = { ...activeFilters, search: query };
    setActiveFilters(filters);
    dispatch(fetchUnifiedItemResults(filters));
  };

  const handleFilterChange = (filters: Partial<ItemSearchParams>) => {
    setActiveFilters(filters);
    dispatch(fetchUnifiedItemResults(filters));
  };

  return (
    <>
      <Header
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        defaultValues={defaultFilters}
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

        <div ref={listRef}>
          <ItemList />
        </div>

        <div ref={observerRef} className="h-8" />
        {loading && <p className="text-center text-gray-500">Loading more items...</p>}
      </div>
    </>
  );
};

export default MarketplacePage;
