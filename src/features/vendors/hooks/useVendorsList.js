import { useState, useEffect } from 'react';
import { vendorsService } from '../services/vendorsApiService';

export function useVendorsList() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);

  useEffect(() => {
    loadVendors();
  }, [currentPage, statusFilter]);

  const loadVendors = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: currentPage,
        size: pageSize,
        status: statusFilter === 'all' ? undefined : statusFilter || undefined,
        search: searchQuery || undefined,
      };

      const response = await vendorsService.getVendors(params);
      setVendors(response.content || []);
      setTotalPages(response.totalPages || 0);
    } catch (err) {
      console.error('Error loading vendors:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    loadVendors();
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(0);
  };

  return {
    vendors,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    statusFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    pageSize,
    loadVendors,
    handleSearch,
    handleStatusFilterChange,
  };
}
