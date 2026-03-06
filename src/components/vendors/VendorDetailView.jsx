import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Mail, Phone, MapPin, User, Building2, Users, Shield, UserCheck, Wrench } from 'lucide-react';
import { formatPostalCode, formatPhoneNumber } from '../../utils/formatters';
import { formatVendorIdForDisplay, normalizeVendorId, displayVendorId } from '../../utils/vendorUtils';
import vendorsService from '../../services/vendorsApiService';
import { UserRole } from '../../types/api';
import ErrorPage from '../ui/ErrorPage';

const statusColors = {
  ACTIVE: { backgroundColor: '#28A745', color: '#fff' },
  INACTIVE: { backgroundColor: '#DC3545', color: '#fff' },
};

const VendorDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    loadVendor();
    // eslint-disable-next-line
  }, [id]);

  const loadVendor = async () => {
    try {
      setLoading(true);
      setError(null);
      const vendorData = await vendorsService.getVendor(id);
      setVendor(vendorData);
    } catch (err) {
      console.error('Error loading vendor:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Show error page if there's an error
  if (error) {
    return (
      <ErrorPage
        error={error}
        onRetry={loadVendor}
        onGoBack={() => navigate('/vendors')}
        onGoHome={() => navigate('/')}
        title="Failed to Load Vendor"
        showDetails={process.env.NODE_ENV === 'development'}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vendor information...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <ErrorPage
        error={{ message: 'Vendor not found' }}
        onGoBack={() => navigate('/vendors')}
        onGoHome={() => navigate('/')}
        title="Vendor Not Found"
        showDetails={false}
      />
    );
  }

  return (
    <div className="flex flex-col items-center min-h-[60vh] bg-gray-50 py-8">
      <div className="w-full max-w-2xl mb-4">
        <Button variant="outline" onClick={() => navigate('/vendors')}>
          &larr; Back to Vendors
        </Button>
      </div>
      <Card className="w-full max-w-2xl shadow-xl rounded-2xl border-0">
        <CardHeader className="flex flex-row items-center justify-between bg-white rounded-t-2xl border-b p-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 rounded-full h-14 w-14 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold mb-1">{vendor.businessName}</CardTitle>
              <Badge style={{...statusColors[vendor.status], fontWeight: 600, fontSize: 13, borderRadius: 999, padding: '2px 12px'}}>
                {vendor.status}
              </Badge>
            </div>
          </div>
          {/* Edit and Delete buttons removed - vendors cannot be modified after creation */}
        </CardHeader>
        <CardContent className="p-6 bg-white rounded-b-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-700">
                <User className="h-5 w-5 text-gray-400" />
                <span className="font-semibold">Legal Name:</span>
                <span>{vendor.legalName}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Mail className="h-5 w-5 text-gray-400" />
                <span className="font-semibold">Email:</span>
                <span>{vendor.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="h-5 w-5 text-gray-400" />
                <span className="font-semibold">Phone:</span>
                <span>{formatPhoneNumber(vendor.phoneNumber)}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="h-5 w-5 text-gray-400" />
                <span className="font-semibold">Address:</span>
                <span>{vendor.streetNumber} {vendor.streetName} {vendor.aptUnitBldg || ''} {formatPostalCode(vendor.postalCode)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <span className="font-semibold">Vendor ID:</span>
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                  {displayVendorId(vendor.vendorUniqueId)}
                </span>
              </div>
            </div>
          </div>

          {/* User Access Information */}
          {vendor.totalUsers && vendor.userRoles && (
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-gray-400" />
                <h3 className="text-lg font-semibold">User Access Configuration</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Total Users</span>
                    <Badge variant="outline">{vendor.totalUsers}</Badge>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {Object.entries(vendor.userRoles || {}).map(([role, count]) => {
                    const roleConfigs = {
                      [UserRole.VENDOR_ADMIN]: {
                        label: 'Vendor Admin',
                        icon: Shield,
                        color: 'bg-red-100 text-red-800'
                      },
                      [UserRole.VENDOR_EMPLOYEE]: {
                        label: 'Vendor Employee',
                        icon: UserCheck,
                        color: 'bg-blue-100 text-blue-800'
                      },
                      [UserRole.VENDOR_TECHNICIAN]: {
                        label: 'Vendor Technician',
                        icon: Wrench,
                        color: 'bg-green-100 text-green-800'
                      }
                    };
                    
                    const config = roleConfigs[role];
                    const IconComponent = config?.icon;
                    
                    return (
                      <div key={role} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                        <div className="flex items-center gap-2">
                          {IconComponent && <IconComponent className="h-4 w-4" />}
                          <span className="font-medium">{config?.label || role}</span>
                        </div>
                        <Badge variant="secondary" className={config?.color}>
                          {count} users
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorDetailView; 