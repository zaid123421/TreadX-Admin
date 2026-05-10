import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthContext';
import { canEditLead } from '@/shared/access/roleMatrix';
import { Button } from '@/shared/ui/button';
import LeadWizard from '../components/LeadWizard';
import { useLeadById } from '../hooks/useLeadById';
import { LeadsFormPageShell } from '../components/LeadsFormPageShell';

const EditLead = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading, lead, error } = useLeadById(id);

  const handleSuccess = (updatedLead) => {
    navigate(`/leads/${id}`, {
      state: {
        message: `Lead "${updatedLead.businessName}" has been updated successfully!`,
        type: 'success',
      },
    });
  };

  const handleCancel = () => {
    navigate(`/leads/${id}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-background text-muted-foreground">
        Loading lead…
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-background text-destructive px-4 text-center">
        {error}
      </div>
    );
  }
  if (!lead) return null;

  if (user && !canEditLead(lead, user)) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 bg-background px-4 text-center">
        <p className="text-destructive max-w-md">
          You do not have permission to edit this lead. Only administrators, sales managers, or the lead owner can
          update it.
        </p>
        <Button variant="outline" onClick={() => navigate(`/leads/${id}`)}>
          Back to lead
        </Button>
      </div>
    );
  }

  return (
    <LeadsFormPageShell title="Edit lead" description="Update lead details and save changes">
      <LeadWizard initialData={lead} onSuccess={handleSuccess} onClose={handleCancel} isEdit />
    </LeadsFormPageShell>
  );
};

export default EditLead;
