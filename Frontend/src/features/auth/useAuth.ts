// src/features/auth/useAuth.ts
import { useAppSelector } from '@/store/hooks/hooks';
import {
  selectIsAuthenticated,
  selectAuthLoaded,
  selectCurrentUser,
  selectGroups,
} from './authSlice';

export const useAuth = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const authLoaded      = useAppSelector(selectAuthLoaded);
  const user            = useAppSelector(selectCurrentUser);
  const groups          = useAppSelector(selectGroups);

  // role helpers
  const hasGroup = (name: string) => groups.includes(name);
  const isAdmin  = hasGroup('Admin');
  const isSeller = hasGroup('Seller');
  const isBuyer  = hasGroup('Buyer');
  const isSupport = hasGroup('Support');
  const isManager = hasGroup('Manager')

  return { isAuthenticated, authLoaded, user, groups, hasGroup, isAdmin, isSeller, isBuyer, isSupport, isManager };
};
