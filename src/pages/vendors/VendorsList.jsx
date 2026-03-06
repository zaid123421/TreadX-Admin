import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Plus, Search, Filter, Eye, Building2 } from 'lucide-react';
import { VendorType, formatDate } from '../../types';
import { formatPostalCode, formatPhoneNumber } from '../../utils/formatters';
import { formatVendorIdForDisplay, normalizeVendorId, displayVendorId } from '../../utils/vendorUtils';
import vendorsService from '../../services/vendorsApiService';
import ErrorPage from '../../components/ui/ErrorPage';

const statusColors = {
  ACTIVE: { backgroundColor: '#28A745', color: '#fff' },
  INACTIVE: { backgroundColor: '#DC3545', color: '#fff' },
};

const VendorsList = () => {
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
        search: searchQuery || undefined
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



  // Show error page if there's an error
  if (error) {
    return (
      <ErrorPage
        error={error}
        onRetry={loadVendors}
        onGoHome={() => window.location.href = '/'}
        title="Failed to Load Vendors"
        showDetails={process.env.NODE_ENV === 'development'}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendor Management</h1>
            <p className="text-gray-600">Manage your vendor relationships and partnerships</p>
          </div>
          <Link to="/vendors/add">
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Add Vendor
            </Button>
          </Link>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={handleSearch} className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Vendors List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Vendors ({vendors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {vendors.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || statusFilter 
                    ? 'Try adjusting your search criteria or filters.'
                    : 'Get started by adding your first vendor.'
                  }
                </p>
                {!searchQuery && !statusFilter && (
                  <Link to="/vendors/add">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Vendor
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-6 font-medium text-gray-900">Vendor</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">ID</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">Contact</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.map((vendor) => (
                      <tr key={vendor.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div>
                            <div className="font-medium text-gray-900">{vendor.businessName}</div>
                            <div className="text-sm text-gray-500">{vendor.legalName}</div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {displayVendorId(vendor.vendorUniqueId)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm">
                            <div className="text-gray-900">{vendor.email}</div>
                            <div className="text-gray-500">{formatPhoneNumber(vendor.phoneNumber)}</div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge style={statusColors[vendor.status]}>
                            {vendor.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Link to={`/vendors/${vendor.id}`}>
                              <Button variant="outline" size="sm" title="View Details">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            {/* Edit and Delete buttons removed - vendors cannot be modified after creation */}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
              >
                Previous
              </Button>
              
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {currentPage + 1} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorsList;

