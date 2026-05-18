import { useEffect, useState } from 'react';
import apiClient from '@/shared/services/apiClient';
import { API_ENDPOINTS } from '@/shared/services/endpoints';
import { LeadStatus } from '@/shared/types/enums';
import { leadsService } from '@/features/leads';

export function useDashboard() {
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalDealers, setTotalDealers] = useState(0);
  const [monthlyRevenue] = useState(0);
  const [leadStatusData, setLeadStatusData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const leadsResponse = await apiClient.get(`${API_ENDPOINTS.LEADS}?page=0&size=1`);
        setTotalLeads(leadsResponse.data.totalElements || 0);

        const dealersResponse = await apiClient.get(`${API_ENDPOINTS.DEALERS}?page=0&size=1`);
        setTotalDealers(dealersResponse.data.totalElements || 0);

        const allLeadsResponse = await leadsService.getLeads({ page: 0, size: 1000 });
        const leads = allLeadsResponse.content || [];

        const statusCounts = {};
        leads.forEach((lead) => {
          statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
        });

        const statusData = [
          { status: LeadStatus.PENDING, count: statusCounts[LeadStatus.PENDING] || 0, color: 'bg-warning' },
          { status: LeadStatus.APPROVED, count: statusCounts[LeadStatus.APPROVED] || 0, color: 'bg-success' },
          { status: LeadStatus.DENIED, count: statusCounts[LeadStatus.DENIED] || 0, color: 'bg-destructive' },
          { status: LeadStatus.CONTACTED, count: statusCounts[LeadStatus.CONTACTED] || 0, color: 'bg-info' },
          { status: LeadStatus.PENDING_CONVERSION, count: statusCounts[LeadStatus.PENDING_CONVERSION] || 0, color: 'bg-accent' },
          { status: LeadStatus.UNQUALIFIED, count: statusCounts[LeadStatus.UNQUALIFIED] || 0, color: 'bg-muted-foreground' },
          { status: LeadStatus.DONE, count: statusCounts[LeadStatus.DONE] || 0, color: 'bg-muted-foreground' },
        ];

        setLeadStatusData(statusData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return {
    totalLeads,
    totalDealers,
    monthlyRevenue,
    leadStatusData,
    loading,
  };
}
