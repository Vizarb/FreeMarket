// src/pages/SellerShopPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks/hooks';
import { fetchUnifiedItemResults, ItemSearchParams } from '@/features/item/itemSearchSlice';
import { selectFilters, setFilters } from '@/features/item/filterSlice';
import ItemList from '@/features/item/ItemList';
import api from '@/api/apiService';
import { SellerProfile } from '@/types/sellerTypes';
import { useHeaderConfig } from '@/store/hooks/useHeaderConfig';
import Header from '@/common/components/Header';
import { selectCurrentUser } from '@/features/auth/authSlice';

const SellerShopPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const filters = useAppSelector(selectFilters);
  const currentUser = useAppSelector(selectCurrentUser);

  const isOwner = currentUser?.id === profile?.user_id;
  const defaultSellerFilter = profile ? { seller: profile.username } : {};
  const { onSearch, onFilterChange, categories } = useHeaderConfig(defaultSellerFilter);

  useEffect(() => {
    const loadSellerProfile = async () => {
      try {
        const response = await api.get<SellerProfile>(`/api/seller-profiles/${slug}/`);
        const seller = response.data.username;
        setProfile(response.data);

        dispatch(setFilters({ seller }));
        dispatch(fetchUnifiedItemResults({ seller } as ItemSearchParams));
      } catch (error) {
        console.error('Failed to load seller profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) loadSellerProfile();
  }, [slug, dispatch]);

  useEffect(() => {
    if (profile) {
      dispatch(fetchUnifiedItemResults(filters));
    }
  }, [dispatch, filters, profile]);

  if (loading) return <p className="p-4">Loading seller shop...</p>;
  if (!profile) return <p className="p-4 text-red-600">Seller profile not found.</p>;

  return (
    <>
      <Header onSearch={onSearch} onFilterChange={onFilterChange} categories={categories} />
      <div className="p-6">
        <div className="mb-6 text-center">
          {profile.banner_image && (
            <img
              src={profile.banner_image}
              alt={`${profile.shop_name} banner`}
              className="w-full h-48 object-cover rounded mb-4"
            />
          )}
          <h1 className="text-3xl font-bold mb-1">{profile.shop_name}</h1>
          {profile.bio && <p className="text-gray-600">{profile.bio}</p>}
          {profile.website && (
            <p className="mt-2">
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Visit Website
              </a>
            </p>
          )}
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Items for sale by {profile.username}</h2>
          {isOwner && (
            <button
              onClick={() => navigate('/dashboard/items/new')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              + Add New Item
            </button>
          )}
        </div>

        <ItemList/>
      </div>
    </>
  );
};

export default SellerShopPage;
