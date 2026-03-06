// Type definitions for TreadX Sales Management

// User and Authentication types
export const UserRole = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  SALES_REP: 'sales_rep',
  MECHANIC: 'mechanic'
};

export const LeadStatus = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  PROPOSAL_SENT: 'proposal_sent',
  NEGOTIATING: 'negotiating',
  ACCEPTED: 'accepted',
  DENIED: 'denied',
  CLOSED_WON: 'closed_won',
  CLOSED_LOST: 'closed_lost'
};

export const VendorType = {
  TIRE_MANUFACTURER: 'tire_manufacturer',
  TIRE_DISTRIBUTOR: 'tire_distributor',
  EQUIPMENT_SUPPLIER: 'equipment_supplier',
  SERVICE_PROVIDER: 'service_provider'
};

export const TireCategory = {
  PASSENGER: 'passenger',
  COMMERCIAL: 'commercial',
  MOTORCYCLE: 'motorcycle',
  AGRICULTURAL: 'agricultural',
  INDUSTRIAL: 'industrial',
  SPECIALTY: 'specialty'
};

// Default objects for form initialization
export const defaultUser = {
  id: '',
  email: '',
  firstName: '',
  lastName: '',
  role: UserRole.SALES_REP,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const defaultLead = {
  id: '',
  title: '',
  description: '',
  status: LeadStatus.NEW,
  priority: 'medium',
  estimatedValue: 0,
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  customerCompany: '',
  assignedUserId: '',
  vendorId: '',
  tireCategory: TireCategory.PASSENGER,
  quantity: 0,
  notes: '',
  attachments: [],
  activities: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const defaultVendor = {
  id: '',
  name: '',
  type: VendorType.TIRE_MANUFACTURER,
  email: '',
  phone: '',
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  },
  website: '',
  description: '',
  isActive: true,
  contacts: [],
  leads: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const defaultContact = {
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  position: '',
  isPrimary: false,
  vendorId: ''
};

export const defaultActivity = {
  id: '',
  type: 'note',
  description: '',
  userId: '',
  leadId: '',
  createdAt: new Date().toISOString()
};

// Validation helpers
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

