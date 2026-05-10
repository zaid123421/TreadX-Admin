import React from 'react';
import { useSubscriptionPlansList } from '../hooks/useSubscriptionPlansList';
import { SubscriptionPlansListView } from './SubscriptionPlansListView';

const SubscriptionPlansList = () => {
  const vm = useSubscriptionPlansList();
  return <SubscriptionPlansListView {...vm} />;
};

export default SubscriptionPlansList;
