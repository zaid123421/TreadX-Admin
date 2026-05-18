import React from 'react';
import { useDealersList } from '../hooks/useDealersList';
import { DealersListView } from '../components/DealersListView';

const DealersList = () => {
  const vm = useDealersList();
  return <DealersListView {...vm} />;
};

export default DealersList;
