import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { PhoneCall, Mail, MessageSquare, Globe, AlertCircle } from 'lucide-react';
import { ContactMethod } from '@/shared/types/enums';

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
  // Use the contact details field for notes about contact attempts, not for storing raw phone numbers
  return 'Enter notes about contact attempts (do not include phone numbers)';
};

export function LeadContactModalView({
  lead,
  formData,
  handleFieldChange,
  handleSubmit,
  isSubmitting,
  error,
  onClose,
}) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <PhoneCall className="h-5 w-5" />
            <span>Initiate Contact</span>
          </DialogTitle>
          <DialogDescription>Record how you plan to contact {lead.businessName}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="contactMethod">Contact Method *</Label>
            <Select
              value={formData.contactMethod}
              onValueChange={(value) => handleFieldChange('contactMethod', value)}
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
              onChange={(e) => handleFieldChange('contactMethodDetails', e.target.value)}
              placeholder={getContactMethodPlaceholder(formData.contactMethod)}
              required
            />
          </div>

          {formData.contactMethod === ContactMethod.PHONE && (
            <div>
              <Label htmlFor="extensionNumber">Extension Number</Label>
              <Input
                id="extensionNumber"
                value={formData.extensionNumber}
                onChange={(e) => handleFieldChange('extensionNumber', e.target.value)}
                placeholder="e.g., 123"
              />
            </div>
          )}

          <div>
            <Label htmlFor="contactName">Contact Person</Label>
            <Input
              id="contactName"
              value={formData.contactName}
              onChange={(e) => handleFieldChange('contactName', e.target.value)}
              placeholder="Enter contact person's name"
            />
          </div>

          <div>
            <Label htmlFor="position">Position/Title</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => handleFieldChange('position', e.target.value)}
              placeholder="e.g., Manager, Owner, Procurement"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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
}
