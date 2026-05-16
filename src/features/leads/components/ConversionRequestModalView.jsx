import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';
import { Label } from '@/shared/ui/label';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Building2, AlertCircle, FileText } from 'lucide-react';
import { formatPostalCode, formatPhoneNumber } from '../utils/leadUtils';

export function ConversionRequestModalView({
  lead,
  requestNotes,
  setRequestNotes,
  isSubmitting,
  error,
  handleSubmit,
  onClose,
}) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Convert to Vendor</DialogTitle>
          <DialogDescription>
            Submit a conversion request to convert {lead.businessName} from a lead to a vendor
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/40 p-4 rounded-lg space-y-2">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <strong>Business:</strong> {lead.businessName}
              </div>
            </div>
            <div>
              <strong>Phone:</strong> {formatPhoneNumber(lead.phoneNumber)}
            </div>
        
            <div>
              <strong>Source:</strong> {lead.source}
            </div>
            {lead.assignedToFirstName && lead.assignedToLastName && (
              <div>
                <strong>Assigned to:</strong> {lead.assignedToFirstName} {lead.assignedToLastName}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="requestNotes">
              Request Notes <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="requestNotes"
              value={requestNotes}
              onChange={(e) => setRequestNotes(e.target.value)}
              placeholder="Please provide notes about this conversion request..."
              rows={4}
              className="mt-1"
            />
            {!requestNotes.trim() && (
              <p className="text-sm text-red-500 mt-1">Request notes are required</p>
            )}
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
              onClick={handleSubmit}
              disabled={!requestNotes.trim() || isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
