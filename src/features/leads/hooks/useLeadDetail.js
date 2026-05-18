import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthContext';
import {
  canConvertLeadToDealer,
  canDeleteLead,
  canEditLead,
  canSalesAgentViewLead,
} from '@/shared/access/roleMatrix';
import { leadsService } from '../services/leadsApiService';
import { fetchSalesAgents } from '@/shared/services/usersApiService';
import { getBusinessInitials, formatLeadDateDetail, resolveLeadDownloadFilename } from '../utils/leadUtils';

export function useLeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [takingLead, setTakingLead] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewContentType, setPreviewContentType] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');

  useEffect(() => {
    if (id) loadLead();
  }, [id, user?.id, user?.roleName]);

  useEffect(() => {
    if (user?.roleName === 'SYSTEM_ADMIN' || user?.roleName === 'SALES_MANAGER') {
      loadAgents();
    }
  }, [user?.roleName]);

  const loadLead = async () => {
    try {
      setLoading(true);
      setError(null);
      const leadData = await leadsService.getLead(id);
      if (user?.roleName === 'SALES_AGENT' && !canSalesAgentViewLead(leadData, user)) {
        setLead(null);
        setError('Forbidden');
        return;
      }
      setLead(leadData);

      if (leadData.uploadedFile && token) {
        loadPreviewUrl(leadData.id);
      }
    } catch (err) {
      const status = err.response?.status;
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to load lead';
      setError(status === 403 ? 'Forbidden' : msg);
    } finally {
      setLoading(false);
    }
  };

  const loadAgents = async () => {
    try {
      const salesAgents = await fetchSalesAgents();
      setAgents(salesAgents);
    } catch (_) {
      setAgents([]);
    }
  };

  const loadPreviewUrl = async (leadId) => {
    try {
      const response = await leadsService.getLeadPreviewResponse(leadId);
      const contentType = response.headers['content-type'];
      const blobUrl = URL.createObjectURL(response.data);
      setPreviewContentType(contentType);
      setPreviewUrl(blobUrl);
    } catch (error) {
      console.error('Failed to load preview URL:', error);
    }
  };

  const handleContactSuccess = (updatedLead) => {
    setLead(updatedLead);
    setShowContactModal(false);
  };

  const handleValidationSuccess = (updatedLead) => {
    setLead(updatedLead);
    setShowValidationModal(false);
  };

  const handleConversionSuccess = async () => {
    await loadLead();
  };

  const handleTakeLead = async () => {
    try {
      setTakingLead(true);
      const updatedLead = await leadsService.takeLead(lead.id);
      setLead(updatedLead);
      setMessage({ text: 'Lead taken successfully!', type: 'success' });
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setTakingLead(false);
    }
  };

const handleDelete = async () => {
  // قمنا بحذف الـ if (window.confirm(...)) من هنا لأن التأكيد يتم الآن عبر الـ UI المخصص
  try {
    setDeleting(true);
    await leadsService.deleteLead(id);
    navigate('/leads', {
      state: {
        message: 'Lead has been deleted successfully',
        type: 'success',
      },
    });
  } catch (err) {
    setError(err.message || 'Failed to delete lead');
  } finally {
    setDeleting(false);
  }
};
  const handleAssignLead = async () => {
    if (!selectedAgentId || !lead?.id) return;
    try {
      setAssigning(true);
      const updated = await leadsService.assignLead(lead.id, selectedAgentId);
      setLead(updated);
      setMessage({ text: 'Lead assigned successfully', type: 'success' });
      setSelectedAgentId('');
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setAssigning(false);
    }
  };

  const handlePreview = () => {
    if (!token) {
      setError('Authentication required to preview document');
      return;
    }

    leadsService
      .getLeadPreviewResponse(lead.id)
      .then((response) => {
        const blobUrl = URL.createObjectURL(response.data);
        window.open(blobUrl, '_blank');
      })
      .catch((error) => {
        console.error('Preview error:', error);
        setError('Failed to load document preview');
      });
  };

  const handleDownload = () => {
    if (!token) {
      setError('Authentication required to download document');
      return;
    }

    leadsService
      .getLeadDownloadResponse(lead.id)
      .then((response) => {
        const contentDisposition = response.headers['content-disposition'];
        const blobData = response.data;
        const finalFilename = resolveLeadDownloadFilename(
          contentDisposition,
          lead.id,
          lead.uploadedFile,
          blobData
        );

        const blobUrl = URL.createObjectURL(blobData);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = finalFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      })
      .catch((error) => {
        console.error('Download error:', error);
        setError('Failed to download document');
      });
  };

  const formatDate = (dateArr) => formatLeadDateDetail(dateArr);

  const canEditLeadFlag = lead && user ? canEditLead(lead, user) : false;
  const canDeleteLeadFlag = lead && user ? canDeleteLead(lead, user) : false;
  const canConvertDealerFlag = user ? canConvertLeadToDealer(user) : false;

  return {
    id,
    navigate,
    user,
    token,
    lead,
    loading,
    error,
    canEditLead: canEditLeadFlag,
    canDeleteLead: canDeleteLeadFlag,
    canConvertLeadToDealer: canConvertDealerFlag,
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
    getInitials: getBusinessInitials,
    previewContentType,
    deleting,
  };
}
