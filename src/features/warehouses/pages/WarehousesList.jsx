import React from 'react';
import { useWarehousesList } from '../hooks/useWarehousesList';
import { WarehousesListView } from '../components/WarehousesListView';

const WarehousesList = () => {
  const list = useWarehousesList();
  return <WarehousesListView {...list} />;
};

export default WarehousesList;
