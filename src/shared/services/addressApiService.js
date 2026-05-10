import apiClient from '@/shared/services/apiClient';
import { API_ENDPOINTS } from '@/shared/services/endpoints';

/**
 * @typedef {{ id: number|string, name: string, iso3?: string }} CountryDTO
 * @typedef {{ id: number|string, name: string, stateCode?: string }} ProvinceDTO
 * @typedef {{ id: number|string, name: string }} CityDTO
 */

/**
 * Resolve list payloads: raw array, Spring Page `{ content: [...] }`, or `{ data: ... }` wrappers.
 */
function unwrapList(payload) {
  if (payload == null) return [];
  if (Array.isArray(payload)) return payload;
  if (typeof payload !== 'object') return [];

  const direct = [
    payload.content,
    payload.items,
    payload.results,
    payload.records,
    payload.countries,
    payload.provinces,
    payload.states,
    payload.cities,
    payload.data,
  ];

  for (const chunk of direct) {
    if (Array.isArray(chunk)) return chunk;
  }

  // Spring-style nested page: { data: { content: [...] } }
  if (payload.data != null && typeof payload.data === 'object') {
    const inner = payload.data;
    if (Array.isArray(inner)) return inner;
    if (Array.isArray(inner.content)) return inner.content;
    if (Array.isArray(inner.data)) return inner.data;
  }

  if (Array.isArray(payload.content?.content)) return payload.content.content;

  return [];
}

/**
 * Map varying DTO shapes to `{ id, name }` for selects.
 * Some APIs return `id: null` but provide `iso3`, `stateCode`, etc. — those are used as stable values.
 */
function normalizeRow(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const id =
    raw.id ??
    raw.value ??
    raw.countryId ??
    raw.provinceId ??
    raw.cityId ??
    raw.iso3 ??
    raw.iso2 ??
    raw.code ??
    raw.stateCode;

  if (id == null || id === '') return null;

  const name =
    raw.name ??
    raw.text ??
    raw.title ??
    raw.label ??
    raw.countryName ??
    raw.stateName ??
    raw.cityName ??
    '';

  return { id, name: String(name) };
}

function normalizeList(rows) {
  return unwrapList(rows).map(normalizeRow).filter((row) => row != null);
}

/**
 * Radix Select passes string values. Pure numeric strings → number (for real DB ids);
 * otherwise keep string (e.g. ISO 3166 alpha-3 when `id` is null on the server).
 */
export function parseAddressSelectValue(value) {
  if (value == null || value === '') return null;
  const s = String(value);
  if (/^\d+$/.test(s)) return Number(s);
  return s;
}

function isNumericAddressId(v) {
  if (v == null || v === '') return false;
  if (typeof v === 'number' && Number.isFinite(v)) return true;
  return typeof v === 'string' && /^\d+$/.test(v.trim());
}

async function getNormalizedList(url) {
  const { data } = await apiClient.get(url);
  return normalizeList(data);
}

/** @returns {Promise<CountryDTO[]>} */
export async function fetchCountries() {
  const { data } = await apiClient.get(API_ENDPOINTS.ADDRESS_COUNTRIES);
  return normalizeList(data);
}

/**
 * Provinces for a country. Docs use numeric `{countryId}`; if the countries API returns `id: null`,
 * the UI stores `iso3` (e.g. SYR). The path `/countries/SYR/provinces` often 404s; we then try query URLs.
 */
export async function fetchProvincesByCountry(countryId) {
  if (countryId == null || countryId === '') return [];
  const enc = encodeURIComponent(String(countryId));
  const numeric = isNumericAddressId(countryId);

  if (numeric) {
    return getNormalizedList(API_ENDPOINTS.ADDRESS_PROVINCES_BY_COUNTRY(enc));
  }

  const q = API_ENDPOINTS.ADDRESS_PROVINCES_QUERY;
  const urls = [
    API_ENDPOINTS.ADDRESS_PROVINCES_BY_COUNTRY(enc),
    `${q}?countryIso3=${enc}`,
    `${q}?iso3=${enc}`,
    `${q}?countryCode=${enc}`,
  ];

  let lastError;
  let anyOk = false;
  for (const url of urls) {
    try {
      const list = await getNormalizedList(url);
      anyOk = true;
      if (list.length > 0) return list;
    } catch (e) {
      lastError = e;
    }
  }
  if (anyOk) return [];
  if (lastError) throw lastError;
  return [];
}

/**
 * Cities for a province/state. Same pattern when `id` is null and `stateCode` is used in the UI.
 */
export async function fetchCitiesByProvince(stateId) {
  if (stateId == null || stateId === '') return [];
  const enc = encodeURIComponent(String(stateId));
  const numeric = isNumericAddressId(stateId);

  if (numeric) {
    return getNormalizedList(API_ENDPOINTS.ADDRESS_CITIES_BY_PROVINCE(enc));
  }

  const q = API_ENDPOINTS.ADDRESS_CITIES_QUERY;
  const urls = [
    API_ENDPOINTS.ADDRESS_CITIES_BY_PROVINCE(enc),
    `${q}?stateId=${enc}`,
    `${q}?stateCode=${enc}`,
    `${q}?provinceId=${enc}`,
  ];

  let lastError;
  let anyOk = false;
  for (const url of urls) {
    try {
      const list = await getNormalizedList(url);
      anyOk = true;
      if (list.length > 0) return list;
    } catch (e) {
      lastError = e;
    }
  }
  if (anyOk) return [];
  if (lastError) throw lastError;
  return [];
}
