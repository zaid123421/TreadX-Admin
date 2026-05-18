import React from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { AlertCircle, Upload } from "lucide-react";
import { LeadSource } from "@/shared/types/enums";
import {
  handlePostalCodeChange,
  handlePhoneNumberChange,
  handleStreetNumberChange,
} from "../utils/leadUtils";

const crm = {
  page: "bg-background",
  muted: "text-muted-foreground",
  card: "bg-card border border-border",
  input:
    "h-10 rounded-md border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/25",
  label: "text-muted-foreground text-sm font-normal",
  req: "text-destructive",
  goldBtn:
    "rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90",
  outlineBtn:
    "rounded-md border border-border bg-transparent text-foreground hover:bg-muted/40",
};

function RequiredLabel({ htmlFor, children }) {
  return (
    <Label htmlFor={htmlFor} className={crm.label}>
      {children} <span className={crm.req}>*</span>
    </Label>
  );
}

/**
 * Radix Select shows the chosen label by porting item text into the trigger only while
 * `SelectItem` nodes are mounted. When the menu is closed, items often unmount, so the
 * trigger can go blank. Passing an explicit label as `SelectValue` children fixes that.
 */
function selectedLabel(list, id) {
  if (id == null || id === "") return undefined;
  // تحويل الطرفين إلى نصوص للمقارنة الآمنة الرقمية والنصية
  const row = list.find((x) => String(x.id) === String(id));
  const name = row?.name ?? row?.label;
  if (name != null && String(name).trim() !== "") return String(name);
  return undefined; // إرجاع undefined يترك الـ placeholder الافتراضي يعمل بسلاسة
}

export function LeadWizardForm({
  formData,
  selectedFile,
  errors,
  isSubmitting,
  countries,
  provinces,
  cities,
  loadingCountries,
  loadingProvinces,
  loadingCities,
  countriesError,
  provincesError,
  citiesError,
  handleInputChange,
  handleCountryChange,
  handleStateChange,
  handleCityChange,
  handleFileChange,
  handleSubmit,
  inputError,
  onClose,
}) {
  return (
    <div className="w-full max-w-full">
      <div
        className={`rounded-xl border-s-4 border-s-primary shadow-xl ${crm.card} p-6 sm:p-8`}
      >
        <h3 className="text-lg font-semibold text-foreground tracking-tight">
          Lead information
        </h3>
        <p className={`mt-1 text-sm ${crm.muted}`}>
          Fields match your pipeline; required items are marked below.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-5">
          <div className="space-y-2">
            <RequiredLabel htmlFor="businessName">
              Company / business name
            </RequiredLabel>
            <Input
              id="businessName"
              value={formData.businessName}
              onChange={(e) =>
                handleInputChange("businessName", e.target.value)
              }
              placeholder="Business name"
              className={`${crm.input} w-full ${inputError("businessName")}`}
            />
            {errors.businessName && (
              <p className="text-sm text-destructive">{errors.businessName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactName" className={crm.label}>
              Contact person
            </Label>
            <Input
              id="contactName"
              value={formData.contactName}
              onChange={(e) => handleInputChange("contactName", e.target.value)}
              placeholder="Primary contact name"
              className={`${crm.input} w-full`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactEmail" className={crm.label}>
              Contact email
            </Label>
            <Input
              id="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={(e) =>
                handleInputChange("contactEmail", e.target.value)
              }
              placeholder="name@company.com"
              className={`${crm.input} w-full`}
            />
          </div>

          <div className="space-y-2">
            <RequiredLabel htmlFor="phoneNumber">Phone number</RequiredLabel>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) =>
                handlePhoneNumberChange(e.target.value, (v) =>
                  handleInputChange("phoneNumber", v),
                )
              }
              onKeyDown={(e) => {
                const allowed = [
                  "0",
                  "1",
                  "2",
                  "3",
                  "4",
                  "5",
                  "6",
                  "7",
                  "8",
                  "9",
                  "Backspace",
                  "Delete",
                  "ArrowLeft",
                  "ArrowRight",
                  "Tab",
                ];
                if (!allowed.includes(e.key)) e.preventDefault();
              }}
              placeholder="+1 (555) 123-4567"
              className={`${crm.input} w-full ${inputError("phoneNumber")}`}
            />
            {errors.phoneNumber && (
              <p className="text-sm text-destructive">{errors.phoneNumber}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sourceUrl" className={crm.label}>
              Source URL
            </Label>
            <Input
              id="sourceUrl"
              value={formData.sourceUrl}
              onChange={(e) => handleInputChange("sourceUrl", e.target.value)}
              placeholder="https://…"
              className={`${crm.input} w-full`}
            />
          </div>

          <div className="space-y-2">
            <RequiredLabel htmlFor="source">Lead source</RequiredLabel>
            <Select
              value={formData.source}
              onValueChange={(value) => handleInputChange("source", value)}
            >
              <SelectTrigger
                className={`${crm.input} !w-full ${inputError("source")}`}
              >
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover text-popover-foreground">
                <SelectItem value={LeadSource.GOVERNMENT}>
                  Government database
                </SelectItem>
                <SelectItem value={LeadSource.ADS}>
                  Advertising campaign
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.source && (
              <p className="text-sm text-destructive">{errors.source}</p>
            )}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-x-6">
              <div className="space-y-2">
                <RequiredLabel htmlFor="country">Country</RequiredLabel>
                <Select
                  key={`country-${formData.countryId}`} // 💡 تجبر React على التحديث النظيف وتمنع خطأ removeChild
                  value={
                    formData.countryId != null
                      ? String(formData.countryId)
                      : undefined
                  }
                  onValueChange={handleCountryChange}
                  disabled={loadingCountries}
                >
                  <SelectTrigger
                    id="country"
                    className={`${crm.input} !w-full ${inputError("countryId")}`}
                  >
                    <SelectValue placeholder="Select country">
                      {selectedLabel(countries, formData.countryId)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent
                    position="item-aligned"
                    className="border-border bg-popover text-popover-foreground max-h-60 z-[200]"
                  >
                    {countries.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {countriesError && (
                  <p className="text-sm text-destructive">{countriesError}</p>
                )}
                {!loadingCountries &&
                  !countriesError &&
                  countries.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No countries returned from the server.
                    </p>
                  )}
                {errors.countryId && (
                  <p className="text-sm text-destructive">{errors.countryId}</p>
                )}
              </div>
              <div className="space-y-2">
                <RequiredLabel htmlFor="state">State / province</RequiredLabel>
                <Select
                  key={`state-${formData.stateId}`} // 💡 تمنع التضارب عند اختيار مدينة أو محافظة جديدة
                  value={
                    formData.stateId != null
                      ? String(formData.stateId)
                      : undefined
                  }
                  onValueChange={handleStateChange}
                  disabled={!formData.countryId || loadingProvinces}
                >
                  <SelectTrigger
                    id="state"
                    className={`${crm.input} !w-full ${inputError("stateId")}`}
                  >
                    <SelectValue
                      placeholder={
                        !formData.countryId
                          ? "Select country first"
                          : "Select state or province"
                      }
                    >
                      {selectedLabel(provinces, formData.stateId)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent
                    position="item-aligned"
                    className="border-border bg-popover text-popover-foreground max-h-60 z-[200]"
                  >
                    {provinces.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {provincesError && (
                  <p className="text-sm text-destructive">{provincesError}</p>
                )}
                {!loadingProvinces &&
                  !provincesError &&
                  formData.countryId &&
                  provinces.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No provinces returned for this country.
                    </p>
                  )}
                {errors.stateId && (
                  <p className="text-sm text-destructive">{errors.stateId}</p>
                )}
              </div>
              <div className="space-y-2">
                <RequiredLabel htmlFor="city">City</RequiredLabel>
                <Select
                  key={`city-${formData.cityId}`} // 💡 تحمي العقدة (Node) من الانهيار عند الضغط النهائي على المدينة
                  value={
                    formData.cityId != null
                      ? String(formData.cityId)
                      : undefined
                  }
                  onValueChange={handleCityChange}
                  disabled={!formData.stateId || loadingCities}
                >
                  <SelectTrigger
                    id="city"
                    className={`${crm.input} !w-full ${inputError("cityId")}`}
                  >
                    <SelectValue
                      placeholder={
                        !formData.stateId ? "Select state first" : "Select city"
                      }
                    >
                      {selectedLabel(cities, formData.cityId)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent
                    position="item-aligned"
                    className="border-border bg-popover text-popover-foreground max-h-60 z-[200]"
                  >
                    {cities.map((ct) => (
                      <SelectItem key={ct.id} value={String(ct.id)}>
                        {ct.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {citiesError && (
                  <p className="text-sm text-destructive">{citiesError}</p>
                )}
                {!loadingCities &&
                  !citiesError &&
                  formData.stateId &&
                  cities.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No cities returned for this province.
                    </p>
                  )}
                {errors.cityId && (
                  <p className="text-sm text-destructive">{errors.cityId}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-x-6">
              <div className="space-y-2">
                <RequiredLabel htmlFor="streetNumber">
                  Street number
                </RequiredLabel>
                <Input
                  id="streetNumber"
                  value={formData.streetNumber}
                  onChange={(e) =>
                    handleStreetNumberChange(e.target.value, (v) =>
                      handleInputChange("streetNumber", v),
                    )
                  }
                  placeholder="123"
                  className={`${crm.input} w-full ${inputError("streetNumber")}`}
                />
                {errors.streetNumber && (
                  <p className="text-sm text-destructive">
                    {errors.streetNumber}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <RequiredLabel htmlFor="streetName">Street name</RequiredLabel>
                <Input
                  id="streetName"
                  value={formData.streetName}
                  onChange={(e) =>
                    handleInputChange("streetName", e.target.value)
                  }
                  placeholder="Main Street"
                  className={`${crm.input} w-full ${inputError("streetName")}`}
                />
                {errors.streetName && (
                  <p className="text-sm text-destructive">
                    {errors.streetName}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="aptUnitBldg" className={crm.label}>
              Apt / unit / building
            </Label>
            <Input
              id="aptUnitBldg"
              value={formData.aptUnitBldg}
              onChange={(e) => handleInputChange("aptUnitBldg", e.target.value)}
              placeholder="Suite 100"
              className={`${crm.input} w-full`}
            />
          </div>

          <div className="space-y-2">
            <RequiredLabel htmlFor="postalCode">Postal code</RequiredLabel>
            <Input
              id="postalCode"
              value={formData.postalCode}
              onChange={(e) =>
                handlePostalCodeChange(e.target.value, (v) =>
                  handleInputChange("postalCode", v),
                )
              }
              placeholder="A1A 1A1"
              className={`${crm.input} w-full ${inputError("postalCode")}`}
            />
            {errors.postalCode && (
              <p className="text-sm text-destructive">{errors.postalCode}</p>
            )}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="file" className={crm.label}>
              Document (optional)
            </Label>
            <div className="rounded-[10px] border border-dashed border-white/20 bg-[#1a2230]/80 px-4 py-6 text-center">
              <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <input
                type="file"
                id="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="file"
                className="cursor-pointer text-sm text-muted-foreground"
              >
                Click to upload — PDF, DOC, JPG, PNG up to 10MB
              </label>
              {selectedFile && (
                <p className="mt-2 text-sm text-primary">{selectedFile.name}</p>
              )}
            </div>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes" className={crm.label}>
              Initial notes
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Additional context for this lead…"
              rows={4}
              className={`${crm.input} min-h-[120px] resize-y py-3`}
            />
          </div>
        </div>

        {errors.submit && (
          <Alert
            variant="destructive"
            className="mt-6 border-destructive/40 bg-destructive/10 text-destructive"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.submit}</AlertDescription>
          </Alert>
        )}

        <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className={`text-sm ${crm.muted}`}>
            Required fields marked with *
          </p>
          <div className="flex flex-wrap justify-end gap-3">
            {onClose && (
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className={crm.outlineBtn}
              >
                Cancel
              </Button>
            )}
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`min-w-[140px] ${crm.goldBtn}`}
            >
              {isSubmitting ? "Saving…" : "Save lead"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
