import React, { useEffect, useState } from 'react';
import ItemForm from '@/components/forms/ItemForm';
import { Category } from '@/types/categoryType';
import { toast } from 'sonner';
import api from '@/api/apiService';
import { useNavigate } from 'react-router-dom';

const NewItemPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get<Category[]>('/api/category/');
        setCategories(res.data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load categories';
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCreate = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      await api.post('/api/items/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Item created successfully!');
      navigate('/seller-dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create item';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create New Item</h1>
      <ItemForm
        mode="create"
        onSubmit={handleCreate}
        categories={categories}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default NewItemPage;
