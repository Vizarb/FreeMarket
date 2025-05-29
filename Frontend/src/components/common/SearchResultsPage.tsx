// src/pages/SearchResultsPage.tsx
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks/hooks';
import {
  fetchUnifiedItemResults,
  selectItemResults,
  selectSearchLoading,
  selectSearchError,
} from '@/features/item/itemSearchSlice';
import ItemList from '@/features/item/ItemList';

const SearchResultsPage: React.FC = () => {
  const [params] = useSearchParams();
  const query = params.get('q') || '';

  const dispatch = useAppDispatch();
  const items = useAppSelector(selectItemResults);
  const loading = useAppSelector(selectSearchLoading);
  const error = useAppSelector(selectSearchError);

  useEffect(() => {
    if (query.trim()) {
      dispatch(fetchUnifiedItemResults(query));
    }
  }, [dispatch, query]);

  return (
<>
    <h2 className="text-2xl font-bold mb-4">Search Results for "{query}"</h2>
    {loading && <p>Loading...</p>}
    {error && <p className="text-red-600">Error: {error}</p>}
    {!loading && !error && items.length === 0 && <p>No items found.</p>}
    {!loading && !error && items.length > 0 && <ItemList />}
</>
);
};

export default SearchResultsPage;
