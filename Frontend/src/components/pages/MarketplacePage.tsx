// src/components/pages/MarketplacePage.tsx

import React, { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks/hooks';
import {
  fetchUnifiedItemResults,
  selectSearchLoading,
  selectSearchError,
} from '@/features/item/itemSearchSlice';
import { fetchCategories } from '@/features/category/categorySlice';
import SearchBar from '@/components/common/SearchBar';
import ItemList from '@/features/item/ItemList';
import FilterPanel from '@/components/common/FilterPanel';

// Now defaultFilters matches the keys expected by fetchUnifiedItemResults:
const defaultFilters = {
  search:    '',     // optional text search
  min_price: 0,
  max_price: 10000,
  category_id: '',
};

const MarketplacePage: React.FC = () => {
  const dispatch = useAppDispatch();

  const loading = useAppSelector(selectSearchLoading);
  const error = useAppSelector(selectSearchError);
  const nextPage = useAppSelector((state) => state.itemSearch.nextPage);

  // Grab categories from Redux
  const {
    items: categories,
    loading: catLoading,
    error: catError,
  } = useAppSelector((state) => state.categories);

  const observerRef = useRef<HTMLDivElement | null>(null);

  // On mount: fetch items + categories
  useEffect(() => {
    dispatch(
      fetchUnifiedItemResults({
        min_price: defaultFilters.min_price,
        max_price: defaultFilters.max_price,
        category_id: defaultFilters.category_id,
      })
    );
    dispatch(fetchCategories());
  }, [dispatch]);

  // loadNextPage: parse nextPage URL params and dispatch with append=true
  const loadNextPage = useCallback(() => {
    if (!nextPage) return;
    const url = new URL(nextPage);
    const rawParams = Object.fromEntries(url.searchParams.entries()) as Record<
      string,
      string
    >;

    // Convert string entries to correct types
    const params: {
      search?: string;
      min_price?: number;
      max_price?: number;
      category_id?: string;
      append: true;
    } = { append: true };

    if (rawParams.search !== undefined) {
      params.search = rawParams.search;
    }
    if (rawParams.min_price !== undefined) {
      params.min_price = Number(rawParams.min_price);
    }
    if (rawParams.max_price !== undefined) {
      params.max_price = Number(rawParams.max_price);
    }
    if (rawParams.category_id !== undefined) {
      params.category_id = rawParams.category_id;
    }

    dispatch(fetchUnifiedItemResults(params));
  }, [dispatch, nextPage]);

  // IntersectionObserver unchanged
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
          {catLoading && <p>Loading categories…</p>}
          {catError && <p className="text-red-600">Category error: {catError}</p>}

          <FilterPanel
            onChange={(filters) =>
              dispatch(fetchUnifiedItemResults(filters))
            }
            defaultValues={{
              min_price: defaultFilters.min_price,
              max_price: defaultFilters.max_price,
              category_id: defaultFilters.category_id,
            }}
              categories={categories.map((cat) => ({
              id: cat.id.toString(),
              name: cat.full_path,
            }))}
          />
        </aside>

        <main className="md:col-span-3 space-y-4">
          <SearchBar
            onSearch={(q) =>
              dispatch(fetchUnifiedItemResults({ search: q }))
            }
          />

          {error && <p className="text-red-600">Error: {error}</p>}
          <ItemList />

          <div ref={observerRef} className="h-8" />
          {loading && (
            <p className="text-center text-gray-500">
              Loading more items...
            </p>
          )}
        </main>
      </div>
    </>
  );
};

export default MarketplacePage;
