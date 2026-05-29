import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Warehouse, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Card, CardContent } from '@/shared/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import ErrorPage from '@/app/components/ErrorPage';
import { WarehouseCard } from './WarehouseCard';
import { EditWarehouseDialog } from './EditWarehouseDialog';

function StatCard({ label, value, icon: Icon, iconClassName }) {
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{value}</p>
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconClassName}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export function WarehousesListView({
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
}) {
  const navigate = useNavigate();

  if (error) {
    return (
      <ErrorPage
        error={error}
        onRetry={loadWarehouses}
        onGoHome={() => navigate('/')}
        title="Failed to Load Warehouses"
        showDetails={import.meta.env.DEV}
      />
    );
  }

  return (
    <div className="min-h-full bg-background px-4 py-8 pb-16 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Admin Panel &gt; Warehouses</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Warehouses
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Manage platform warehouses and their assigned admins.
          </p>
        </div>
        <Button
          className="rounded-md bg-primary text-primary-foreground hover:opacity-90"
          onClick={() => navigate('/warehouses/provision')}
        >
          <Plus className="mr-2 h-4 w-4" />
          Provision Warehouse
        </Button>
      </div>

      {flash?.message && (
        <Alert className="mt-6 border-emerald-500/30 bg-emerald-500/10">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <AlertDescription className="text-foreground">{flash.message}</AlertDescription>
        </Alert>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Warehouses"
          value={stats.total}
          icon={Warehouse}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatCard
          label="Active"
          value={stats.active}
          icon={CheckCircle2}
          iconClassName="bg-emerald-500/10 text-emerald-400"
        />
        <StatCard
          label={stats.pendingSetup > 0 ? 'Pending Setup' : 'Inactive'}
          value={stats.pendingSetup > 0 ? stats.pendingSetup : stats.inactive}
          icon={Clock}
          iconClassName="bg-amber-500/10 text-amber-400"
        />
      </div>

      {loading ? (
        <div className="mt-12 flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-sm">Loading warehouses…</p>
        </div>
      ) : warehouses.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Warehouse className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">No warehouses yet</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Provision your first warehouse to begin WMS onboarding.
          </p>
          <Button
            className="mt-6 rounded-md bg-primary text-primary-foreground hover:opacity-90"
            onClick={() => navigate('/warehouses/provision')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Provision Warehouse
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-2">
          {warehouses.map((warehouse) => (
            <WarehouseCard
              key={warehouse.id}
              warehouse={warehouse}
              actionId={actionId}
              onEdit={setEditingWarehouse}
              onDelete={setDeletingWarehouse}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      <EditWarehouseDialog
        warehouse={editingWarehouse}
        open={Boolean(editingWarehouse)}
        onOpenChange={(open) => {
          if (!open) setEditingWarehouse(null);
        }}
        onSuccess={handleEditSuccess}
      />

      <AlertDialog
        open={Boolean(deletingWarehouse)}
        onOpenChange={(open) => {
          if (!open) setDeletingWarehouse(null);
        }}
      >
        <AlertDialogContent className="border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete warehouse?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{' '}
              <strong>{deletingWarehouse?.warehouseName}</strong> ({deletingWarehouse?.warehouseCode}
              ). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionId === deletingWarehouse?.id}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={actionId === deletingWarehouse?.id}
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
            >
              {actionId === deletingWarehouse?.id ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
