// Utility functions for dealer management

/**
 * Formats a dealer ID to the new format: Country(3) + Province(2) + City(3) + DealerId(7) = 15 digits
 * @param {number|string} dealerId - The dealer ID
 * @returns {string} - The formatted dealer ID
 */
export const formatDealerId = (dealerId) => {
  if (!dealerId) return '';
  
  // Convert to string and ensure it's a number
  const id = parseInt(dealerId);
  if (isNaN(id)) return dealerId;
  
  // Format as 001010001 + dealer ID (padded to 7 digits)
  const paddedId = id.toString().padStart(7, '0');
  return `001010001${paddedId}`;
};

/**
 * Validates if a dealer ID follows the correct format
 * @param {string} dealerId - The dealer ID to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateDealerId = (dealerId) => {
  if (!dealerId) return false;
  
  // Check if it starts with 001010001 and has exactly 15 digits total
  // Format: Country(3) + Province(2) + City(4) + DealerId(6) = 15 digits
  const pattern = /^001010001\d{6}$/;
  return pattern.test(dealerId) && dealerId.length === 15;
};

/**
 * Extracts the original dealer ID from the formatted ID
 * @param {string} formattedId - The formatted dealer ID
 * @returns {number|null} - The original dealer ID or null if invalid
 */
export const extractDealerId = (formattedId) => {
  if (!formattedId || !validateDealerId(formattedId)) {
    return null;
  }
  
  // Remove the prefix and convert to number
  const originalId = formattedId.replace('001010001', '');
  const id = parseInt(originalId);
  return isNaN(id) ? null : id;
};

/**
 * Formats dealer ID for display with proper spacing
 * @param {string} dealerId - The dealer ID
 * @returns {string} - The formatted display string
 */
export const formatDealerIdForDisplay = (dealerId) => {
  if (!dealerId) return '';
  
  // If it's already in the correct 15-digit format, return as is
  if (validateDealerId(dealerId)) {
    return dealerId;
  }
  
  // If it's a plain number, format it
  const id = parseInt(dealerId);
  if (!isNaN(id)) {
    return formatDealerId(id);
  }
  
  // If it's neither valid format nor a plain number, return as is
  return dealerId;
};

/**
 * Normalizes dealer ID by converting Arabic numerals to standard digits
 * @param {string} dealerId - The dealer ID that might contain Arabic numerals
 * @returns {string} - The normalized dealer ID with standard digits
 */
export const normalizeDealerId = (dealerId) => {
  if (!dealerId) return '';
  
  // Convert Arabic numerals to standard digits
  return dealerId
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
export const displayDealerId = (dealerId) => {
  if (!dealerId) return '';
  return normalizeDealerId(dealerId);
};

/** Inline badge styles for dealer status (lists + detail) */
export const DEALER_STATUS_BADGE_STYLES = {
  ACTIVE: {
    backgroundColor: 'var(--color-success-main-light)',
    color: 'var(--color-secondary-on-surface)',
  },
  INACTIVE: {
    backgroundColor: 'var(--color-error-main)',
    color: 'var(--color-secondary-on-surface)',
  },
}; 