// src/features/seller/AddProductForm.tsx
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAppDispatch } from '@/store/hooks/hooks';
import { createProductThunk } from '@/features/item/itemSlice';
import { useCategories } from '@/store/hooks/useCategories';

interface ProductFormState {
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  quantity: number;
  categories: number[];
  tags: string;
  image: File | null;
}

const AddProductForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { categories } = useCategories();

  const [form, setForm] = useState<ProductFormState>({
    name: '',
    description: '',
    price_cents: 0,
    currency: 'USD',
    quantity: 1,
    categories: [],
    tags: '',
    image: null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'price_cents' || name === 'quantity' ? Number(value) : value }));
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

    formData.append('tags', form.tags); // comma-separated

    await dispatch(createProductThunk(formData));
    setForm({ name: '', description: '', price_cents: 0, currency: 'USD', quantity: 1, categories: [], tags: '', image: null });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input name="name" placeholder="Product name" value={form.name} onChange={handleChange} required />
      <Textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />
      <Input name="price_cents" type="number" placeholder="Price (cents)" value={form.price_cents} onChange={handleChange} required />
      <Input name="quantity" type="number" placeholder="Quantity" value={form.quantity} onChange={handleChange} required />
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

      <Input name="tags" placeholder="Tags (comma-separated)" value={form.tags} onChange={handleChange} />
      <Input type="file" accept="image/*" onChange={handleFileChange} />

      <Button type="submit">Create Product</Button>
    </form>
  );
};

export default AddProductForm;
