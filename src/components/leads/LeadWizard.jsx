import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  ChevronLeft, 
  ChevronRight, 
  Building2, 
  Phone, 
  MapPin, 
  Globe, 
  FileText, 
  CheckCircle,
  AlertCircle,
  Upload
} from 'lucide-react';
import { LeadSource, defaultLeadRequest } from '../../types/api';
import { leadsService } from '../../services/leadsApiService';
import { 
  handlePostalCodeChange, 
  handlePhoneNumberChange, 
  handleStreetNumberChange,
  validatePostalCode,
  validatePhoneNumber,
  validateStreetNumber
} from '../../utils/formatters';

const WIZARD_STEPS = [
  {
    id: 'business',
    title: 'Business Information',
    description: 'Enter the basic business details',
    icon: Building2,
    fields: ['businessName']
  },
  {
    id: 'contact',
    title: 'Contact Details',
    description: 'Add phone number and contact information',
    icon: Phone,
    fields: ['phoneNumber']
  },
  {
    id: 'address',
    title: 'Address Information',
    description: 'Provide the business location',
    icon: MapPin,
    fields: ['streetNumber', 'streetName', 'aptUnitBldg', 'postalCode']
  },
  {
    id: 'source',
    title: 'Lead Source',
    description: 'Specify where this lead came from',
    icon: Globe,
    fields: ['source', 'sourceUrl']
  },
  {
    id: 'documents',
    title: 'Documents & Notes',
    description: 'Upload files and add additional notes',
    icon: FileText,
    fields: ['uploadedFile', 'notes']
  },
  {
    id: 'review',
    title: 'Review & Submit',
    description: 'Review all information before submitting',
    icon: CheckCircle,
    fields: []
  }
];

const LeadWizard = ({ onClose, onSuccess, initialData = null, isEdit = false }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialData || { ...defaultLeadRequest });
  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const currentStepData = WIZARD_STEPS[currentStep];
  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

  // Validate current step
  const validateCurrentStep = () => {
    const stepErrors = {};
    const requiredFields = currentStepData.fields;

    requiredFields.forEach(field => {
      if (field === 'businessName' && !formData.businessName?.trim()) {
        stepErrors.businessName = 'Business name is required';
      }
      if (field === 'phoneNumber' && !formData.phoneNumber?.trim()) {
        stepErrors.phoneNumber = 'Phone number is required';
      } else if (field === 'phoneNumber' && formData.phoneNumber?.trim() && !validatePhoneNumber(formData.phoneNumber)) {
        stepErrors.phoneNumber = 'Please enter a valid Canadian phone number';
      }
      if (field === 'streetNumber' && !formData.streetNumber?.trim()) {
        stepErrors.streetNumber = 'Street number is required';
      } else if (field === 'streetNumber' && formData.streetNumber?.trim() && !validateStreetNumber(formData.streetNumber)) {
        stepErrors.streetNumber = 'Street number must contain only numbers';
      }
      if (field === 'streetName' && !formData.streetName?.trim()) {
        stepErrors.streetName = 'Street name is required';
      }
      if (field === 'postalCode' && !formData.postalCode?.trim()) {
        stepErrors.postalCode = 'Postal code is required';
      } else if (field === 'postalCode' && formData.postalCode?.trim() && !validatePostalCode(formData.postalCode)) {
        stepErrors.postalCode = 'Please enter a valid Canadian postal code (e.g., A1A 1A1)';
      }
      if (field === 'source' && !formData.source) {
        stepErrors.source = 'Lead source is required';
      }
    });

    setValidationErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    if (file) {
      handleInputChange('uploadedFile', file.name);
    }
  };

  // Navigate to next step
  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, WIZARD_STEPS.length - 1));
    }
  };

  // Navigate to previous step
  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  // Submit the form
  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      let result;
      if (isEdit) {
        result = await leadsService.updateLead(formData.id, formData, selectedFile);
      } else {
        result = await leadsService.createLead(formData, selectedFile);
      }
      if (onSuccess) {
        onSuccess(result);
      } else {
        navigate('/leads');
      }
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStepData.id) {
      case 'business':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Business Information</h3>
              <p className="text-gray-600">Let's start with the basic business details</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  placeholder="Enter the business name"
                  className={validationErrors.businessName ? 'border-red-500' : ''}
                />
                {validationErrors.businessName && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.businessName}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Phone className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Contact Details</h3>
              <p className="text-gray-600">How can we reach this business?</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => handlePhoneNumberChange(e.target.value, (value) => handleInputChange('phoneNumber', value))}
                  onKeyPress={(e) => {
                    // Allow only numbers, backspace, delete, and navigation keys
                    const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
                    if (!allowedKeys.includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  placeholder="+1 (555) 123-4567"
                  className={validationErrors.phoneNumber ? 'border-red-500' : ''}
                />
                {validationErrors.phoneNumber && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.phoneNumber}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'address':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <MapPin className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Address Information</h3>
              <p className="text-gray-600">Where is this business located?</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="streetNumber">Street Number *</Label>
                <Input
                  id="streetNumber"
                  value={formData.streetNumber}
                  onChange={(e) => handleStreetNumberChange(e.target.value, (value) => handleInputChange('streetNumber', value))}
                  placeholder="123"
                  className={validationErrors.streetNumber ? 'border-red-500' : ''}
                />
                {validationErrors.streetNumber && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.streetNumber}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="streetName">Street Name *</Label>
                <Input
                  id="streetName"
                  value={formData.streetName}
                  onChange={(e) => handleInputChange('streetName', e.target.value)}
                  placeholder="Main Street"
                  className={validationErrors.streetName ? 'border-red-500' : ''}
                />
                {validationErrors.streetName && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.streetName}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="aptUnitBldg">Apt/Unit/Building</Label>
                <Input
                  id="aptUnitBldg"
                  value={formData.aptUnitBldg}
                  onChange={(e) => handleInputChange('aptUnitBldg', e.target.value)}
                  placeholder="Suite 100"
                />
              </div>
              
              <div>
                <Label htmlFor="postalCode">Postal Code *</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => handlePostalCodeChange(e.target.value, (value) => handleInputChange('postalCode', value))}
                  placeholder="A1A 1A1"
                  className={validationErrors.postalCode ? 'border-red-500' : ''}
                />
                {validationErrors.postalCode && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.postalCode}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'source':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Globe className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Lead Source</h3>
              <p className="text-gray-600">Where did this lead come from?</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="source">Source *</Label>
                <Select 
                  value={formData.source} 
                  onValueChange={(value) => handleInputChange('source', value)}
                >
                  <SelectTrigger className={validationErrors.source ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select lead source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={LeadSource.GOVERNMENT}>Government Database</SelectItem>
                    <SelectItem value={LeadSource.ADS}>Advertising Campaign</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.source && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.source}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="sourceUrl">Source URL</Label>
                <Input
                  id="sourceUrl"
                  value={formData.sourceUrl}
                  onChange={(e) => handleInputChange('sourceUrl', e.target.value)}
                  placeholder="https://example.com/lead-source"
                />
              </div>
            </div>
          </div>
        );

      case 'documents':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <FileText className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Documents & Notes</h3>
              <p className="text-gray-600">Add any supporting documents or notes</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="file">Upload Document</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <input
                    type="file"
                    id="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <label htmlFor="file" className="cursor-pointer">
                    <span className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </span>
                    <br />
                    <span className="text-xs text-gray-400">
                      PDF, DOC, JPG, PNG up to 10MB
                    </span>
                  </label>
                  {selectedFile && (
                    <div className="mt-2">
                      <Badge variant="secondary">{selectedFile.name}</Badge>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Add any additional information about this lead..."
                  rows={4}
                />
              </div>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Review & Submit</h3>
              <p className="text-gray-600">Please review all information before submitting</p>
            </div>
            
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Business Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Name:</strong> {formData.businessName}</div>
                  <div><strong>Phone:</strong> {formData.phoneNumber}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    {formData.streetNumber} {formData.streetName}
                    {formData.aptUnitBldg && `, ${formData.aptUnitBldg}`}
                    <br />
                    {formData.postalCode}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Source Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Source:</strong> {formData.source}</div>
                  {formData.sourceUrl && <div><strong>URL:</strong> {formData.sourceUrl}</div>}
                </CardContent>
              </Card>
              
              {(selectedFile || formData.notes) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Additional Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedFile && <div><strong>File:</strong> {selectedFile.name}</div>}
                    {formData.notes && <div><strong>Notes:</strong> {formData.notes}</div>}
                  </CardContent>
                </Card>
              )}
            </div>
            
            {errors.submit && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.submit}</AlertDescription>
              </Alert>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{isEdit ? 'Edit Lead' : 'Add New Lead'}</h2>
          <Badge variant="outline">
            Step {currentStep + 1} of {WIZARD_STEPS.length}
          </Badge>
        </div>
        
        <Progress value={progress} className="mb-4" />
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <currentStepData.icon className="h-4 w-4" />
          <span>{currentStepData.title}</span>
          <span>•</span>
          <span>{currentStepData.description}</span>
        </div>
      </div>

      {/* Step Content */}
      <Card className="mb-8">
        <CardContent className="p-8">
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
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <div className="flex space-x-2">
          {onClose && (
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          )}
          
          {currentStep < WIZARD_STEPS.length - 1 ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (isEdit ? 'Updating Lead...' : 'Creating Lead...') : (isEdit ? 'Update Lead' : 'Create Lead')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadWizard;

