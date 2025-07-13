import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '@/store/hooks/hooks';
import { fetchUnifiedItemResults, ItemSearchParams } from '@/features/item/itemSearchSlice';
import { setFilters } from '@/features/item/filterSlice';
import api from '@/api/apiService';
import { SellerProfile } from '@/types/sellerTypes';
import { useNavigate } from 'react-router-dom';
import Header from '@/common/components/Header';
import PanelFormWrapper from '@/features/auth/PanelFormWrapper';
import ProductTable from './SellerProductTable';
import ServiceTable from './SellerServiceTable';
import { Button } from '@/common/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/common/ui/dropdown-menu';

const SellerDashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [itemType, setItemType] = useState<'product' | 'service'>('product');

  useEffect(() => {
    const loadSeller = async (): Promise<void> => {
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
      <Header />
      <div className="p-6 ">
        <PanelFormWrapper title="Manage Your Shop" onSubmit={(e) => e.preventDefault()}>
          <div className="flex justify-center items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" className="bg-green-600 hover:bg-green-700 text-white">
                  + Add New Item
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => {
                  setItemType('product');
                  navigate('/seller-dashboard/new/product');
                }}>
                  {itemType}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setItemType('service');
                  navigate('/seller-dashboard/new/service');
                }}>
                  Service
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-6 space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">Products</h3>
              <ProductTable />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Services</h3>
              <ServiceTable />
            </div>
          </div>
        </PanelFormWrapper>
      </div>
    </>
  );
};

export default SellerDashboardPage;
