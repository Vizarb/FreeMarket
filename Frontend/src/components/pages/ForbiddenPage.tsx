// src/components/pages/ForbiddenPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ForbiddenPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
      <h1 className="text-4xl font-bold text-red-600 mb-4">403 – Forbidden</h1>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
        You don’t have permission to access this page.
      </p>
      <Link to="/">
        <Button>Return to Home</Button>
      </Link>
    </div>
  );
};

export default ForbiddenPage;
