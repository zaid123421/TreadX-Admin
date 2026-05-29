import React from 'react';
import { useProvisionWarehouse } from '../hooks/useProvisionWarehouse';
import { ProvisionWarehouseFormView } from './ProvisionWarehouseFormView';

export function ProvisionWarehouseForm(props) {
  const wizard = useProvisionWarehouse(props);
  return <ProvisionWarehouseFormView {...wizard} />;
}
