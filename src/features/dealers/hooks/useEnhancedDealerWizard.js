import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { leadsService } from '../../leads/services/leadsApiService';
import { LeadStatus, UserRole } from '@/shared/types/enums';
import { defaultDealerRequest } from '@/features/dealers/types/dealerDefaults';
import { dealersService } from '../services/dealersApiService';
import { subscriptionPlansService } from '@/features/subscriptions';
import { validatePostalCode, validatePhoneNumber, validateStreetNumber } from '../../leads/utils/leadUtils';
import { toast } from 'sonner';
import { getDealerWizardSteps } from '../utils/dealerWizardSteps';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export function useEnhancedDealerWizard({ onClose, onSuccess }) {
  const query = useQuery();
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
    ...defaultDealerRequest,
    totalUsers: 0,
    userRoles: {
      [UserRole.DEALER_ADMIN]: 0,
      [UserRole.DEALER_TECHNICIAN]: 0,
    },
    subscriptionPlanId: '',
    autoRenew: true,
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);

  const WIZARD_STEPS = getDealerWizardSteps(!!leadIdFromQuery);

  useEffect(() => {
    if (!leadIdFromQuery) {
      fetchLeads();
    }
  }, [leadIdFromQuery, currentPage, searchTerm]);

  useEffect(() => {
    const loadLead = async () => {
      if (!leadIdFromQuery) return;
      setLoading(true);
      try {
        const lead = await leadsService.getLead(leadIdFromQuery);
        setSelectedLead(lead);
        setFormData((prev) => ({
          ...prev,
          leadId: lead.id,
          businessName: lead.businessName || prev.businessName,
          phoneNumber: lead.phoneNumber || prev.phoneNumber,
          streetNumber: lead.streetNumber || prev.streetNumber,
          streetName: lead.streetName || prev.streetName,
          aptUnitBldg: lead.aptUnitBldg || prev.aptUnitBldg,
          postalCode: lead.postalCode || prev.postalCode,
          email: lead.contactEmail || lead.email || prev.email,
        }));
      } catch (err) {
        console.error('Failed to load lead for dealer conversion', err);
      } finally {
        setLoading(false);
      }
    };
    loadLead();
  }, [leadIdFromQuery]);

  useEffect(() => {
    fetchSubscriptionPlans();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await leadsService.getLeadsByStatus(LeadStatus.CONTACTED, {
        page: currentPage,
        size: pageSize,
        search: searchTerm,
      });
      setLeads(response.content || []);
      setTotalPages(response.totalPages || 0);
    } catch (e) {
      console.error('Error fetching leads:', e);
      setError('Failed to fetch contacted leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionPlans = async () => {
    try {
      const response = await subscriptionPlansService.getActiveSubscriptionPlans({ page: 0, size: 100 });
      setSubscriptionPlans(response.content || []);
    } catch (err) {
      setSubscriptionPlans([]);
    }
  };

  const handleLeadSelect = (lead) => {
    setSelectedLead(lead);
    setFormData((prev) => ({
      ...prev,
      leadId: lead.id,
      businessName: lead.businessName,
      phoneNumber: lead.phoneNumber,
      streetNumber: lead.streetNumber,
      streetName: lead.streetName,
      aptUnitBldg: lead.aptUnitBldg,
      email: lead.contactEmail || lead.email || prev.email,
      postalCode: lead.postalCode,
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
      const dealerData = {
        ...formData,
        totalUsers: formData.totalUsers,
        userRoles: formData.userRoles,
      };

      const response = await dealersService.createDealer(dealerData);
      toast.success('Dealer created successfully!');
      onSuccess(response);
    } catch (err) {
      console.error('Error creating dealer:', err);
      console.error('Error creating dealer:', err);
      toast.error(err.message || 'Failed to create dealer');
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
    if (currentStepData.id === 'contact') {
      return Boolean(formData.email) && validatePhoneNumber(formData.phoneNumber);
    }
    if (currentStepData.id === 'address') {
      return (
        Boolean(formData.streetName) &&
        validateStreetNumber(formData.streetNumber) &&
        validatePostalCode(formData.postalCode)
      );
    }
    if (currentStepData.id === 'onboarding') {
      return (
        Boolean(formData.subscriptionPlanId) &&
        Boolean(formData.adminFirstName) &&
        Boolean(formData.adminLastName) &&
        Boolean(formData.adminEmail)
      );
    }
    return currentStepData.fields.every((field) => {
      if (field === 'aptUnitBldg') return true;
      const value = formData[field];
      return value !== null && value !== undefined && value !== '';
    });
  };

  return {
    WIZARD_STEPS,
    currentStep,
    leads,
    loading,
    searchTerm,
    setSearchTerm,
    selectedLead,
    formData,
    setFormData,
    isSubmitting,
    error,
    subscriptionPlans,
    handleLeadSelect,
    handleNext,
    handlePrevious,
    handleSubmit,
    isStepValid,
    onClose,
  };
}

