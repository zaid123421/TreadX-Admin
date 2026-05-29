import {
  validateStreetNumber,
} from '@/features/leads/utils/leadUtils';
import {
  fetchCountries,
  fetchProvincesByCountry,
  fetchCitiesByProvince,
} from '@/shared/services/addressApiService';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WAREHOUSE_CODE_RE = /^[A-Z0-9][A-Z0-9_-]*$/i;
const PHONE_RE = /^\+?[0-9\s()-]{7,20}$/;

function validateWarehousePhone(phone) {
  if (!phone?.trim()) return 'Phone number is required';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 7 || cleaned.length > 15) {
    return 'Enter a valid phone number (e.g. +96170123456)';
  }
  if (!PHONE_RE.test(phone.trim())) {
    return 'Enter a valid phone number (e.g. +96170123456)';
  }
  return null;
}

function validateWarehousePostal(postalCode) {
  if (!postalCode?.trim()) return 'Postal code is required';
  if (postalCode.trim().length < 3 || postalCode.trim().length > 12) {
    return 'Enter a valid postal code';
  }
  return null;
}

function validateWarehouseCore(formData) {
  const errors = {};

  if (!formData.warehouseName?.trim()) {
    errors.warehouseName = 'Warehouse name is required';
  }

  const code = formData.warehouseCode?.trim();
  if (!code) {
    errors.warehouseCode = 'Warehouse code is required';
  } else if (!WAREHOUSE_CODE_RE.test(code)) {
    errors.warehouseCode = 'Use letters, numbers, hyphens, or underscores only';
  }

  if (!formData.email?.trim()) {
    errors.email = 'Warehouse email is required';
  } else if (!EMAIL_RE.test(formData.email.trim())) {
    errors.email = 'Enter a valid email address';
  }

  const phoneErr = validateWarehousePhone(formData.phoneNumber);
  if (phoneErr) errors.phoneNumber = phoneErr;

  if (!formData.streetName?.trim()) {
    errors.streetName = 'Street name is required';
  }

  const streetNumErr = !formData.streetNumber?.trim()
    ? 'Street number is required'
    : !validateStreetNumber(formData.streetNumber)
      ? 'Street number must contain only numbers'
      : null;
  if (streetNumErr) errors.streetNumber = streetNumErr;

  const postalErr = validateWarehousePostal(formData.postalCode);
  if (postalErr) errors.postalCode = postalErr;

  if (formData.countryId == null || formData.countryId === '') {
    errors.countryId = 'Country is required';
  }
  if (formData.stateId == null || formData.stateId === '') {
    errors.stateId = 'State / province is required';
  }
  if (formData.cityId == null || formData.cityId === '') {
    errors.cityId = 'City is required';
  }

  return errors;
}

export function validateWarehouseForm(formData) {
  const errors = validateWarehouseCore(formData);

  if (!formData.managerFirstName?.trim()) {
    errors.managerFirstName = 'Manager first name is required';
  }
  if (!formData.managerLastName?.trim()) {
    errors.managerLastName = 'Manager last name is required';
  }
  if (!formData.managerEmail?.trim()) {
    errors.managerEmail = 'Manager email is required';
  } else if (!EMAIL_RE.test(formData.managerEmail.trim())) {
    errors.managerEmail = 'Enter a valid email address';
  }
  if (!formData.managerPassword) {
    errors.managerPassword = 'Manager password is required';
  } else if (formData.managerPassword.length < 8) {
    errors.managerPassword = 'Password must be at least 8 characters';
  }

  return errors;
}

export function validateWarehouseEditForm(formData) {
  return validateWarehouseCore(formData);
}

function buildWarehouseAddressPayload(formData) {
  const unit = formData.unitNumber?.trim();
  const notes = formData.operationalNotes?.trim();

  return {
    streetName: formData.streetName.trim(),
    streetNumber: formData.streetNumber.trim(),
    postalCode: formData.postalCode.trim(),
    unitNumber: unit || null,
    specialInstructions: notes || null,
    cityId: Number(formData.cityId),
    stateId: Number(formData.stateId),
    countryId: Number(formData.countryId),
  };
}

/** Build POST /wms/warehouses payload from form state */
export function buildWarehousePayload(formData) {
  return {
    warehouseName: formData.warehouseName.trim(),
    warehouseCode: formData.warehouseCode.trim().toUpperCase(),
    email: formData.email.trim(),
    phoneNumber: formData.phoneNumber.trim(),
    address: buildWarehouseAddressPayload(formData),
    manager: {
      firstName: formData.managerFirstName.trim(),
      lastName: formData.managerLastName.trim(),
      email: formData.managerEmail.trim(),
      password: formData.managerPassword,
    },
  };
}

/** Build PUT /wms/warehouses/{id} payload from form state */
export function buildWarehouseUpdatePayload(formData) {
  return {
    warehouseName: formData.warehouseName.trim(),
    warehouseCode: formData.warehouseCode.trim().toUpperCase(),
    email: formData.email.trim(),
    phoneNumber: formData.phoneNumber.trim(),
    address: buildWarehouseAddressPayload(formData),
  };
}

export function normalizeWarehouseToEditForm(warehouse) {
  const addr = warehouse?.address ?? {};
  return {
    warehouseName: warehouse?.warehouseName ?? '',
    warehouseCode: warehouse?.warehouseCode ?? '',
    email: warehouse?.email ?? '',
    phoneNumber: warehouse?.phoneNumber ?? '',
    streetName: addr.streetName ?? '',
    streetNumber: addr.streetNumber ?? '',
    postalCode: addr.postalCode ?? '',
    unitNumber: addr.unitNumber ?? '',
    operationalNotes: addr.specialInstructions ?? '',
    countryId: null,
    stateId: null,
    cityId: null,
  };
}

function matchByName(list, name) {
  if (!name || !Array.isArray(list)) return null;
  const target = String(name).trim().toLowerCase();
  const row = list.find((item) => String(item.name ?? '').trim().toLowerCase() === target);
  return row?.id ?? null;
}

/** Resolve address IDs from display names returned by GET list */
export async function resolveAddressIdsFromNames(address = {}) {
  const countries = await fetchCountries();
  const countryId = matchByName(countries, address.country);
  if (countryId == null) {
    return { countryId: null, stateId: null, cityId: null };
  }

  const provinces = await fetchProvincesByCountry(countryId);
  const stateId = matchByName(provinces, address.province);
  if (stateId == null) {
    return { countryId, stateId: null, cityId: null };
  }

  const cities = await fetchCitiesByProvince(stateId);
  const cityId = matchByName(cities, address.city);

  return { countryId, stateId, cityId };
}

export function computeChecklistSteps(formData) {
  const hasIdentity =
    Boolean(formData.warehouseName?.trim()) && Boolean(formData.warehouseCode?.trim());
  const hasLocation =
    formData.countryId != null &&
    formData.stateId != null &&
    formData.cityId != null;
  const hasManager =
    Boolean(formData.managerFirstName?.trim()) &&
    Boolean(formData.managerLastName?.trim()) &&
    Boolean(formData.managerEmail?.trim()) &&
    Boolean(formData.managerPassword);

  return {
    identity: hasIdentity,
    location: hasLocation,
    manager: hasManager,
    canProvision: hasIdentity && hasLocation && hasManager,
  };
}

export function computeEditChecklistSteps(formData) {
  const hasIdentity =
    Boolean(formData.warehouseName?.trim()) && Boolean(formData.warehouseCode?.trim());
  const hasLocation =
    formData.countryId != null &&
    formData.stateId != null &&
    formData.cityId != null;
  const hasContact =
    Boolean(formData.email?.trim()) && Boolean(formData.phoneNumber?.trim());

  return {
    identity: hasIdentity,
    location: hasLocation,
    contact: hasContact,
    canSave: hasIdentity && hasLocation && hasContact,
  };
}
