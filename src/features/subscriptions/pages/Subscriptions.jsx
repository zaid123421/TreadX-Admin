import React from 'react';
import { useSubscriptionsPage } from '../hooks/useSubscriptionsPage';
import { SubscriptionsView } from '../components/SubscriptionsView';

const Subscriptions = () => {
  const vm = useSubscriptionsPage();
  return <SubscriptionsView {...vm} />;
};

export default Subscriptions;
