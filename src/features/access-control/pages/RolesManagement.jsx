import React from 'react';
import { useRolesManagement } from '../hooks/useRolesManagement';
import { RolesManagementView } from '../components/RolesManagementView';

const RolesManagement = () => {
  const vm = useRolesManagement();
  return (
    <RolesManagementView
      roles={vm.roles}
      error={vm.error}
      name={vm.name}
      setName={vm.setName}
      onCreateRole={vm.createRole}
      onDeleteRole={vm.deleteRole}
    />
  );
};

export default RolesManagement;
