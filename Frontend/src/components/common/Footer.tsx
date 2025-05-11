import React from 'react';

const Footer: React.FC = () => (
  <footer className="bg-white border-t py-6 mt-12">
    <div className="container mx-auto px-4 text-center text-sm text-gray-500">
      © {new Date().getFullYear()} FreeMarket. All rights reserved.
    </div>
  </footer>
);

export default Footer;