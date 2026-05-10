import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

export function RolesManagementView({
  roles,
  error,
  name,
  setName,
  onCreateRole,
  onDeleteRole,
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Roles Management</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Input placeholder="Role name" value={name} onChange={(e) => setName(e.target.value)} />
            <Button onClick={onCreateRole}>Create Role</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>All Roles</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {roles.map((r) => (
            <div key={r.id} className="flex justify-between border rounded p-2">
              <div className="text-sm">{r.name}</div>
              <Button variant="destructive" size="sm" onClick={() => onDeleteRole(r.id)}>Delete</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
