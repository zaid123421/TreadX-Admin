import { defaultLeadRequest } from '@/features/leads/types/leadDefaults';

/**
 * Split embedded "Contact: …" prefix from notes (wizard / API round-trip).
 */
export const splitContactFromNotes = (lead) => {
  const raw = lead?.notes ?? '';
  const m = raw.match(/^Contact:\s*([\s\S]*?)(?:\n\n|$)/);
  if (m) {
    return {
      contactName: m[1].trim(),
      notes: raw.slice(m[0].length).trim(),
    };
  }
  return {
    contactName: lead?.contactName?.trim() ? lead.contactName : '',
    notes: raw,
  };
};

const str = (v) => (v == null || v === '' ? '' : String(v));

export const normalizeLeadToForm = (lead) => {
  if (!lead) return { ...defaultLeadRequest };
  const addr = lead.address || {};
  const { contactName, notes } = splitContactFromNotes(lead);
  return {
    ...defaultLeadRequest,
    id: lead.id,
    businessName: str(lead.businessName),
    contactName,
    contactEmail: str(lead.contactEmail),
    phoneNumber: str(lead.phoneNumber),
    streetNumber: str(lead.streetNumber ?? addr.streetNumber),
    streetName: str(lead.streetName ?? addr.streetName),
    aptUnitBldg: str(lead.aptUnitBldg ?? addr.unitNumber),
    postalCode: str(lead.postalCode ?? addr.postalCode),
    cityId: lead.cityId ?? addr.cityId ?? null,
    stateId: lead.stateId ?? addr.stateId ?? null,
    countryId: lead.countryId ?? addr.countryId ?? null,
    source: lead.source ?? defaultLeadRequest.source,
    sourceUrl: lead.sourceUrl ?? '',
    uploadedFile: lead.uploadedFile ?? '',
    status: lead.status ?? defaultLeadRequest.status,
    notes,
    dealerId: lead.dealerId ?? lead.dealerId ?? null,
  };
};

export const buildNotesForApi = (formData) => {
  const parts = [];
  if (formData.contactName?.trim()) parts.push(`Contact: ${formData.contactName.trim()}`);
  if (formData.notes?.trim()) parts.push(formData.notes.trim());
  return parts.join('\n\n');
};
