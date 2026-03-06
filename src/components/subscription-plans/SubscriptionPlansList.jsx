import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../ui/pagination';
import { Search, Plus, Edit, Trash2, Eye, CheckCircle, XCircle } from 'lucide-react';
import { subscriptionPlansService } from '../../services/subscriptionPlansApiService';
import { BillingCycle } from '../../types/api';
import { toast } from 'sonner';
import SubscriptionPlanForm from './SubscriptionPlanForm';

const SubscriptionPlansList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [deletingPlan, setDeletingPlan] = useState(null);

  // Fetch subscription plans
  const {
    data: plansData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['subscription-plans', currentPage, pageSize, searchTerm],
    queryFn: () => subscriptionPlansService.getActiveSubscriptionPlans({
      page: currentPage,
      size: pageSize,
      search: searchTerm
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

    // Handle search
    const handleSearch = (value) => {
      setSearchTerm(value);
      setCurrentPage(0);
    };

    // Handle page change
    const handlePageChange = (page) => {
      setCurrentPage(page);
    };

    // Handle delete plan
    const handleDeletePlan = async (planId) => {
      try {
        await subscriptionPlansService.deleteSubscriptionPlan(planId);
        toast.success('Subscription plan deleted successfully');
        refetch();
        setDeletingPlan(null);
      } catch (error) {
        toast.error(error.message || 'Failed to delete subscription plan');
      }
    };

    // Handle edit plan
    const handleEditPlan = (plan) => {
      setEditingPlan(plan);
      setIsCreateModalOpen(true);
    };

    // Format billing cycle
    const formatBillingCycle = (cycle) => {
      switch (cycle) {
        case BillingCycle.MONTHLY:
          return 'Monthly';
        case BillingCycle.QUARTERLY:
          return 'Quarterly';
        case BillingCycle.YEARLY:
          return 'Yearly';
        default:
          return cycle;
      }
    };

    // Format price
    const formatPrice = (price) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(price);
    };

  if (error) {
    console.error('Query error:', error);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading subscription plans</p>
          <p className="text-sm text-gray-600 mb-4">{error.message}</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Subscription Plans</h1>
          <p className="text-muted-foreground">Manage subscription plans for vendors</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
              </DialogTitle>
            </DialogHeader>
            <SubscriptionPlanForm
              plan={editingPlan}
              onSuccess={() => {
                setIsCreateModalOpen(false);
                setEditingPlan(null);
                refetch();
              }}
              onCancel={() => {
                setIsCreateModalOpen(false);
                setEditingPlan(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search plans..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Plans</CardTitle>
        </CardHeader>
        <CardContent>
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plansData?.content?.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">{plan.planName}</TableCell>
                      <TableCell className="max-w-xs truncate">{plan.description}</TableCell>
                      <TableCell>{formatPrice(plan.price)}</TableCell>
                      <TableCell>{formatBillingCycle(plan.billingCycle)}</TableCell>
                      <TableCell>{plan.maxTireStorage.toLocaleString()}</TableCell>
                      <TableCell>{plan.maxUsers}</TableCell>
                                             <TableCell>
                         <Badge variant={plan.isActive ? "outline" : "secondary"} className={plan.isActive ? "border-green-500 text-green-700 bg-green-50" : ""}>
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
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPlan(plan)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeletingPlan(plan)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Subscription Plan</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{plan.planName}"? This action cannot be undone.
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
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
                            <PaginationLink
                              onClick={() => handlePageChange(page)}
                              isActive={currentPage === page}
                            >
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
                            <PaginationLink
                              onClick={() => handlePageChange(plansData.totalPages - 1)}
                            >
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
};

export default SubscriptionPlansList; 