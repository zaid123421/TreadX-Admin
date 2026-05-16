import React from 'react';
import { Badge } from '@/shared/ui/badge';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { ConversionRequestStatus } from '@/shared/types/enums';

const ConversionRequestStatusBadge = ({ status, className = '' }) => {
  const statusConfig = {
    [ConversionRequestStatus.PENDING]: {
      icon: Clock,
      className: 'border border-warning/25 bg-warning/15 text-warning',
      label: 'Pending',
    },
    [ConversionRequestStatus.APPROVED]: {
      icon: CheckCircle,
      className: 'border border-success/25 bg-success/15 text-success',
      label: 'Approved',
    },
    [ConversionRequestStatus.REJECTED]: {
      icon: XCircle,
      className: 'border border-destructive/25 bg-destructive/15 text-destructive',
      label: 'Rejected',
    },
  };

  const config = statusConfig[status] || statusConfig[ConversionRequestStatus.PENDING];
  const Icon = config.icon;

  return (
    <Badge className={`${config.className} ${className} flex items-center gap-1.5 w-fit`}>
      <Icon className="h-3.5 w-3.5" />
      <span>{config.label}</span>
    </Badge>
  );
};

export default ConversionRequestStatusBadge;
