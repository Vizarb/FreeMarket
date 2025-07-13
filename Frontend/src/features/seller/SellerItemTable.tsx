// SellerItemTable.tsx (Generic Table Component)
import React from 'react';
import { Item } from '@/types/itemType';
import { Button } from '@/common/ui/button';

export interface Column<T> {
  header: string;
  render: (item: T) => React.ReactNode;
}

export interface ItemTableProps<T extends Item> {
  items: T[];
  showDeleted: boolean;
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
  setShowDeleted: React.Dispatch<React.SetStateAction<boolean>>;
  columns: Column<T>[];
}

function SellerItemTable<T extends Item>({
  items,
  showDeleted,
  setShowDeleted,
  columns,
}: ItemTableProps<T>): React.ReactElement {
  const visibleItems: T[] = showDeleted ? items : items.filter((item: T) => !item.is_deleted);

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-zinc-800">Your Items</h2>
        <Button onClick={(): void => setShowDeleted((prev) => !prev)} variant="outline">
          {showDeleted ? 'Hide Deleted' : 'Show Deleted'}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left border border-zinc-200 rounded-md">
          <thead className="bg-zinc-100 text-sm text-zinc-600">
            <tr>
              {columns.map((col: Column<T>, i: number) => (
                <th key={i} className="px-4 py-2 border-b">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((item: T) => (
              <tr key={item.id} className="border-t hover:bg-zinc-50 text-sm">
                {columns.map((col: Column<T>, i: number) => (
                  <td key={i} className="px-4 py-2">
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {visibleItems.length === 0 && (
        <p className="text-center text-zinc-500 mt-6 text-sm">No items to display.</p>
      )}
    </div>
  );
}

export default SellerItemTable;
