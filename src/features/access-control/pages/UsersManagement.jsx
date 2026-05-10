import React from 'react';
import { useUsersManagement } from '../hooks/useUsersManagement';
import { UsersManagementView } from '../components/UsersManagementView';

const UsersManagement = () => {
  const vm = useUsersManagement();
  return <UsersManagementView {...vm} />;
};

export default UsersManagement;
