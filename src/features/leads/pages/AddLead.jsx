import React from 'react';
import { useNavigate } from 'react-router-dom';
import LeadWizard from '../components/LeadWizard';
import { LeadsFormPageShell } from '../components/LeadsFormPageShell';

const AddLead = () => {
  const navigate = useNavigate();

  const handleSuccess = (newLead) => {
    navigate('/leads', {
      state: {
        message: `Lead "${newLead.businessName}" has been created successfully!`,
        type: 'success',
      },
    });
  };

  const handleCancel = () => {
    navigate('/leads');
  };

  return (
    <LeadsFormPageShell
      title="Add new lead"
      description="Fill in the lead information to add to the pipeline"
    >
      <LeadWizard onSuccess={handleSuccess} onClose={handleCancel} />
    </LeadsFormPageShell>
  );
};

export default AddLead;
