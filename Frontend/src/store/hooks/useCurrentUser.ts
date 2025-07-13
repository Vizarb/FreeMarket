import { useSelector } from 'react-redux';
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthLoaded,
  selectGroups,
  selectUserId,
  selectUsername,
} from '@/features/auth/authSlice';

const useCurrentUser = () => {
  const user = useSelector(selectCurrentUser);
  const userId = useSelector(selectUserId);
  const username = useSelector(selectUsername);
  const groups = useSelector(selectGroups);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authLoaded = useSelector(selectAuthLoaded);

  const isAdmin = groups.includes('admin');
  const isSeller = groups.includes('seller');
  const isBuyer = groups.includes('buyer');

  return {
    user,
    userId,
    username,
    groups,
    isAuthenticated,
    authLoaded,
    isAdmin,
    isSeller,
    isBuyer,
  };
};

export default useCurrentUser;
