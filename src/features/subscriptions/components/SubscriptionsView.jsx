import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/ui/table';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/shared/ui/alert-dialog';
import { Input } from '@/shared/ui/input';
import { format } from 'date-fns';
import { XCircle, Trash2, Edit } from 'lucide-react';
import SubscriptionEditModal from './SubscriptionEditModal';

export function SubscriptionsView({
  items,
  loading,
  isInitialLoading,
  error,
  handleCancel,
  handleDelete,
  handleEdit,
  subscriptionPlans,
}) {
  const [openId, setOpenId] = useState(null);
  const [reason, setReason] = useState('');
  const [deleteOpenId, setDeleteOpenId] = useState(null);
  const [editSubscription, setEditSubscription] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = (subscription) => {
    setEditSubscription(subscription);
    setIsEditing(true);
  };

  const handleEditSubmit = async (data) => {
    await handleEdit(editSubscription.id, data);
    setIsEditing(false);
    setEditSubscription(null);
  };

  const handleEditClose = () => {
    setIsEditing(false);
    setEditSubscription(null);
  };

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Subscriptions</h1>
          <p className="text-sm text-muted-foreground">Manage pending and active subscriptions</p>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
            Updating...
          </div>
        )}
      </div>

      <Card className="border-none shadow-xs bg-card">
        <CardContent className="pt-6">
          {error && items.length === 0 && (
            <p className="text-sm text-destructive mb-4">{error}</p>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dealer</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Billing Day</TableHead>
                <TableHead>Cancellation Reason</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody
              className={
                loading
                  ? 'opacity-60 transition-opacity duration-200'
                  : 'transition-opacity duration-200'
              }
            >
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                    No subscriptions found.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((s) => (
                  <TableRow
                    key={s.id}
                    className="align-middle hover:bg-muted/40 transition-colors"
                  >
                    <TableCell className="font-medium text-foreground">{s.dealerName || '-'}</TableCell>
                    <TableCell className="text-foreground">{s.planName || '-'}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          s.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : s.status === 'CANCELLED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {s.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-foreground font-mono">
                      {s.amountPaid != null ? s.amountPaid.toFixed(2) : '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{s.billingWeekday || '-'}</TableCell>
                    <TableCell className="text-muted-foreground">{s.cancellationReason ? s.cancellationReason : <span className="opacity-50">—</span>}</TableCell>
                    <TableCell className="text-foreground">
                      {s.startDate
                        ? `${format(new Date(s.startDate), 'yyyy-MM-dd')} → ${format(new Date(s.endDate), 'yyyy-MM-dd')}`
                        : '-'}
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8"
                          onClick={() => handleEditClick(s)}
                          disabled={loading}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <AlertDialog
                          open={openId === s.id}
                          onOpenChange={(open) => {
                            if (!open) {
                              setReason('');
                              setOpenId(null);
                            }
                          }}
                        >
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8"
                              onClick={() => setOpenId(s.id)}
                              disabled={loading}
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              Cancel
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                              <AlertDialogDescription>
                                Provide a reason for cancelling this subscription (optional).
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="pt-2">
                              <Input
                                placeholder="Reason (optional)"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full"
                              />
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Close</AlertDialogCancel>
                              <AlertDialogAction asChild>
                                <Button
                                  variant="destructive"
                                  onClick={() => {
                                    handleCancel(s.id, reason);
                                    setOpenId(null);
                                    setReason('');
                                  }}
                                >
                                  Confirm
                                </Button>
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog
                          open={deleteOpenId === s.id}
                          onOpenChange={(open) => {
                            if (!open) setDeleteOpenId(null);
                          }}
                        >
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8 bg-transparent border border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                              onClick={() => setDeleteOpenId(s.id)}
                              disabled={loading}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Subscription</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this subscription? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction asChild>
                                <Button
                                  variant="destructive"
                                  onClick={() => {
                                    handleDelete(s.id);
                                    setDeleteOpenId(null);
                                  }}
                                >
                                  Delete
                                </Button>
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {isEditing && editSubscription && (
        <SubscriptionEditModal
          subscription={editSubscription}
          subscriptionPlans={subscriptionPlans}
          onClose={handleEditClose}
          onSave={handleEditSubmit}
          isSubmitting={false}
        />
      )}
    </div>
  );
}
