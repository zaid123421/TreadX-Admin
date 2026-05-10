import React from 'react';
import { useVendorsList } from '../hooks/useVendorsList';
import { VendorsListView } from '../components/VendorsListView';

const VendorsList = () => {
  const vm = useVendorsList();
  return <VendorsListView {...vm} />;
};

export default VendorsList;
