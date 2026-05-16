import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
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
  error,
  handleCancel,
  handleDelete,
  handleEdit,
  subscriptionPlans,
}) {
  const [openId, setOpenId] = useState(null);
  const [reason, setReason] = useState('');
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

  return (
    <div className="space-y-6">
      
      {/* 1️⃣ المحافظة على فصل العنوان تماماً خارج المستطيل */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Subscriptions</h1>
        <p className="text-sm text-muted-foreground">Manage pending and active subscriptions</p>
      </div>

      {/* 2️⃣ إعادة باقي مستطيل الجدول كما كان في كودكِ الأصلي */}
      <Card className="bg-surface-container">
        <CardContent className="pt-6"> {/* أضفنا Padding علوي بسيط لتعويض غياب الـ Header الأصلي */}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {loading ? (
            <p className="text-white">Loading...</p>
          ) : (
            <Table className="text-white">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white">Dealer</TableHead>
                  <TableHead className="text-white">Plan</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Amount</TableHead>
                  <TableHead className="text-white">Billing Day</TableHead>
                  <TableHead className="text-white">Cancellation Reason</TableHead>
                  <TableHead className="text-white">Period</TableHead>
                  <TableHead className="text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((s) => (
                  <TableRow key={s.id} className="
    align-middle 
    border-b border-border/40 
    
    /* ⚡ التعديل لجعل البوردر يحيط بالسطر كاملاً عند الـ Hover ⚡ */
    hover:bg-primary/10 
    hover:outline hover:outline-1 hover:outline-primary/40 hover:-outline-offset-1
    
    transition-all duration-150
    cursor-pointer
  ">
                    <TableCell className="text-white">{s.dealerName || '-'}</TableCell>
                    <TableCell className="text-white">{s.planName || '-'}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          s.status === 'ACTIVE' ? 'bg-emerald-600 text-white' : s.status === 'CANCELLED' ? 'bg-red-600 text-white' : 'bg-yellow-500 text-white'
                        }`}
                      >
                        {s.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-white">{s.amountPaid != null ? s.amountPaid.toFixed(2) : '-'}</TableCell>
                    <TableCell className="text-white">{s.billingWeekday || '-'}</TableCell>
                    <TableCell className="text-white">{s.cancellationReason ?? ''}</TableCell>
                    <TableCell className="text-white">{s.startDate ? `${format(new Date(s.startDate), 'yyyy-MM-dd')} → ${format(new Date(s.endDate), 'yyyy-MM-dd')}` : '-'}</TableCell>
                    
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 border-border hover:border-primary/40 hover:text-primary transition-colors"
                          onClick={() => handleEditClick(s)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <AlertDialog open={openId === s.id} onOpenChange={(open) => { if (!open) { setReason(''); setOpenId(null); } }}>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 border-border hover:border-warning/40 hover:text-warning transition-colors"
                              onClick={() => setOpenId(s.id)}
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              Cancel
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                              <AlertDialogDescription className="text-white">Provide a reason for cancelling this subscription (optional).</AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="pt-2">
                              <Input placeholder="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full" />
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Close</AlertDialogCancel>
                              <AlertDialogAction asChild>
                                <Button className="bg-destructive hover:bg-destructive/90 text-white" onClick={() => { handleCancel(s.id, reason); setOpenId(null); setReason(''); }}>Confirm</Button>
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-8 bg-transparent border border-destructive/30 text-destructive hover:bg-destructive hover:text-white transition-colors"
                          onClick={() => handleDelete(s.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {isEditing && editSubscription && (
        <SubscriptionEditModal
          subscription={editSubscription}
          subscriptionPlans={subscriptionPlans}
          onClose={() => {
            setIsEditing(false);
            setEditSubscription(null);
          }}
          onSave={handleEditSubmit}
          isSubmitting={false}
        />
      )}
    </div>
  );
}