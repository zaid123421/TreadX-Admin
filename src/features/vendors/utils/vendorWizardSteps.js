import { Building2, Mail, MapPin, Users, CheckCircle } from 'lucide-react';

export const getVendorWizardSteps = (hasLeadId) =>
  hasLeadId
    ? [
        {
          id: 'business',
          title: 'Business Information',
          description: 'Enter the legal and business name',
          icon: Building2,
          fields: ['legalName', 'businessName'],
        },
        {
          id: 'contact',
          title: 'Contact Information',
          description: 'Add email and phone number',
          icon: Mail,
          fields: ['email', 'phoneNumber'],
        },
        {
          id: 'address',
          title: 'Address',
          description: 'Provide the business address',
          icon: MapPin,
          fields: ['streetNumber', 'streetName', 'aptUnitBldg', 'postalCode'],
        },
        {
          id: 'user-access',
          title: 'User Access Management',
          description: 'Configure user roles and access',
          icon: Users,
          fields: ['totalUsers', 'userRoles'],
        },
        {
          id: 'onboarding',
          title: 'Subscription & Admin Setup',
          description: 'Select a plan and admin invitation details',
          icon: Users,
          fields: ['subscriptionPlanId', 'adminFirstName', 'adminLastName', 'adminEmail'],
        },
        {
          id: 'review',
          title: 'Review & Submit',
          description: 'Review all information before submitting',
          icon: CheckCircle,
          fields: ['status'],
        },
      ]
    : [
        {
          id: 'select-lead',
          title: 'Select Contacted Lead',
          description: 'Choose a contacted lead to convert to a vendor',
          icon: Building2,
          fields: [],
        },
        {
          id: 'business',
          title: 'Business Information',
          description: 'Enter the legal and business name',
          icon: Building2,
          fields: ['legalName', 'businessName'],
        },
        {
          id: 'contact',
          title: 'Contact Information',
          description: 'Add email and phone number',
          icon: Mail,
          fields: ['email', 'phoneNumber'],
        },
        {
          id: 'address',
          title: 'Address',
          description: 'Provide the business address',
          icon: MapPin,
          fields: ['streetNumber', 'streetName', 'aptUnitBldg', 'postalCode'],
        },
        {
          id: 'user-access',
          title: 'User Access Management',
          description: 'Configure user roles and access',
          icon: Users,
          fields: ['totalUsers', 'userRoles'],
        },
        {
          id: 'onboarding',
          title: 'Subscription & Admin Setup',
          description: 'Select a plan and admin invitation details',
          icon: Users,
          fields: ['subscriptionPlanId', 'adminFirstName', 'adminLastName', 'adminEmail'],
        },
        {
          id: 'review',
          title: 'Review & Submit',
          description: 'Review all information before submitting',
          icon: CheckCircle,
          fields: ['status'],
        },
      ];
