import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks/hooks';
import { logout } from '../../features/auth/authSlice';
import { clearTokens } from '../../utils/tokenManager';
import { Button } from '@/components/ui/button';

const AuthLinks: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    clearTokens();
    dispatch(logout());
  };

  if (isAuthenticated) {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-sm">
        <span className="text-gray-600 dark:text-gray-300 text-center sm:text-left">
          Welcome, <span className="font-medium">{user?.username}</span>
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="hidden sm:inline-flex"
        >
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <Link to="/login">
        <Button variant="ghost" size="sm">
          Login
        </Button>
      </Link>
      <Link to="/register">
        <Button size="sm">Register</Button>
      </Link>
    </div>
  );
};

export default AuthLinks;
