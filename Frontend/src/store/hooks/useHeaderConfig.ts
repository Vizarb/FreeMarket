// src/hooks/useHeaderConfig.ts
import { useAppDispatch, useAppSelector } from '@/store/hooks/hooks';
import { setFilters } from '@/features/item/filterSlice';
import { ItemSearchParams } from '@/features/item/itemSearchSlice';
import { useCategories } from './useCategories';

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

  const { formattedCategories } = useCategories();

  return { onSearch, onFilterChange, categories: formattedCategories };
}