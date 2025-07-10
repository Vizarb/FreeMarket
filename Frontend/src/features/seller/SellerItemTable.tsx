import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks/hooks';
import {
  selectSellerItems,
  fetchSellerItems,
} from './sellerItemSlice';
import api from '@/api/apiService';
import { toast } from 'sonner';
import { Item } from '@/types/itemType';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const SellerItemTable: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const items = useAppSelector(selectSellerItems);
  const [showDeleted, setShowDeleted] = useState(false);

  const handleDelete = async (id: number): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await api.patch(`/api/items/${id}/`, { is_deleted: true });
      toast.success('Item soft-deleted');
      dispatch(fetchSellerItems());
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Failed to delete item: ${message}`);
    }
  };

  const visibleItems = showDeleted ? items : items.filter((item) => !item.is_deleted);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Items</h2>
        <Button onClick={() => setShowDeleted((prev) => !prev)} variant="outline">
          {showDeleted ? 'Hide Deleted' : 'Show Deleted'}
        </Button>
      </div>

      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Price</th>
            <th className="p-2 border">Stock</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {visibleItems.map((item: Item) => (
            <tr key={item.id} className="border-t hover:bg-gray-50">
              <td className="p-2">{item.name}</td>
              <td className="p-2">${(item.price_cents / 100).toFixed(2)}</td>
              <td className="p-2">{item.is_deleted ? 'Deleted' : 'Active'}</td>
              <td className="p-2 space-x-2">
                {!item.is_deleted && (
                  <>
                    <button
                      className="text-sm text-blue-600 underline"
                      onClick={() => navigate(`/dashboard/items/edit/${item.id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-sm text-red-600 underline"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {visibleItems.length === 0 && (
        <p className="text-center text-gray-500 mt-6">No items to display.</p>
      )}
    </div>
  );
};

export default SellerItemTable;
