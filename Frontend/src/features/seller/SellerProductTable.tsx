// SellerProductTable.tsx
import React, { useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import api from '@/api/apiService';
import SellerItemTable, { Column } from '@/features/seller/SellerItemTable';
import { Product } from '@/types/productType';

const SellerProductTable: React.FC = () => {
  const [items, setItems] = useState<Product[]>([]);
  const [showDeleted, setShowDeleted] = useState<boolean>(false);

  useEffect((): void => {
    const fetchProducts = async (): Promise<void> => {
      try {
        const res = await api.get<Product[]>('/api/products/mine/');
        setItems(res.data);
      } catch (err: unknown) {
        const message = err instanceof AxiosError ? err.message : 'Failed to load products.';
        toast.error(message);
      }
    };
    fetchProducts();
  }, []);

  const handleDelete = async (id: number): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await api.patch(`/api/items/${id}/`, { is_deleted: true });
      toast.success('Product soft-deleted');
      setItems((prev: Product[]) =>
        prev.map((item: Product) => (item.id === id ? { ...item, is_deleted: true } : item))
      );
    } catch (err: unknown) {
      const message = err instanceof AxiosError ? err.message : 'Failed to delete product.';
      toast.error(message);
    }
  };

  const handleRestore = async (id: number): Promise<void> => {
    try {
      await api.post(`/api/items/${id}/restore/`);
      toast.success('Product restored');
      setItems((prev: Product[]) =>
        prev.map((item: Product) => (item.id === id ? { ...item, is_deleted: false } : item))
      );
    } catch (err: unknown) {
      const message = err instanceof AxiosError ? err.message : 'Failed to restore product.';
      toast.error(message);
    }
  };

  const columns: Column<Product>[] = [
    {
      header: 'Image',
      render: (i: Product): React.ReactNode =>
        i.image ? <img src={i.image} className="w-12 h-12 object-cover" alt={i.name} /> : 'No image',
    },
    { header: 'Name', render: (i: Product): React.ReactNode => i.name },
    { header: 'Price', render: (i: Product): React.ReactNode => `$${(i.price_cents / 100).toFixed(2)}` },
    { header: 'Quantity', render: (i: Product): React.ReactNode => i.quantity ?? '—' },
    {
      header: 'Status',
      render: (i: Product): React.ReactNode =>
        i.is_deleted ? (
          <span className="text-red-600 text-sm">Deleted</span>
        ) : (
          <span className="text-green-700 text-sm">Active</span>
        ),
    },
    {
      header: 'Actions',
      render: (i: Product): React.ReactNode =>
        i.is_deleted ? (
          <button className="text-green-600 text-sm" onClick={() => handleRestore(i.id)}>
            Restore
          </button>
        ) : (
          <>
            <button className="text-blue-600 text-sm mr-2" onClick={(): void => alert('Edit')}>
              Edit
            </button>
            <button className="text-red-600 text-sm" onClick={() => handleDelete(i.id)}>
              Delete
            </button>
          </>
        ),
    },
  ];

  return (
    <SellerItemTable<Product>
      items={items}
      showDeleted={showDeleted}
      setShowDeleted={setShowDeleted}
      onDelete={handleDelete}
      onRestore={handleRestore}
      columns={columns}
    />
  );
};

export default SellerProductTable;
