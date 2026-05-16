import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { CheckCircle, XCircle, Calendar, Mail } from 'lucide-react';
import ConversionRequestStatusBadge from './ConversionRequestStatusBadge';

const ConversionRequestCard = ({ request, onApprove, onReject, isLoading }) => {
  const isPending = request.status === 'PENDING';

  const formatDate = (date) =>
    date ? new Date(date).toISOString().split('T')[0] : 'N/A';

  return (
    <Card
      className="
        border border-border/60
        bg-card
        hover:border-primary/40
        hover:shadow-lg
        transition-all duration-200
        rounded-lg
        flex flex-col justify-between
        overflow-hidden
      "
    >
      <CardContent className="p-4 space-y-4 flex-1 flex flex-col justify-between">
        
        <div className="space-y-3">
          {/* HEADER: العنوان وحالة الطلب بوضوح أكبر */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-text-title-md font-bold text-foreground tracking-tight line-clamp-1">
              {request.leadBusinessName}
            </h3>
            <div className="shrink-0">
              <ConversionRequestStatusBadge status={request.status} />
            </div>
          </div>

          {/* EMAILS: استخدام توزيع طولي واضح ومقروء بدلاً من السطور المنكمشة */}
          <div className="space-y-2 bg-surface-container-low/40 p-2.5 rounded-md border border-border/30">
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-semibold text-muted-foreground/90 flex items-center gap-1">
                <Mail className="h-3 w-3 text-warning" /> Requested By
              </span>
              <span className="text-text-body-md font-medium text-foreground truncate pl-4">
                {request.requestedByEmail}
              </span>
            </div>

            <div className="flex flex-col gap-0.5 pt-1.5 border-t border-border/20">
              <span className="text-[11px] font-semibold text-muted-foreground/90 flex items-center gap-1">
                <Mail className="h-3 w-3 text-tertiary" /> Assigned To
              </span>
              <span className="text-text-body-md font-medium text-foreground truncate pl-4">
                {request.assignedToEmail}
              </span>
            </div>
          </div>

          {/* NOTES: خلفية ملونة متناسقة مع الـ Warning Container إذا وجدت ملاحظات */}
          {request.requestNotes && (
            <div className="bg-amber-500/10 dark:bg-amber-500/5 border border-warning/20 rounded-md p-2.5">
              <p className="text-[11px] font-bold text-warning-main-dark dark:text-color-primary-main-dark uppercase tracking-wider mb-0.5">
                Notes
              </p>
              <p className="text-text-body-md font-normal text-foreground leading-relaxed">
                {request.requestNotes}
              </p>
            </div>
          )}
        </div>

        {/* FOOTER: مساحة الأزرار والتاريخ */}
        <div className="flex items-center justify-between pt-3 border-t border-border/40 mt-auto">
          <span className="text-text-label-sm font-mono text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(request.createdAt)}
          </span>

          {isPending && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => onReject(request.id)}
                disabled={isLoading}
                variant="destructive"
                className="h-8 px-3 text-text-label-md font-semibold"
              >
                <XCircle className="h-3.5 w-3.5 mr-1.5" />
                Reject
              </Button>
              <Button
                size="sm"
                onClick={() => onApprove(request.id)}
                disabled={isLoading}
                className="
                  h-8 px-3 text-text-label-md font-semibold
                  bg-success hover:bg-success/90
                  text-white transition-colors shadow-sm
                "
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                Approve
              </Button>
            </div>
          )}
        </div>
        
      </CardContent>
    </Card>
  );
};

export default ConversionRequestCard;