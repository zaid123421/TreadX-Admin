import React from 'react';
import { useChangePassword } from '../hooks/useChangePassword';
import { ChangePasswordView } from '../components/ChangePasswordView';

const ChangePassword = () => {
  const vm = useChangePassword();
  return (
    <ChangePasswordView
      currentPassword={vm.currentPassword}
      setCurrentPassword={vm.setCurrentPassword}
      newPassword={vm.newPassword}
      setNewPassword={vm.setNewPassword}
      confirmPassword={vm.confirmPassword}
      setConfirmPassword={vm.setConfirmPassword}
      message={vm.message}
      error={vm.error}
      onSubmit={vm.submit}
    />
  );
};

export default ChangePassword;
