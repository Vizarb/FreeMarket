import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks/hooks';
import {
  fetchUnifiedItemResults,
  selectSearchLoading,
  selectSearchError,
} from '../../features/item/itemSearchSlice';
import SearchBar from '@/components/common/SearchBar';
import ItemList from '../../features/item/ItemList';

const MarketplacePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectSearchLoading);
  const error = useAppSelector(selectSearchError);

  useEffect(() => {
    dispatch(fetchUnifiedItemResults(''));
  }, [dispatch]);

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Marketplace</h2>
      <SearchBar />

      {loading && <p>Loading marketplace...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {!loading && !error && (
        <section className="mt-6">
          <ItemList />
        </section>
      )}
    </>
  );
};

export default MarketplacePage;
