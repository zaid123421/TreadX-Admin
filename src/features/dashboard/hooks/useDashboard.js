import { useEffect, useState } from 'react';
import apiClient from '@/shared/services/apiClient';
import { API_ENDPOINTS } from '@/shared/services/endpoints';
import { LeadStatus } from '@/shared/types/enums';
import { leadsService } from '@/features/leads';
import { reportsService } from '@/features/reports';
import { normalizeCapacityOverview } from '../utils/capacityOverview';

const EMPTY_CAPACITY = normalizeCapacityOverview(null);

export function useDashboard() {
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalDealers, setTotalDealers] = useState(0);
  const [leadStatusData, setLeadStatusData] = useState([]);
  const [capacity, setCapacity] = useState(EMPTY_CAPACITY);
  const [capacityError, setCapacityError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [capacityLoading, setCapacityLoading] = useState(true);

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
          { status: LeadStatus.PENDING, count: statusCounts[LeadStatus.PENDING] || 0, color: 'bg-warning', fill: 'var(--warning)' },
          { status: LeadStatus.APPROVED, count: statusCounts[LeadStatus.APPROVED] || 0, color: 'bg-success', fill: 'var(--success)' },
          { status: LeadStatus.DENIED, count: statusCounts[LeadStatus.DENIED] || 0, color: 'bg-destructive', fill: 'var(--destructive)' },
          { status: LeadStatus.CONTACTED, count: statusCounts[LeadStatus.CONTACTED] || 0, color: 'bg-info', fill: 'var(--info)' },
          { status: LeadStatus.PENDING_CONVERSION, count: statusCounts[LeadStatus.PENDING_CONVERSION] || 0, color: 'bg-accent', fill: 'var(--accent)' },
          { status: LeadStatus.UNQUALIFIED, count: statusCounts[LeadStatus.UNQUALIFIED] || 0, color: 'bg-muted-foreground', fill: 'var(--muted-foreground)' },
          { status: LeadStatus.DONE, count: statusCounts[LeadStatus.DONE] || 0, color: 'bg-primary', fill: 'var(--primary)' },
        ];

        setLeadStatusData(statusData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCapacityOverview = async () => {
      setCapacityLoading(true);
      setCapacityError(null);
      try {
        const data = await reportsService.getCapacityOverview();
        setCapacity(normalizeCapacityOverview(data));
      } catch (error) {
        console.error('Failed to fetch capacity overview:', error);
        setCapacityError(error.message || 'Failed to load capacity overview');
        setCapacity(EMPTY_CAPACITY);
      } finally {
        setCapacityLoading(false);
      }
    };

    fetchDashboardData();
    fetchCapacityOverview();
  }, []);

  return {
    totalLeads,
    totalDealers,
    leadStatusData,
    capacity,
    capacityError,
    capacityLoading,
    loading,
  };
}
