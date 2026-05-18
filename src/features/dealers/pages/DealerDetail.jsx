import React from 'react';
import DealerDetailView from '../components/DealerDetailView';
import { useDealerDetail } from '../hooks/useDealerDetail';

const DealerDetail = () => {
  const vm = useDealerDetail();
  return <DealerDetailView vm={vm} />;
};

export default DealerDetail;
