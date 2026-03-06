import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { PhoneCall, Mail, MessageSquare, Globe, AlertCircle } from 'lucide-react';
import { ContactMethod, defaultInitiateContactRequest } from '../../types/api';
import { leadsService } from '../../services/leadsApiService';

const LeadContactModal = ({ lead, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ ...defaultInitiateContactRequest });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const updatedLead = await leadsService.initiateContact(lead.id, formData);
      onSuccess(updatedLead);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getContactMethodIcon = (method) => {
    switch (method) {
      case ContactMethod.PHONE:
        return <PhoneCall className="h-4 w-4" />;
      case ContactMethod.MAIL_EMAIL:
        return <Mail className="h-4 w-4" />;
      case ContactMethod.TEXT:
        return <MessageSquare className="h-4 w-4" />;
      case ContactMethod.OTHER:
        return <Globe className="h-4 w-4" />;
      default:
        return <PhoneCall className="h-4 w-4" />;
    }
  };

  const getContactMethodPlaceholder = (method) => {
    switch (method) {
      case ContactMethod.PHONE:
        return 'Enter phone number';
      case ContactMethod.MAIL_EMAIL:
        return 'Enter email address';
      case ContactMethod.TEXT:
        return 'Enter mobile number for SMS';
      case ContactMethod.OTHER:
        return 'Enter contact details';
      default:
        return 'Enter contact details';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <PhoneCall className="h-5 w-5" />
            <span>Initiate Contact</span>
          </DialogTitle>
          <DialogDescription>
            Record how you plan to contact {lead.businessName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contact Method */}
          <div>
            <Label htmlFor="contactMethod">Contact Method *</Label>
            <Select 
              value={formData.contactMethod} 
              onValueChange={(value) => handleInputChange('contactMethod', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select contact method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ContactMethod.PHONE}>
                  <div className="flex items-center space-x-2">
                    <PhoneCall className="h-4 w-4" />
                    <span>Phone Call</span>
                  </div>
                </SelectItem>
                <SelectItem value={ContactMethod.MAIL_EMAIL}>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </div>
                </SelectItem>
                <SelectItem value={ContactMethod.TEXT}>
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Text Message</span>
                  </div>
                </SelectItem>
                <SelectItem value={ContactMethod.OTHER}>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>Other</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contact Details */}
          <div>
            <Label htmlFor="contactMethodDetails">
              <div className="flex items-center space-x-2">
                {getContactMethodIcon(formData.contactMethod)}
                <span>Contact Details *</span>
              </div>
            </Label>
            <Input
              id="contactMethodDetails"
              value={formData.contactMethodDetails}
              onChange={(e) => handleInputChange('contactMethodDetails', e.target.value)}
              placeholder={getContactMethodPlaceholder(formData.contactMethod)}
              required
            />
          </div>

          {/* Extension Number (for phone calls) */}
          {formData.contactMethod === ContactMethod.PHONE && (
            <div>
              <Label htmlFor="extensionNumber">Extension Number</Label>
              <Input
                id="extensionNumber"
                value={formData.extensionNumber}
                onChange={(e) => handleInputChange('extensionNumber', e.target.value)}
                placeholder="e.g., 123"
              />
            </div>
          )}

          {/* Contact Person */}
          <div>
            <Label htmlFor="contactName">Contact Person</Label>
            <Input
              id="contactName"
              value={formData.contactName}
              onChange={(e) => handleInputChange('contactName', e.target.value)}
              placeholder="Enter contact person's name"
            />
          </div>

          {/* Position */}
          <div>
            <Label htmlFor="position">Position/Title</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
              placeholder="e.g., Manager, Owner, Procurement"
            />
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.contactMethod || !formData.contactMethodDetails}
            >
              {isSubmitting ? 'Initiating Contact...' : 'Initiate Contact'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadContactModal;

