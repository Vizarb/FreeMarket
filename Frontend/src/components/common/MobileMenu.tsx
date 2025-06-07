// src/components/MobileMenu.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Menu,
  Package,
  User2,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/useAuth';
import AuthLinks from './Authlinks';


const MobileMenu: React.FC = () => {
  const { isBuyer, isSeller, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu size={20} />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-64 p-4 space-y-4">
        <div className="font-bold text-lg text-indigo-600">
          FreeMarket Menu
        </div>

        <div className="flex flex-col gap-2">
          <Button variant="ghost" onClick={() => navigate('/become-seller')}>
            Apply to Sell
          </Button>
          {isAdmin && (
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/seller-applications')}
            >
              Review Applications
            </Button>
          )}

          {isBuyer || isAdmin ? (
            <Button
              variant="ghost"
              onClick={() => navigate('/orders')}
              className="justify-start"
            >
              <Package size={16} className="mr-2" />
              My Orders
            </Button>
          ) : null}

          {isSeller || isAdmin ? (
            <Button
              variant="ghost"
              onClick={() => navigate('/seller')}
              className="justify-start"
            >
              <User2 size={16} className="mr-2" />
              Seller Dashboard
            </Button>
          ) : null}

          {isAdmin && (
            <Button
              variant="ghost"
              onClick={() => navigate('/admin')}
              className="justify-start"
            >
              <ShieldCheck size={16} className="mr-2" />
              Admin Panel
            </Button>
          )}
        </div>

        <div className="pt-4 border-t">
          <AuthLinks />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
