import { DealerStatus } from '@/shared/types/enums';

export const defaultDealerRequest = {
  leadId: null,
  legalName: '',
  businessName: '',
  streetNumber: '',
  streetName: '',
  aptUnitBldg: '',
  postalCode: '',
  email: '',
  phoneNumber: '',
  status: DealerStatus.ACTIVE,
};

export const defaultDealerResponse = {
  id: null,
  legalName: '',
  businessName: '',
  email: '',
  phoneNumber: '',
  dealerUniqueId: '',
  status: DealerStatus.ACTIVE,
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
