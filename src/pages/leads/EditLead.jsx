import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LeadWizard from '../../components/leads/LeadWizard';
import { leadsService } from '../../services/leadsApiService';

const EditLead = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLead = async () => {
      setLoading(true);
      try {
        const data = await leadsService.getLead(id);
        setLead(data);
      } catch (err) {
        setError('Failed to load lead.');
      } finally {
        setLoading(false);
      }
    };
    fetchLead();
  }, [id]);

  const handleSuccess = (updatedLead) => {
    navigate(`/leads/${id}`, {
      state: {
        message: `Lead "${updatedLead.businessName}" has been updated successfully!`,
        type: 'success'
      }
    });
  };

  const handleCancel = () => {
    navigate(`/leads/${id}`);
  };

  if (loading) return <div className="text-center py-8">Loading lead...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;
  if (!lead) return null;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-2 flex items-center justify-center">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6">
        <LeadWizard
          initialData={lead}
          onSuccess={handleSuccess}
          onClose={handleCancel}
          isEdit
        />
      </div>
    </div>
  );
};

export default EditLead; 