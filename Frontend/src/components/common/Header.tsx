// src/components/Header.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCartSummary } from '../../store/hooks/useCart';
import AuthLinks from './Authlinks';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/features/auth/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Package, ShieldCheck, User2, Moon, Sun } from 'lucide-react';

const Header: React.FC = () => {
  const { itemCount } = useCartSummary();
  const { isAuthenticated, isBuyer, isSeller, isAdmin } = useAuth();

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const root = window.document.documentElement;
    const currentlyDark = root.classList.contains('dark');

    if (currentlyDark) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <header className="bg-white dark:bg-zinc-900 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/marketplace" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
          FreeMarket
        </Link>

        {/* Search Bar */}
        <div className="flex-1 mx-8">
          <Input
            placeholder="Search products or services..."
            className="w-full"
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center space-x-4">
          {/* Dark mode toggle */}
          <Button variant="ghost" onClick={toggleTheme} size="icon">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </Button>

          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Menu</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(isBuyer || isAdmin)&& (
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
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex items-center gap-2">
                      <ShieldCheck size={16} /> Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Cart */}
          {(isBuyer || isAdmin) && (
            <Link to="/cart" className="relative text-sm hover:underline">
              <div className="flex items-center gap-1">
                <ShoppingCart size={18} /> Cart
              </div>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>
          )}

          {/* Auth buttons */}
          <AuthLinks />
        </div>
      </div>
    </header>
  );
};

export default Header;
