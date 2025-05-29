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

  {/* Role-Based Protected Routes */}
  <Route
    path="/"
    element={
      <RoleProtectedRoute allowedRoles={["Buyer", "Admin", "Seller"]}>
        <Layout />
      </RoleProtectedRoute>
    }
  >
    {roleBasedRoutes.map(({ path, component: Component }) => (
      <Route key={path} path={path} element={<Component />} />
    ))}
  </Route>
</Routes>


  );
};

export default AppRoutes;
