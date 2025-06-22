// src/features/seller/SellerDashboard.tsx
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MyItems from './MyItems';
import AddProductForm from './AddProductForm';
import AddServiceForm from './AddServiceForm';

const SellerDashboard: React.FC = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Seller Dashboard</h2>

      <Tabs defaultValue="my-items" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="my-items">My Items</TabsTrigger>
          <TabsTrigger value="add-product">Add Product</TabsTrigger>
          <TabsTrigger value="add-service">Add Service</TabsTrigger>
        </TabsList>

        <TabsContent value="my-items">
          <MyItems />
        </TabsContent>

        <TabsContent value="add-product">
          <AddProductForm />
        </TabsContent>

        <TabsContent value="add-service">
          <AddServiceForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SellerDashboard;
