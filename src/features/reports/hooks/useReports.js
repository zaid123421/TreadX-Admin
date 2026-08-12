import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { dealersService } from '@/features/dealers';
import { warehousesService } from '@/features/warehouses';
import { reportsService } from '../services/reportsApiService';
import { REPORT_CATALOG, REPORT_CATEGORIES } from '../utils/reportCatalog';

export function useReports() {
  const { t } = useTranslation('reports');
  const [dealerId, setDealerId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [dealers, setDealers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [dealersLoading, setDealersLoading] = useState(true);
  const [warehousesLoading, setWarehousesLoading] = useState(true);
  const [exportingKey, setExportingKey] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setDealersLoading(true);
      try {
        const data = await dealersService.getDealers({ page: 0, size: 200 });
        const list = Array.isArray(data?.content)
          ? data.content
          : Array.isArray(data)
            ? data
            : [];
        if (!cancelled) setDealers(list);
      } catch {
        if (!cancelled) setDealers([]);
      } finally {
        if (!cancelled) setDealersLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setWarehousesLoading(true);
      try {
        const list = await warehousesService.getWarehouses();
        if (!cancelled) setWarehouses(list);
      } catch {
        if (!cancelled) setWarehouses([]);
      } finally {
        if (!cancelled) setWarehousesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    return REPORT_CATEGORIES.map((categoryKey) => ({
      categoryKey,
      reports: REPORT_CATALOG.filter((r) => r.categoryKey === categoryKey),
    }));
  }, []);

  const resolvePath = useCallback((report, format) => {
    const target = format === 'pdf' ? report.pdf : report.excel;
    if (typeof target === 'function') {
      if (!dealerId) return null;
      return target(dealerId);
    }
    return target;
  }, [dealerId]);

  const resolveExportParams = useCallback(
    (report) => {
      if (report.requiresWarehouse && warehouseId) {
        return { warehouseId };
      }
      return undefined;
    },
    [warehouseId],
  );

  const handleExport = useCallback(
    async (report, format) => {
      if (report.requiresDealer && !dealerId) {
        toast.error(t('selectDealerFirst'));
        return;
      }

      if (report.requiresWarehouse && !warehouseId) {
        toast.error(t('selectWarehouseFirst'));
        return;
      }

      const path = resolvePath(report, format);
      if (!path) {
        toast.error(t('selectDealerFirst'));
        return;
      }

      const key = `${report.id}-${format}`;
      setExportingKey(key);
      try {
        await reportsService.downloadExport(path, {
          format,
          nameHint: report.id,
          params: resolveExportParams(report),
        });
        toast.success(t('downloadStarted'));
      } catch (err) {
        toast.error(err.message || t('downloadFailed'));
      } finally {
        setExportingKey(null);
      }
    },
    [dealerId, warehouseId, resolvePath, resolveExportParams, t],
  );

  return {
    categories,
    dealers,
    warehouses,
    dealersLoading,
    warehousesLoading,
    dealerId,
    setDealerId,
    warehouseId,
    setWarehouseId,
    exportingKey,
    handleExport,
  };
}
