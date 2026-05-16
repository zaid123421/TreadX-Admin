import React from 'react';
import {ConversionRequestApprovalModalView} from './ConversionRequestApprovalModalView';
import { conversionRequestsService } from '../services/conversionRequestsApiService';
import { subscriptionPlansService } from '@/features/subscriptions/services/subscriptionPlansApiService';

export default function ConversionRequestApprovalModal({ request, onClose, onSuccess }) {
  const [subscriptionPlans, setSubscriptionPlans] = React.useState([]);
  const [loadingPlans, setLoadingPlans] = React.useState(false);

  // 1️⃣ جعل هيكلية الـ State مطابقة تماماً لما يتوقعه السيرفر (كل الحقول مسطحة)
  const [formData, setFormData] = React.useState({
    leadId: request?.leadId,
    legalName: '',
    businessName: request?.leadBusinessName || '',
    streetNumber: request?.streetNumber || '',
    streetName: request?.streetName || '',
    aptUnitBldg: request?.aptUnitBldg || '',
    postalCode: request?.postalCode || '',
    email: request?.email || '',
    phoneNumber: request?.phoneNumber || '',
    status: 'ACTIVE',
    totalUsers: 1,           // مسطح مباشرة
    subscriptionPlanId: '',
    autoRenew: false,
    billingWeekday: 'MONDAY',
    adminFirstName: '',      // مسطح مباشرة
    adminLastName: '',       // مسطح مباشرة
    adminEmail: '',          // مسطح مباشرة
    userRoles: {             // الكائن الوحيد الذي يقبله السيرفر كـ Map داخلي
      DEALER_ADMIN: 1,
      DEALER_TECHNICIAN: 0,
    },
  });
  
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const loadSubscriptionPlans = async () => {
      try {
        setLoadingPlans(true);
        const plans = await subscriptionPlansService.getActiveSubscriptionPlans();
        setSubscriptionPlans(plans || []);
      } catch (err) {
        console.error('Failed to load subscription plans:', err);
      } finally {
        setLoadingPlans(false);
      }
    };

    loadSubscriptionPlans();
  }, []);

  const handleSubmit = async () => {
    // Validation
    if (!formData.legalName.trim()) { setError('Legal name is required'); return; }
    if (!formData.businessName.trim()) { setError('Business name is required'); return; }
    if (!formData.email.trim()) { setError('Email is required'); return; }
    if (!formData.phoneNumber.trim()) { setError('Phone number is required'); return; }
    if (!formData.subscriptionPlanId) { setError('Subscription plan is required'); return; }
    if (!formData.adminFirstName.trim()) { setError('Admin first name is required'); return; }
    if (!formData.adminLastName.trim()) { setError('Admin last name is required'); return; }
    if (!formData.adminEmail.trim()) { setError('Admin email is required'); return; }

    const totalRoles = formData.userRoles.DEALER_ADMIN + formData.userRoles.DEALER_TECHNICIAN;
    if (totalRoles > formData.totalUsers) {
      setError(`Total team members (${totalRoles}) cannot exceed total users (${formData.totalUsers})`);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // 2️⃣ بناء الـ Payload النهائي بالـ 18 حقل المسطح المتوقعين في السيرفر بدون كائن "system" أو "admin"
      const decisionData = {
        approve: true,
        dealerCreation: {
          leadId: formData.leadId,
          legalName: formData.legalName,
          businessName: formData.businessName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          totalUsers: formData.totalUsers, // إرسال مباشر
          subscriptionPlanId: formData.subscriptionPlanId,
          autoRenew: formData.autoRenew,
          billingWeekday: formData.billingWeekday,
          userRoles: formData.userRoles,
          adminFirstName: formData.adminFirstName, // إرسال مباشر
          adminLastName: formData.adminLastName,   // إرسال مباشر
          adminEmail: formData.adminEmail,         // إرسال مباشر
          // الحقول الإضافية إذا لزم الأمر
          streetNumber: formData.streetNumber,
          streetName: formData.streetName,
          aptUnitBldg: formData.aptUnitBldg,
          postalCode: formData.postalCode,
          status: formData.status
        },
      };
      
      await conversionRequestsService.makeDecision(request.id, decisionData);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to approve conversion request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 3️⃣ تعديل الـ Handler ليتعامل بمرونة مع الحقول المسطحة لحماية الـ Admin والـ System
  const handleNestedFieldChange = (section, field, value) => {
    setFormData((prev) => {
      // إذا كان التعديل يخص الـ userRoles نعدله داخل كائنه الخاص
      if (section === 'userRoles') {
        return {
          ...prev,
          userRoles: {
            ...prev.userRoles,
            [field]: value,
          },
        };
      }
      
      // لأي قسم آخر (مثل محاولات تعديل admin أو system في الـ View)، نقوم بتسطيحه وحفظه مباشرة في الـ السطح
      return {
        ...prev,
        [field]: value, // يُخزن مباشرة كـ adminFirstName أو totalUsers
      };
    });
  };

  return (
    <ConversionRequestApprovalModalView
      request={request}
      formData={formData}
      subscriptionPlans={subscriptionPlans}
      loadingPlans={loadingPlans}
      onFieldChange={handleFieldChange}
      onNestedFieldChange={handleNestedFieldChange}
      isSubmitting={isSubmitting}
      error={error}
      handleSubmit={handleSubmit}
      onClose={onClose}
    />
  );
}