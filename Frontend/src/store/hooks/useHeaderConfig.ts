// src/hooks/useHeaderConfig.ts
import { useAppDispatch, useAppSelector } from '@/store/hooks/hooks';
import { setFilters } from '@/features/item/filterSlice';
import { ItemSearchParams } from '@/features/item/itemSearchSlice';
import { Category } from '@/types/categoryType';

export function useHeaderConfig(defaultFilters: Partial<ItemSearchParams> = {}) {
  const dispatch = useAppDispatch();
  const { items: categories } = useAppSelector((state) => state.categories);
  const savedFilters = useAppSelector((state) => state.filters);

  const baseFilters = { ...defaultFilters, seller: savedFilters.seller };

  const onSearch = (search: string) => {
    dispatch(setFilters({ ...baseFilters, search }));
  };

  const onFilterChange = (filters: Partial<ItemSearchParams>) => {
    dispatch(setFilters({ ...baseFilters, ...filters }));
  };

  const formattedCategories = (categories || []).map((cat: Category) => ({
    id: cat.id.toString(),
    name: cat.full_path,
  }));

  return { onSearch, onFilterChange, categories: formattedCategories };
}
