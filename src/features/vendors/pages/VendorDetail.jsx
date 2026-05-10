import React from 'react';
import VendorDetailView from '../components/VendorDetailView';
import { useVendorDetail } from '../hooks/useVendorDetail';

const VendorDetail = () => {
  const vm = useVendorDetail();
  return <VendorDetailView vm={vm} />;
};

export default VendorDetail;
