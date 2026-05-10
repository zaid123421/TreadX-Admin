import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Badge } from '@/shared/ui/badge';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Users, Shield, UserCheck, Wrench, AlertTriangle } from 'lucide-react';
import { UserRole } from '@/shared/types/api';

const UserAccessManagement = ({ 
  userRoles, 
  onUserRolesChange, 
  totalUsers, 
  onTotalUsersChange,
  maxUsers = 50 
}) => {
  const [validationError, setValidationError] = useState('');

  // Role configurations
  const roleConfigs = {
    [UserRole.DEALER_ADMIN]: {
      label: 'Dealer Admin',
      description: 'Full access to vendor management and user administration',
      icon: Shield,
      color: 'bg-red-100 text-red-800',
      maxCount: 10
    },
    [UserRole.DEALER_TECHNICIAN]: {
      label: 'Dealer Technician',
      description: 'Technical access for tire management and maintenance',
      icon: Wrench,
      color: 'bg-green-100 text-green-800',
      maxCount: 20
    }
  };

  // Calculate total from user roles
  const calculatedTotal = Object.values(userRoles).reduce((sum, count) => sum + (count || 0), 0);

  // Validate user counts
  useEffect(() => {
    const total = Object.values(userRoles).reduce((sum, count) => sum + (count || 0), 0);
    
    if (total > maxUsers) {
      setValidationError(`Total users (${total}) cannot exceed maximum allowed (${maxUsers})`);
    } else if (total !== totalUsers) {
      setValidationError(`Total users (${total}) must match the specified total (${totalUsers})`);
    } else {
      setValidationError('');
    }
  }, [userRoles, totalUsers, maxUsers]);

  // Handle role count change
  const handleRoleCountChange = (role, count) => {
    const newCount = parseInt(count) || 0;
    const newUserRoles = {
      ...userRoles,
      [role]: newCount
    };
    onUserRolesChange(newUserRoles);
  };

  // Handle total users change
  const handleTotalUsersChange = (value) => {
    const newTotal = parseInt(value) || 0;
    onTotalUsersChange(newTotal);
  };

  // Auto-distribute users (simple distribution)
  const handleAutoDistribute = () => {
    if (totalUsers <= 0) return;

    const roles = Object.keys(userRoles);
    const baseCount = Math.floor(totalUsers / roles.length);
    const remainder = totalUsers % roles.length;

    const newUserRoles = {};
    roles.forEach((role, index) => {
      newUserRoles[role] = baseCount + (index < remainder ? 1 : 0);
    });

    onUserRolesChange(newUserRoles);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Access Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Total Users Input */}
          <div className="space-y-2">
            <Label htmlFor="totalUsers">Total Users *</Label>
            <div className="flex gap-2">
              <Input
                id="totalUsers"
                type="number"
                min="0"
                max={maxUsers}
                value={totalUsers}
                onChange={(e) => handleTotalUsersChange(e.target.value)}
                placeholder="Enter total number of users"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAutoDistribute}
                disabled={totalUsers <= 0}
              >
                Auto-Distribute
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Maximum allowed: {maxUsers} users
            </p>
          </div>

          {/* Validation Error */}
          {validationError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {/* User Roles Configuration */}
          <div className="space-y-4">
            <Label>User Role Distribution</Label>
            
            {Object.entries(userRoles).map(([role, count]) => {
              const config = roleConfigs[role];
              const IconComponent = config.icon;
              
              return (
                <div key={role} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4" />
                      <span className="font-medium">{config.label}</span>
                      <Badge variant="secondary" className={config.color}>
                        {count || 0} users
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max={config.maxCount}
                        value={count || 0}
                        onChange={(e) => handleRoleCountChange(role, e.target.value)}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">
                        max {config.maxCount}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {config.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Summary</p>
                <p className="text-sm text-muted-foreground">
                  Total users: {calculatedTotal} / {totalUsers}
                </p>
              </div>
              <div className="text-right">
                <Badge 
                  variant={calculatedTotal === totalUsers && totalUsers > 0 ? "default" : "secondary"}
                >
                  {calculatedTotal === totalUsers && totalUsers > 0 ? "Valid" : "Invalid"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAccessManagement; 