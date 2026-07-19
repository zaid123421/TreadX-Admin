import React from 'react';
import { useForgotPassword } from '../hooks/useForgotPassword';
import { ForgotPasswordView } from '../components/ForgotPasswordView';

const ForgotPassword = () => {
  const vm = useForgotPassword();

  return (
    <ForgotPasswordView
      email={vm.email}
      setEmail={vm.setEmail}
      loading={vm.loading}
      error={vm.error}
      success={vm.success}
      onSubmit={vm.submit}
    />
  );
};

export default ForgotPassword;
