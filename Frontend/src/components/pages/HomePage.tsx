import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-indigo-50 to-white text-center px-4">
      <h1 className="text-4xl md:text-5xl font-bold text-indigo-700 mb-4">Welcome to FreeMarket</h1>
      <p className="text-lg md:text-xl text-gray-700 max-w-2xl mb-8">
        Your one-stop marketplace for physical products and digital services. Discover the best offers from verified sellers and freelancers.
      </p>
      <div className="space-x-4">
        <Link to="/marketplace">
          <Button size="lg">Explore Marketplace</Button>
        </Link>
        <Link to="/register">
          <Button variant="outline" size="lg">Join Now</Button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
