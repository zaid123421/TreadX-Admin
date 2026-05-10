import React from 'react';
import { useSubscriptionPlanForm } from '../hooks/useSubscriptionPlanForm';
import { SubscriptionPlanFormView } from './SubscriptionPlanFormView';

const SubscriptionPlanForm = ({ plan, onSuccess, onCancel }) => {
  const vm = useSubscriptionPlanForm({ plan, onSuccess, onCancel });
  return <SubscriptionPlanFormView {...vm} />;
};

export default SubscriptionPlanForm;
