import React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/ui/badge";
import {
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  UserCheck,
  CheckSquare,
} from "lucide-react";
import { LeadStatus } from '@/shared/types/enums';

const LeadStatusBadge = ({ status, className = "" }) => {
  const { t } = useTranslation("leads");

  const statusConfig = {
    [LeadStatus.PENDING]: {
      icon: Clock,
      variant: "secondary",
      className: "border border-warning/25 bg-warning/15 text-warning",
    },
    [LeadStatus.APPROVED]: {
      icon: CheckCircle,
      variant: "default",
      className: "border border-success/25 bg-success/15 text-success",
    },
    [LeadStatus.DENIED]: {
      icon: XCircle,
      variant: "destructive",
      className: "border border-destructive/25 bg-destructive/15 text-destructive",
    },
    [LeadStatus.CONTACTED]: {
      icon: Phone,
      variant: "default",
      className: "border border-info/25 bg-info/15 text-info",
    },
    [LeadStatus.ONBOARDED]: {
      icon: UserCheck,
      variant: "default",
      className: "border border-accent/40 bg-accent/15 text-accent-foreground",
    },
    [LeadStatus.DONE]: {
      icon: CheckSquare,
      variant: "default",
      className: "border border-border bg-muted text-muted-foreground",
    },
  };

  const config =
    statusConfig[status] || {
      icon: Clock,
      variant: "secondary",
      className: "border border-border bg-muted text-muted-foreground",
    };

  const IconComponent = config.icon;
  const label = t(`status.${status}`, { defaultValue: status });

  return (
    <Badge
      variant={config.variant}
      className={`flex items-center gap-1 ${config.className} ${className}`}
    >
      <IconComponent className="h-3 w-3" />
      {label}
    </Badge>
  );
};

export default LeadStatusBadge;
