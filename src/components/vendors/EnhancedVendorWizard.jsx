import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { leadsService } from '../../services/leadsApiService';
import { LeadStatus, defaultVendorRequest, UserRole } from '../../types/api';
import { vendorsService } from '../../services/vendorsApiService';
import { useAuth } from '../../contexts/AuthContext';
import UserAccessManagement from './UserAccessManagement';
import { 
  handlePostalCodeChange, 
  handlePhoneNumberChange, 
  handleStreetNumberChange,
  validatePostalCode,
  validatePhoneNumber,
  validateStreetNumber
} from '../../utils/formatters';
import { toast } from 'sonner';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

const getSteps = (hasLeadId) => hasLeadId ? [
  {
    id: 'business',
    title: 'Business Information',
    description: 'Enter the legal and business name',
    icon: Building2,
    fields: ['legalName', 'businessName']
  },
  {
    id: 'contact',
    title: 'Contact Information',
    description: 'Add email and phone number',
    icon: Mail,
    fields: ['email', 'phoneNumber']
  },
  {
    id: 'address',
    title: 'Address',
    description: 'Provide the business address',
    icon: MapPin,
    fields: ['streetNumber', 'streetName', 'aptUnitBldg', 'postalCode']
  },
  {
    id: 'user-access',
    title: 'User Access Management',
    description: 'Configure user roles and access',
    icon: Users,
    fields: ['totalUsers', 'userRoles']
  },
  {
    id: 'review',
    title: 'Review & Submit',
    description: 'Review all information before submitting',
    icon: CheckCircle,
    fields: ['status']
  }
] : [
  {
    id: 'select-lead',
    title: 'Select Contacted Lead',
    description: 'Choose a contacted lead to convert to a vendor',
    icon: Building2,
    fields: []
  },
  {
    id: 'business',
    title: 'Business Information',
    description: 'Enter the legal and business name',
    icon: Building2,
    fields: ['legalName', 'businessName']
  },
  {
    id: 'contact',
    title: 'Contact Information',
    description: 'Add email and phone number',
    icon: Mail,
    fields: ['email', 'phoneNumber']
  },
  {
    id: 'address',
    title: 'Address',
    description: 'Provide the business address',
    icon: MapPin,
    fields: ['streetNumber', 'streetName', 'aptUnitBldg', 'postalCode']
  },
  {
    id: 'user-access',
    title: 'User Access Management',
    description: 'Configure user roles and access',
    icon: Users,
    fields: ['totalUsers', 'userRoles']
  },
  {
    id: 'review',
    title: 'Review & Submit',
    description: 'Review all information before submitting',
    icon: CheckCircle,
    fields: ['status']
  }
];

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const EnhancedVendorWizard = ({ onClose, onSuccess }) => {
  const query = useQuery();
  const { user } = useAuth();
  const leadIdFromQuery = query.get('leadId');
  const [currentStep, setCurrentStep] = useState(0);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedLead, setSelectedLead] = useState(null);
  const [formData, setFormData] = useState({ 
    ...defaultVendorRequest,
    totalUsers: 0,
    userRoles: {
      [UserRole.VENDOR_ADMIN]: 0,
      [UserRole.VENDOR_EMPLOYEE]: 0,
      [UserRole.VENDOR_TECHNICIAN]: 0
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const WIZARD_STEPS = getSteps(!!leadIdFromQuery);

  // Fetch contacted leads if no lead ID provided
  useEffect(() => {
    if (!leadIdFromQuery) {
      fetchLeads();
    }
  }, [leadIdFromQuery, currentPage, searchTerm]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await leadsService.getLeadsByStatus(LeadStatus.CONTACTED, {
        page: currentPage,
        size: pageSize,
        search: searchTerm
      });
      setLeads(response.content || []);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      console.error('Error fetching leads:', error);
      setError('Failed to fetch contacted leads');
    } finally {
      setLoading(false);
    }
  };

  const handleLeadSelect = (lead) => {
    setSelectedLead(lead);
    setFormData(prev => ({
      ...prev,
      leadId: lead.id,
      businessName: lead.businessName,
      phoneNumber: lead.phoneNumber,
      streetNumber: lead.streetNumber,
      streetName: lead.streetName,
      aptUnitBldg: lead.aptUnitBldg,
      postalCode: lead.postalCode
    }));
  };

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const vendorData = {
        ...formData,
        totalUsers: formData.totalUsers,
        userRoles: formData.userRoles
      };
      
      const response = await vendorsService.createVendor(vendorData);
      toast.success('Vendor created successfully!');
      onSuccess(response);
    } catch (error) {
      console.error('Error creating vendor:', error);
      toast.error(error.message || 'Failed to create vendor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    const currentStepData = WIZARD_STEPS[currentStep];
    if (currentStepData.id === 'select-lead') {
      return selectedLead !== null;
    }
    if (currentStepData.id === 'user-access') {
      const totalFromRoles = Object.values(formData.userRoles).reduce((sum, count) => sum + (count || 0), 0);
      return formData.totalUsers > 0 && totalFromRoles === formData.totalUsers;
    }
    return currentStepData.fields.every(field => {
      if (field === 'aptUnitBldg') return true; // Make optional
      const value = formData[field];
      return value !== null && value !== undefined && value !== '';
    });
  };

  const renderStepContent = () => {
    const currentStepData = WIZARD_STEPS[currentStep];

    switch (currentStepData.id) {
      case 'select-lead':
        return (
          <div className="space-y-4">
            <div className="relative">
              <Input
                placeholder="Search contacted leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4"
              />
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.businessName}</TableCell>
                      <TableCell>{lead.phoneNumber}</TableCell>
                      <TableCell>
                        {[lead.streetNumber, lead.streetName, lead.aptUnitBldg, lead.postalCode]
                          .filter(Boolean)
                          .join(', ')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{lead.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant={selectedLead?.id === lead.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleLeadSelect(lead)}
                        >
                          {selectedLead?.id === lead.id ? "Selected" : "Select"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        );

      case 'business':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Legal Name *</label>
              <Input
                value={formData.legalName}
                onChange={(e) => setFormData(prev => ({ ...prev, legalName: e.target.value }))}
                placeholder="Enter legal business name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Business Name *</label>
              <Input
                value={formData.businessName}
                onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                placeholder="Enter business name"
              />
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number *</label>
              <Input
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>
          </div>
        );

      case 'address':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Street Number *</label>
                <Input
                  value={formData.streetNumber}
                  onChange={(e) => {
                    const formatted = handleStreetNumberChange(e.target.value);
                    setFormData(prev => ({ ...prev, streetNumber: formatted }));
                  }}
                  placeholder="Street number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Postal Code *</label>
                <Input
                  value={formData.postalCode}
                  onChange={(e) => {
                    const formatted = handlePostalCodeChange(e.target.value);
                    setFormData(prev => ({ ...prev, postalCode: formatted }));
                  }}
                  placeholder="Postal code"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Street Name *</label>
              <Input
                value={formData.streetName}
                onChange={(e) => setFormData(prev => ({ ...prev, streetName: e.target.value }))}
                placeholder="Street name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Apt/Unit/Building</label>
              <Input
                value={formData.aptUnitBldg}
                onChange={(e) => setFormData(prev => ({ ...prev, aptUnitBldg: e.target.value }))}
                placeholder="Apartment, unit, or building"
              />
            </div>
          </div>
        );

      case 'user-access':
        return (
          <UserAccessManagement
            userRoles={formData.userRoles}
            onUserRolesChange={(userRoles) => setFormData(prev => ({ ...prev, userRoles }))}
            totalUsers={formData.totalUsers}
            onTotalUsersChange={(totalUsers) => setFormData(prev => ({ ...prev, totalUsers }))}
            maxUsers={50}
          />
        );

      case 'review':
        return (
          <div className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please review all information before submitting. This will create a new vendor with the specified user access configuration.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="font-medium">Legal Name:</span> {formData.legalName}
                  </div>
                  <div>
                    <span className="font-medium">Business Name:</span> {formData.businessName}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="font-medium">Email:</span> {formData.email}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {formData.phoneNumber}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="font-medium">Address:</span> {formData.streetNumber} {formData.streetName}
                  </div>
                  {formData.aptUnitBldg && (
                    <div>
                      <span className="font-medium">Unit:</span> {formData.aptUnitBldg}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Postal Code:</span> {formData.postalCode}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Access Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="font-medium">Total Users:</span> {formData.totalUsers}
                  </div>
                  {Object.entries(formData.userRoles).map(([role, count]) => (
                    <div key={role}>
                      <span className="font-medium">{role}:</span> {count} users
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Create New Vendor</h1>
        <p className="text-muted-foreground">Set up a new vendor with user access management</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <Progress value={(currentStep / (WIZARD_STEPS.length - 1)) * 100} className="mb-4" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {currentStep + 1} of {WIZARD_STEPS.length}</span>
          <span>{Math.round(((currentStep + 1) / WIZARD_STEPS.length) * 100)}% Complete</span>
        </div>
      </div>

      {/* Step Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            {React.createElement(WIZARD_STEPS[currentStep].icon, { className: "w-6 h-6" })}
            <div>
              <CardTitle>{WIZARD_STEPS[currentStep].title}</CardTitle>
              <p className="text-muted-foreground">{WIZARD_STEPS[currentStep].description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          
          {currentStep === WIZARD_STEPS.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={!isStepValid() || isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Vendor'}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedVendorWizard; 