import api from './authService';
import { VendorType } from '../types';

// Mock data for demonstration
const mockVendors = [
  {
    id: '1',
    name: 'Michelin North America',
    type: VendorType.TIRE_MANUFACTURER,
    email: 'contact@michelin.com',
    phone: '+1-800-MICHELIN',
    address: {
      street: '1 Parkway South',
      city: 'Greenville',
      state: 'SC',
      zipCode: '29615',
      country: 'USA'
    },
    website: 'https://www.michelin.com',
    description: 'Leading tire manufacturer specializing in premium passenger and commercial tires',
    isActive: true,
    contacts: [
      {
        id: '1',
        firstName: 'Robert',
        lastName: 'Anderson',
        email: 'r.anderson@michelin.com',
        phone: '+1-555-0101',
        position: 'Sales Manager',
        isPrimary: true,
        vendorId: '1'
      },
      {
        id: '2',
        firstName: 'Lisa',
        lastName: 'Chen',
        email: 'l.chen@michelin.com',
        phone: '+1-555-0102',
        position: 'Account Executive',
        isPrimary: false,
        vendorId: '1'
      }
    ],
    leads: ['1'],
    createdAt: new Date(Date.now() - 2592000000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '2',
    name: 'Bridgestone Americas',
    type: VendorType.TIRE_MANUFACTURER,
    email: 'info@bridgestone.com',
    phone: '+1-800-BRIDGESTONE',
    address: {
      street: '200 4th Avenue South',
      city: 'Nashville',
      state: 'TN',
      zipCode: '37201',
      country: 'USA'
    },
    website: 'https://www.bridgestone.com',
    description: 'Global tire manufacturer offering comprehensive tire solutions',
    isActive: true,
    contacts: [
      {
        id: '3',
        firstName: 'David',
        lastName: 'Martinez',
        email: 'd.martinez@bridgestone.com',
        phone: '+1-555-0201',
        position: 'Regional Sales Director',
        isPrimary: true,
        vendorId: '2'
      }
    ],
    leads: ['2'],
    createdAt: new Date(Date.now() - 2160000000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: '3',
    name: 'Continental Tire',
    type: VendorType.TIRE_MANUFACTURER,
    email: 'sales@continental-tire.com',
    phone: '+1-800-CONTI-TIRE',
    address: {
      street: '1830 MacMillan Park Drive',
      city: 'Fort Mill',
      state: 'SC',
      zipCode: '29707',
      country: 'USA'
    },
    website: 'https://www.continental-tire.com',
    description: 'German tire manufacturer known for innovative tire technology',
    isActive: true,
    contacts: [
      {
        id: '4',
        firstName: 'Emma',
        lastName: 'Schmidt',
        email: 'e.schmidt@continental.com',
        phone: '+1-555-0301',
        position: 'Business Development Manager',
        isPrimary: true,
        vendorId: '3'
      }
    ],
    leads: [],
    createdAt: new Date(Date.now() - 1728000000).toISOString(),
    updatedAt: new Date(Date.now() - 259200000).toISOString()
  },
  {
    id: '4',
    name: 'TirePlus Distribution',
    type: VendorType.TIRE_DISTRIBUTOR,
    email: 'orders@tireplus.com',
    phone: '+1-555-TIRES',
    address: {
      street: '500 Industrial Blvd',
      city: 'Atlanta',
      state: 'GA',
      zipCode: '30309',
      country: 'USA'
    },
    website: 'https://www.tireplus.com',
    description: 'Regional tire distributor serving the Southeast market',
    isActive: true,
    contacts: [
      {
        id: '5',
        firstName: 'James',
        lastName: 'Thompson',
        email: 'j.thompson@tireplus.com',
        phone: '+1-555-0401',
        position: 'Sales Representative',
        isPrimary: true,
        vendorId: '4'
      }
    ],
    leads: [],
    createdAt: new Date(Date.now() - 1296000000).toISOString(),
    updatedAt: new Date(Date.now() - 432000000).toISOString()
  }
];

export const vendorsService = {
  getVendors: async (params = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredVendors = [...mockVendors];
        
        if (params.type) {
          filteredVendors = filteredVendors.filter(vendor => vendor.type === params.type);
        }
        
        if (params.isActive !== undefined) {
          filteredVendors = filteredVendors.filter(vendor => vendor.isActive === params.isActive);
        }
        
        if (params.search) {
          const searchLower = params.search.toLowerCase();
          filteredVendors = filteredVendors.filter(vendor => 
            vendor.name.toLowerCase().includes(searchLower) ||
            vendor.email.toLowerCase().includes(searchLower) ||
            vendor.description.toLowerCase().includes(searchLower)
          );
        }
        
        resolve({
          data: {
            vendors: filteredVendors,
            total: filteredVendors.length,
            page: params.page || 1,
            limit: params.limit || 10
          }
        });
      }, 500);
    });
  },

  getVendor: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const vendor = mockVendors.find(v => v.id === id);
        if (vendor) {
          resolve({ data: vendor });
        } else {
          reject(new Error('Vendor not found'));
        }
      }, 300);
    });
  },

  createVendor: async (vendorData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newVendor = {
          ...vendorData,
          id: Date.now().toString(),
          contacts: [],
          leads: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        mockVendors.unshift(newVendor);
        resolve({ data: newVendor });
      }, 500);
    });
  },

  updateVendor: async (id, vendorData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockVendors.findIndex(v => v.id === id);
        if (index !== -1) {
          mockVendors[index] = {
            ...mockVendors[index],
            ...vendorData,
            updatedAt: new Date().toISOString()
          };
          resolve({ data: mockVendors[index] });
        } else {
          reject(new Error('Vendor not found'));
        }
      }, 500);
    });
  },

  deleteVendor: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockVendors.findIndex(v => v.id === id);
        if (index !== -1) {
          mockVendors.splice(index, 1);
          resolve({ data: { success: true } });
        } else {
          reject(new Error('Vendor not found'));
        }
      }, 300);
    });
  },

  addContact: async (vendorId, contactData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const vendorIndex = mockVendors.findIndex(v => v.id === vendorId);
        if (vendorIndex !== -1) {
          const newContact = {
            ...contactData,
            id: Date.now().toString(),
            vendorId
          };
          mockVendors[vendorIndex].contacts.push(newContact);
          mockVendors[vendorIndex].updatedAt = new Date().toISOString();
          resolve({ data: newContact });
        } else {
          reject(new Error('Vendor not found'));
        }
      }, 300);
    });
  },

  updateContact: async (vendorId, contactId, contactData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const vendorIndex = mockVendors.findIndex(v => v.id === vendorId);
        if (vendorIndex !== -1) {
          const contactIndex = mockVendors[vendorIndex].contacts.findIndex(c => c.id === contactId);
          if (contactIndex !== -1) {
            mockVendors[vendorIndex].contacts[contactIndex] = {
              ...mockVendors[vendorIndex].contacts[contactIndex],
              ...contactData
            };
            mockVendors[vendorIndex].updatedAt = new Date().toISOString();
            resolve({ data: mockVendors[vendorIndex].contacts[contactIndex] });
          } else {
            reject(new Error('Contact not found'));
          }
        } else {
          reject(new Error('Vendor not found'));
        }
      }, 300);
    });
  },

  deleteContact: async (vendorId, contactId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const vendorIndex = mockVendors.findIndex(v => v.id === vendorId);
        if (vendorIndex !== -1) {
          const contactIndex = mockVendors[vendorIndex].contacts.findIndex(c => c.id === contactId);
          if (contactIndex !== -1) {
            mockVendors[vendorIndex].contacts.splice(contactIndex, 1);
            mockVendors[vendorIndex].updatedAt = new Date().toISOString();
            resolve({ data: { success: true } });
          } else {
            reject(new Error('Contact not found'));
          }
        } else {
          reject(new Error('Vendor not found'));
        }
      }, 300);
    });
  }
};

