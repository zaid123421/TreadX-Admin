import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Progress } from '@/shared/ui/progress';
import { Input } from '@/shared/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Badge } from '@/shared/ui/badge';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Label } from '@/shared/ui/label';
import UserAccessManagement from './UserAccessManagement';
import {
  handlePostalCodeChange,
  handlePhoneNumberChange,
  handleStreetNumberChange,
} from '../../leads/utils/leadUtils';
import { AlertTriangle, ArrowLeft, ArrowRight } from 'lucide-react';

function renderStepContent(vm) {
  const {
    WIZARD_STEPS,
    currentStep,
    leads,
    loading,
    searchTerm,
    setSearchTerm,
    selectedLead,
    formData,
    setFormData,
    subscriptionPlans,
    handleLeadSelect,
  } = vm;

  const currentStepData = WIZARD_STEPS[currentStep];

  switch (currentStepData.id) {
    case 'select-lead':
      return (
        <div className="space-y-4">
          <div className="relative">
            <Input
              placeholder="Search contacted leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.businessName}</TableCell>
                    <TableCell>{lead.phoneNumber}</TableCell>
                    <TableCell>
                      {[lead.streetNumber, lead.streetName, lead.aptUnitBldg, lead.postalCode].filter(Boolean).join(', ')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{lead.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={selectedLead?.id === lead.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleLeadSelect(lead)}
                      >
                        {selectedLead?.id === lead.id ? 'Selected' : 'Select'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      );

    case 'business':
      return (
        <div className="space-y-4">
          <div>
            <Label className="mb-2 text-sm font-medium text-foreground">Legal Name *</Label>
            <Input
              value={formData.legalName}
              onChange={(e) => setFormData((prev) => ({ ...prev, legalName: e.target.value }))}
              placeholder="Enter legal business name"
            />
          </div>
          <div>
            <Label className="mb-2 text-sm font-medium text-foreground">Business Name *</Label>
            <Input
              value={formData.businessName}
              onChange={(e) => setFormData((prev) => ({ ...prev, businessName: e.target.value }))}
              placeholder="Enter business name"
            />
          </div>
        </div>
      );

    case 'contact':
      return (
        <div className="space-y-4">
          <div>
            <Label className="mb-2 text-sm font-medium text-foreground">Email *</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="Enter email address"
            />
          </div>
          <div>
            <Label className="mb-2 text-sm font-medium text-foreground">Phone Number *</Label>
            <Input
              value={formData.phoneNumber}
              onChange={(e) =>
                handlePhoneNumberChange(e.target.value, (formatted) =>
                  setFormData((prev) => ({ ...prev, phoneNumber: formatted }))
                )
              }
              placeholder="Enter phone number"
            />
          </div>
        </div>
      );

    case 'address':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 text-sm font-medium text-foreground">Street Number *</Label>
              <Input
                value={formData.streetNumber}
                onChange={(e) =>
                  handleStreetNumberChange(e.target.value, (formatted) =>
                    setFormData((prev) => ({ ...prev, streetNumber: formatted }))
                  )
                }
                placeholder="Street number"
              />
            </div>
            <div>
              <Label className="mb-2 text-sm font-medium text-foreground">Postal Code *</Label>
              <Input
                value={formData.postalCode}
                onChange={(e) =>
                  handlePostalCodeChange(e.target.value, (formatted) =>
                    setFormData((prev) => ({ ...prev, postalCode: formatted }))
                  )
                }
                placeholder="Postal code"
              />
            </div>
          </div>
          <div>
            <Label className="mb-2 text-sm font-medium text-foreground">Street Name *</Label>
            <Input
              value={formData.streetName}
              onChange={(e) => setFormData((prev) => ({ ...prev, streetName: e.target.value }))}
              placeholder="Street name"
            />
          </div>
          <div>
            <Label className="mb-2 text-sm font-medium text-foreground">Apt/Unit/Building</Label>
            <Input
              value={formData.aptUnitBldg}
              onChange={(e) => setFormData((prev) => ({ ...prev, aptUnitBldg: e.target.value }))}
              placeholder="Apartment, unit, or building"
            />
          </div>
        </div>
      );

    case 'user-access':
      return (
        <UserAccessManagement
          userRoles={formData.userRoles}
          onUserRolesChange={(userRoles) => setFormData((prev) => ({ ...prev, userRoles }))}
          totalUsers={formData.totalUsers}
          onTotalUsersChange={(totalUsers) => setFormData((prev) => ({ ...prev, totalUsers }))}
          maxUsers={50}
        />
      );

    case 'onboarding':
      return (
        <div className="space-y-4">
          <div>
            <Label className="mb-2 text-sm font-medium text-foreground">Subscription Plan *</Label>
            <select
              value={formData.subscriptionPlanId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, subscriptionPlanId: Number(e.target.value) }))
              }
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="">Select active plan</option>
              {subscriptionPlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.planName} ({plan.billingCycle}) - ${plan.price}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 text-sm font-medium text-foreground">Admin First Name *</Label>
              <Input
                value={formData.adminFirstName}
                onChange={(e) => setFormData((prev) => ({ ...prev, adminFirstName: e.target.value }))}
              />
            </div>
            <div>
              <Label className="mb-2 text-sm font-medium text-foreground">Admin Last Name *</Label>
              <Input
                value={formData.adminLastName}
                onChange={(e) => setFormData((prev) => ({ ...prev, adminLastName: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <Label className="mb-2 text-sm font-medium text-foreground">Admin Email *</Label>
            <Input
              type="email"
              value={formData.adminEmail}
              onChange={(e) => setFormData((prev) => ({ ...prev, adminEmail: e.target.value }))}
            />
          </div>
        </div>
      );

    case 'review':
      return (
        <div className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please review all information before submitting. This will create a new dealer with the specified user
              access configuration.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="font-medium">Legal Name:</span> {formData.legalName}
                </div>
                <div>
                  <span className="font-medium">Business Name:</span> {formData.businessName}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="font-medium">Email:</span> {formData.email}
                </div>
                <div>
                  <span className="font-medium">Phone:</span> {formData.phoneNumber}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="font-medium">Address:</span> {formData.streetNumber} {formData.streetName}
                </div>
                {formData.aptUnitBldg && (
                  <div>
                    <span className="font-medium">Unit:</span> {formData.aptUnitBldg}
                  </div>
                )}
                <div>
                  <span className="font-medium">Postal Code:</span> {formData.postalCode}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Access Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="font-medium">Total Users:</span> {formData.totalUsers}
                </div>
                {Object.entries(formData.userRoles).map(([role, count]) => (
                  <div key={role}>
                    <span className="font-medium">{role}:</span> {count} users
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      );

    default:
      return null;
  }
}

export function EnhancedDealerWizardView(props) {
  const {
    WIZARD_STEPS,
    currentStep,
    handlePrevious,
    handleNext,
    handleSubmit,
    isStepValid,
    isSubmitting,
    onClose,
  } = props;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 text-foreground">Create New Dealer</h1>
        <p className="text-muted-foreground">Set up a new dealer with user access management</p>
      </div>

      <div className="mb-8">
        <Progress value={(currentStep / (WIZARD_STEPS.length - 1)) * 100} className="mb-4" />
        <div className="flex justify-between text-sm text-foreground">
          <span>
            Step {currentStep + 1} of {WIZARD_STEPS.length}
          </span>
          <span>{Math.round(((currentStep + 1) / WIZARD_STEPS.length) * 100)}% Complete</span>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            {React.createElement(WIZARD_STEPS[currentStep].icon, { className: 'w-6 h-6 text-primary shrink-0' })}
            <div>
              <CardTitle>{WIZARD_STEPS[currentStep].title}</CardTitle>
              <p className="text-muted-foreground">{WIZARD_STEPS[currentStep].description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>{renderStepContent(props)}</CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

            {currentStep === WIZARD_STEPS.length - 1 ? (
            <Button onClick={handleSubmit} disabled={!isStepValid() || isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Dealer'}
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!isStepValid()}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
