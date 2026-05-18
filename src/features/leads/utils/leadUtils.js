// Utility functions for formatting and validation

import { ContactMethod, LeadStatus } from '@/shared/types/enums';

/**
 * Parse backend date array [y,m,d,h,min,s,nanos] to Date.
 * @param {number[]|unknown} arr
 * @returns {Date|null}
 */
export const parseBackendDate = (arr) => {
  if (!Array.isArray(arr)) return null;
  return new Date(
    arr[0],
    arr[1] - 1,
    arr[2],
    arr[3],
    arr[4],
    arr[5],
    Math.floor(arr[6] / 1000000)
  );
};

/** Short locale date for tables/lists */
export const formatLeadDateShort = (arr) => {
  const d = parseBackendDate(arr);
  if (!d) return 'N/A';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/** Long locale date for detail screens */
export const formatLeadDateDetail = (arr) => {
  const d = parseBackendDate(arr);
  if (!d) return 'N/A';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getBusinessInitials = (businessName) => {
  if (!businessName) return '';
  return businessName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Status counts for current page of leads; `total` uses server totalElements.
 */
export const computeLeadsStatusStats = (leads, totalElements) => {
  const stats = {
    total: totalElements,
    pending: 0,
    approved: 0,
    contacted: 0,
    denied: 0,
    pendingConversion: 0,
    unqualified: 0,
  };
  leads.forEach((lead) => {
    switch (lead.status) {
      case LeadStatus.PENDING:
        stats.pending++;
        break;
      case LeadStatus.APPROVED:
        stats.approved++;
        break;
      case LeadStatus.CONTACTED:
        stats.contacted++;
        break;
      case LeadStatus.DENIED:
        stats.denied++;
        break;
      case LeadStatus.PENDING_CONVERSION:
        stats.pendingConversion++;
        break;
      case LeadStatus.UNQUALIFIED:
        stats.unqualified++;
        break;
      default:
        break;
    }
  });
  return stats;
};

export const filterLeadsBySearchAndSource = (leads, searchTerm, sourceFilter) => {
  return leads.filter((lead) => {
    const matchesSearch =
      !searchTerm ||
      lead.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phoneNumber.includes(searchTerm) ||
      (lead.notes && lead.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
    return matchesSearch && matchesSource;
  });
};

/**
 * Resolve download filename from Content-Disposition, uploadedFile hint, and blob mime type.
 * Mirrors previous LeadDetailView download behavior.
 */
export const resolveLeadDownloadFilename = (contentDisposition, leadId, uploadedFile, blobData) => {
  let filename = `lead-${leadId}-document`;

  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1].replace(/['"]/g, '');
    }
  }

  if (filename === `lead-${leadId}-document` && uploadedFile) {
    const originalFilename = uploadedFile.split('/').pop();
    if (originalFilename && originalFilename.includes('.')) {
      filename = originalFilename;
    }
  }

  let finalFilename = filename;

  if (!finalFilename.includes('.')) {
    const mimeType = blobData.type;
    const mimeExtMap = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/bmp': '.bmp',
      'image/tiff': '.tiff',
      'application/pdf': '.pdf',
      'application/msword': '.doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
      'application/vnd.ms-excel': '.xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    };
    const ext =
      mimeExtMap[mimeType] || (mimeType.startsWith('image/') ? '.png' : '.bin');
    finalFilename = filename + ext;
  }

  return finalFilename;
};

/**
 * Format postal code to Canadian format and uppercase
 * @param {string} postalCode - Raw postal code input
 * @returns {string} Formatted postal code (e.g., "A1A 1A1")
 */
export const formatPostalCode = (postalCode) => {
  if (!postalCode) return '';
  
  // Remove all non-alphanumeric characters and convert to uppercase
  let cleaned = postalCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  
  // Canadian postal code format: A1A 1A1
  if (cleaned.length >= 6) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)}`;
  }
  
  return cleaned;
};

/**
 * Validate postal code format
 * @param {string} postalCode - Postal code to validate
 * @returns {boolean} True if valid Canadian postal code format
 */
export const validatePostalCode = (postalCode) => {
  if (!postalCode) return false;
  
  // Canadian postal code regex: A1A 1A1 format
  const postalRegex = /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/;
  return postalRegex.test(postalCode.toUpperCase());
};

/**
 * Format phone number to Canadian format
 * @param {string} phone - Raw phone number input
 * @returns {string} Formatted phone number (e.g., "+1 (555) 123-4567")
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If it starts with 1, remove it (we'll add it back)
  if (cleaned.startsWith('1') && cleaned.length === 11) {
    cleaned = cleaned.slice(1);
  }
  
  // Format as Canadian number: +1 (XXX) XXX-XXXX
  if (cleaned.length >= 10) {
    const areaCode = cleaned.slice(0, 3);
    const prefix = cleaned.slice(3, 6);
    const lineNumber = cleaned.slice(6, 10);
    return `+1 (${areaCode}) ${prefix}-${lineNumber}`;
  } else if (cleaned.length >= 6) {
    const areaCode = cleaned.slice(0, 3);
    const prefix = cleaned.slice(3, 6);
    return `+1 (${areaCode}) ${prefix}`;
  } else if (cleaned.length >= 3) {
    const areaCode = cleaned.slice(0, 3);
    return `+1 (${areaCode})`;
  } else if (cleaned.length > 0) {
    return `+1 (${cleaned}`;
  }
  
  return '';
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid Canadian phone number format
 */
export const validatePhoneNumber = (phone) => {
  if (!phone) return false;
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // For Canadian phone numbers, we need exactly 10 digits for the actual phone number
  // If it has 11 digits and starts with 1, remove the country code and check
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    // Remove the country code (first digit) and check if remaining is 10 digits
    const phoneDigits = cleaned.slice(1);
    return phoneDigits.length === 10;
  }
  
  // Check for exactly 10 digits (standard Canadian format without country code)
  if (cleaned.length === 10) {
    return true;
  }
  
  return false;
};

/**
 * Format street number to numbers only
 * @param {string} streetNumber - Raw street number input
 * @returns {string} Numbers only
 */
export const formatStreetNumber = (streetNumber) => {
  if (!streetNumber) return '';
  
  // Remove all non-digit characters
  return streetNumber.replace(/\D/g, '');
};

/**
 * Validate street number (numbers only)
 * @param {string} streetNumber - Street number to validate
 * @returns {boolean} True if contains only numbers
 */
export const validateStreetNumber = (streetNumber) => {
  if (!streetNumber) return false;
  
  // Check if contains only digits
  return /^\d+$/.test(streetNumber);
};

/**
 * Handle postal code input change with auto-formatting
 * @param {string} value - Raw input value
 * @param {function} onChange - Change handler function
 */
export const handlePostalCodeChange = (value, onChange) => {
  const formatted = formatPostalCode(value);
  onChange(formatted);
};

/**
 * Handle phone number input change with auto-formatting
 * @param {string} value - Raw input value
 * @param {function} onChange - Change handler function
 */
export const handlePhoneNumberChange = (value, onChange) => {
  // If the value is empty, just return empty string
  if (!value || value.trim() === '') {
    onChange('');
    return;
  }
  
  // If the value already starts with +1, don't reformat it (user is editing)
  if (value.startsWith('+1')) {
    onChange(value);
    return;
  }
  
  // Remove any existing formatting to get just digits
  const cleaned = value.replace(/\D/g, '');
  
  // Only format if we have exactly 10 digits (Canadian phone number)
  if (cleaned.length === 10) {
    const areaCode = cleaned.slice(0, 3);
    const prefix = cleaned.slice(3, 6);
    const lineNumber = cleaned.slice(6, 10);
    onChange(`+1 (${areaCode}) ${prefix}-${lineNumber}`);
  } else {
    // For any other length, just pass the cleaned digits
    onChange(cleaned);
  }
};

/**
 * Handle street number input change with numbers-only
 * @param {string} value - Raw input value
 * @param {function} onChange - Change handler function
 */
export const handleStreetNumberChange = (value, onChange) => {
  const formatted = formatStreetNumber(value);
  onChange(formatted);
};

export const getStatusColor = (status) => {
  switch (status) {
    case LeadStatus.PENDING:
      return {
        backgroundColor: 'var(--color-primary-main-dark)',
        color: 'var(--color-primary-on-container)',
      };
    case LeadStatus.APPROVED:
      return {
        backgroundColor: 'var(--color-success-main-light)',
        color: 'var(--color-secondary-on-surface)',
      };
    case LeadStatus.DENIED:
      return {
        backgroundColor: 'var(--color-error-main)',
        color: 'var(--color-secondary-on-surface)',
      };
    case LeadStatus.CONTACTED:
      return {
        backgroundColor: 'var(--color-info-main)',
        color: 'var(--color-secondary-on-surface)',
      };
    case LeadStatus.PENDING_CONVERSION:
      return {
        backgroundColor: 'var(--color-warning-main-light)',
        color: 'var(--color-secondary-on-surface)',
      };
    case LeadStatus.UNQUALIFIED:
      return {
        backgroundColor: 'var(--color-surface-light-container)',
        color: 'var(--color-secondary-main)',
      };
    case LeadStatus.DONE:
      return {
        backgroundColor: 'var(--color-secondary-main)',
        color: 'var(--color-secondary-on-surface)',
      };
    default:
      return {
        backgroundColor: 'var(--color-surface-light-container)',
        color: 'var(--color-secondary-main)',
      };
  }
};

export const getStatusLabel = (status) => {
  return status.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
};

export const getContactMethodLabel = (method) => {
  switch (method) {
    case ContactMethod.MAIL_EMAIL:
      return 'Email';
    case ContactMethod.TEXT:
      return 'Text Message';
    case ContactMethod.PHONE:
      return 'Phone Call';
    case ContactMethod.OTHER:
      return 'Other';
    default:
      return method;
  }
}; 