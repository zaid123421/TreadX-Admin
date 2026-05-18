import React from 'react';
import { useNavigate } from 'react-router-dom';
import EnhancedDealerWizard from '../components/EnhancedDealerWizard';

const AddDealer = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Show success message and navigate to dealers list
    navigate('/dealers', {
      state: {
        message: `Dealer has been created successfully!`,
        type: 'success'
      }
    });
  };

  const handleCancel = () => {
    navigate('/dealers');
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:py-12 flex justify-center">
      <div className="w-full max-w-4xl rounded-xl border border-border bg-card text-card-foreground shadow-lg p-6 sm:p-8">
        <EnhancedDealerWizard
          onSuccess={handleSuccess}
          onClose={handleCancel}
        />
      </div>
    </div>
  );
};

export default AddDealer; 