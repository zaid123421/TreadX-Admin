import React from 'react';
import { useEditDealerForm } from '../hooks/useEditDealerForm';
import { EditDealerFormView } from './EditDealerFormView';

const EditDealerForm = () => {
  const vm = useEditDealerForm();
  return <EditDealerFormView {...vm} />;
};

export default EditDealerForm;
