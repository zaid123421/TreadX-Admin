import { useState, useEffect } from 'react';
import { leadsService } from '../services/leadsApiService';

export function useLeadById(leadId) {
  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLead = async () => {
      setLoading(true);
      try {
        const data = await leadsService.getLead(leadId);
        setLead(data);
        setError(null);
      } catch (err) {
        setError('Failed to load lead.');
      } finally {
        setLoading(false);
      }
    };
    fetchLead();
  }, [leadId]);

  return { loading, lead, error };
}
