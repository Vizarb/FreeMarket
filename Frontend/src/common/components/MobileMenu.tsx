// src/MobileMenu.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/common/ui/sheet';
import {
  Menu,
  Package,
  LayoutDashboard,
  Store,
  ShieldCheck,
  NotebookTabs,
  UserRoundPen,
} from 'lucide-react';
import { Button } from '@/common/ui/button';
import { useAuth } from '@/features/auth/useAuth';
import { useMyShopSlug } from '@/features/seller/useMyShopSlug';
import AuthLinks from '../../features/auth/Authlinks';

const MobileMenu: React.FC = () => {
  const { isBuyer, isSeller, isAdmin, isAuthenticated } = useAuth();
  const { slug: myShopSlug } = useMyShopSlug();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu size={20} />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-64 p-4 space-y-4">
        <div className="font-bold text-lg text-indigo-600">
          FreeMarket Menu
        </div>

        {isAuthenticated && (
          <div className="flex flex-col gap-2">
            <Link to="/become-seller">
              <Button variant="outline" className="w-full justify-start gap-2">
                <UserRoundPen size={16} />
                Apply to Sell
              </Button>
            </Link>

            {isAdmin && (
              <Link to="/admin/seller-applications">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <NotebookTabs size={16} />
                  Review Applications
                </Button>
              </Link>
            )}

            {(isBuyer || isAdmin) && (
              <Link to="/orders">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Package size={16} />
                  My Orders
                </Button>
              </Link>
            )}

            {(isSeller || isAdmin) && (
              <Link to="/seller-dashboard">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <LayoutDashboard size={16} />
                  Seller Dashboard
                </Button>
              </Link>
            )}

            {(isSeller || isAdmin) && myShopSlug && (
              <Link to={`/shop/${myShopSlug}`}>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Store size={16} />
                  My Shop
                </Button>
              </Link>
            )}

            {isAdmin && (
              <Link to="/admin">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <ShieldCheck size={16} />
                  Admin Panel
                </Button>
              </Link>
            )}
          </div>
        )}

        <div className="pt-4 border-t">
          <AuthLinks />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
