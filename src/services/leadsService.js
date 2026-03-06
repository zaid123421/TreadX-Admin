import api from './authService';
import { LeadStatus, TireCategory } from '../types';

// Mock data for demonstration
const mockLeads = [
  {
    id: '1',
    title: 'Commercial Fleet Tire Order',
    description: 'Large order for commercial truck tires for logistics company',
    status: LeadStatus.QUALIFIED,
    priority: 'high',
    estimatedValue: 25000,
    customerName: 'John Smith',
    customerEmail: 'john.smith@logistics.com',
    customerPhone: '+1-555-0123',
    customerCompany: 'Swift Logistics',
    assignedUserId: '3',
    vendorId: '1',
    tireCategory: TireCategory.COMMERCIAL,
    quantity: 50,
    notes: 'Customer needs delivery by end of month',
    attachments: [],
    activities: [
      {
        id: '1',
        type: 'note',
        description: 'Initial contact made, customer interested',
        userId: '3',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '2',
    title: 'Passenger Car Tire Replacement',
    description: 'Individual customer looking for premium passenger tires',
    status: LeadStatus.CONTACTED,
    priority: 'medium',
    estimatedValue: 800,
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.j@email.com',
    customerPhone: '+1-555-0456',
    customerCompany: '',
    assignedUserId: '3',
    vendorId: '2',
    tireCategory: TireCategory.PASSENGER,
    quantity: 4,
    notes: 'Customer prefers Michelin brand',
    attachments: [],
    activities: [],
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: '3',
    title: 'Motorcycle Tire Bulk Order',
    description: 'Motorcycle dealership needs various motorcycle tires',
    status: LeadStatus.NEW,
    priority: 'medium',
    estimatedValue: 5000,
    customerName: 'Mike Wilson',
    customerEmail: 'mike@bikeshop.com',
    customerPhone: '+1-555-0789',
    customerCompany: 'Wilson Motorcycles',
    assignedUserId: '',
    vendorId: '',
    tireCategory: TireCategory.MOTORCYCLE,
    quantity: 25,
    notes: 'Mix of sport and touring tires needed',
    attachments: [],
    activities: [],
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    updatedAt: new Date(Date.now() - 345600000).toISOString()
  }
];

export const leadsService = {
  getLeads: async (params = {}) => {
    // Mock API call with filtering
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredLeads = [...mockLeads];
        
        if (params.status) {
          filteredLeads = filteredLeads.filter(lead => lead.status === params.status);
        }
        
        if (params.assignedUserId) {
          filteredLeads = filteredLeads.filter(lead => lead.assignedUserId === params.assignedUserId);
        }
        
        if (params.search) {
          const searchLower = params.search.toLowerCase();
          filteredLeads = filteredLeads.filter(lead => 
            lead.title.toLowerCase().includes(searchLower) ||
            lead.customerName.toLowerCase().includes(searchLower) ||
            lead.customerCompany.toLowerCase().includes(searchLower)
          );
        }
        
        resolve({
          data: {
            leads: filteredLeads,
            total: filteredLeads.length,
            page: params.page || 1,
            limit: params.limit || 10
          }
        });
      }, 500);
    });
  },

  getLead: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const lead = mockLeads.find(l => l.id === id);
        if (lead) {
          resolve({ data: lead });
        } else {
          reject(new Error('Lead not found'));
        }
      }, 300);
    });
  },

  createLead: async (leadData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newLead = {
          ...leadData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          activities: []
        };
        mockLeads.unshift(newLead);
        resolve({ data: newLead });
      }, 500);
    });
  },

  updateLead: async (id, leadData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockLeads.findIndex(l => l.id === id);
        if (index !== -1) {
          mockLeads[index] = {
            ...mockLeads[index],
            ...leadData,
            updatedAt: new Date().toISOString()
          };
          resolve({ data: mockLeads[index] });
        } else {
          reject(new Error('Lead not found'));
        }
      }, 500);
    });
  },

  deleteLead: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockLeads.findIndex(l => l.id === id);
        if (index !== -1) {
          mockLeads.splice(index, 1);
          resolve({ data: { success: true } });
        } else {
          reject(new Error('Lead not found'));
        }
      }, 300);
    });
  },

  updateLeadStatus: async (id, status) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockLeads.findIndex(l => l.id === id);
        if (index !== -1) {
          mockLeads[index].status = status;
          mockLeads[index].updatedAt = new Date().toISOString();
          resolve({ data: mockLeads[index] });
        } else {
          reject(new Error('Lead not found'));
        }
      }, 300);
    });
  },

  assignLead: async (id, userId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockLeads.findIndex(l => l.id === id);
        if (index !== -1) {
          mockLeads[index].assignedUserId = userId;
          mockLeads[index].updatedAt = new Date().toISOString();
          resolve({ data: mockLeads[index] });
        } else {
          reject(new Error('Lead not found'));
        }
      }, 300);
    });
  },

  addActivity: async (leadId, activity) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockLeads.findIndex(l => l.id === leadId);
        if (index !== -1) {
          const newActivity = {
            ...activity,
            id: Date.now().toString(),
            createdAt: new Date().toISOString()
          };
          mockLeads[index].activities.unshift(newActivity);
          mockLeads[index].updatedAt = new Date().toISOString();
          resolve({ data: newActivity });
        } else {
          reject(new Error('Lead not found'));
        }
      }, 300);
    });
  }
};

