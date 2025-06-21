import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks/hooks';
import {
  selectFilters,
  setFilters,
  FilterState,
  initialState,
  resetFiltersExceptSeller,
} from '@/features/item/filterSlice';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface FilterPanelProps {
  onChange: (filters: Partial<FilterState>) => void;
  categories?: { id: string; name: string }[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onChange, categories = [] }) => {
  const dispatch = useAppDispatch();
  const savedFilters = useAppSelector(selectFilters);

  const [localFilters, setLocalFilters] = useState<FilterState>(savedFilters);

  // Keep local state in sync when Redux changes externally
  useEffect(() => {
    setLocalFilters(savedFilters);
  }, [savedFilters]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSliderChange = ([min, max]: number[]) => {
    setLocalFilters((prev) => ({
      ...prev,
      min_price: min,
      max_price: max,
    }));
  };

  const handleApplyFilters = () => {
    const merged = { ...localFilters, seller: savedFilters.seller }; // Preserve seller
    dispatch(setFilters(merged));
    onChange(merged);
  };

  const handleClear = () => {
    dispatch(resetFiltersExceptSeller());
    onChange({ ...initialState, seller: savedFilters.seller });
  };

  return (
    <div className="space-y-4 p-4 w-full max-w-sm">
      {/* Item Type */}
      <div>
        <Label htmlFor="item_type">Item Type</Label>
        <select
          id="item_type"
          name="item_type"
          value={localFilters.item_type}
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
          value={localFilters.category_id}
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
        <Label>Price (${localFilters.min_price / 100} – ${localFilters.max_price / 100})</Label>
        <Slider
          min={0}
          max={100000}
          step={1000}
          value={[localFilters.min_price, localFilters.max_price]}
          onValueChange={handleSliderChange}
        />
      </div>

      {/* Sorting */}
      <div>
        <Label htmlFor="ordering">Sort By</Label>
        <select
          id="ordering"
          name="ordering"
          value={localFilters.ordering}
          onChange={handleInputChange}
          className="w-full border px-2 py-1 rounded"
        >
          <option value="">Default</option>
          <option value="price_cents">Price: Low to High</option>
          <option value="-price_cents">Price: High to Low</option>
          <option value="-created_at">Newest</option>
          <option value="name">Name (A–Z)</option>
        </select>
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
