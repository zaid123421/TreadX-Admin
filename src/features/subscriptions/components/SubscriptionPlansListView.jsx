import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui/alert-dialog';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/shared/ui/pagination';
import { Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import SubscriptionPlanForm from './SubscriptionPlanForm';

export function SubscriptionPlansListView(props) {
  const {
    plansData,
    isLoading,
    error,
    refetch,
    currentPage,
    handlePageChange,
    isCreateModalOpen,
    onModalOpenChange,
    editingPlan,
    handleDeletePlan,
    handleEditPlan,
    closeModal,
    onFormSuccess,
    formatBillingCycle,
    formatPrice,
    canManagePlans,
  } = props;

  if (error) {
    console.error('Query error:', error);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading subscription plans</p>
          <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground">Subscription Plans</h1>
          <p className="text-sm text-muted-foreground">
            {canManagePlans
              ? 'Manage subscription plans for dealers'
              : 'View active subscription plans (read-only).'}
          </p>
        </div>

        {canManagePlans && (
          <Dialog open={isCreateModalOpen} onOpenChange={onModalOpenChange}>
            <DialogTrigger asChild>
              <Button className="h-9">
                <Plus className="w-4 h-4 mr-2" />
                Add Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPlan ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}</DialogTitle>
              </DialogHeader>
              <SubscriptionPlanForm
                plan={editingPlan}
                onSuccess={onFormSuccess}
                onCancel={closeModal}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="border-none shadow-xs bg-card">
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Billing Cycle</TableHead>
                    <TableHead>Max Storage</TableHead>
                    <TableHead>Max Users</TableHead>
                    <TableHead>Status</TableHead>
                    {canManagePlans && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plansData?.content?.map((plan) => (
                    <TableRow
                      key={plan.id}
                      className="align-middle hover:bg-muted/40 transition-colors"
                    >
                      <TableCell className="font-semibold text-foreground">
                        {plan.planName}
                      </TableCell>

                      <TableCell className="text-muted-foreground max-w-xs truncate">
                        {plan.description}
                      </TableCell>

                      <TableCell className="text-primary font-mono font-bold">
                        {formatPrice(plan.price)}
                      </TableCell>

                      <TableCell className="text-muted-foreground font-medium">
                        {formatBillingCycle(plan.billingCycle)}
                      </TableCell>

                      <TableCell className="text-foreground font-mono font-semibold">
                        {plan.maxTireStorage.toLocaleString()}
                      </TableCell>

                      <TableCell className="text-foreground font-mono font-semibold">
                        {plan.maxUsers}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={plan.isActive ? 'outline' : 'secondary'}
                          className={plan.isActive ? 'border-green-500 text-green-700 bg-green-50' : ''}
                        >
                          {plan.isActive ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </Badge>
                      </TableCell>

                      {canManagePlans && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8"
                              onClick={() => handleEditPlan(plan)}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="h-8 bg-transparent border border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Subscription Plan</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete &quot;{plan.planName}&quot;? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeletePlan(plan.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {plansData && plansData.totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 0}
                        />
                      </PaginationItem>

                      {Array.from({ length: Math.min(5, plansData.totalPages) }, (_, i) => {
                        const page = i;
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink onClick={() => handlePageChange(page)} isActive={currentPage === page}>
                              {page + 1}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}

                      {plansData.totalPages > 5 && (
                        <>
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationLink onClick={() => handlePageChange(plansData.totalPages - 1)}>
                              {plansData.totalPages}
                            </PaginationLink>
                          </PaginationItem>
                        </>
                      )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage >= plansData.totalPages - 1}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
