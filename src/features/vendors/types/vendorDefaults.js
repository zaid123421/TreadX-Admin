import { VendorStatus } from '@/shared/types/enums';

export const defaultVendorRequest = {
  leadId: null,
  legalName: '',
  businessName: '',
  streetNumber: '',
  streetName: '',
  aptUnitBldg: '',
  postalCode: '',
  email: '',
  phoneNumber: '',
  status: VendorStatus.ACTIVE,
};

export const defaultVendorResponse = {
  id: null,
  legalName: '',
  businessName: '',
  email: '',
  phoneNumber: '',
  vendorUniqueId: '',
  status: VendorStatus.ACTIVE,
  streetNumber: '',
  streetName: '',
  aptUnitBldg: '',
  postalCode: '',
  totalUsers: 0,
  userRoles: {
    DEALER_ADMIN: 0,
    DEALER_TECHNICIAN: 0,
  },
};
