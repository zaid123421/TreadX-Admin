import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthContext';
import { canDeleteLead, canEditLead } from '@/shared/access/roleMatrix';
import { leadsService } from '../services/leadsApiService';
import {
  computeLeadsStatusStats,
  filterLeadsBySearchAndSource,
} from '../utils/leadUtils';

export function useLeadsList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hasAnyRole } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [message, setMessage] = useState(null);
  const [takingLead, setTakingLead] = useState(null);

  const canCreateLeads = hasAnyRole(['SYSTEM_ADMIN', 'SALES_MANAGER', 'SALES_AGENT']);

  useEffect(() => {
    if (location.state?.message) {
      setMessage({
        text: location.state.message,
        type: location.state.type || 'success',
      });
      setTimeout(() => setMessage(null), 5000);
    }
  }, [location.state]);

  useEffect(() => {
    loadLeads();
  }, [searchTerm, statusFilter, sourceFilter, currentPage, sortBy, sortDirection]);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        page: currentPage,
        size: pageSize,
        sortBy,
        direction: sortDirection,
      };

      let data;
      const isAgent = user?.roleName === 'SALES_AGENT';

      if (statusFilter !== 'all') {
        if (isAgent) {
          data = await leadsService.getMyLeads({ status: statusFilter, ...params });
        } else {
          data = await leadsService.getLeadsByStatus(statusFilter, params);
        }
      } else if (isAgent) {
        data = await leadsService.getMyLeads(params);
      } else {
        data = await leadsService.getLeads(params);
      }

      setLeads(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error('Failed to load leads:', error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await leadsService.deleteLead(id);
        setMessage({ text: 'Lead deleted successfully', type: 'success' });
        loadLeads();
      } catch (error) {
        setMessage({ text: error.message, type: 'error' });
      }
    }
  };

  const handleTakeLead = async (id, event) => {
    event.stopPropagation();
    try {
      setTakingLead(id);
      await leadsService.takeLead(id);
      setMessage({ text: 'Lead taken successfully!', type: 'success' });
      loadLeads();
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setTakingLead(null);
    }
  };

  const stats = useMemo(
    () => computeLeadsStatusStats(leads, totalElements),
    [leads, totalElements]
  );

  const filteredLeads = useMemo(
    () => filterLeadsBySearchAndSource(leads, searchTerm, sourceFilter),
    [leads, searchTerm, sourceFilter]
  );

  const handleSortPresetChange = (value) => {
    const [field, direction] = value.split('-');
    setSortBy(field);
    setSortDirection(direction);
  };

  return {
    navigate,
    user,
    leads,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sourceFilter,
    setSourceFilter,
    currentPage,
    setCurrentPage,
    pageSize,
    totalPages,
    totalElements,
    sortBy,
    sortDirection,
    setSortBy,
    setSortDirection,
    handleSortPresetChange,
    message,
    takingLead,
    canCreateLeads,
    canEditLead: (lead) => canEditLead(lead, user),
    canDeleteLead: (lead) => canDeleteLead(lead, user),
    loadLeads,
    handleDelete,
    handleTakeLead,
    stats,
    filteredLeads,
  };
}
