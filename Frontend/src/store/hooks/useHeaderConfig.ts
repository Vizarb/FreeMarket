// src/hooks/useHeaderConfig.ts
import { useAppDispatch, useAppSelector } from '@/store/hooks/hooks';
import { setFilters } from '@/features/item/filterSlice';
import { ItemSearchParams } from '@/features/item/itemSearchSlice';
import { useCategories } from './useCategories'; // ✅ NEW HOOK

export function useHeaderConfig(defaultFilters: Partial<ItemSearchParams> = {}) {
  const dispatch = useAppDispatch();
  const savedFilters = useAppSelector((state) => state.filters);

  const baseFilters = { ...defaultFilters, seller: savedFilters.seller };

  const onSearch = (search: string) => {
    dispatch(setFilters({ ...baseFilters, search }));
  };

  const onFilterChange = (filters: Partial<ItemSearchParams>) => {
    dispatch(setFilters({ ...baseFilters, ...filters }));
  };

  const { categories } = useCategories(); // ✅ Use shared logic

  const formattedCategories = (categories || []).map((cat) => ({
    id: cat.id.toString(),
    name: cat.full_path,
  }));

  return { onSearch, onFilterChange, categories: formattedCategories };
}
