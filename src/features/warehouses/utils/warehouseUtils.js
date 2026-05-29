export const WAREHOUSE_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING_SETUP: 'PENDING_SETUP',
};

export const WAREHOUSE_STATUS_STYLES = {
  ACTIVE: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  INACTIVE: 'border-muted-foreground/30 bg-muted/40 text-muted-foreground',
  PENDING_SETUP: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
};

export const WAREHOUSE_CARD_BORDER = {
  ACTIVE: 'border-s-emerald-500/60',
  INACTIVE: 'border-s-muted-foreground/40',
  PENDING_SETUP: 'border-s-amber-500/60',
};

export function computeWarehouseStats(warehouses = []) {
  const total = warehouses.length;
  const active = warehouses.filter((w) => w.status === WAREHOUSE_STATUS.ACTIVE).length;
  const inactive = warehouses.filter((w) => w.status === WAREHOUSE_STATUS.INACTIVE).length;
  const pendingSetup = warehouses.filter((w) => w.status === WAREHOUSE_STATUS.PENDING_SETUP).length;

  return { total, active, inactive, pendingSetup };
}

export function formatWarehouseLocation(warehouse) {
  const addr = warehouse?.address;
  if (!addr) return '—';
  const parts = [addr.city, addr.province, addr.country].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : '—';
}

export function formatWarehouseAddressLine(warehouse) {
  const addr = warehouse?.address;
  if (!addr) return '—';
  const street = [addr.streetNumber, addr.streetName].filter(Boolean).join(' ');
  const parts = [street, addr.unitNumber ? `Unit ${addr.unitNumber}` : null].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : '—';
}

export function formatWarehouseDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getNextWarehouseStatus(currentStatus) {
  return currentStatus === WAREHOUSE_STATUS.ACTIVE
    ? WAREHOUSE_STATUS.INACTIVE
    : WAREHOUSE_STATUS.ACTIVE;
}

export function getWarehouseStatusLabel(status) {
  switch (status) {
    case WAREHOUSE_STATUS.ACTIVE:
      return 'ACTIVE';
    case WAREHOUSE_STATUS.INACTIVE:
      return 'INACTIVE';
    case WAREHOUSE_STATUS.PENDING_SETUP:
      return 'PENDING SETUP';
    default:
      return status ?? 'UNKNOWN';
  }
}
