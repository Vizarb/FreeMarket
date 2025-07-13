// src/common/UserDropdownMenu.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';
import { useMyShopSlug } from '@/features/seller/useMyShopSlug';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/common/ui/dropdown-menu';
import { Button } from '@/common/ui/button';
import {
  Menu,
  Package,
  ShieldCheck,
  LayoutDashboard,
  Store,
  NotebookTabs,
  UserRoundPen,
} from 'lucide-react';

const UserDropdownMenu: React.FC = () => {
  const { isAuthenticated, isSeller, isBuyer, isAdmin } = useAuth();
  const { slug: myShopSlug } = useMyShopSlug();

  if (!isAuthenticated) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Menu size={16} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to="/become-seller" className="flex items-center gap-2 w-full">
            <UserRoundPen size={16} />
            Apply to Sell
          </Link>
        </DropdownMenuItem>

        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link to="/admin/seller-applications" className="flex items-center gap-2 w-full">
              <NotebookTabs size={16} />
              Review Applications
            </Link>
          </DropdownMenuItem>
        )}

        {(isBuyer || isAdmin) && (
          <DropdownMenuItem asChild>
            <Link to="/orders" className="flex items-center gap-2 w-full">
              <Package size={16} />
              My Orders
            </Link>
          </DropdownMenuItem>
        )}

        {(isSeller || isAdmin) && (
          <DropdownMenuItem asChild>
            <Link to="/seller-dashboard" className="flex items-center gap-2 w-full">
              <LayoutDashboard size={16} />
              Seller Dashboard
            </Link>
          </DropdownMenuItem>
        )}

        {(isSeller || isAdmin) && myShopSlug && (
          <DropdownMenuItem asChild>
            <Link to={`/shop/${myShopSlug}`} className="flex items-center gap-2 w-full">
              <Store size={16} />
              My Shop
            </Link>
          </DropdownMenuItem>
        )}

        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link to="/admin" className="flex items-center gap-2 w-full">
              <ShieldCheck size={16} />
              Admin Panel
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdownMenu;
