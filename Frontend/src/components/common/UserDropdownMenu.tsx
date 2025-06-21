// src/components/common/UserDropdownMenu.tsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';
import { useMyShopSlug } from '@/features/seller/useMyShopSlug';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Menu,
  Package,
  ShieldCheck,
  User2,
  UserX2,
} from 'lucide-react';

const UserDropdownMenu: React.FC = () => {
  const navigate = useNavigate();
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
          <Button
            variant="ghost"
            onClick={() => navigate('/become-seller')}
            className="w-full justify-start"
          >
            Apply to Sell
          </Button>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/seller-applications')}
            className="w-full justify-start"
          >
            Review Applications
          </Button>
        </DropdownMenuItem>

        {(isBuyer || isAdmin) && (
          <DropdownMenuItem asChild>
            <Link to="/orders" className="flex items-center gap-2">
              <Package size={16} /> My Orders
            </Link>
          </DropdownMenuItem>
        )}

        {(isSeller || isAdmin) && (
          <DropdownMenuItem asChild>
            <Link to="/seller" className="flex items-center gap-2">
              <User2 size={16} /> Seller Dashboard
            </Link>
          </DropdownMenuItem>
        )}

        {(isSeller || isAdmin) && myShopSlug && (
          <DropdownMenuItem asChild>
            <Link to={`/shop/${myShopSlug}`} className="flex items-center gap-2">
              <UserX2 size={16} /> My Shop
            </Link>
          </DropdownMenuItem>
        )}

        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link to="/admin" className="flex items-center gap-2">
              <ShieldCheck size={16} /> Admin Panel
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdownMenu;
