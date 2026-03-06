// Utility functions for formatting and validation

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