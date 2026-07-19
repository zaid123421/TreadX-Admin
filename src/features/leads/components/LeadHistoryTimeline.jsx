import React from 'react';
import { Badge } from '@/shared/ui/badge';
import {
  Calendar,
  CheckCircle,
  Edit,
  UserCheck,
  PhoneCall,
  ArrowRight,
  History,
  UserPlus,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { formatFullName } from '@/shared/utils/formatters';
import {
  formatHistoryDate,
  formatActionTypeLabel,
  getHistoryTimestamp,
  getStatusLabel,
  getStatusColor,
} from '../utils/leadUtils';

function getActionVisual(actionType = '') {
  const key = String(actionType).toUpperCase();

  if (key.includes('VALIDAT')) {
    return {
      icon: CheckCircle,
      tone: 'bg-success/15 text-success border-success/25',
      dot: 'bg-success',
    };
  }
  if (key.includes('ASSIGN')) {
    return {
      icon: UserCheck,
      tone: 'bg-info/15 text-info border-info/25',
      dot: 'bg-info',
    };
  }
  if (key.includes('CONTACT')) {
    return {
      icon: PhoneCall,
      tone: 'bg-primary/15 text-primary border-primary/25',
      dot: 'bg-primary',
    };
  }
  if (key.includes('CREATE') || key.includes('ADD')) {
    return {
      icon: UserPlus,
      tone: 'bg-primary/15 text-primary border-primary/25',
      dot: 'bg-primary',
    };
  }
  if (key.includes('UPDATE') || key.includes('STATUS') || key.includes('EDIT')) {
    return {
      icon: Edit,
      tone: 'bg-warning/15 text-warning border-warning/25',
      dot: 'bg-warning',
    };
  }
  if (key.includes('DENY') || key.includes('REJECT') || key.includes('UNQUALIF')) {
    return {
      icon: AlertCircle,
      tone: 'bg-destructive/15 text-destructive border-destructive/25',
      dot: 'bg-destructive',
    };
  }

  return {
    icon: History,
    tone: 'bg-muted text-muted-foreground border-border',
    dot: 'bg-muted-foreground',
  };
}

function StatusBadge({ status }) {
  if (!status) return null;
  return (
    <Badge
      variant="outline"
      className="font-semibold text-[11px] px-2 py-0.5 rounded-md border-transparent"
      style={getStatusColor(status)}
    >
      {getStatusLabel(status)}
    </Badge>
  );
}

function MetaRow({ label, children }) {
  if (!children) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{children}</span>
    </div>
  );
}

export default function LeadHistoryTimeline({
  history = [],
  loading = false,
  error = null,
  onRetry,
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-6 text-center">
        <AlertCircle className="mx-auto mb-2 h-6 w-6 text-destructive" />
        <p className="text-sm font-medium text-foreground mb-1">Failed to load history</p>
        <p className="text-xs text-muted-foreground mb-3">{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="text-sm font-medium text-primary hover:underline"
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  const items = [...history].sort((a, b) => getHistoryTimestamp(b) - getHistoryTimestamp(a));

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center">
        <History className="mx-auto mb-3 h-8 w-8 text-muted-foreground/70" />
        <p className="text-sm font-medium text-foreground">No history yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Lead activity will appear here as actions are performed.
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-0">
      <div className="absolute start-[19px] top-3 bottom-3 w-px bg-border" aria-hidden />

      <ol className="relative space-y-4">
        {items.map((item, index) => {
          const visual = getActionVisual(item.actionType);
          const Icon = visual.icon;
          const performedBy = formatFullName(
            item.performedByFirstName,
            item.performedByLastName
          );
          const validatedBy = formatFullName(
            item.validatedByFirstName,
            item.validatedByLastName
          );
          const assignedTo = formatFullName(
            item.assignedToFirstName,
            item.assignedToLastName
          );
          const timestamp =
            item.createdAt || item.assignedAt || item.validatedAt || item.updatedAt;

          return (
            <li key={`${item.createdAt}-${item.actionType}-${index}`} className="relative ps-12">
              <div
                className={`absolute start-2 top-3 flex h-8 w-8 items-center justify-center rounded-full border bg-card shadow-sm ${visual.tone}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>

              <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs transition-colors hover:border-primary/30 hover:bg-muted/20">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">
                      {formatActionTypeLabel(item.actionType)}
                    </h4>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <time>{formatHistoryDate(timestamp)}</time>
                    </div>
                  </div>

                  {(item.previousStatus || item.newStatus) && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {item.previousStatus && <StatusBadge status={item.previousStatus} />}
                      {item.previousStatus && item.newStatus && (
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      {item.newStatus && <StatusBadge status={item.newStatus} />}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <MetaRow label="Performed by">{performedBy || null}</MetaRow>
                  <MetaRow label="Validated by">{validatedBy || null}</MetaRow>
                  <MetaRow label="Assigned to">{assignedTo || null}</MetaRow>
                  {item.addedByManager != null && (
                    <MetaRow label="Added by manager">
                      {item.addedByManager ? 'Yes' : 'No'}
                    </MetaRow>
                  )}
                </div>

                {item.details && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5">
                    <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
                      {item.details}
                    </p>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
