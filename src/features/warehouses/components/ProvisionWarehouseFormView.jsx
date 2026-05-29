import React from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Badge } from '@/shared/ui/badge';
import {
  AlertCircle,
  Info,
  Loader2,
  UserCog,
} from 'lucide-react';
import {
  handleStreetNumberChange,
} from '@/features/leads/utils/leadUtils';
import { ProvisioningChecklist } from './ProvisioningChecklist';

// --- WMS Class Styles with Design System Tokens ---
const wms = {
  // Using minimal radius, padding, and spacing
  card: 'rounded-lg border border-border bg-card shadow-sm',
  sectionTitle: 'text-sm font-semibold text-foreground',
  sectionDesc: 'text-xs text-muted-foreground',
  // Standard input, minimal height
  input:
    'h-9 rounded-md border-input bg-background text-foreground text-sm placeholder:text-muted-foreground/80 focus-visible:border-primary focus-visible:ring-primary/20',
  label: 'text-xs text-muted-foreground font-normal',
  req: 'text-destructive',
  goldBtn: 'rounded-md bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 duration-normal ease-standard',
  outlineBtn: 'rounded-md border border-border bg-transparent text-foreground hover:bg-muted/40 duration-normal ease-standard',
};

function RequiredLabel({ htmlFor, children }) {
  return (
    <Label htmlFor={htmlFor} className={wms.label}>
      {children} <span className={wms.req}>*</span>
    </Label>
  );
}

function selectedLabel(list, id) {
  if (id == null || id === '') return undefined;
  const row = list.find((x) => String(x.id) === String(id));
  const name = row?.name ?? row?.label;
  if (name != null && String(name).trim() !== '') return String(name);
  return undefined;
}

function SectionCard({ title, description, children, className = '' }) {
  return (
    // Reducing card padding from p-6 to p-4/sm:p-5
    <section className={`${wms.card} p-4 sm:p-5 ${className}`}>
      <h2 className={wms.sectionTitle}>{title}</h2>
      {description && <p className={`mt-0.5 ${wms.sectionDesc}`}>{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
 }

export function ProvisionWarehouseFormView({
  formData,
  errors,
  isSubmitting,
  countries,
  provinces,
  cities,
  loadingCountries,
  loadingProvinces,
  loadingCities,
  checklist,
  handleInputChange,
  handleCountryChange,
  handleStateChange,
  handleCityChange,
  handleSubmit,
  inputError,
  onClose,
}) {
  return (
    // Minimal spacing-y between sections
    <div className="w-full space-y-4">
      <ProvisioningChecklist checklist={checklist} />

      <div className="space-y-4">
        {errors.submit && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.submit}</AlertDescription>
          </Alert>
        )}

        <SectionCard
          title="Warehouse Information"
          description="Core identity and contact details for the new warehouse."
        >
          {/* Main Grid: Reduced gap from gap-5 to gap-4 */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
            
            {/* Warehouse Name */}
            <div className="space-y-1.5 sm:col-span-8">
              <RequiredLabel htmlFor="warehouseName">Warehouse Name</RequiredLabel>
              <Input
                id="warehouseName"
                value={formData.warehouseName}
                onChange={(e) => handleInputChange('warehouseName', e.target.value)}
                placeholder="TreadX Central Warehouse"
                className={`${wms.input} ${inputError('warehouseName')}`}
              />
              {errors.warehouseName && (
                <p className="text-xs text-destructive">{errors.warehouseName}</p>
              )}
            </div>

            {/* Warehouse Code */}
            <div className="space-y-1.5 sm:col-span-4">
              <div className="flex items-center gap-1.5">
                <RequiredLabel htmlFor="warehouseCode">Warehouse Code</RequiredLabel>
                <Info className="h-3.5 w-3.5 text-muted-foreground/60" aria-hidden />
              </div>
              <Input
                id="warehouseCode"
                value={formData.warehouseCode}
                onChange={(e) =>
                  handleInputChange('warehouseCode', e.target.value.toUpperCase())
                }
                placeholder="WH-CENTRAL-01"
                className={`${wms.input} font-mono uppercase ${inputError('warehouseCode')}`}
              />
              {errors.warehouseCode && (
                <p className="text-xs text-destructive">{errors.warehouseCode}</p>
              )}
            </div>

            {/* Email & Phone - Compact Row */}
            <div className="space-y-1.5 sm:col-span-6">
              <RequiredLabel htmlFor="email">Warehouse Email</RequiredLabel>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="central@treadx.com"
                className={`${wms.input} ${inputError('email')}`}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-1.5 sm:col-span-6">
              <RequiredLabel htmlFor="phoneNumber">Phone Number</RequiredLabel>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="+96170123456"
                className={`${wms.input} ${inputError('phoneNumber')}`}
              />
              {errors.phoneNumber && (
                <p className="text-xs text-destructive">{errors.phoneNumber}</p>
              )}
            </div>

          </div>

          {/* Address & Location - Nested Compact Grids */}
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-12">
            
            <div className="space-y-1.5 sm:col-span-3">
              <RequiredLabel htmlFor="streetNumber">Street #</RequiredLabel>
              <Input
                id="streetNumber"
                value={formData.streetNumber}
                onChange={(e) =>
                  handleStreetNumberChange(e.target.value, (v) =>
                    handleInputChange('streetNumber', v),
                  )
                }
                placeholder="12"
                className={`${wms.input} ${inputError('streetNumber')}`}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-9">
              <RequiredLabel htmlFor="streetName">Street Name</RequiredLabel>
              <Input
                id="streetName"
                value={formData.streetName}
                onChange={(e) => handleInputChange('streetName', e.target.value)}
                placeholder="Industrial Zone St"
                className={`${wms.input} ${inputError('streetName')}`}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-4">
              <RequiredLabel htmlFor="postalCode">Postal Code</RequiredLabel>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                placeholder="1001"
                className={`${wms.input} ${inputError('postalCode')}`}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-8">
              <Label htmlFor="unitNumber" className={wms.label}>
                Unit / Apt (optional)
              </Label>
              <Input
                id="unitNumber"
                value={formData.unitNumber}
                onChange={(e) => handleInputChange('unitNumber', e.target.value)}
                placeholder="Unit 4B"
                className={wms.input}
              />
            </div>

            {/* Country/Province/City Row */}
            <div className="space-y-1.5 sm:col-span-4">
              <RequiredLabel htmlFor="countryId">Country</RequiredLabel>
              <Select
                value={formData.countryId != null ? String(formData.countryId) : undefined}
                onValueChange={handleCountryChange}
                disabled={loadingCountries}
              >
                <SelectTrigger className={`${wms.input} ${inputError('countryId')}`}>
                  <SelectValue placeholder={loadingCountries ? 'Loading…' : 'Select country'}>
                    {selectedLabel(countries, formData.countryId)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={String(c.id)} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 sm:col-span-4">
              <RequiredLabel htmlFor="stateId">State</RequiredLabel>
              <Select
                value={formData.stateId != null ? String(formData.stateId) : undefined}
                onValueChange={handleStateChange}
                disabled={!formData.countryId || loadingProvinces}
              >
                <SelectTrigger className={`${wms.input} ${inputError('stateId')}`}>
                  <SelectValue placeholder={loadingProvinces ? 'Loading…' : 'Select state'}>
                    {selectedLabel(provinces, formData.stateId)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((p) => (
                    <SelectItem key={String(p.id)} value={String(p.id)}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 sm:col-span-4">
              <RequiredLabel htmlFor="cityId">City</RequiredLabel>
              <Select
                value={formData.cityId != null ? String(formData.cityId) : undefined}
                onValueChange={handleCityChange}
                disabled={!formData.stateId || loadingCities}
              >
                <SelectTrigger className={`${wms.input} ${inputError('cityId')}`}>
                  <SelectValue placeholder={loadingCities ? 'Loading…' : 'Select city'}>
                    {selectedLabel(cities, formData.cityId)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={String(c.id)} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 sm:col-span-12">
              <Label htmlFor="operationalNotes" className={wms.label}>
                Operational Notes (optional)
              </Label>
              <Textarea
                id="operationalNotes"
                value={formData.operationalNotes}
                onChange={(e) => handleInputChange('operationalNotes', e.target.value)}
                placeholder="Delivery instructions..."
                className="min-h-[72px] resize-y border-input bg-background"
                rows={2}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Warehouse Admin Assignment"
          description="Create credentials for the warehouse manager."
        >
          {/* Admin Grid: Combined rows to reduce scrolling */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
            <div className="space-y-1.5 sm:col-span-6">
              <RequiredLabel htmlFor="managerFirstName">First Name</RequiredLabel>
              <Input
                id="managerFirstName"
                value={formData.managerFirstName}
                onChange={(e) => handleInputChange('managerFirstName', e.target.value)}
                placeholder="Ahmad"
                className={`${wms.input} ${inputError('managerFirstName')}`}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-6">
              <RequiredLabel htmlFor="managerLastName">Last Name</RequiredLabel>
              <Input
                id="managerLastName"
                value={formData.managerLastName}
                onChange={(e) => handleInputChange('managerLastName', e.target.value)}
                placeholder="Manager"
                className={`${wms.input} ${inputError('managerLastName')}`}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-8">
              <RequiredLabel htmlFor="managerEmail">Manager Email</RequiredLabel>
              <Input
                id="managerEmail"
                type="email"
                value={formData.managerEmail}
                onChange={(e) => handleInputChange('managerEmail', e.target.value)}
                placeholder="wh.manager@treadx.com"
                className={`${wms.input} ${inputError('managerEmail')}`}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-4">
              <RequiredLabel htmlFor="managerPassword">Initial Password</RequiredLabel>
              <Input
                id="managerPassword"
                type="password"
                value={formData.managerPassword}
                onChange={(e) => handleInputChange('managerPassword', e.target.value)}
                placeholder="Manager123!"
                className={`${wms.input} ${inputError('managerPassword')}`}
              />
            </div>
          </div>

          {/* Compact Manager Details Card with Transition */}
          {formData.managerFirstName && formData.managerLastName && formData.managerEmail && (
            <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2 animate-standard ease-standard">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UserCog className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground leading-tight">
                    {formData.managerFirstName} {formData.managerLastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{formData.managerEmail}</p>
                </div>
                <Badge variant="outline" className="border-sky-500/30 bg-sky-500/10 text-sky-400 text-[10px] px-1.5 py-0">
                  WAREHOUSE_MANAGER
                </Badge>
              </div>
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] px-1.5 py-0">
                Eligible
              </Badge>
            </div>
          )}

          <Alert className="mt-3 border-primary/25 bg-primary/5 p-2">
            <Info className="h-3.5 w-3.5 text-primary" />
            <AlertDescription className="text-xs text-muted-foreground/90">
              The assigned admin completes the Initial Setup Wizard on first login.
            </AlertDescription>
          </Alert>
        </SectionCard>

        {/* Action Buttons - No changes needed to spacing here */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button
            type="button"
            className={`${wms.goldBtn} min-w-[160px]`}
            disabled={isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Provisioning…
              </>
            ) : (
              'Provision Warehouse'
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className={wms.outlineBtn}
            disabled={isSubmitting}
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}