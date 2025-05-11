import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { publicRoutes, roleBasedRoutes } from './routeConfig';
import RoleProtectedRoute from './RoleProtectedRoute';
import Layout from '@/components/common/Layout';

const AppRoutes: React.FC = () => {
  return (
<Routes>
  {/* Public Routes */}
  {publicRoutes.map(({ path, component: Component }) => (
    <Route key={path} path={path} element={<Component />} />
  ))}

  {/* All Role-Based Routes (includes all authenticated pages) */}
  {roleBasedRoutes.map(({ path, component: Component, roles }) => (
    <Route
      key={path}
      path={path}
      element={
        <RoleProtectedRoute allowedRoles={roles}>
          <Layout />
        </RoleProtectedRoute>
      }
    >
      <Route index element={<Component />} />
    </Route>
  ))}
</Routes>

  );
};

export default AppRoutes;
