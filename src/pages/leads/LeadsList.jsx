import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  Building2,
  FileText,
  PhoneCall,
  MessageSquare,
  RefreshCw,
  Handshake
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { leadsService } from '../../services/leadsApiService';
import { 
  getStatusColor, 
  getStatusLabel, 
  LeadStatus, 
  LeadSource,
  formatAddress 
} from '../../types/api';
import { formatPostalCode, formatPhoneNumber } from '../../utils/formatters';

// Helper to parse backend date arrays
function parseBackendDate(arr) {
  if (!Array.isArray(arr)) return null;
  return new Date(
    arr[0],
    arr[1] - 1,
    arr[2],
    arr[3],
    arr[4],
    arr[5],
    Math.floor(arr[6] / 1000000)
  );
}

const LeadsList = () => {
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

  const canCreateLeads = hasAnyRole(['PLATFORM_ADMIN','SALES_MANAGER', 'SALES_AGENT', , 'admin', 'manager', 'sales_rep']);
  const canEditLeads = hasAnyRole(['PLATFORM_ADMIN','SALES_MANAGER', 'SALES_AGENT', ,'admin', 'manager', 'sales_rep']);
  const canDeleteLeads = hasAnyRole(['PLATFORM_ADMIN','SALES_MANAGER', 'SALES_AGENT', ,'admin', 'manager']);
  const canValidateLeads = hasAnyRole(['PLATFORM_ADMIN','SALES_MANAGER', 'admin', 'manager']);


  useEffect(() => {
    // Show success message if navigated from add/edit
    if (location.state?.message) {
      setMessage({
        text: location.state.message,
        type: location.state.type || 'success'
      });
      // Clear the message after 5 seconds
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
        direction: sortDirection
      };

      let data;
      
      // Check if user is an agent (SALES_AGENT role)
      const isAgent = user?.roleName === 'SALES_AGENT';
      
      if (statusFilter !== 'all') {
        if (isAgent) {
          data = await leadsService.getMyLeads({ status: statusFilter, ...params });
        } else {
          data = await leadsService.getLeadsByStatus(statusFilter, params);
        }
      } else {
        if (isAgent) {
          data = await leadsService.getMyLeads(params);
        } else {
          data = await leadsService.getLeads(params);
        }
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
    event.stopPropagation(); // Prevent row click
    try {
      setTakingLead(id);
      await leadsService.takeLead(id);
      setMessage({ text: 'Lead taken successfully!', type: 'success' });
      loadLeads(); // Refresh the list
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setTakingLead(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (businessName) => {
    return businessName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusStats = () => {
    const stats = {
      total: totalElements,
      pending: 0,
      approved: 0,
      contacted: 0,
      denied: 0
    };

    leads.forEach(lead => {
      switch (lead.status) {
        case LeadStatus.PENDING:
          stats.pending++;
          break;
        case LeadStatus.APPROVED:
          stats.approved++;
          break;
        case LeadStatus.CONTACTED:
          stats.contacted++;
          break;
        case LeadStatus.DENIED:
          stats.denied++;
          break;
      }
    });

    return stats;
  };

  const stats = getStatusStats();

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !searchTerm || 
      lead.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phoneNumber.includes(searchTerm) ||
      (lead.notes && lead.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
    
    return matchesSearch && matchesSource;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Message */}
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads Management</h1>
          <p className="text-gray-600">Track and manage your tire business leads</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadLeads} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          {canCreateLeads && (
            <Button onClick={() => navigate('/leads/add')} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add New Lead
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="flex flex-col items-center justify-center bg-blue-50 rounded-xl px-6 py-4 min-w-[120px] min-h-[90px]">
          <Users className="h-6 w-6 text-blue-600 mb-1" />
          <div className="text-xs text-gray-500">Total Leads</div>
          <div className="font-bold text-xl text-blue-900">{stats.total}</div>
        </div>
        <div className="flex flex-col items-center justify-center bg-yellow-50 rounded-xl px-6 py-4 min-w-[120px] min-h-[90px]">
          <Clock className="h-6 w-6 text-yellow-600 mb-1" />
          <div className="text-xs text-gray-500">Pending</div>
          <div className="font-bold text-xl text-yellow-900">{stats.pending}</div>
        </div>

                  <div className="flex flex-col items-center justify-center bg-green-50 rounded-xl px-6 py-4 min-w-[120px] min-h-[90px]">
            <CheckCircle className="h-6 w-6 text-green-600 mb-1" />
            <div className="text-xs text-gray-500">Approved</div>
            <div className="font-bold text-xl text-green-900">{stats.approved}</div>
          </div>
          <div className="flex flex-col items-center justify-center bg-blue-50 rounded-xl px-6 py-4 min-w-[120px] min-h-[90px]">
            <PhoneCall className="h-6 w-6 text-blue-600 mb-1" />
            <div className="text-xs text-gray-500">Contacted</div>
            <div className="font-bold text-xl text-blue-900">{stats.contacted}</div>
          </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search leads by business name, phone, or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={LeadStatus.PENDING} style={{display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
                  <span style={{backgroundColor: '#FFBF00', color: '#000', borderRadius: '999px', padding: '2px 10px', fontWeight: 500, fontSize: '12px', display: 'inline-block'}}>
                    Pending
                  </span>
                </SelectItem>

                <SelectItem value={LeadStatus.APPROVED} style={{display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
                  <span style={{backgroundColor: '#28A745', color: '#fff', borderRadius: '999px', padding: '2px 10px', fontWeight: 500, fontSize: '12px', display: 'inline-block'}}>
                    Approved
                  </span>
                </SelectItem>
                <SelectItem value={LeadStatus.DENIED} style={{display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
                  <span style={{backgroundColor: '#DC3545', color: '#fff', borderRadius: '999px', padding: '2px 10px', fontWeight: 500, fontSize: '12px', display: 'inline-block'}}>
                    Denied
                  </span>
                </SelectItem>
                <SelectItem value={LeadStatus.CONTACTED} style={{display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
                  <span style={{backgroundColor: '#007BFF', color: '#fff', borderRadius: '999px', padding: '2px 10px', fontWeight: 500, fontSize: '12px', display: 'inline-block'}}>
                    Contacted
                  </span>
                </SelectItem>
                <SelectItem value={LeadStatus.ONBOARDED} style={{display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
                  <span style={{backgroundColor: '#EA580C', color: '#fff', borderRadius: '999px', padding: '2px 10px', fontWeight: 500, fontSize: '12px', display: 'inline-block'}}>
                    Onboarded
                  </span>
                </SelectItem>
                <SelectItem value={LeadStatus.DONE} style={{display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
                  <span style={{backgroundColor: '#343A40', color: '#fff', borderRadius: '999px', padding: '2px 10px', fontWeight: 500, fontSize: '12px', display: 'inline-block'}}>
                    Done
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value={LeadSource.GOVERNMENT}>Government</SelectItem>
                <SelectItem value={LeadSource.ADS}>Advertising</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={`${sortBy}-${sortDirection}`} onValueChange={(value) => {
              const [field, direction] = value.split('-');
              setSortBy(field);
              setSortDirection(direction);
            }}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">Newest First</SelectItem>
                <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                <SelectItem value="businessName-asc">Business A-Z</SelectItem>
                <SelectItem value="businessName-desc">Business Z-A</SelectItem>
                <SelectItem value="updatedAt-desc">Recently Updated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leads ({filteredLeads.length})</CardTitle>
          <CardDescription>
            Manage your tire business leads and track their progress through the sales pipeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow
                  key={lead.id}
                  className="hover:bg-gray-100 cursor-pointer"
                  onClick={() => navigate(`/leads/${lead.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {getInitials(lead.businessName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-900">{lead.businessName}</div>
                        {lead.uploadedFile && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <FileText className="h-3 w-3 mr-1" />
                            Has document
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm text-gray-900 flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {formatPhoneNumber(lead.phoneNumber)}
                      </div>
                      {lead.contactName && (
                        <div className="text-sm text-gray-500 flex items-center">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          {lead.contactName}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {lead.streetNumber} {lead.streetName}
                      </div>
                      {lead.aptUnitBldg && (
                        <div className="text-gray-500">{lead.aptUnitBldg}</div>
                      )}
                      <div className="text-gray-500">{formatPostalCode(lead.postalCode)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {lead.source}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge style={getStatusColor(lead.status)}>
                      {getStatusLabel(lead.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">
                      {parseBackendDate(lead.createdAt) ? parseBackendDate(lead.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                    </div>
                    {parseBackendDate(lead.updatedAt) && (
                      <div className="text-xs text-gray-500">
                        Updated {parseBackendDate(lead.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    )}
                    {lead.addedByName && (
                      <div className="text-xs text-gray-500">
                        Added by {lead.addedByName}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {/* Take Lead button for agents */}
                      {user?.roleName === 'SALES_AGENT' && lead.addedByManager && !lead.assignedTo && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={(e) => handleTakeLead(lead.id, e)}
                          disabled={takingLead === lead.id}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {takingLead === lead.id ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                              Taking...
                            </>
                          ) : (
                            <>
                              <Handshake className="h-4 w-4 mr-1" />
                              Take
                            </>
                          )}
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/leads/${lead.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {canEditLeads && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/leads/${lead.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {canDeleteLeads && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(lead.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredLeads.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' || sourceFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by adding your first tire business lead'
                }
              </p>
              {canCreateLeads && (
                <Button onClick={() => navigate('/leads/add')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Lead
                </Button>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-500">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage >= totalPages - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadsList;

