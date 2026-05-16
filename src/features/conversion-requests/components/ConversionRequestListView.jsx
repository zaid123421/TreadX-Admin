import React from 'react';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { RefreshCw } from 'lucide-react';
import ConversionRequestCard from './ConversionRequestCard';
import ConversionRequestApprovalModal from './ConversionRequestApprovalModal';
import ConversionRequestRejectionModal from './ConversionRequestRejectionModal';

export function ConversionRequestListView({
  loading,
  error,
  message,
  requests,
  currentPage,
  setCurrentPage,
  totalPages,
  totalElements,
  handleApprove,
  handleReject,
  handleApprovalSuccess,
  handleRejectionSubmit,
  actionInProgress,
  loadRequests,
  showApprovalModal,
  setShowApprovalModal,
  showRejectionModal,
  setShowRejectionModal,
  selectedRequest,
}) {
  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading conversion requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {/* Alert Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-headline-sm font-bold text-foreground">Conversion Requests</h1>
          <p className="text-text-label-md text-muted-foreground">Manage pending conversion requests</p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadRequests} size="sm" className="h-9">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Content */}
      {requests.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">No conversion requests found</p>
            <p className="text-text-label-md text-muted-foreground/75">
              {totalElements === 0
                ? 'There are no pending conversion requests yet.'
                : 'No requests available.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ⚡ التعديل الأساسي هنا: تم تحويلها إلى Grid مرن وممتاز للشاشات المتوسطة والكبيرة ⚡ */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {requests.map((request) => (
              <ConversionRequestCard
                key={request.id}
                request={request}
                onApprove={handleApprove}
                onReject={handleReject}
                isLoading={actionInProgress === request.id}
              />
            ))}
          </div>

          {/* Pagination Info */}
          <div className="flex items-center justify-between text-text-label-md text-muted-foreground pt-4 border-t border-border/40">
            <p>
              Showing {requests.length} of {totalElements} requests
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <span className="font-medium text-foreground">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage >= totalPages - 1}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {showApprovalModal && selectedRequest && (
        <ConversionRequestApprovalModal
          request={selectedRequest}
          onClose={() => setShowApprovalModal(false)}
          onSuccess={handleApprovalSuccess}
        />
      )}

      {showRejectionModal && selectedRequest && (
        <ConversionRequestRejectionModal
          request={selectedRequest}
          onClose={() => setShowRejectionModal(false)}
          onReject={handleRejectionSubmit}
          isSubmitting={actionInProgress === selectedRequest.id}
        />
      )}
    </div>
  );
}
