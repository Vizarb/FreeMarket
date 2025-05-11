// src/hooks/useCustomNavigate.ts

import { useNavigate } from 'react-router-dom';
import { useAppSelector } from './hooks';
import { selectIsAuthenticated } from '../../features/auth/authSlice';

const useCustomNavigate = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Navigate to a protected route
  const goToProtectedRoute = (path: string) => {
    if (isAuthenticated) {
      navigate(path);
    } else {
      alert('You need to be logged in to access this page.');
      navigate('/login');
    }
  };

  // Navigate to a public route
  const goToPublicRoute = (path: string) => {
    navigate(path);
  };

  // Redirect to Login if not authenticated
  const redirectToLogin = () => {
    navigate('/login');
  };

  // Navigate to Home
  const goToHome = () => {
    navigate('/');
  };

  return {
    goToProtectedRoute,
    goToPublicRoute,
    redirectToLogin,
    goToHome,
  };
};

export default useCustomNavigate;
