import React from 'react';
import { useLoginForm } from '../hooks/useLoginForm';
import { LoginFormView } from './LoginFormView';

const LoginForm = () => {
  const vm = useLoginForm();
  return <LoginFormView {...vm} />;
};

export default LoginForm;
