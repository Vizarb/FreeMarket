import React from 'react';
import Header from './Header';

const DefaultHeader: React.FC = () => {  
  return (
    <Header
      onSearch={() => {}}
      onFilterChange={() => {}}
      categories={[]}
    />
  );
};

export default DefaultHeader;
