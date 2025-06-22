// src/features/seller/AddServiceForm.tsx
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAppDispatch } from '@/store/hooks/hooks';
import { createServiceThunk } from '@/features/item/itemSlice';
import { useCategories } from '@/hooks/useCategories';

interface ServiceFormState {
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  service_duration: number;
  service_type: string;
  categories: number[];
  image: File | null;
}

const AddServiceForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { categories } = useCategories();

  const [form, setForm] = useState<ServiceFormState>({
    name: '',
    description: '',
    price_cents: 0,
    currency: 'USD',
    service_duration: 60,
    service_type: 'Other',
    categories: [],
    image: null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'price_cents' || name === 'service_duration' ? Number(value) : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setForm((prev) => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleCategoryToggle = (catId: number) => {
    setForm((prev) => {
      const alreadySelected = prev.categories.includes(catId);
      return {
        ...prev,
        categories: alreadySelected
          ? prev.categories.filter((id) => id !== catId)
          : [...prev.categories, catId],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (key === 'categories') {
        value.forEach((catId) => formData.append('categories', String(catId)));
      } else if (key === 'image' && value instanceof File) {
        formData.append('image', value);
      } else {
        formData.append(key, String(value));
      }
    });

    await dispatch(createServiceThunk(formData));
    setForm({
      name: '',
      description: '',
      price_cents: 0,
      currency: 'USD',
      service_duration: 60,
      service_type: 'Other',
      categories: [],
      image: null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input name="name" placeholder="Service name" value={form.name} onChange={handleChange} required />
      <Textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />
      <Input name="price_cents" type="number" placeholder="Price (cents)" value={form.price_cents} onChange={handleChange} required />
      <Input name="service_duration" type="number" placeholder="Duration (minutes)" value={form.service_duration} onChange={handleChange} required />
      <Input name="service_type" placeholder="Type (e.g. tutoring, repair)" value={form.service_type} onChange={handleChange} required />
      <Input name="currency" value={form.currency} onChange={handleChange} required />

      <div>
        <label className="block text-sm font-medium mb-1">Categories</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              type="button"
              variant={form.categories.includes(cat.id) ? 'default' : 'outline'}
              onClick={() => handleCategoryToggle(cat.id)}
            >
              {cat.full_path}
            </Button>
          ))}
        </div>
      </div>

      <Input type="file" accept="image/*" onChange={handleFileChange} />

      <Button type="submit">Create Service</Button>
    </form>
  );
};

export default AddServiceForm;
