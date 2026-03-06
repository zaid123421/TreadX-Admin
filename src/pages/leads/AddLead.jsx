import React from 'react';
import { useNavigate } from 'react-router-dom';
import LeadWizard from '../../components/leads/LeadWizard';

const AddLead = () => {
  const navigate = useNavigate();

  const handleSuccess = (newLead) => {
    // Show success message and navigate to leads list
    navigate('/leads', { 
      state: { 
        message: `Lead "${newLead.businessName}" has been created successfully!`,
        type: 'success'
      }
    });
  };

  const handleCancel = () => {
    navigate('/leads');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-2 flex items-center justify-center">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6">
        <LeadWizard 
          onSuccess={handleSuccess}
          onClose={handleCancel}
        />
      </div>
    </div>
  );
};

export default AddLead;

