import React from 'react';
import { Badge } from '../ui/badge';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Phone, 
  UserCheck, 
  CheckSquare 
} from 'lucide-react';
import { LeadStatus } from '../../types/api';

const LeadStatusBadge = ({ status, className = '' }) => {
  const statusConfig = {
    [LeadStatus.PENDING]: {
      label: 'Pending',
      icon: Clock,
      variant: 'secondary',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    [LeadStatus.APPROVED]: {
      label: 'Approved',
      icon: CheckCircle,
      variant: 'default',
      className: 'bg-green-100 text-green-800 border-green-200'
    },
    [LeadStatus.DENIED]: {
      label: 'Denied',
      icon: XCircle,
      variant: 'destructive',
      className: 'bg-red-100 text-red-800 border-red-200'
    },
    [LeadStatus.CONTACTED]: {
      label: 'Contacted',
      icon: Phone,
      variant: 'default',
      className: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    [LeadStatus.ONBOARDED]: {
      label: 'Onboarded',
      icon: UserCheck,
      variant: 'default',
      className: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    [LeadStatus.DONE]: {
      label: 'Completed',
      icon: CheckSquare,
      variant: 'default',
      className: 'bg-gray-100 text-gray-800 border-gray-200'
    }
  };

  const config = statusConfig[status] || {
    label: status,
    icon: Clock,
    variant: 'secondary',
    className: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const IconComponent = config.icon;

  return (
    <Badge 
      variant={config.variant} 
      className={`flex items-center gap-1 ${config.className} ${className}`}
    >
      <IconComponent className="w-3 h-3" />
      {config.label}
    </Badge>
  );
};

export default LeadStatusBadge; 