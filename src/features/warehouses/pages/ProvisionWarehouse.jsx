import React from 'react';
import { useNavigate } from 'react-router-dom';
import { WarehouseFormPageShell } from '../components/WarehouseFormPageShell';
import { ProvisionWarehouseForm } from '../components/ProvisionWarehouseForm';

const ProvisionWarehouse = () => {
  const navigate = useNavigate();

  const handleSuccess = (warehouse) => {
    const name =
      warehouse?.warehouseName ?? warehouse?.name ?? 'Warehouse';
    navigate('/warehouses', {
      state: {
        message: `"${name}" has been provisioned successfully and is pending setup.`,
        type: 'success',
      },
    });
  };

  const handleCancel = () => {
    navigate('/warehouses');
  };

  return (
    <WarehouseFormPageShell
      title="Provision New Warehouse"
      description="Create a warehouse record and assign an admin before onboarding."
    >
      <ProvisionWarehouseForm onSuccess={handleSuccess} onClose={handleCancel} />
    </WarehouseFormPageShell>
  );
};

export default ProvisionWarehouse;
