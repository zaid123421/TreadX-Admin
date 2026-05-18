import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog"; // تأكد من صحة مسار المكون في مشروعك
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Phone,
  Building2,
  FileText,
  MessageSquare,
  RefreshCw,
  Handshake,
  Users,
  Clock,
  CheckCircle,
  PhoneCall,
} from "lucide-react";
import { LeadSource, LeadStatus } from "@/shared/types/enums";
import {
  getBusinessInitials,
  getStatusColor,
  getStatusLabel,
  formatPhoneNumber,
} from "../utils/leadUtils";

/**
 * Presentational leads table + filters (data and actions from useLeadsList).
 */
export function LeadsListView({
  navigate,
  user,
  loading,
  isInitialLoading,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  sourceFilter,
  setSourceFilter,
  sortBy,
  sortDirection,
  handleSortPresetChange,
  message,
  canCreateLeads,
  canEditLead,
  canDeleteLead,
  loadLeads,
  handleDelete,
  handleTakeLead,
  takingLead,
  stats,
  filteredLeads,
  currentPage,
  setCurrentPage,
  pageSize,
  totalPages,
  totalElements,
}) {
  // حالة مخصصة للاحتفاظ بالـ Lead المطلوب حذفه لفتح المودال وعرض تفاصيله
  const [leadToDelete, setLeadToDelete] = React.useState(null);

  // 💡 الآن الشاشة الكاملة لن تختفي أثناء البحث، ستختفي فقط عند فتح الصفحة لأول مرة
  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading leads...</p>
        </div>
      </div>
    );
  }

  // دالة التأكيد النهائي للحذف المربوطة بالمودال المخصص
  const confirmDelete = async () => {
    if (leadToDelete) {
      await handleDelete(leadToDelete.id);
      setLeadToDelete(null); // إعادة تعيين الحالة بعد الحذف
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Leads Management
          </h1>
          <p className="text-muted-foreground">
            Track and manage your tire business leads
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadLeads} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>

          {canCreateLeads && (
            <Button onClick={() => navigate("/leads/add")}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Lead
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="flex flex-col items-center justify-center bg-muted/30 border border-border rounded-xl px-6 py-4 min-w-[120px] min-h-[90px]">
          <Users className="h-6 w-6 text-primary mb-1" />
          <div className="text-xs text-muted-foreground">Total Leads</div>
          <div className="font-bold text-xl text-foreground">{stats.total}</div>
        </div>
        <div className="flex flex-col items-center justify-center bg-muted/30 border border-border rounded-xl px-6 py-4 min-w-[120px] min-h-[90px]">
          <Clock className="h-6 w-6 text-warning mb-1" />
          <div className="text-xs text-muted-foreground">Pending</div>
          <div className="font-bold text-xl text-foreground">
            {stats.pending}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center bg-muted/30 border border-border rounded-xl px-6 py-4 min-w-[120px] min-h-[90px]">
          <CheckCircle className="h-6 w-6 text-success mb-1" />
          <div className="text-xs text-muted-foreground">Approved</div>
          <div className="font-bold text-xl text-foreground">
            {stats.approved}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center bg-muted/30 border border-border rounded-xl px-6 py-4 min-w-[120px] min-h-[90px]">
          <PhoneCall className="h-6 w-6 text-info mb-1" />
          <div className="text-xs text-muted-foreground">Contacted</div>
          <div className="font-bold text-xl text-foreground">
            {stats.contacted}
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search leads by business name, phone, or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10" // أضفنا padding جهة اليمين للمؤشر الجديد
                />
                {/* 💡 إذا كان يعمل بالخلفية يظهر لودر صغير ناعم في زاوية الإدخال */}
                {loading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem
                  value={LeadStatus.PENDING}
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      backgroundColor: "var(--color-primary-main-dark)",
                      color: "var(--color-primary-on-container)",
                      borderRadius: "var(--radius-full)",
                      padding: "var(--spacing-1) var(--spacing-3)",
                      fontWeight: "var(--font-weight-medium)",
                      fontSize: "var(--font-size-label-md)",
                      display: "inline-block",
                    }}
                  >
                    Pending
                  </span>
                </SelectItem>
                <SelectItem
                  value={LeadStatus.APPROVED}
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      backgroundColor: "var(--color-success-main-light)",
                      color: "var(--color-secondary-on-surface)",
                      borderRadius: "var(--radius-full)",
                      padding: "var(--spacing-1) var(--spacing-3)",
                      fontWeight: "var(--font-weight-medium)",
                      fontSize: "var(--font-size-label-md)",
                      display: "inline-block",
                    }}
                  >
                    Approved
                  </span>
                </SelectItem>
                <SelectItem
                  value={LeadStatus.DENIED}
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      backgroundColor: "var(--color-error-main)",
                      color: "var(--color-secondary-on-surface)",
                      borderRadius: "var(--radius-full)",
                      padding: "var(--spacing-1) var(--spacing-3)",
                      fontWeight: "var(--font-weight-medium)",
                      fontSize: "var(--font-size-label-md)",
                      display: "inline-block",
                    }}
                  >
                    Denied
                  </span>
                </SelectItem>
                <SelectItem
                  value={LeadStatus.CONTACTED}
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      backgroundColor: "var(--color-info-main)",
                      color: "var(--color-secondary-on-surface)",
                      borderRadius: "var(--radius-full)",
                      padding: "var(--spacing-1) var(--spacing-3)",
                      fontWeight: "var(--font-weight-medium)",
                      fontSize: "var(--font-size-label-md)",
                      display: "inline-block",
                    }}
                  >
                    Contacted
                  </span>
                </SelectItem>
                <SelectItem
                  value={LeadStatus.PENDING_CONVERSION}
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      backgroundColor: "var(--color-warning-main-light)",
                      color: "var(--color-secondary-on-surface)",
                      borderRadius: "var(--radius-full)",
                      padding: "var(--spacing-1) var(--spacing-3)",
                      fontWeight: "var(--font-weight-medium)",
                      fontSize: "var(--font-size-label-md)",
                      display: "inline-block",
                    }}
                  >
                    Pending Conversion
                  </span>
                </SelectItem>
                <SelectItem
                  value={LeadStatus.UNQUALIFIED}
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      backgroundColor: "var(--color-surface-light-container)",
                      color: "var(--color-secondary-main)",
                      borderRadius: "var(--radius-full)",
                      padding: "var(--spacing-1) var(--spacing-3)",
                      fontWeight: "var(--font-weight-medium)",
                      fontSize: "var(--font-size-label-md)",
                      display: "inline-block",
                    }}
                  >
                    Unqualified
                  </span>
                </SelectItem>
                <SelectItem
                  value={LeadStatus.DONE}
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      backgroundColor: "var(--color-secondary-main)",
                      color: "var(--color-secondary-on-surface)",
                      borderRadius: "var(--radius-full)",
                      padding: "var(--spacing-1) var(--spacing-3)",
                      fontWeight: "var(--font-weight-medium)",
                      fontSize: "var(--font-size-label-md)",
                      display: "inline-block",
                    }}
                  >
                    Done
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value={LeadSource.GOVERNMENT}>
                  Government
                </SelectItem>
                <SelectItem value={LeadSource.ADS}>Advertising</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={`${sortBy}-${sortDirection}`}
              onValueChange={handleSortPresetChange}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">Newest First</SelectItem>
                <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                <SelectItem value="businessName-asc">Business A-Z</SelectItem>
                <SelectItem value="businessName-desc">Business Z-A</SelectItem>
                <SelectItem value="updatedAt-desc">Recently Updated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leads ({filteredLeads.length})</CardTitle>
          <CardDescription>
            Manage your tire business leads and track their progress through the
            sales pipeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className={loading ? "opacity-60 transition-opacity duration-200" : "transition-opacity duration-200"}>
  {filteredLeads.map((lead) => (
                <TableRow
                  key={lead.id}
                  className="hover:bg-muted/40 cursor-pointer"
                  onClick={() => navigate(`/leads/${lead.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/15 text-primary">
                          {getBusinessInitials(lead.businessName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-foreground">
                          {lead.businessName}
                        </div>
                        {lead.uploadedFile && (
                          <div className="text-sm text-muted-foreground flex items-center">
                            <FileText className="h-3 w-3 mr-1" />
                            Has document
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm text-foreground flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {formatPhoneNumber(lead.phoneNumber)}
                      </div>
                      {lead.contactName && (
                        <div className="text-sm text-muted-foreground flex items-center">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          {lead.contactName}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{lead.source}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge style={getStatusColor(lead.status)}>
                      {getStatusLabel(lead.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {lead.createdAt && (
                      <div className="text-sm font-medium text-foreground">
                        {(() => {
                          try {
                            const date = new Date(lead.createdAt);
                            return isNaN(date.getTime())
                              ? "N/A"
                              : date.toLocaleDateString("en-CA");
                          } catch (e) {
                            return "N/A";
                          }
                        })()}
                      </div>
                    )}
                    {lead.updatedAt && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Updated:{" "}
                        {(() => {
                          try {
                            const date = new Date(lead.updatedAt);
                            return isNaN(date.getTime())
                              ? "N/A"
                              : date.toLocaleDateString("en-CA");
                          } catch (e) {
                            return "N/A";
                          }
                        })()}
                      </div>
                    )}
                    {lead.addedByName && (
                      <div className="text-xs text-muted-foreground/80 mt-1 flex items-center gap-1">
                        <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/40"></span>
                        <span>By {lead.addedByName}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {user?.roleName === "SALES_AGENT" &&
                        lead.addedByManager &&
                        !lead.assignedTo && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={(e) => handleTakeLead(lead.id, e)}
                            disabled={takingLead === lead.id}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {takingLead === lead.id ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                Taking...
                              </>
                            ) : (
                              <>
                                <Handshake className="h-4 w-4 mr-1" />
                                Take
                              </>
                            )}
                          </Button>
                        )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/leads/${lead.id}`);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {canEditLead(lead) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/leads/${lead.id}/edit`);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}

                      {canDeleteLead(lead) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLeadToDelete(lead); // نقوم بتخزين الـ Lead بالكامل هنا بدلاً من الحذف الفوري
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredLeads.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No leads found
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" || sourceFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by adding your first tire business lead"}
              </p>
              {canCreateLeads && (
                <Button onClick={() => navigate("/leads/add")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Lead
                </Button>
              )}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {currentPage * pageSize + 1} to{" "}
                {Math.min((currentPage + 1) * pageSize, totalElements)} of{" "}
                {totalElements} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
                  }
                  disabled={currentPage >= totalPages - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* الـ UI الجديد والمخصص لتأكيد الحذف التدميري */}
      <AlertDialog
        open={!!leadToDelete}
        onOpenChange={(open) => !open && setLeadToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              lead
              <span className="font-semibold text-foreground">
                {" "}
                "{leadToDelete?.businessName}"{" "}
              </span>
              and completely remove their record from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Lead
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
