import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Separator } from '@/shared/ui/separator';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import {
  Building2,
  Phone,
  MapPin,
  Globe,
  FileText,
  Calendar,
  User,
  Mail,
  MessageSquare,
  Edit,
  Trash2,
  ArrowLeft,
  Download,
  Eye,
  PhoneCall,
  MessageCircle,
  Handshake,
  UserCheck,
  CheckCircle,
} from 'lucide-react';
import { LeadStatus } from '@/shared/types/enums';
import { formatFullName } from '@/shared/utils/formatters';
import LeadContactModal from './LeadContactModal';
import LeadValidationModal from './LeadValidationModal';
import ConversionRequestModal from './ConversionRequestModal';
import {
  formatPostalCode,
  formatPhoneNumber,
  getContactMethodLabel,
  getStatusColor,
  getStatusLabel,
} from '../utils/leadUtils';

export default function LeadDetailView({ vm }) {
  const {
    id,
    navigate,
    user,
    token,
    lead,
    loading,
    error,
    canEditLead,
    canDeleteLead,
    canConvertLeadToVendor,
    showContactModal,
    setShowContactModal,
    showValidationModal,
    setShowValidationModal,
    takingLead,
    previewUrl,
    message,
    assigning,
    agents,
    selectedAgentId,
    setSelectedAgentId,
    handleContactSuccess,
    handleValidationSuccess,
    handleConversionSuccess,
    handleTakeLead,
    handleDelete,
    handleAssignLead,
    handlePreview,
    handleDownload,
    formatDate,
    getInitials,
  } = vm;

  const [showConversionModal, setShowConversionModal] = React.useState(false);

  const handleConversionModalSuccess = async () => {
    setShowConversionModal(false);
    await handleConversionSuccess();
    vm.setMessage?.({ type: 'success', text: 'Conversion request submitted successfully' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading lead details...</p>
        </div>
      </div>
    );
  }

  if (error === 'Forbidden') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-red-100 rounded-full p-6 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636l-1.414 1.414M5.636 18.364l1.414-1.414M6.343 6.343l1.414 1.414M17.657 17.657l-1.414-1.414M12 8v4m0 4h.01"
            />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-red-600 mb-2">403 Forbidden</h1>
        <p className="text-muted-foreground mb-6">
          You do not have permission to view this lead. Please contact your administrator if you believe this is a
          mistake.
        </p>
        <Button onClick={() => navigate('/leads')}>Return to Leads</Button>
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

  if (!lead) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert>
          <AlertDescription>Lead not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/leads')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-2xl font-bold">{lead.businessName}</h1>
            <p className="text-muted-foreground">Lead Details</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Badge style={getStatusColor(lead.status)}>{getStatusLabel(lead.status)}</Badge>

          {user?.roleName === 'SALES_AGENT' && lead.addedByManager && !lead.assignedTo && (
            <Button
              variant="default"
              size="sm"
              onClick={handleTakeLead}
              disabled={takingLead}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {takingLead ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                  Taking...
                </>
              ) : (
                <>
                  <Handshake className="h-4 w-4 mr-2" />
                  Take Lead
                </>
              )}
            </Button>
          )}

          {canEditLead && (
            <Button variant="outline" size="sm" onClick={() => navigate(`/leads/${id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}

          {canDeleteLead && (
            <Button variant="outline" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-semibold">
                    {getInitials(lead.businessName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">{lead.businessName}</CardTitle>
                  <CardDescription>
                    Lead ID: {lead.id} • Created {formatDate(lead.createdAt)}
                    {lead.addedByName && ` • Added by ${lead.addedByName}`}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Phone:</span>
                        <span>{formatPhoneNumber(lead.phoneNumber)}</span>
                      </div>

                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <span className="font-medium">Address:</span>
                          <div className="text-muted-foreground">
                            {lead.formattedAddress ||
                              `${lead.streetNumber} ${lead.streetName}${
                                lead.aptUnitBldg ? `, ${lead.aptUnitBldg}` : ''
                              }, ${formatPostalCode(lead.postalCode)}`}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Source:</span>
                        <span>{lead.source}</span>
                      </div>

                      {lead.sourceUrl && (
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Source URL:</span>
                          <a
                            href={lead.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View Source
                          </a>
                        </div>
                      )}

                      {lead.addedByManager && (
                        <div className="flex items-center space-x-2">
                          <UserCheck className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Added by Manager:</span>
                          <span className="text-green-600 font-medium">Yes</span>
                        </div>
                      )}

                      {lead.assignedToFirstName && lead.assignedToLastName && (
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Assigned to:</span>
                          <span>
                            {lead.assignedToFirstName} {lead.assignedToLastName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {lead.notes && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Notes</h4>
                      <p className="text-muted-foreground bg-muted/40 p-3 rounded-lg">{lead.notes}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                  {lead.contactMethod ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Contact Method:</span>
                        <span>{getContactMethodLabel(lead.contactMethod)}</span>
                      </div>

                      {lead.contactMethodDetails && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Contact Details:</span>
                          <span>{lead.contactMethodDetails}</span>
                        </div>
                      )}

                      {lead.contactName && (
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Contact Person:</span>
                          <span>{lead.contactName}</span>
                          {lead.position && <span className="text-muted-foreground">({lead.position})</span>}
                        </div>
                      )}

                      {lead.extensionNumber && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Extension:</span>
                          <span>{lead.extensionNumber}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No contact information available</p>
                      <Button className="mt-4" onClick={() => setShowContactModal(true)}>
                        <PhoneCall className="h-4 w-4 mr-2" />
                        Initiate Contact
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="documents" className="space-y-4">
                  {lead.uploadedFile ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-8 w-8 text-blue-600" />
                          <div>
                            <p className="font-medium">{lead.uploadedFile}</p>
                            <p className="text-sm text-muted-foreground">Uploaded document</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={handlePreview}>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleDownload}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                      <div className="mt-4">
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="Lead Preview"
                            className="w-full max-w-xs rounded border"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : token ? (
                          <div className="text-center py-4 text-muted-foreground">Loading preview...</div>
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">
                            Authentication required to preview document
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No documents uploaded</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-muted/40 rounded-lg">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Lead Created</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(lead.createdAt)}
                          {lead.addedByName && ` by ${lead.addedByName}`}
                        </p>
                      </div>
                    </div>

                    {lead.updatedAt !== lead.createdAt && (
                      <div className="flex items-center space-x-3 p-3 bg-muted/40 rounded-lg">
                        <Edit className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Last Updated</p>
                          <p className="text-sm text-muted-foreground">{formatDate(lead.updatedAt)}</p>
                        </div>
                      </div>
                    )}

                    {lead.validatedAt && (
                      <div className="flex items-center space-x-3 p-3 bg-muted/40 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="font-medium">Lead Validated</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(lead.validatedAt)} by{' '}
                            {formatFullName(lead.validatedByFirstName, lead.validatedByLastName)}
                          </p>
                        </div>
                      </div>
                    )}

                    {lead.assignedAt && lead.assignedToFirstName && lead.assignedToLastName && (
                      <div className="flex items-center space-x-3 p-3 bg-muted/40 rounded-lg">
                        <UserCheck className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="font-medium">Lead Assigned</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(lead.assignedAt)} to{' '}
                            {formatFullName(lead.assignedToFirstName, lead.assignedToLastName)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lead.status === LeadStatus.PENDING &&
                (user?.roleName === 'SYSTEM_ADMIN' || user?.roleName === 'SALES_MANAGER') && (
                  <Button className="w-full" onClick={() => setShowValidationModal(true)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Validate Lead
                  </Button>
                )}

              {lead.status === LeadStatus.APPROVED && !lead.contactMethod && (
                <Button className="w-full" onClick={() => setShowContactModal(true)}>
                  <PhoneCall className="h-4 w-4 mr-2" />
                  Initiate Contact
                </Button>
              )}

              {(user?.roleName === 'SYSTEM_ADMIN' || user?.roleName === 'SALES_MANAGER') && (
                <div className="space-y-2">
                  <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Assign to sales agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={String(agent.id)}>
                          {agent.firstName} {agent.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button className="w-full" onClick={handleAssignLead} disabled={!selectedAgentId || assigning}>
                    {assigning ? 'Assigning...' : 'Assign Lead'}
                  </Button>
                </div>
              )}

              {lead.status === LeadStatus.CONTACTED && canConvertLeadToVendor && (
                <Button className="w-full" onClick={() => setShowConversionModal(true)}>
                  <Building2 className="h-4 w-4 mr-2" />
                  Convert to Vendor
                </Button>
              )}

              <Button variant="outline" className="w-full">
                <MessageCircle className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Status:</span>
                <Badge style={getStatusColor(lead.status)}>{getStatusLabel(lead.status)}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Lead Source:</span>
                <span className="text-sm">{lead.source}</span>
              </div>

              {lead.vendorId && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Vendor ID:</span>
                  <span className="text-sm">{lead.vendorUniqueId}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {showContactModal && (
        <LeadContactModal
          lead={lead}
          onClose={() => setShowContactModal(false)}
          onSuccess={handleContactSuccess}
        />
      )}

      {showValidationModal && (
        <LeadValidationModal
          lead={lead}
          onClose={() => setShowValidationModal(false)}
          onSuccess={handleValidationSuccess}
        />
      )}

      {showConversionModal && (
        <ConversionRequestModal
          lead={lead}
          onClose={() => setShowConversionModal(false)}
          onSuccess={handleConversionModalSuccess}
        />
      )}
    </div>
  );
}
