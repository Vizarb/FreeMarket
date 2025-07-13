import React, { useState } from 'react';
import ServiceForm from '@/features/service/ServiceForm';
import { toast } from 'sonner';
import api from '@/api/apiService';
import { useNavigate } from 'react-router-dom';
import DefaultHeader from '@/common/components/DefaultHeader';

const NewServicePage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      await api.post('/api/services/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Service created successfully!');
      navigate('/seller-dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create service';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <DefaultHeader />
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create New Service</h1>
      <ServiceForm
        mode="create"
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
      />
    </div>
    </>
  );
};

export default NewServicePage;
