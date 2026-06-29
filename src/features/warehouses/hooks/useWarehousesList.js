import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { warehousesService } from '../services/warehousesApiService';
import {
  computeWarehouseStats,
  getNextWarehouseStatus,
  WAREHOUSE_STATUS,
} from '../utils/warehouseUtils';

export function useWarehousesList() {
  const location = useLocation();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionId, setActionId] = useState(null);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [deletingWarehouse, setDeletingWarehouse] = useState(null);

  const flash = location.state;

  const loadWarehouses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await warehousesService.getWarehouses();
      setWarehouses(list);
    } catch (err) {
      setError(err.message || 'Failed to load warehouses');
      setWarehouses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWarehouses();
  }, [loadWarehouses]);

  const stats = useMemo(() => computeWarehouseStats(warehouses), [warehouses]);

  const handleToggleStatus = async (warehouse) => {
    if (!warehouse?.id) return;
    const nextStatus = getNextWarehouseStatus(warehouse.status);
    if (
      warehouse.status !== WAREHOUSE_STATUS.ACTIVE &&
      warehouse.status !== WAREHOUSE_STATUS.INACTIVE
    ) {
      toast.error('Only ACTIVE or INACTIVE warehouses can be toggled');
      return;
    }

    setActionId(warehouse.id);
    try {
      await warehousesService.updateWarehouseStatus(warehouse.id, nextStatus);
      toast.success(
        `"${warehouse.warehouseName}" is now ${nextStatus === WAREHOUSE_STATUS.ACTIVE ? 'active' : 'inactive'}`,
      );
      await loadWarehouses();
    } catch (err) {
      toast.error(err.message || 'Failed to update warehouse status');
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingWarehouse?.id) return;
    setActionId(deletingWarehouse.id);
    try {
      await warehousesService.deleteWarehouse(deletingWarehouse.id);
      toast.success(`"${deletingWarehouse.warehouseName}" deleted successfully`);
      setDeletingWarehouse(null);
      await loadWarehouses();
    } catch (err) {
      toast.error(err.message || 'Failed to delete warehouse');
    } finally {
      setActionId(null);
    }
  };

  const handleEditSuccess = async () => {
    setEditingWarehouse(null);
    await loadWarehouses();
  };

  return {
    warehouses,
    loading,
    error,
    stats,
    flash,
    actionId,
    editingWarehouse,
    setEditingWarehouse,
    deletingWarehouse,
    setDeletingWarehouse,
    loadWarehouses,
    handleToggleStatus,
    handleDelete,
    handleEditSuccess,
  };
}
