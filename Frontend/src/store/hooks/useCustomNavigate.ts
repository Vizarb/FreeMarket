// src/hooks/useCustomNavigate.ts

import { useNavigate } from 'react-router-dom';
import { useAppSelector } from './hooks';
import { selectIsAuthenticated } from '@/features/auth/authSlice';
import { toast } from 'sonner';

const useCustomNavigate = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Navigate to a protected route
  const goToProtectedRoute = (path: string) => {
    if (isAuthenticated) {
      navigate(path);
    } else {
      toast.error('You need to be logged in to access this page.');
      navigate('/login', { state: { from: path } });
    }
  };

  // Navigate to a public route
  const goToPublicRoute = (path: string) => {
    navigate(path);
  };

  // Redirect to login, with optional redirect target
  const redirectToLogin = (redirectTo?: string) => {
    if (redirectTo) {
      navigate('/login', { state: { from: redirectTo } });
    } else {
      navigate('/login');
    }
  };

  // Navigate to home page
  const goToHome = () => {
    navigate('/');
  };

  // Go back in browser history
  const goBack = () => {
    navigate(-1);
  };

  return {
    goToProtectedRoute,
    goToPublicRoute,
    redirectToLogin,
    goToHome,
    goBack,
  };
};

export default useCustomNavigate;
