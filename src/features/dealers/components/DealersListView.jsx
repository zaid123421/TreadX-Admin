import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Search, Eye, Building2, Edit, ChevronLeft, ChevronRight, Mail, Phone } from 'lucide-react';
import { formatPhoneNumber } from '../../leads/utils/leadUtils';
import { DEALER_STATUS_BADGE_STYLES } from '../utils/dealerUtils';
import ErrorPage from '@/app/components/ErrorPage';
import SubscriptionEditModal from '../../subscriptions/components/SubscriptionEditModal';

export function DealersListView({
  dealers,
  loading,
  isInitialLoading, // 💡 استبدال المتغير القديم بمتغير الـ Initial Loading
  error,
  searchQuery,
  setSearchQuery,
  statusFilter,
  currentPage,
  setCurrentPage,
  totalPages,
  loadDealers,
  handleStatusFilterChange,
  handleEditSubscription,
  subscriptionPlans,
}) {
  const [editSubscription, setEditSubscription] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = (subscription) => {
    setEditSubscription(subscription);
    setIsEditing(true);
  };

  const handleEditSubmit = async (data) => {
    await handleEditSubscription(editSubscription.id, data);
    setIsEditing(false);
    setEditSubscription(null);
  };

  if (error) {
    return (
      <ErrorPage
        error={error}
        onRetry={loadDealers}
        onGoHome={() => (window.location.href = '/')}
        title="Failed to Load Dealers"
        showDetails={import.meta.env.DEV}
      />
    );
  }

  // 💡 الـ Loader الكبير يعمل الآن فقط عند فتح الصفحة لأول مرة وليس عند البحث
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-muted/10 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground font-medium">Loading dealers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Dealer Management</h1>
          <p className="text-sm text-muted-foreground">Manage and track your dealer relationships, contacts, and active subscriptions.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-5">
        
        {/* شريط البحث المطور الذكي */}
        <Card className="border-none shadow-xs bg-card">
          <CardContent className="p-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search dealers by name or contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 h-10 bg-muted/30 focus-visible:bg-background border-muted/60" // تم تعديل الـ pr-10 ليناسب لودر البحث
              />
              {/* 💡 لودر صغير وناعم يدور داخل حقل البحث أثناء جلب البيانات بالخلفية */}
              {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* كرت عرض بيانات الجدول */}
        <Card className="border-none shadow-xs bg-card overflow-hidden">
          <CardHeader className="pb-4 border-b bg-card">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <span>Dealers</span>
              <Badge variant="secondary" className="font-mono px-2 py-0.5 rounded-md text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                {dealers.length} Total
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {dealers.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60 mx-auto mb-4 border border-dashed">
                  <Building2 className="h-6 w-6 text-muted-foreground/80" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">No dealers found</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  {searchQuery ? 'Try adjusting your search query or clear the filter to start over.' : 'No dealers are registered in the system yet.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <th className="py-3.5 px-6 font-semibold">Dealer Info</th>
                      <th className="py-3.5 px-6 font-semibold">Contact Details</th>
                      <th className="py-3.5 px-6 font-semibold">Status</th>
                      <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  {/* 💡 تفعيل الشفافية الخفيفة للجدول بأكمله ليعلم المستخدم أن البيانات يتم تحديثها بالخلفية */}
                  <tbody className={`divide-y divide-border/60 transition-opacity duration-200 ${loading ? 'opacity-60' : 'opacity-100'}`}>
                    {dealers.map((dealer) => (
                      <tr key={dealer.id} className="group hover:bg-muted/30 transition-colors">
                        
                        <td className="py-4 px-6">
                          <div className="space-y-0.5">
                            <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                              {dealer.businessName}
                            </div>
                            <div className="text-xs text-muted-foreground font-medium">
                              {dealer.legalName || '-'}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-1 text-xs font-medium">
                            <span className="flex items-center gap-1.5 text-foreground/80">
                              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                              {dealer.email}
                            </span>
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                              {formatPhoneNumber(dealer.phoneNumber)}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <Badge 
                            style={{
                              ...DEALER_STATUS_BADGE_STYLES[dealer.status],
                              fontWeight: 600,
                              fontSize: '11px',
                              borderRadius: '6px',
                              padding: '2px 8px'
                            }}
                          >
                            {dealer.status}
                          </Badge>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link to={`/dealers/${dealer.id}`}>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted" 
                                title="View Profile"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            
                            {dealer.activeSubscriptionId && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                title="Edit Subscription"
                                onClick={() => handleEditClick({
                                  id: dealer.activeSubscriptionId,
                                  dealerId: dealer.id,
                                  planId: dealer.subscriptionPlanId,
                                  startDate: dealer.subscriptionStartDate,
                                  endDate: dealer.subscriptionEndDate,
                                  amountPaid: dealer.subscriptionAmountPaid,
                                  autoRenew: dealer.subscriptionAutoRenew,
                                  billingWeekday: dealer.subscriptionBillingWeekday,
                                })}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* شريط ترقين الصفحات (Pagination) */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border border-border bg-card rounded-xl p-4 shadow-2xs">
            <div className="text-xs text-muted-foreground font-medium">
              Showing page <span className="font-semibold text-foreground">{currentPage + 1}</span> of <span className="font-semibold text-foreground">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 h-8 font-medium text-xs rounded-lg"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 h-8 font-medium text-xs rounded-lg"
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

      </div>

      {/* الـ Modal المدمج الخاص بك مع إصلاح القوس المفقود بالـ props */}
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