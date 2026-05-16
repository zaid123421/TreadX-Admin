import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { conversionRequestsService } from '../services/conversionRequestsApiService';

export function useConversionRequestsList() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [actionInProgress, setActionInProgress] = useState(null);
  const [message, setMessage] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        size: pageSize,
      };

      const data = await conversionRequestsService.getAssignedPendingRequests(params);

      const content = Array.isArray(data) ? data : data?.content || [];
      const totalElementsCount = Array.isArray(data) ? data.length : data?.totalElements || content.length;
      const totalPagesCount = data?.totalPages || 1;

      setRequests(content);
      setTotalPages(totalPagesCount);
      setTotalElements(totalElementsCount);
    } catch (err) {
      console.error('Failed to load conversion requests:', err);
      setError(err.message || 'Failed to fetch requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleApprove = (requestId) => {
    const request = requests.find((r) => r.id === requestId);
    if (request) {
      setSelectedRequest(request);
      setShowApprovalModal(true);
    }
  };

  const handleRejectClick = (requestId) => {
    const request = requests.find((r) => r.id === requestId);
    if (request) {
      setSelectedRequest(request);
      setShowRejectionModal(true);
    }
  };

  const handleApprovalSuccess = async () => {
    setShowApprovalModal(false);
    setSelectedRequest(null);
    setMessage({
      text: 'Conversion request approved successfully! Dealer created.',
      type: 'success',
    });
    await loadRequests();
    setTimeout(() => setMessage(null), 5000);
  };

  const handleRejectionSubmit = async (rejectionReason) => {
    try {
      setActionInProgress(selectedRequest.id);
      await conversionRequestsService.makeDecision(selectedRequest.id, {
        approve: false,
        rejectionReason,
      });
      setShowRejectionModal(false);
      setSelectedRequest(null);
      setMessage({
        text: 'Conversion request rejected successfully!',
        type: 'success',
      });
      await loadRequests();
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      console.error('Failed to reject request:', err);
      setMessage({
        text: 'Failed to reject request: ' + err.message,
        type: 'error',
      });
    } finally {
      setActionInProgress(null);
    }
  };

return {
    requests,
    filteredRequests: requests,
    loading,
    error,
    message,
    currentPage,
    setCurrentPage,
    totalPages,
    totalElements,
    handleApprove,
    handleReject: handleRejectClick,
    handleApprovalSuccess,
    handleRejectionSubmit,
    actionInProgress,
    loadRequests,
    showApprovalModal,
    setShowApprovalModal,
    showRejectionModal,
    setShowRejectionModal,
    selectedRequest,
  };
}