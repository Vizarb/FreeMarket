// Inside MarketplacePage or ItemList component

import React, { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks/hooks';
import {
  fetchUnifiedItemResults,
  selectItemResults,
  selectSearchLoading,
  selectNextPage,
} from '@/features/item/itemSearchSlice';
import { selectFilters } from '@/features/item/filterSlice';
import { UnifiedItemResult } from '@/types/itemSearchTypes';
import ItemCard from '../item/ItemCard';

const ItemList: React.FC = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectItemResults);
  const filters = useAppSelector(selectFilters);
  const loading = useAppSelector(selectSearchLoading);
  const nextPage = useAppSelector(selectNextPage);

  const observerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const loadedPages = useRef<Set<string>>(new Set());

  // Load the next page, but only once per `nextPage` value
  const loadNextPage = useCallback(() => {
    if (!nextPage || loadedPages.current.has(nextPage)) return;

    loadedPages.current.add(nextPage);
    dispatch(fetchUnifiedItemResults({ ...filters, append: true, nextPageUrl: nextPage}));
  }, [dispatch, nextPage, filters]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
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
  }, [loadNextPage]);

  // Scroll to top when filters change
  useEffect(() => {
    loadedPages.current.clear(); // allow reloading pages on filter change
    if (listRef.current) {
      listRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [filters]);

  const isEmpty = !items.length && !loading;

  return (
    <>
      <div ref={listRef} />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {isEmpty && (
          <p className="col-span-full text-center text-gray-500">No items found.</p>
        )}

        {items.map((item: UnifiedItemResult) => (
          <div key={item.item_id} className="h-full flex">
            <ItemCard item={item} />
          </div>
        ))}
      </div>

      <div ref={observerRef} className="h-4" />
    </>
  );
};

export default ItemList;
