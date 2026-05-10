import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Plus, Search, Filter, Eye, Building2 } from 'lucide-react';
import { formatPhoneNumber } from '../../leads/utils/leadUtils';
import { displayVendorId, VENDOR_STATUS_BADGE_STYLES } from '../utils/vendorUtils';
import ErrorPage from '@/app/components/ErrorPage';

export function VendorsListView({
  vendors,
  loading,
  error,
  searchQuery,
  setSearchQuery,
  statusFilter,
  currentPage,
  setCurrentPage,
  totalPages,
  loadVendors,
  handleSearch,
  handleStatusFilterChange,
}) {
  if (error) {
    return (
      <ErrorPage
        error={error}
        onRetry={loadVendors}
        onGoHome={() => (window.location.href = '/')}
        title="Failed to Load Vendors"
        showDetails={import.meta.env.DEV}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Vendor Management</h1>
          <p className="text-muted-foreground">Manage your vendor relationships and partnerships</p>
        </div>
        <Link to="/vendors/add">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Vendor
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No vendors found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Get started by adding your first vendor.'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Link to="/vendors/add">
                  <Button>
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
                    <th className="text-left py-3 px-6 font-medium text-foreground">Vendor</th>
                    <th className="text-left py-3 px-6 font-medium text-foreground">ID</th>
                    <th className="text-left py-3 px-6 font-medium text-foreground">Contact</th>
                    <th className="text-left py-3 px-6 font-medium text-foreground">Status</th>
                    <th className="text-left py-3 px-6 font-medium text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((vendor) => (
                    <tr key={vendor.id} className="border-b hover:bg-muted/40">
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-foreground">{vendor.businessName}</div>
                          <div className="text-sm text-muted-foreground">{vendor.legalName}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                          {displayVendorId(vendor.vendorUniqueId)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm">
                          <div className="text-foreground">{vendor.email}</div>
                          <div className="text-muted-foreground">{formatPhoneNumber(vendor.phoneNumber)}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge style={VENDOR_STATUS_BADGE_STYLES[vendor.status]}>{vendor.status}</Badge>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Link to={`/vendors/${vendor.id}`}>
                            <Button variant="outline" size="sm" title="View Details">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
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
            <span className="px-4 py-2 text-sm text-muted-foreground">
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
  );
}
