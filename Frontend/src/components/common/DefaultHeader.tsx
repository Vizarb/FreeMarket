import React from 'react';
import Header from './Header';
import { defaultFilterState } from '@/constants/filters';

const DefaultHeader: React.FC = () => {
  return (
    <Header
      onSearch={() => {}}
      onFilterChange={() => {}}
      defaultValues={defaultFilterState}
      categories={[]}
    />
  );
};

export default DefaultHeader;
