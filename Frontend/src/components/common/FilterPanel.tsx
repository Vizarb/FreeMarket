import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface FilterState {
  currency: string;
  item_type: string;
  min_price: number;
  max_price: number;
  category_id: string;
}

interface FilterPanelProps {
  onChange: (filters: Partial<FilterState>) => void;
  defaultValues?: Partial<FilterState>;
  categories?: { id: string; name: string }[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  onChange,
  defaultValues = {},
  categories = [],
}) => {
  const [filters, setFilters] = useState<FilterState>({
    currency: defaultValues.currency || '',
    item_type: defaultValues.item_type || '',
    min_price: defaultValues.min_price ?? 0,
    max_price: defaultValues.max_price ?? 10000,
    category_id: defaultValues.category_id || '',
  });

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      ...defaultValues,
    }));
  }, [defaultValues]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = ([min, max]: number[]) => {
    setFilters((prev) => ({ ...prev, min_price: min, max_price: max }));
  };

  const handleApplyFilters = () => {
    onChange(filters);
  };

  const handleClear = () => {
    const cleared: FilterState = {
      currency: '',
      item_type: '',
      min_price: 0,
      max_price: 10000,
      category_id: '',
    };
    setFilters(cleared);
    onChange(cleared);
  };

  return (
    <div className="space-y-4 p-4 w-full max-w-sm">
      {/* Currency */}
      <div>
        <Label htmlFor="currency">Currency</Label>
        <select
          id="currency"
          name="currency"
          value={filters.currency}
          onChange={handleInputChange}
          className="w-full border px-2 py-1 rounded"
        >
          <option value="">All</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
        </select>
      </div>

      {/* Item Type */}
      <div>
        <Label htmlFor="item_type">Item Type</Label>
        <select
          id="item_type"
          name="item_type"
          value={filters.item_type}
          onChange={handleInputChange}
          className="w-full border px-2 py-1 rounded"
        >
          <option value="">All</option>
          <option value="product">Product</option>
          <option value="service">Service</option>
        </select>
      </div>

      {/* Category */}
      <div>
        <Label htmlFor="category_id">Category</Label>
        <select
          id="category_id"
          name="category_id"
          value={filters.category_id}
          onChange={handleInputChange}
          className="w-full border px-2 py-1 rounded"
        >
          <option value="">All</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <Label>Price (${filters.min_price / 100} – ${filters.max_price / 100})</Label>
        <Slider
          min={0}
          max={100000}
          step={1000}
          value={[filters.min_price, filters.max_price]}
          onValueChange={handleSliderChange}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-between gap-2 pt-2">
        <Button variant="outline" onClick={handleClear} className="flex-1">
          Clear
        </Button>
        <Button onClick={handleApplyFilters} className="flex-1">
          Apply
        </Button>
      </div>
    </div>
  );
};

export default FilterPanel;
