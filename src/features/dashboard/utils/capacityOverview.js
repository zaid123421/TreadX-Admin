/**
 * Capacity overview from GET /wms/warehouses/capacity-overview
 *
 * Expected shape:
 * {
 *   totalCapacity, allocated, used,
 *   totalStorageCapacity, totalStored,
 *   usage: { empty, occupied, reservedInbound, reservedOutbound, total },
 *   warehouseCount, initializedWarehouseCount
 * }
 */

export const USAGE_SEGMENT_ORDER = [
  'occupied',
  'reservedInbound',
  'reservedOutbound',
  'empty',
];

/** Stable colors keyed by usage segment (not index-based). */
export const USAGE_SEGMENT_COLORS = {
  occupied: 'var(--primary)',
  reservedInbound: 'var(--warning)',
  reservedOutbound: 'var(--info)',
  empty: 'var(--muted-foreground)',
};

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function percent(part, total) {
  if (!total || total <= 0) return 0;
  return Math.round((part / total) * 1000) / 10;
}

/**
 * @param {unknown} payload
 * @returns {{
 *   summary: {
 *     totalCapacity: number,
 *     allocated: number,
 *     used: number,
 *     totalStorageCapacity: number,
 *     totalStored: number,
 *     warehouseCount: number,
 *     initializedWarehouseCount: number,
 *     utilizationPercent: number,
 *     allocationPercent: number,
 *   },
 *   segments: Array<{ key: string, value: number, percent: number, color: string }>,
 *   chartSegments: Array<{ key: string, value: number, percent: number, color: string }>,
 * }}
 */
export function normalizeCapacityOverview(payload) {
  const empty = {
    summary: {
      totalCapacity: 0,
      allocated: 0,
      used: 0,
      totalStorageCapacity: 0,
      totalStored: 0,
      warehouseCount: 0,
      initializedWarehouseCount: 0,
      utilizationPercent: 0,
      allocationPercent: 0,
    },
    segments: [],
    chartSegments: [],
  };

  if (!payload) return empty;

  const raw = payload?.data ?? payload?.content ?? payload;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return empty;

  const usage = raw.usage && typeof raw.usage === 'object' ? raw.usage : {};
  const totalCapacity = toNumber(raw.totalCapacity ?? usage.total ?? raw.totalStorageCapacity);
  const used = toNumber(raw.used ?? usage.occupied ?? raw.totalStored);
  const allocated = toNumber(raw.allocated ?? usage.reservedInbound);

  const summary = {
    totalCapacity,
    allocated,
    used,
    totalStorageCapacity: toNumber(raw.totalStorageCapacity ?? totalCapacity),
    totalStored: toNumber(raw.totalStored ?? used),
    warehouseCount: toNumber(raw.warehouseCount),
    initializedWarehouseCount: toNumber(raw.initializedWarehouseCount),
    utilizationPercent: percent(used, totalCapacity),
    allocationPercent: percent(allocated, totalCapacity),
  };

  const usageTotal = toNumber(usage.total, totalCapacity) || totalCapacity;

  const segments = USAGE_SEGMENT_ORDER.map((key) => {
    const value = toNumber(usage[key]);
    return {
      key,
      value,
      percent: percent(value, usageTotal),
      color: USAGE_SEGMENT_COLORS[key] || 'var(--muted-foreground)',
    };
  });

  // Pie should still render when everything is empty (single empty slice)
  const positive = segments.filter((s) => s.value > 0);
  const chartSegments =
    positive.length > 0
      ? positive
      : totalCapacity > 0
        ? [
            {
              key: 'empty',
              value: totalCapacity,
              percent: 100,
              color: USAGE_SEGMENT_COLORS.empty,
            },
          ]
        : [];

  return { summary, segments, chartSegments };
}
