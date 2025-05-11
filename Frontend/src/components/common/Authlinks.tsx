// src/components/AuthLinks.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks/hooks';
import { logout } from '../../features/auth/authSlice';
import { clearTokens } from '../../utils/tokenManager';
import { Button } from '@/components/ui/button';

const AuthLinks: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector(state => state.auth);

  const handleLogout = () => {
    clearTokens();
    dispatch(logout());
  };

  if (isAuthenticated) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm">Welcome, {user?.username}</span>
        <Button variant="outline" onClick={handleLogout}>Logout</Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <Link to="/login">
        <Button variant="ghost">Login</Button>
      </Link>
      <Link to="/register">
        <Button>Register</Button>
      </Link>
    </div>
  );
};

export default AuthLinks;