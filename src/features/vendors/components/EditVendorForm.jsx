import React from 'react';
import { useEditVendorForm } from '../hooks/useEditVendorForm';
import { EditVendorFormView } from './EditVendorFormView';

const EditVendorForm = () => {
  const vm = useEditVendorForm();
  return <EditVendorFormView {...vm} />;
};

export default EditVendorForm;
