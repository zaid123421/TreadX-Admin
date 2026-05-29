import React from 'react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Switch } from '@/shared/ui/switch';
import { Label } from '@/shared/ui/label';
import {
  Warehouse,
  Mail,
  Phone,
  MapPin,
  Edit,
  Trash2,
  Loader2,
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import {
  WAREHOUSE_STATUS,
  WAREHOUSE_STATUS_STYLES,
  WAREHOUSE_CARD_BORDER,
  formatWarehouseLocation,
  formatWarehouseAddressLine,
  formatWarehouseDate,
  getWarehouseStatusLabel,
} from '../utils/warehouseUtils';

export function WarehouseCard({
  warehouse,
  actionId,
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  const status = warehouse.status ?? WAREHOUSE_STATUS.INACTIVE;
  const statusStyle = WAREHOUSE_STATUS_STYLES[status] ?? WAREHOUSE_STATUS_STYLES.INACTIVE;
  const borderStyle = WAREHOUSE_CARD_BORDER[status] ?? WAREHOUSE_CARD_BORDER.INACTIVE;
  const isBusy = actionId === warehouse.id;
  const canToggle =
    status === WAREHOUSE_STATUS.ACTIVE || status === WAREHOUSE_STATUS.INACTIVE;
  const location = formatWarehouseLocation(warehouse);
  const addressLine = formatWarehouseAddressLine(warehouse);

  return (
    <article
      className={cn(
        'flex flex-col rounded-xl border border-border bg-card shadow-sm border-s-4',
        borderStyle,
      )}
    >
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Warehouse className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-foreground">
                {warehouse.warehouseName}
                {warehouse.address?.city ? ` — ${warehouse.address.city}` : ''}
              </h3>
              <Badge variant="outline" className="mt-2 font-mono text-xs">
                {warehouse.warehouseCode}
              </Badge>
            </div>
          </div>
          <Badge variant="outline" className={cn('shrink-0 text-xs', statusStyle)}>
            {getWarehouseStatusLabel(status)}
          </Badge>
        </div>

        <div className="mt-5 space-y-3 text-sm">
          <div className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary/80" />
            <div>
              <p className="text-foreground">{location}</p>
              <p className="mt-0.5 text-xs">{addressLine}</p>
              {warehouse.address?.postalCode && (
                <p className="mt-0.5 text-xs">Postal: {warehouse.address.postalCode}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4 shrink-0 text-primary/80" />
            <span className="truncate text-foreground">{warehouse.email || '—'}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4 shrink-0 text-primary/80" />
            <span className="text-foreground">{warehouse.phoneNumber || '—'}</span>
          </div>

          {warehouse.address?.specialInstructions && (
            <p className="rounded-md border border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
              {warehouse.address.specialInstructions}
            </p>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
          <div>
            <span className="block uppercase tracking-wide">Created</span>
            <span className="text-foreground">{formatWarehouseDate(warehouse.createdAt)}</span>
          </div>
          <div>
            <span className="block uppercase tracking-wide">Updated</span>
            <span className="text-foreground">{formatWarehouseDate(warehouse.updatedAt)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-4">
        {canToggle ? (
          <div className="flex items-center gap-2">
            <Switch
              id={`status-${warehouse.id}`}
              checked={status === WAREHOUSE_STATUS.ACTIVE}
              disabled={isBusy}
              onCheckedChange={() => onToggleStatus(warehouse)}
            />
            <Label htmlFor={`status-${warehouse.id}`} className="text-sm text-muted-foreground">
              {status === WAREHOUSE_STATUS.ACTIVE ? 'Active' : 'Inactive'}
            </Label>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Status cannot be toggled</span>
        )}

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-md border-border"
            disabled={isBusy}
            onClick={() => onEdit(warehouse)}
          >
            <Edit className="mr-1.5 h-4 w-4" />
            Edit
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-md border-destructive/40 text-destructive hover:bg-destructive/10"
            disabled={isBusy}
            onClick={() => onDelete(warehouse)}
          >
            {isBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}
