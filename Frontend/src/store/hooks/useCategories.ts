// src/hooks/useCategories.ts
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks/hooks';
import { fetchCategories } from '@/features/category/categorySlice';

export const useCategories = () => {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state) => state.categories.items);
  const loading = useAppSelector((state) => state.categories.loading);
  const error = useAppSelector((state) => state.categories.error);

  useEffect(() => {
    if (!categories || categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories]);

  const formattedCategories = (categories || []).map((cat) => ({
    id: cat.id.toString(),
    name: cat.full_path,
  }));

  return { categories, formattedCategories, loading, error };
};
