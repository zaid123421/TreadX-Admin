import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/dialog';
import { useEditWarehouse } from '../hooks/useEditWarehouse';
import { EditWarehouseFormView } from './EditWarehouseFormView';

export function EditWarehouseDialog({ warehouse, open, onOpenChange, onSuccess }) {
  const handleClose = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-border bg-card">
        {warehouse && (
          <EditWarehouseDialogBody
            key={warehouse.id}
            warehouse={warehouse}
            onSuccess={onSuccess}
            onClose={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function EditWarehouseDialogBody({ warehouse, onSuccess, onClose }) {
  const form = useEditWarehouse({
    warehouse,
    onSuccess,
    onClose,
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Warehouse</DialogTitle>
        <DialogDescription>
          Update {warehouse.warehouseName} ({warehouse.warehouseCode})
        </DialogDescription>
      </DialogHeader>
      <EditWarehouseFormView {...form} />
    </>
  );
}
