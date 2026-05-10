import { useState, useEffect } from 'react';
import { LeadStatus } from '@/shared/types/enums';
import { leadsService } from '../services/leadsApiService';

export function useLeadsApproval() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadPendingLeads();
  }, []);

  const loadPendingLeads = async () => {
    try {
      setLoading(true);
      const data = await leadsService.getLeadsByStatus(LeadStatus.PENDING, {});
      setLeads(data.content || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (leadId, action) => {
    setActionLoading(leadId + action);
    try {
      await leadsService.validateLead(leadId, {
        status: action,
        notes: action === LeadStatus.APPROVED ? 'Approved by admin' : 'Denied by admin',
      });
      setLeads((prev) => prev.filter((lead) => lead.id !== leadId));
    } catch (err) {
      console.error('Failed to validate lead:', err);
    } finally {
      setActionLoading(null);
    }
  };

  return {
    leads,
    loading,
    error,
    actionLoading,
    handleAction,
  };
}
