import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { LeadStatus } from '../../types/api';
import { leadsService } from '../../services/leadsApiService';
import { formatPostalCode, formatPhoneNumber } from '../../utils/formatters';

const LeadValidationModal = ({ lead, onClose, onSuccess }) => {
  const [validationStatus, setValidationStatus] = useState(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleValidate = async (status) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const validationData = {
        status,
        notes: notes.trim() || undefined
      };

      const updatedLead = await leadsService.validateLead(lead.id, validationData);
      onSuccess(updatedLead);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = () => {
    setValidationStatus(LeadStatus.APPROVED);
  };

  const handleDeny = () => {
    setValidationStatus(LeadStatus.DENIED);
  };

  const handleConfirm = () => {
    if (validationStatus) {
      handleValidate(validationStatus);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Validate Lead</DialogTitle>
          <DialogDescription>
            Review and approve or deny the lead for {lead.businessName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Lead Summary */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div><strong>Business:</strong> {lead.businessName}</div>
            <div><strong>Phone:</strong> {formatPhoneNumber(lead.phoneNumber)}</div>
            <div><strong>Address:</strong> {lead.streetNumber} {lead.streetName}, {formatPostalCode(lead.postalCode)}</div>
            <div><strong>Source:</strong> {lead.source}</div>
            {lead.addedByName && <div><strong>Added by:</strong> {lead.addedByName}</div>}
            {lead.notes && <div><strong>Notes:</strong> {lead.notes}</div>}
          </div>

          {/* Validation Decision */}
          {!validationStatus ? (
            <div className="space-y-3">
              <Label>Validation Decision</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2 border-green-200 hover:border-green-300 hover:bg-green-50"
                  onClick={handleApprove}
                >
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span className="text-green-700 font-medium">Approve</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2 border-red-200 hover:border-red-300 hover:bg-red-50"
                  onClick={handleDeny}
                >
                  <XCircle className="h-6 w-6 text-red-600" />
                  <span className="text-red-700 font-medium">Deny</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                {validationStatus === LeadStatus.APPROVED ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-700">Approving Lead</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-red-700">Denying Lead</span>
                  </>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setValidationStatus(null)}
                className="text-gray-600"
              >
                Change Decision
              </Button>
            </div>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes">
              {validationStatus === LeadStatus.DENIED ? 'Reason for Denial' : 'Validation Notes'}
              {validationStatus === LeadStatus.DENIED && <span className="text-red-500"> *</span>}
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                validationStatus === LeadStatus.DENIED
                  ? "Please provide a reason for denying this lead..."
                  : "Add any notes about this validation decision..."
              }
              rows={3}
              className="mt-1"
            />
            {validationStatus === LeadStatus.DENIED && !notes.trim() && (
              <p className="text-sm text-red-500 mt-1">Reason is required when denying a lead</p>
            )}
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
              onClick={handleConfirm}
              disabled={
                !validationStatus || 
                isSubmitting || 
                (validationStatus === LeadStatus.DENIED && !notes.trim())
              }
              className={
                validationStatus === LeadStatus.APPROVED 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {isSubmitting ? 'Processing...' : `Confirm ${validationStatus === LeadStatus.APPROVED ? 'Approval' : 'Denial'}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadValidationModal; 