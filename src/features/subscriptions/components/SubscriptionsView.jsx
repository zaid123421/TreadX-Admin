import React from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

export function SubscriptionsView({
  items,
  loading,
  error,
  dealerId,
  setDealerId,
  planId,
  setPlanId,
  amountPaid,
  setAmountPaid,
  subscriptionId,
  setSubscriptionId,
  cancelReason,
  setCancelReason,
  handleCreate,
  handleCancel,
  handleDelete,
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Subscriptions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input placeholder="Dealer ID" value={dealerId} onChange={(e) => setDealerId(e.target.value)} />
            <Input placeholder="Plan ID" value={planId} onChange={(e) => setPlanId(e.target.value)} />
            <Input placeholder="Amount Paid" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} />
          </div>
          <Button onClick={handleCreate}>Create Subscription</Button>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input
              placeholder="Subscription ID"
              value={subscriptionId}
              onChange={(e) => setSubscriptionId(e.target.value)}
            />
            <Input
              placeholder="Cancel reason (optional)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            <Button variant="outline" onClick={handleCancel}>
              Cancel Subscription
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-2">
              {items.map((s) => (
                <div key={s.id} className="flex items-center justify-between border rounded p-2">
                  <div className="text-sm">
                    #{s.id} - Dealer: {s.dealerName || s.dealerId} - Plan: {s.planName || s.planId} - Status:{' '}
                    {s.status}
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(s.id)}>
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
