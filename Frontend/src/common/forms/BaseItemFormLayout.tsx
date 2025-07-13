import React, { useState, useEffect } from 'react';
import { Currency } from '@/types/enums';
import { useCategories } from '@/store/hooks/useCategories';
import { toast } from 'sonner';
import type { Category } from '@/types/categoryType';

interface BaseItemFormLayoutProps {
  name: string;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  priceCents: number;
  setPriceCents: (v: number) => void;
  currency: Currency;
  setCurrency: (v: Currency) => void;
  image: File | null;
  setImage: (f: File | null) => void;
  onSubmit: (formData: FormData) => void;
  isSubmitting?: boolean;
  children?: React.ReactNode;
  title?: string;
}

const BaseItemFormLayout: React.FC<BaseItemFormLayoutProps> = ({
  name, setName,
  description, setDescription,
  priceCents, setPriceCents,
  currency, setCurrency,
  image, setImage,
  onSubmit, isSubmitting = false,
  children,
  title = 'Create Item',
}) => {
  const { categories, loading: categoriesLoading } = useCategories();

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (image instanceof File) {
      const objectUrl = URL.createObjectURL(image);
      setImagePreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setImagePreviewUrl(null);
  }, [image]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // === Basic validation with toasts ===
    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }

    if (!priceCents || priceCents <= 0) {
      toast.error("Price must be a positive number.");
      return;
    }

    if (!currency) {
      toast.error("Currency is required.");
      return;
    }

    if (selectedCategories.length === 0) {
      toast.error("Please select at least one category.");
      return;
    }

    // === Build form data ===
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price_cents', priceCents.toString());
    formData.append('currency', currency);
    selectedCategories.forEach((catId) => formData.append('category_ids', catId));
    if (image) formData.append('image', image);

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 bg-white shadow rounded-xl max-w-xl mx-auto">
    <h2 className="text-xl font-bold">{title}</h2>

    {/* Item Info */}
    <div>
      <h3 className="text-lg font-semibold mb-1">Item Name & Description</h3>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className="border p-2 w-full"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="border p-2 w-full mt-2"
      />
    </div>

    {/* Pricing */}
    <div>
      <h3 className="text-lg font-semibold mb-1">Pricing</h3>
      <input
        type="number"
        value={priceCents}
        onChange={(e) => setPriceCents(Number(e.target.value))}
        placeholder="Price (in cents)"
        className="border p-2 w-full"
        required
      />
    </div>

    {/* Currency */}
    <div>
      <h3 className="text-lg font-semibold mb-1">Currency</h3>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as Currency)}
        className="border p-2 w-full"
      >
        {Object.values(Currency).map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>

    {/* Categories */}
    <div>
      <h3 className="text-lg font-semibold mb-1">Categories</h3>
      <select
        multiple
        value={selectedCategories}
        onChange={(e) => {
          const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
          setSelectedCategories(selected);
        }}
        className="border p-2 w-full"
      >
        {categories.map((cat: Category) => (
          <option key={cat.id} value={cat.id.toString()}>{cat.full_path}</option>
        ))}
      </select>
      {categoriesLoading && <p className="text-sm text-gray-500 mt-1">Loading categories…</p>}
    </div>

    {/* Image */}
    <div>
      <h3 className="text-lg font-semibold mb-1">Item Image</h3>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files?.[0] || null)}
        className="border p-2 w-full"
      />
      {imagePreviewUrl && (
        <img
          src={imagePreviewUrl}
          alt="Preview"
          className="max-h-48 object-contain border rounded mt-2"
        />
      )}
    </div>

    {children}

    <button
      type="submit"
      disabled={isSubmitting}
      className="bg-blue-600 text-white py-2 px-4 rounded w-full"
    >
      {isSubmitting ? 'Submitting…' : 'Submit'}
    </button>
  </form>

  );
};

export default BaseItemFormLayout;
