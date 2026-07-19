import React, { useState } from "react";
import { Plus, Users, Mail, User, Lock, Briefcase, Trash2, Filter, BadgeCheck, Pencil } from "lucide-react";
import {
  Card,
  CardContent,
} from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Badge } from "@/shared/ui/badge";
import { Switch } from "@/shared/ui/switch";
import { Checkbox } from "@/shared/ui/checkbox";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

function roleLabel(r) {
  if (r == null) return "";
  if (typeof r === "object")
    return r.description
      ? `${r.name} — ${r.description}`
      : (r.name ?? r.id ?? "");
  return String(r);
}

function roleIdOf(r) {
  if (r == null) return "";
  if (typeof r === "object") return r.id != null ? String(r.id) : "";
  return String(r);
}

function getUserRoleName(u) {
  if (u?.role == null) return "—";
  return typeof u.role === "object" ? (u.role?.name ?? "—") : String(u.role);
}

function isUserActive(u) {
  if (u == null) return true;
  if (typeof u.active === "boolean") return u.active;
  if (typeof u.isActive === "boolean") return u.isActive;
  return true;
}

function getAvatarLetters(firstName, lastName) {
  const f = firstName ? firstName.charAt(0).toUpperCase() : "";
  const l = lastName ? lastName.charAt(0).toUpperCase() : "";
  return f || l ? `${f}${l}` : "U";
}

const ROLE_COLOR_STYLES = {
  SYSTEM_ADMIN: "bg-red-500/5 text-red-400 border-red-500/20 hover:border-red-500/40",
  DEALER_ADMIN: "bg-orange-500/5 text-orange-400 border-orange-500/20 hover:border-orange-500/40",
  SALES_MANAGER: "bg-amber-500/5 text-amber-400 border-amber-500/20 hover:border-amber-500/40",
  DEALER_TECHNICIAN: "bg-emerald-500/5 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40",
  WAREHOUSE_MANAGER: "bg-sky-500/5 text-sky-400 border-sky-500/20 hover:border-sky-500/40",
  WAREHOUSE_STAFF: "bg-blue-500/5 text-blue-400 border-blue-500/20 hover:border-blue-500/40",
  SALES_AGENT: "bg-purple-500/5 text-purple-400 border-purple-500/20 hover:border-purple-500/40",
  DEFAULT: "bg-muted/10 text-foreground/90 border-border hover:border-primary/30"
};

function RoleSelectField({ form, setForm, fieldErrors, rolesForSelect, managerAgentOnly }) {
  if (managerAgentOnly) {
    return (
      <p className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm font-semibold text-foreground">
        Sales Agent (Fixed credential role)
      </p>
    );
  }
  return (
    <>
      <Select
        value={form.roleId}
        onValueChange={(v) => setForm((p) => ({ ...p, roleId: v }))}
      >
        <SelectTrigger className={`h-10 bg-muted/30 border-muted/60 ${fieldErrors.roleId ? 'border-destructive focus-visible:ring-destructive' : ''}`}>
          <SelectValue placeholder="Select secure system role" />
        </SelectTrigger>
        <SelectContent>
          {rolesForSelect
            .filter((r) => {
              const name = typeof r === "object" ? r.name : String(r);
              return name !== "DEALER_ADMIN" && name !== "DEALER_TECHNICIAN" && name !== "WAREHOUSE_MANAGER" && name !== "WAREHOUSE_STAFF";
            })
            .map((r) => (
              <SelectItem key={roleIdOf(r)} value={roleIdOf(r)}>
                {roleLabel(r)}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
      {fieldErrors.roleId && (
        <p className="text-xs text-destructive font-medium">{fieldErrors.roleId}</p>
      )}
    </>
  );
}

function PermissionsField({ isSystemAdmin, permissions, form, togglePermission }) {
  if (!isSystemAdmin || permissions.length === 0) return null;
  return (
    <div className="space-y-2 pt-2 border-t border-dashed">
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Additional Permissions Override (optional)</Label>
      <div className="max-h-40 space-y-2.5 overflow-y-auto rounded-xl border bg-muted/20 p-3">
        {permissions.map((perm) => {
          const pid = perm.id;
          const checked = (form.permissionIds || []).includes(pid);
          return (
            <label
              key={pid}
              className="flex cursor-pointer items-start gap-3 text-sm group"
            >
              <Checkbox
                checked={checked}
                onCheckedChange={() => togglePermission(pid)}
                aria-label={perm.name || String(pid)}
                className="mt-0.5"
              />
              <span className="text-foreground text-xs font-medium">
                <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                  {perm.name ?? `Permission ${pid}`}
                </span>
                {perm.description && (
                  <span className="block text-muted-foreground text-[11px] mt-0.5 leading-relaxed font-normal">
                    {perm.description}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export function UsersManagementView({
  filteredUsers,
  rolesForSelect,
  permissions,
  error,
  form,
  setForm,
  fieldErrors,
  createUser,
  updateUser,
  deleteUser,
  canDelete,
  canUpdate,
  canCreate,
  managerAgentOnly,
  isSystemAdmin,
  roleFilter,
  setRoleFilter,
  createOpen,
  openCreateModal,
  setCreateModalOpen,
  editOpen,
  openEditModal,
  setEditModalOpen,
  saving,
  togglePermission,
}) {
  const [userToDelete, setUserToDelete] = useState(null);
  const showActions = canUpdate || canDelete;

  const confirmDelete = async () => {
    if (!userToDelete) return;
    await deleteUser(userToDelete.id);
    setUserToDelete(null);
  };

  const userToDeleteName = userToDelete
    ? [userToDelete.firstName, userToDelete.lastName].filter(Boolean).join(" ") || userToDelete.email
    : "";

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-4 sm:p-6 animate-in fade-in duration-200">
      
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" /> Users Directory
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create accounts, assign secure roles, and manage endpoint system access permissions.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center shrink-0">
          <div className="relative flex items-center">
            <Filter className="absolute left-3 h-4 w-4 text-muted-foreground z-10" />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[220px] pl-9 h-10 bg-card border-muted/70">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                {rolesForSelect.map((r) => {
                  const roleValue = typeof r === "object" && r !== null ? r.name : String(r);
                  return (
                    <SelectItem key={roleIdOf(r)} value={roleValue}>
                      {roleLabel(r)}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {canCreate && (
            <Button
              type="button"
              onClick={openCreateModal}
              className="h-10 font-semibold gap-2 shadow-sm"
            >
              <Plus className="h-4 w-4" /> Add New User
            </Button>
          )}
        </div>
      </div>

      <Card className="border border-border bg-card shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30 text-xs font-semibold uppercase tracking-wider">
                  <TableHead className="py-3.5 px-6 font-semibold">User Details</TableHead>
                  <TableHead className="py-3.5 px-6 font-semibold">Email Address</TableHead>
                  <TableHead className="py-3.5 px-6 font-semibold">Security Role</TableHead>
                  <TableHead className="py-3.5 px-6 font-semibold">Status</TableHead>
                  {showActions && <TableHead className="py-3.5 px-6 text-right font-semibold">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/50">
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={showActions ? 5 : 4}
                      className="text-center py-16 text-muted-foreground"
                    >
                      <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2 stroke-1" />
                      <p className="font-medium text-sm">No users match the selected role filter.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((u) => {
                    const fullName = [u.firstName, u.lastName].filter(Boolean).join(" ") || "—";
                    const isActive = isUserActive(u);
                    const roleName = getUserRoleName(u);
                    const roleBadgeClass = ROLE_COLOR_STYLES[roleName] || ROLE_COLOR_STYLES.DEFAULT;
                    
                    return (
                      <TableRow key={u.id} className="group hover:bg-muted/20 transition-colors">
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-xs font-bold text-primary tracking-wider">
                              {getAvatarLetters(u.firstName, u.lastName)}
                            </div>
                            <div className="space-y-0.5">
                              <span className="font-semibold text-sm text-foreground block group-hover:text-primary transition-colors">
                                {fullName}
                              </span>
                              {u.position && (
                                <span className="text-xs text-muted-foreground block font-medium capitalize">
                                  {u.position}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-6 text-sm font-medium text-foreground/90">{u.email}</td>
                        
                        <td className="py-3.5 px-6">
                          <Badge 
                            variant="outline" 
                            className={`font-mono px-2 py-0.5 rounded text-[11px] font-bold tracking-wide ${roleBadgeClass}`}
                          >
                            {roleName}
                          </Badge>
                        </td>
                        
                        <td className="py-3.5 px-6">
                          <Badge 
                            variant="outline" 
                            className={`font-bold rounded-md px-2 py-0.5 text-[11px] uppercase tracking-wider ${
                              isActive 
                                ? "bg-white/95 text-emerald-500 border-emerald-500/20" 
                                : "bg-muted text-emerald-500 border-muted-foreground/10"
                            }`}
                          >
                            {isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>

                        {showActions && (
                          <td className="py-3.5 px-6 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {canUpdate && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                                  onClick={() => openEditModal(u)}
                                  title={`Edit ${fullName}`}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              )}
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                                  onClick={() => setUserToDelete(u)}
                                  title={`Delete ${fullName}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl border-none p-6">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-primary" />
              {managerAgentOnly ? "Create Sales Agent" : "Create New User"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Fill in the account deployment credentials. Required fields are marked with an asterisk (*).
            </DialogDescription>
          </DialogHeader>

          {error && createOpen && (
            <Alert variant="destructive" className="my-2 border-destructive/30 bg-destructive/10">
              <AlertDescription className="text-xs font-semibold">{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="um-first" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">First name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="um-first"
                    autoComplete="given-name"
                    value={form.firstName}
                    onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                    className={`pl-10 h-10 bg-muted/30 border-muted/60 ${fieldErrors.firstName ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                </div>
                {fieldErrors.firstName && (
                  <p className="text-xs text-destructive font-medium">{fieldErrors.firstName}</p>
                )}
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="um-last" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="um-last"
                    autoComplete="family-name"
                    value={form.lastName}
                    onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                    className={`pl-10 h-10 bg-muted/30 border-muted/60 ${fieldErrors.lastName ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                </div>
                {fieldErrors.lastName && (
                  <p className="text-xs text-destructive font-medium">{fieldErrors.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="um-email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="um-email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className={`pl-10 h-10 bg-muted/30 border-muted/60 ${fieldErrors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
              </div>
              {fieldErrors.email && <p className="text-xs text-destructive font-medium">{fieldErrors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="um-password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="um-password"
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  className={`pl-10 h-10 bg-muted/30 border-muted/60 ${fieldErrors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
              </div>
              {fieldErrors.password ? (
                <p className="text-xs text-destructive font-medium">{fieldErrors.password}</p>
              ) : (
                <p className="text-[11px] text-muted-foreground font-medium">
                  At least 8 characters with upper, lower, and a number.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">System Role *</Label>
              <RoleSelectField
                form={form}
                setForm={setForm}
                fieldErrors={fieldErrors}
                rolesForSelect={rolesForSelect}
                managerAgentOnly={managerAgentOnly}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="um-position" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Position Description (optional)</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="um-position"
                  value={form.position}
                  onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
                  placeholder="e.g. Senior Agent"
                  className="pl-10 h-10 bg-muted/30 border-muted/60"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/20 px-4 py-3 mt-1">
              <div className="space-y-0.5">
                <Label htmlFor="um-active" className="text-sm font-bold text-foreground">
                  Active Account Deployment
                </Label>
                <p className="text-xs text-muted-foreground font-medium">New credentials deploy active by default.</p>
              </div>
              <Switch
                id="um-active"
                checked={form.active !== false}
                onCheckedChange={(checked) => setForm((p) => ({ ...p, active: checked }))}
              />
            </div>

            <PermissionsField
              isSystemAdmin={isSystemAdmin}
              permissions={permissions}
              form={form}
              togglePermission={togglePermission}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 border-t pt-4">
            <Button type="button" variant="outline" className="h-10 rounded-xl font-semibold" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" className="h-10 rounded-xl font-semibold px-5" onClick={createUser} disabled={saving}>
              {saving ? 'Creating…' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog — SYSTEM_ADMIN only (canUpdate) */}
      <Dialog open={editOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl border-none p-6">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" />
              Edit User
            </DialogTitle>
            <DialogDescription className="text-xs">
              Update account details. Password is not changed here. Required fields are marked with an asterisk (*).
            </DialogDescription>
          </DialogHeader>

          {error && editOpen && (
            <Alert variant="destructive" className="my-2 border-destructive/30 bg-destructive/10">
              <AlertDescription className="text-xs font-semibold">{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="um-edit-first" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">First name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="um-edit-first"
                    autoComplete="given-name"
                    value={form.firstName}
                    onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                    className={`pl-10 h-10 bg-muted/30 border-muted/60 ${fieldErrors.firstName ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                </div>
                {fieldErrors.firstName && (
                  <p className="text-xs text-destructive font-medium">{fieldErrors.firstName}</p>
                )}
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="um-edit-last" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="um-edit-last"
                    autoComplete="family-name"
                    value={form.lastName}
                    onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                    className={`pl-10 h-10 bg-muted/30 border-muted/60 ${fieldErrors.lastName ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                </div>
                {fieldErrors.lastName && (
                  <p className="text-xs text-destructive font-medium">{fieldErrors.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="um-edit-email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="um-edit-email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className={`pl-10 h-10 bg-muted/30 border-muted/60 ${fieldErrors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
              </div>
              {fieldErrors.email && <p className="text-xs text-destructive font-medium">{fieldErrors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">System Role *</Label>
              <RoleSelectField
                form={form}
                setForm={setForm}
                fieldErrors={fieldErrors}
                rolesForSelect={rolesForSelect}
                managerAgentOnly={false}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="um-edit-position" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Position Description (optional)</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="um-edit-position"
                  value={form.position}
                  onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
                  placeholder="e.g. Sales Agent"
                  className="pl-10 h-10 bg-muted/30 border-muted/60"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/20 px-4 py-3 mt-1">
              <div className="space-y-0.5">
                <Label htmlFor="um-edit-active" className="text-sm font-bold text-foreground">
                  Active Account
                </Label>
                <p className="text-xs text-muted-foreground font-medium">Inactive users cannot sign in.</p>
              </div>
              <Switch
                id="um-edit-active"
                checked={form.active !== false}
                onCheckedChange={(checked) => setForm((p) => ({ ...p, active: checked }))}
              />
            </div>

            <PermissionsField
              isSystemAdmin={isSystemAdmin}
              permissions={permissions}
              form={form}
              togglePermission={togglePermission}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 border-t pt-4">
            <Button type="button" variant="outline" className="h-10 rounded-xl font-semibold" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" className="h-10 rounded-xl font-semibold px-5" onClick={updateUser} disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              <span className="font-semibold text-foreground">
                {" "}
                "{userToDeleteName}"{" "}
              </span>
              and remove their account from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
