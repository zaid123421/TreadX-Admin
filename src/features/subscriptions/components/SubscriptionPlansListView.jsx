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
          <p className="text-red-600 mb-4">Error loading subscription plans</p>
          <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1️⃣ فصل العنوان تماماً خارج مستطيل الجدول ليطابق واجهة الاشتراكات */}
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
              <Button className="bg-primary hover:bg-primary/90 text-secondary-on-surface font-semibold h-9">
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

      {/* 2️⃣ مستطيل الباقات مع الحفاظ على الهيكل والألوان كما تريدين */}
      <Card className="bg-surface-container">
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <Table className="text-white">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-white">Plan Name</TableHead>
                    <TableHead className="text-white">Description</TableHead>
                    <TableHead className="text-white">Price</TableHead>
                    <TableHead className="text-white">Billing Cycle</TableHead>
                    <TableHead className="text-white">Max Storage</TableHead>
                    <TableHead className="text-white">Max Users</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                    {canManagePlans && <TableHead className="text-white text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
  {plansData?.content?.map((plan) => (
    <TableRow 
      key={plan.id}
      className="
        align-middle 
        border-b border-border/40 
        hover:bg-primary/10 
        hover:outline hover:outline-1 hover:outline-primary/40 hover:-outline-offset-1
        transition-all duration-150
      "
    >
      {/* 1️⃣ اسم الباقة: نبرزه بوزن عريض ولون أبيض ناصع لأنه المعرّف الأساسي */}
      <TableCell className="text-white font-bold text-text-body-lg">
        {plan.planName}
      </TableCell>
      
      {/* 2️⃣ الوصف: نجعله بلون رمادي خفيف وباهت لأنه نص طويل وثانوي */}
      <TableCell className="text-muted-foreground/80 max-w-xs truncate font-normal">
        {plan.description}
      </TableCell>
      
      {/* 3️⃣ السعر: نستخدم لون الهوية البرتقالي المشرق مع خط مونو عريض ليخطف العين فوراً */}
      <TableCell className="text-color-primary-main-dark font-mono font-bold text-text-body-lg">
        {formatPrice(plan.price)}
      </TableCell>
      
      {/* 4️⃣ دورة الفوترة: نصوص فرعية ناعمة بالرمادي */}
      <TableCell className="text-muted-foreground font-medium">
        {formatBillingCycle(plan.billingCycle)}
      </TableCell>
      
      {/* 5️⃣ المساحة التخزينية القصوى: نبرز الرقم بلون الترتياري (الأزرق اللوجستي) وبخط مونو مخصص للأرقام */}
      <TableCell className="text-color-tertiary-main-dark font-mono font-semibold">
        {plan.maxTireStorage.toLocaleString()}
      </TableCell>
      
      {/* 6️⃣ الحد الأقصى للمستخدمين: لون مغاير هادئ أو نكتفي بالأبيض المتوسط */}
      <TableCell className="text-secondary-on-surface/90 font-mono font-semibold">
        {plan.maxUsers}
      </TableCell>
      
      {/* بادج الحالة كما هو */}
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
              className="h-8 border-border hover:border-primary/40 hover:text-primary transition-colors text-white"
              onClick={() => handleEditPlan(plan)}
            >
              <Edit className="w-3.5 h-3.5" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="h-8 bg-transparent border border-destructive/30 text-destructive hover:bg-destructive hover:text-white transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Subscription Plan</AlertDialogTitle>
                  <AlertDialogDescription className="text-white">
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

              {/* الـ Pagination */}
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