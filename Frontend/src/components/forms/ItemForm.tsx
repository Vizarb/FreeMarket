import React, { useState } from 'react';
import { Currency } from '@/types/enums';
import { Category } from '@/types/categoryType';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ItemFormInput = {
  name: string;
  description: string | null;
  price_cents: number;
  currency: Currency;
  categories: number[];
  image?: File | string | null;
};

interface ItemFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<ItemFormInput>;
  categories: Category[];
  onSubmit: (formData: FormData) => void;
  isSubmitting: boolean;
}

const ItemForm: React.FC<ItemFormProps> = ({
  mode,
  initialData = {},
  categories,
  onSubmit,
  isSubmitting,
}) => {
  const [name, setName] = useState(initialData.name ?? '');
  const [description, setDescription] = useState(initialData.description ?? '');
  const [priceCents, setPriceCents] = useState(initialData.price_cents ?? 0);
  const [currency, setCurrency] = useState(initialData.currency ?? Currency.USD);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialData.categories?.map((id) => String(id)) ?? []
  );
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price_cents', priceCents.toString());
    formData.append('currency', currency);
    selectedCategories.forEach((id) => formData.append('categories', id));
    if (image) formData.append('image', image);

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-md border">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            value={priceCents}
            onChange={(e) => setPriceCents(Number(e.target.value))}
            min={0}
            required
          />
        </div>

        <div className="flex-1">
          <Label htmlFor="currency">Currency</Label>
          <Select value={currency} onValueChange={(val) => setCurrency(val as Currency)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(Currency).map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="categories">Categories</Label>
        <select
          multiple
          value={selectedCategories}
          onChange={(e) =>
            setSelectedCategories(Array.from(e.target.selectedOptions, (opt) => opt.value))
          }
          className="w-full border rounded px-3 py-2 h-32"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="image">Image</Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] ?? null)}
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {mode === 'create' ? 'Create Item' : 'Update Item'}
      </Button>
    </form>
  );
};

export default ItemForm;
