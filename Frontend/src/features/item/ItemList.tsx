import React from 'react';
import { useAppSelector } from '../../store/hooks/hooks';
import {
  selectItemResults,
  selectSearchLoading,
  selectNextPage,
} from './itemSearchSlice';
import ItemCard from '../item/ItemCard';
import { UnifiedItemResult } from '../../types/itemSearchTypes';

const ItemList: React.FC = () => {
  const items = useAppSelector(selectItemResults);
  const loading = useAppSelector(selectSearchLoading);
  const nextPage = useAppSelector(selectNextPage); // means there *could* be more to load

  const isEmpty = !items.length && !loading;

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
      {isEmpty && (
        <p className="col-span-full text-center text-gray-500">No items found.</p>
      )}

      {items.map((item: UnifiedItemResult) => (
        <div key={item.item_id} className="h-full flex">
          <ItemCard item={item} />
        </div>
      ))}

      {loading && nextPage && (
        <div className="col-span-full flex justify-center py-4">
          <span className="animate-spin rounded-full h-6 w-6 border-2 border-gray-400 border-t-transparent"></span>
        </div>
      )}
    </div>
  );
};

export default ItemList;
