import React, { useEffect } from 'react';
import { ProtectedRoutes } from './ProtectedRoutes';
import { PublicRoutes } from './PublicRoutes';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { useAuthStore } from '@/store/zustandStores';

export const IndexRoutes: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);    
  const {  checkAuth, fetchUserProfile } = useAuthStore();

  useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchUserProfile();
        }
    }, [isAuthenticated, fetchUserProfile]);

  return isAuthenticated ? <ProtectedRoutes /> : <PublicRoutes />;
};