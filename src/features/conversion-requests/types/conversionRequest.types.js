/**
 * ConversionRequest Types and Defaults
 */

export const ConversionRequestDefaults = {
  id: null,
  leadId: null,
  leadBusinessName: '',
  requestedById: null,
  requestedByEmail: '',
  assignedToId: null,
  assignedToEmail: '',
  status: 'PENDING',
  requestNotes: '',
  rejectionReason: null,
  reviewedById: null,
  reviewedByEmail: null,
  reviewedAt: null,
  createdAt: null,
  updatedAt: null,
};

/**
 * Type definition for ConversionRequest
 * @typedef {Object} ConversionRequest
 * @property {number} id
 * @property {number} leadId
 * @property {string} leadBusinessName
 * @property {number} requestedById
 * @property {string} requestedByEmail
 * @property {number} assignedToId
 * @property {string} assignedToEmail
 * @property {string} status - 'PENDING' | 'APPROVED' | 'REJECTED'
 * @property {string|null} requestNotes
 * @property {string|null} rejectionReason
 * @property {number|null} reviewedById
 * @property {string|null} reviewedByEmail
 * @property {string|null} reviewedAt
 * @property {string} createdAt
 * @property {string} updatedAt
 */
