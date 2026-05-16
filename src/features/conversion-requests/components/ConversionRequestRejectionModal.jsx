import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { AlertCircle, XCircle } from 'lucide-react';

export default function ConversionRequestRejectionModal({ request, onClose, onReject, isSubmitting }) {
  const [rejectionReason, setRejectionReason] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = () => {
    if (!rejectionReason.trim()) {
      setError('Rejection reason is required');
      return;
    }
    onReject(rejectionReason);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            Reject Conversion Request
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to reject the conversion request for {request.leadBusinessName}?
            Please provide a reason for the rejection.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rejectionReason">
              Rejection Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                setError('');
              }}
              placeholder="Enter the reason for rejecting this conversion request..."
              rows={4}
              className="resize-none"
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
              onClick={handleSubmit}
              disabled={isSubmitting}
              variant="destructive"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Request
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
