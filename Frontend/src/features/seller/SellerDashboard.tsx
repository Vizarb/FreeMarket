import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '@/store/hooks/hooks';
import { fetchUnifiedItemResults, ItemSearchParams } from '@/features/item/itemSearchSlice';
import { setFilters } from '@/features/item/filterSlice';
import api from '@/api/apiService';
import { SellerProfile } from '@/types/sellerTypes';
import { useNavigate } from 'react-router-dom';
import SellerItemTable from './SellerItemTable';
import Header from '@/components/common/DefaultHeader';

const SellerDashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSeller = async () => {
      try {
        const res = await api.get<SellerProfile>('/api/seller-profiles/me/');
        setProfile(res.data);
        dispatch(setFilters({ seller: res.data.username }));
        dispatch(fetchUnifiedItemResults({ seller: res.data.username } as ItemSearchParams));
      } catch (err) {
        console.error('Failed to fetch seller profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSeller();
  }, [dispatch]);

  if (loading) return <p className="p-4">Loading your shop...</p>;
  if (!profile) return <p className="p-4 text-red-600">You don't have a seller profile.</p>;

  return (
        <>
        <Header
      />
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Your Shop</h1>
        <button
          onClick={() => navigate('/seller-dashboard/items/new')}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          + Add New Item
        </button>
      </div>

    <SellerItemTable />
    </div>
    </>
  );
};

export default SellerDashboardPage;
