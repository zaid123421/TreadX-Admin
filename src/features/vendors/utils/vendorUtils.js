// Utility functions for vendor management

/**
 * Formats a vendor ID to the new format: Country(3) + Province(2) + City(3) + VendorId(7) = 15 digits
 * @param {number|string} vendorId - The vendor ID
 * @returns {string} - The formatted vendor ID
 */
export const formatVendorId = (vendorId) => {
  if (!vendorId) return '';
  
  // Convert to string and ensure it's a number
  const id = parseInt(vendorId);
  if (isNaN(id)) return vendorId;
  
  // Format as 001010001 + vendor ID (padded to 7 digits)
  const paddedId = id.toString().padStart(7, '0');
  return `001010001${paddedId}`;
};

/**
 * Validates if a vendor ID follows the correct format
 * @param {string} vendorId - The vendor ID to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateVendorId = (vendorId) => {
  if (!vendorId) return false;
  
  // Check if it starts with 001010001 and has exactly 15 digits total
  // Format: Country(3) + Province(2) + City(4) + VendorId(6) = 15 digits
  const pattern = /^001010001\d{6}$/;
  return pattern.test(vendorId) && vendorId.length === 15;
};

/**
 * Extracts the original vendor ID from the formatted ID
 * @param {string} formattedId - The formatted vendor ID
 * @returns {number|null} - The original vendor ID or null if invalid
 */
export const extractVendorId = (formattedId) => {
  if (!formattedId || !validateVendorId(formattedId)) {
    return null;
  }
  
  // Remove the prefix and convert to number
  const originalId = formattedId.replace('001010001', '');
  const id = parseInt(originalId);
  return isNaN(id) ? null : id;
};

/**
 * Formats vendor ID for display with proper spacing
 * @param {string} vendorId - The vendor ID
 * @returns {string} - The formatted display string
 */
export const formatVendorIdForDisplay = (vendorId) => {
  if (!vendorId) return '';
  
  // If it's already in the correct 15-digit format, return as is
  if (validateVendorId(vendorId)) {
    return vendorId;
  }
  
  // If it's a plain number, format it
  const id = parseInt(vendorId);
  if (!isNaN(id)) {
    return formatVendorId(id);
  }
  
  // If it's neither valid format nor a plain number, return as is
  return vendorId;
};

/**
 * Normalizes vendor ID by converting Arabic numerals to standard digits
 * @param {string} vendorId - The vendor ID that might contain Arabic numerals
 * @returns {string} - The normalized vendor ID with standard digits
 */
export const normalizeVendorId = (vendorId) => {
  if (!vendorId) return '';
  
  // Convert Arabic numerals to standard digits
  return vendorId
    .replace(/٠/g, '0')
    .replace(/١/g, '1')
    .replace(/٢/g, '2')
    .replace(/٣/g, '3')
    .replace(/٤/g, '4')
    .replace(/٥/g, '5')
    .replace(/٦/g, '6')
    .replace(/٧/g, '7')
    .replace(/٨/g, '8')
    .replace(/٩/g, '9');
};

/**
 * Simple display function that just normalizes and returns the ID
 * Use this when you want to display the ID exactly as received from backend
 */
export const displayVendorId = (vendorId) => {
  if (!vendorId) return '';
  return normalizeVendorId(vendorId);
};

/** Inline badge styles for vendor status (lists + detail) */
export const VENDOR_STATUS_BADGE_STYLES = {
  ACTIVE: {
    backgroundColor: 'var(--color-success-main-light)',
    color: 'var(--color-secondary-on-surface)',
  },
  INACTIVE: {
    backgroundColor: 'var(--color-error-main)',
    color: 'var(--color-secondary-on-surface)',
  },
}; 