// src/features/seller/useMyShopSlug.ts
import { useEffect, useState } from 'react';
import api from '@/api/apiService';

interface SellerProfileResponse {
  slug: string;
}

export function useMyShopSlug(): { slug: string | null; loading: boolean } {
  const [slug, setSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSlug = async () => {
      try {
        const response = await api.get<SellerProfileResponse>('/api/seller-profiles/me/');
        setSlug(response.data.slug);
      } catch (err) {
        console.warn('No seller profile found for current user.', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSlug();
  }, []);

  return { slug, loading };
}
