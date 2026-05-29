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
import { AlertCircle, Info, Loader2 } from 'lucide-react';
import { handleStreetNumberChange } from '@/features/leads/utils/leadUtils';

const wms = {
  input:
    'h-10 rounded-md border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/25',
  label: 'text-sm text-muted-foreground font-normal',
  req: 'text-destructive',
  goldBtn: 'rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90',
  outlineBtn: 'rounded-md border border-border bg-transparent text-foreground hover:bg-muted/40',
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

export function EditWarehouseFormView({
  formData,
  errors,
  isSubmitting,
  isResolvingAddress,
  countries,
  provinces,
  cities,
  loadingCountries,
  loadingProvinces,
  loadingCities,
  handleInputChange,
  handleCountryChange,
  handleStateChange,
  handleCityChange,
  handleSubmit,
  inputError,
  onClose,
}) {
  return (
    <div className="space-y-5">
      {isResolvingAddress && (
        <Alert className="border-primary/25 bg-primary/5">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <AlertDescription className="text-sm text-muted-foreground">
            Resolving address location…
          </AlertDescription>
        </Alert>
      )}

      {errors.submit && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.submit}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <RequiredLabel htmlFor="edit-warehouseName">Warehouse Name</RequiredLabel>
          <Input
            id="edit-warehouseName"
            value={formData.warehouseName}
            onChange={(e) => handleInputChange('warehouseName', e.target.value)}
            className={`${wms.input} ${inputError('warehouseName')}`}
          />
          {errors.warehouseName && (
            <p className="text-sm text-destructive">{errors.warehouseName}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <RequiredLabel htmlFor="edit-warehouseCode">Warehouse Code</RequiredLabel>
            <Info className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
          </div>
          <Input
            id="edit-warehouseCode"
            value={formData.warehouseCode}
            onChange={(e) => handleInputChange('warehouseCode', e.target.value.toUpperCase())}
            className={`${wms.input} font-mono uppercase ${inputError('warehouseCode')}`}
          />
          {errors.warehouseCode && (
            <p className="text-sm text-destructive">{errors.warehouseCode}</p>
          )}
        </div>

        <div className="space-y-2">
          <RequiredLabel htmlFor="edit-email">Warehouse Email</RequiredLabel>
          <Input
            id="edit-email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`${wms.input} ${inputError('email')}`}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <RequiredLabel htmlFor="edit-phoneNumber">Phone Number</RequiredLabel>
          <Input
            id="edit-phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            className={`${wms.input} ${inputError('phoneNumber')}`}
          />
          {errors.phoneNumber && (
            <p className="text-sm text-destructive">{errors.phoneNumber}</p>
          )}
        </div>

        <div className="space-y-2">
          <RequiredLabel htmlFor="edit-streetNumber">Street Number</RequiredLabel>
          <Input
            id="edit-streetNumber"
            value={formData.streetNumber}
            onChange={(e) =>
              handleStreetNumberChange(e.target.value, (v) => handleInputChange('streetNumber', v))
            }
            className={`${wms.input} ${inputError('streetNumber')}`}
          />
          {errors.streetNumber && (
            <p className="text-sm text-destructive">{errors.streetNumber}</p>
          )}
        </div>

        <div className="space-y-2">
          <RequiredLabel htmlFor="edit-streetName">Street Name</RequiredLabel>
          <Input
            id="edit-streetName"
            value={formData.streetName}
            onChange={(e) => handleInputChange('streetName', e.target.value)}
            className={`${wms.input} ${inputError('streetName')}`}
          />
          {errors.streetName && (
            <p className="text-sm text-destructive">{errors.streetName}</p>
          )}
        </div>

        <div className="space-y-2">
          <RequiredLabel htmlFor="edit-postalCode">Postal Code</RequiredLabel>
          <Input
            id="edit-postalCode"
            value={formData.postalCode}
            onChange={(e) => handleInputChange('postalCode', e.target.value)}
            className={`${wms.input} ${inputError('postalCode')}`}
          />
          {errors.postalCode && (
            <p className="text-sm text-destructive">{errors.postalCode}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-unitNumber" className={wms.label}>
            Unit / Apt (optional)
          </Label>
          <Input
            id="edit-unitNumber"
            value={formData.unitNumber}
            onChange={(e) => handleInputChange('unitNumber', e.target.value)}
            className={wms.input}
          />
        </div>

        <div className="space-y-2">
          <RequiredLabel htmlFor="edit-countryId">Country</RequiredLabel>
          <Select
            value={formData.countryId != null ? String(formData.countryId) : undefined}
            onValueChange={handleCountryChange}
            disabled={loadingCountries || isResolvingAddress}
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
          {errors.countryId && <p className="text-sm text-destructive">{errors.countryId}</p>}
        </div>

        <div className="space-y-2">
          <RequiredLabel htmlFor="edit-stateId">State / Province</RequiredLabel>
          <Select
            value={formData.stateId != null ? String(formData.stateId) : undefined}
            onValueChange={handleStateChange}
            disabled={!formData.countryId || loadingProvinces || isResolvingAddress}
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
          {errors.stateId && <p className="text-sm text-destructive">{errors.stateId}</p>}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <RequiredLabel htmlFor="edit-cityId">City</RequiredLabel>
          <Select
            value={formData.cityId != null ? String(formData.cityId) : undefined}
            onValueChange={handleCityChange}
            disabled={!formData.stateId || loadingCities || isResolvingAddress}
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
          {errors.cityId && <p className="text-sm text-destructive">{errors.cityId}</p>}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="edit-operationalNotes" className={wms.label}>
            Special Instructions (optional)
          </Label>
          <Textarea
            id="edit-operationalNotes"
            value={formData.operationalNotes}
            onChange={(e) => handleInputChange('operationalNotes', e.target.value)}
            className="min-h-[80px] resize-y border-input bg-background"
            rows={3}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
        <Button
          type="button"
          variant="outline"
          className={wms.outlineBtn}
          disabled={isSubmitting}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="button"
          className={wms.goldBtn}
          disabled={isSubmitting || isResolvingAddress}
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  );
}
