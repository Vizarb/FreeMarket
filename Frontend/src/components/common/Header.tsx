import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartSummary } from '../../store/hooks/useCart';
import AuthLinks from './Authlinks';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import { useAuth } from '@/features/auth/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
  ShoppingCart,
  Package,
  ShieldCheck,
  User2,
  Moon,
  Sun,
  Menu,
  SlidersHorizontal,
} from 'lucide-react';
import MobileMenu from './MobileMenu';
import { useAppDispatch } from '@/store/hooks/hooks';
import { FilterState, resetFilters } from '@/features/item/filterSlice';



interface HeaderProps {
  onSearch?: (query: string) => void;
  onFilterChange?: (filters: Partial<FilterState>) => void;
  categories?: { id: string; name: string }[];
}

const Header: React.FC<HeaderProps> = ({ onSearch, onFilterChange  = () => {}, categories = [] }) => {
  const dispatch = useAppDispatch();

  const { itemCount } = useCartSummary();
  const { isAuthenticated, isBuyer, isSeller, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);

  const handleLogoClick = () => {
  dispatch(resetFilters()); // reset Redux filter state
  navigate('/marketplace');
};


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
    <header className="bg-white dark:bg-zinc-900 shadow-sm w-full sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Logo + Theme Toggle */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <span
            onClick={handleLogoClick}
            className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:opacity-80 transition-opacity"
          >
            FreeMarket
          </span>
          <Button variant="ghost" onClick={toggleTheme} size="icon">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
        </div>

        {/* Center: SearchBar + Filters */}
        <div className="flex flex-grow gap-2 min-w-[280px] sm:min-w-[400px] items-start">
          <div className="flex-grow">
            <SearchBar onSearch={onSearch} />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <SlidersHorizontal size={18} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0">
              <FilterPanel
                onChange={onFilterChange}
                categories={categories}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Right: User Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {isAuthenticated && (isBuyer || isAdmin) && (
            <Link
              to="/cart"
              className="relative flex items-center text-sm gap-1 hover:underline"
            >
              <ShoppingCart size={18} />
              <span>Cart</span>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>
          )}

          {isAuthenticated && (
            <>
              <div className="hidden md:block">
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
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center gap-2">
                          <ShieldCheck size={16} /> Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Mobile Drawer */}
              <div className="block md:hidden">
                <MobileMenu />
              </div>
            </>
          )}

          <AuthLinks />
        </div>
      </div>
    </header>
  );
};

export default Header;
