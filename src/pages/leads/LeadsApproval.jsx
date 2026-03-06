import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { LeadStatus } from '../../types/api';
import { leadsService } from '../../services/leadsApiService';
import { formatPostalCode, formatPhoneNumber } from '../../utils/formatters';

const LeadsApproval = () => {
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
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (leadId, action) => {
    setActionLoading(leadId + action);
    try {
      await leadsService.validateLead(leadId, {
        status: action,
        notes: action === LeadStatus.APPROVED ? 'Approved by admin' : 'Denied by admin'
      });
      
      // Remove the lead from the list
      setLeads(prev => prev.filter(lead => lead.id !== leadId));
    } catch (error) {
      console.error('Failed to validate lead:', error);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pending leads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads Management</h1>
          <p className="text-gray-600">Approve or deny pending leads</p>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-6">Pending Leads for Approval</h2>
        
        {leads.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Leads</h3>
                <p className="text-gray-600">All leads have been processed.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {leads.map((lead) => (
              <Card key={lead.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        <h3 className="text-lg font-semibold">{lead.businessName}</h3>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p><strong>Phone:</strong> {formatPhoneNumber(lead.phoneNumber)}</p>
                          <p><strong>Address:</strong> {lead.streetNumber} {lead.streetName}, {formatPostalCode(lead.postalCode)}</p>
                          <p><strong>Source:</strong> {lead.source}</p>
                        </div>
                        <div>
                          <p><strong>Added by:</strong> {lead.addedByName}</p>
                          <p><strong>Created:</strong> {new Date(lead.createdAt).toLocaleDateString()}</p>
                          {lead.notes && <p><strong>Notes:</strong> {lead.notes}</p>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        disabled={actionLoading === lead.id + 'APPROVED'}
                        onClick={() => handleAction(lead.id, 'APPROVED')}
                      >
                        {actionLoading === lead.id + 'APPROVED' ? 'Approving...' : 'Approve'}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={actionLoading === lead.id + 'DENIED'}
                        onClick={() => handleAction(lead.id, 'DENIED')}
                      >
                        {actionLoading === lead.id + 'DENIED' ? 'Denying...' : 'Deny'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadsApproval; 