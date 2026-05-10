import React from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Badge } from '@/shared/ui/badge';
import { Switch } from '@/shared/ui/switch';
import { Checkbox } from '@/shared/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';

function roleLabel(r) {
  if (r == null) return '';
  if (typeof r === 'object') return r.description ? `${r.name} — ${r.description}` : r.name ?? r.id ?? '';
  return String(r);
}

function roleIdOf(r) {
  if (r == null) return '';
  if (typeof r === 'object') return r.id != null ? String(r.id) : '';
  return String(r);
}

function getUserRoleName(u) {
  if (u?.role == null) return '—';
  return typeof u.role === 'object' ? u.role?.name ?? '—' : String(u.role);
}

function isUserActive(u) {
  if (u == null) return true;
  if (typeof u.active === 'boolean') return u.active;
  if (typeof u.isActive === 'boolean') return u.isActive;
  return true;
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
  deleteUser,
  canDelete,
  canCreate,
  managerAgentOnly,
  isSystemAdmin,
  roleFilter,
  setRoleFilter,
  createOpen,
  openCreateModal,
  setCreateModalOpen,
  togglePermission,
}) {
  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Users</h1>
          <p className="mt-1 text-muted-foreground">
            Create accounts, assign roles, and manage access. Uses <span className="font-medium text-foreground">POST /users</span> with
            validation for email and password strength.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="SYSTEM_ADMIN">System Administrator</SelectItem>
              <SelectItem value="SALES_MANAGER">Sales Manager</SelectItem>
              <SelectItem value="SALES_AGENT">Sales Agent</SelectItem>
            </SelectContent>
          </Select>
          {canCreate && (
            <Button type="button" onClick={openCreateModal} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add New User
            </Button>
          )}
        </div>
      </div>

      {error && !createOpen && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Directory</CardTitle>
          <CardDescription>Name, email, role, and account status</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  {canDelete && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canDelete ? 5 : 4} className="text-center text-muted-foreground">
                      No users match this filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium text-foreground">
                        {[u.firstName, u.lastName].filter(Boolean).join(' ') || '—'}
                      </TableCell>
                      <TableCell className="text-foreground">{u.email}</TableCell>
                      <TableCell className="text-muted-foreground">{getUserRoleName(u)}</TableCell>
                      <TableCell>
                        <Badge variant={isUserActive(u) ? 'default' : 'secondary'}>
                          {isUserActive(u) ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      {canDelete && (
                        <TableCell className="text-right">
                          <Button variant="destructive" size="sm" onClick={() => deleteUser(u.id)}>
                            Delete
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {managerAgentOnly ? 'Create Sales Agent' : 'Create user'}
            </DialogTitle>
            <DialogDescription>
              Required: email, password, first name, last name, role. Optional: position and additional permissions
              (admin only).
            </DialogDescription>
          </DialogHeader>

          {error && createOpen && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="um-first">First name *</Label>
                <Input
                  id="um-first"
                  autoComplete="given-name"
                  value={form.firstName}
                  onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                  className={fieldErrors.firstName ? 'border-destructive' : ''}
                />
                {fieldErrors.firstName && (
                  <p className="text-xs text-destructive">{fieldErrors.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="um-last">Last name *</Label>
                <Input
                  id="um-last"
                  autoComplete="family-name"
                  value={form.lastName}
                  onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                  className={fieldErrors.lastName ? 'border-destructive' : ''}
                />
                {fieldErrors.lastName && (
                  <p className="text-xs text-destructive">{fieldErrors.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="um-email">Email *</Label>
              <Input
                id="um-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className={fieldErrors.email ? 'border-destructive' : ''}
              />
              {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="um-password">Password *</Label>
              <Input
                id="um-password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                className={fieldErrors.password ? 'border-destructive' : ''}
              />
              {fieldErrors.password ? (
                <p className="text-xs text-destructive">{fieldErrors.password}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  At least 8 characters with upper, lower, and a number.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Role *</Label>
              {managerAgentOnly ? (
                <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground">
                  Sales Agent (fixed for your role)
                </p>
              ) : (
                <>
                  <Select
                    value={form.roleId}
                    onValueChange={(v) => setForm((p) => ({ ...p, roleId: v }))}
                  >
                    <SelectTrigger className={fieldErrors.roleId ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {rolesForSelect.map((r) => (
                        <SelectItem key={roleIdOf(r)} value={roleIdOf(r)}>
                          {roleLabel(r)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldErrors.roleId && (
                    <p className="text-xs text-destructive">{fieldErrors.roleId}</p>
                  )}
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="um-position">Position (optional)</Label>
              <Input
                id="um-position"
                value={form.position}
                onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
                placeholder="e.g. Senior Agent"
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-2">
              <div className="space-y-0.5">
                <Label htmlFor="um-active" className="text-foreground">
                  Active account
                </Label>
                <p className="text-xs text-muted-foreground">New users are active by default</p>
              </div>
              <Switch
                id="um-active"
                checked={form.active !== false}
                onCheckedChange={(checked) => setForm((p) => ({ ...p, active: checked }))}
              />
            </div>

            {isSystemAdmin && permissions.length > 0 && (
              <div className="space-y-2">
                <Label>Additional permissions (optional)</Label>
                <p className="text-xs text-muted-foreground">From GET /permissions — merged with role permissions.</p>
                <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border border-border p-3">
                  {permissions.map((perm) => {
                    const pid = perm.id;
                    const checked = (form.permissionIds || []).includes(pid);
                    return (
                      <label
                        key={pid}
                        className="flex cursor-pointer items-start gap-3 text-sm"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => togglePermission(pid)}
                          aria-label={perm.name || String(pid)}
                        />
                        <span className="text-foreground">
                          <span className="font-medium">{perm.name ?? `Permission ${pid}`}</span>
                          {perm.description && (
                            <span className="block text-muted-foreground">{perm.description}</span>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={createUser}>
              Create user
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
