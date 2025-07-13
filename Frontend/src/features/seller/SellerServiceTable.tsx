// SellerServiceTable.tsx
import React, { useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import api from '@/api/apiService';
import SellerItemTable from '@/features/seller/SellerItemTable';
import { Service } from '@/types/serviceType';

interface Column<T> {
  header: string;
  render: (item: T) => React.ReactNode;
}

const SellerServiceTable: React.FC = () => {
  const [items, setItems] = useState<Service[]>([]);
  const [showDeleted, setShowDeleted] = useState<boolean>(false);

  useEffect((): void => {
    const fetchServices = async (): Promise<void> => {
      try {
        const res = await api.get<Service[]>('/api/services/mine/');
        setItems(res.data);
      } catch (err: unknown) {
        const message = err instanceof AxiosError ? err.message : 'Failed to load services.';
        toast.error(message);
      }
    };
    fetchServices();
  }, []);

  const handleDelete = async (id: number): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;

    try {
      await api.patch(`/api/items/${id}/`, { is_deleted: true });
      toast.success('Service soft-deleted');
      setItems((prev: Service[]) =>
        prev.map((item: Service) => (item.id === id ? { ...item, is_deleted: true } : item))
      );
    } catch (err: unknown) {
      const message = err instanceof AxiosError ? err.message : 'Failed to delete service.';
      toast.error(message);
    }
  };

  const handleRestore = async (id: number): Promise<void> => {
    try {
      await api.post(`/api/items/${id}/restore/`);
      toast.success('Service restored');
      setItems((prev: Service[]) =>
        prev.map((item: Service) => (item.id === id ? { ...item, is_deleted: false } : item))
      );
    } catch (err: unknown) {
      const message = err instanceof AxiosError ? err.message : 'Failed to restore service.';
      toast.error(message);
    }
  };

  const columns: Column<Service>[] = [
    {
      header: 'Image',
      render: (i: Service): React.ReactNode =>
        i.image ? <img src={i.image} className="w-12 h-12 object-cover" alt={i.name} /> : 'No image',
    },
    { header: 'Name', render: (i: Service): React.ReactNode => i.name },
    { header: 'Price', render: (i: Service): React.ReactNode => `$${(i.price_cents / 100).toFixed(2)}` },
    { header: 'Type', render: (i: Service): React.ReactNode => i.service_type ?? '—' },
    { header: 'Duration (hrs)', render: (i: Service): React.ReactNode => i.service_duration ?? '—' },
    {
      header: 'Status',
      render: (i: Service): React.ReactNode =>
        i.is_deleted ? (
          <span className="text-red-600 text-sm">Deleted</span>
        ) : (
          <span className="text-green-700 text-sm">Active</span>
        ),
    },
    {
      header: 'Actions',
      render: (i: Service): React.ReactNode =>
        i.is_deleted ? (
          <button className="text-green-600 text-sm" onClick={() => handleRestore(i.id)}>
            Restore
          </button>
        ) : (
          <>
            <button className="text-blue-600 text-sm mr-2" onClick={() => alert('Edit')}>
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
    <SellerItemTable
      items={items}
      showDeleted={showDeleted}
      setShowDeleted={setShowDeleted}
      onDelete={handleDelete}
      onRestore={handleRestore}
      columns={columns}
    />
  );
};

export default SellerServiceTable;
