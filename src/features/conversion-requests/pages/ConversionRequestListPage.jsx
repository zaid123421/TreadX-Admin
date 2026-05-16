import React from 'react';
import { useConversionRequestsList } from '../hooks/useConversionRequestsList';
import { ConversionRequestListView } from '../components/ConversionRequestListView';

const ConversionRequestListPage = () => {
  const vm = useConversionRequestsList();
  return <ConversionRequestListView {...vm} />;
};

export default ConversionRequestListPage;
