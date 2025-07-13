// NewProductPage.tsx
import React, { useState } from 'react';
import ProductForm from '@/features/product/ProductForm';
import { toast } from 'sonner';
import api from '@/api/apiService';
import { useNavigate } from 'react-router-dom';
import DefaultHeader from '@/common/components/DefaultHeader';

const NewProductPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      await api.post('/api/products/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Product created successfully!');
      navigate('/seller-dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create product';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
<>
    <DefaultHeader />
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create New Product</h1>
      <ProductForm
        mode="create"
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
      />
    </div>
</>
  );
};

export default NewProductPage;