// src/features/product/ProductForm.tsx
import React, { useState } from 'react';
import { useItemFormFields } from '@/features/item/useItemFormFields';
import api from '@/api/apiService';
import { Currency } from '@/types/enums';

const ProductForm: React.FC = () => {
  const {
    name, setName,
    description, setDescription,
    priceCents, setPriceCents,
    currency, setCurrency,
    image, setImage,
  } = useItemFormFields();

  const [quantity, setQuantity] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price_cents', priceCents.toString());
    formData.append('currency', currency);
    formData.append('quantity', quantity.toString());
    if (image) formData.append('image', image);

    try {
      await api.post(`${import.meta.env.VITE_BACKEND_URL}/api/products/`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Product created!');
    } catch (err) {
      console.error(err);
      alert('Failed to create product');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white shadow rounded-xl max-w-xl mx-auto">
      <h2 className="text-xl font-bold">Add New Product</h2>
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
        className="border p-2 w-full"
      />
      <input
        type="number"
        value={priceCents}
        onChange={(e) => setPriceCents(Number(e.target.value))}
        placeholder="Price (in cents)"
        className="border p-2 w-full"
        required
      />
      <select
        value={currency}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCurrency(e.target.value as Currency)}
        className="border p-2 w-full"
      >
        <option value="USD">USD ($)</option>
        <option value="EUR">EUR (€)</option>
        <option value="GBP">GBP (£)</option>
      </select>
      <input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        placeholder="Quantity"
        className="border p-2 w-full"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files?.[0] || null)}
        className="border p-2 w-full"
      />
      <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded w-full">
        Submit
      </button>
    </form>
  );
};

export default ProductForm;
