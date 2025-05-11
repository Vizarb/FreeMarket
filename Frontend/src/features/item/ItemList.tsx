import React from 'react';
import { useAppSelector } from '../../store/hooks/hooks';
import { selectItemResults, selectSearchLoading } from './itemSearchSlice';
import ItemCard from '../item/ItemCard';
import { UnifiedItemResult } from '../../types/itemSearchTypes';



const ItemList: React.FC = () => {
  const items = useAppSelector(selectItemResults);
  const loading = useAppSelector(selectSearchLoading);

  if (loading) return <p>Loading...</p>;
  if (!items.length) return <p>No items found.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {items.map((item: UnifiedItemResult) => (
        // Ensure `item.id` is a valid, unique key
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
};

export default ItemList;
