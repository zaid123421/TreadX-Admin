import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { vendorsService } from '../../services/vendorsApiService';
import { 
  handlePostalCodeChange, 
  handlePhoneNumberChange, 
  handleStreetNumberChange
} from '../../utils/formatters';

const EditVendorForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadVendor();
    // eslint-disable-next-line
  }, [id]);

  const loadVendor = async () => {
    try {
      setLoading(true);
      const vendor = await vendorsService.getVendor(id);
      setFormData(vendor);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await vendorsService.updateVendor(id, formData);
      navigate(`/vendors/${id}`, {
        state: {
          message: 'Vendor updated successfully!',
          type: 'success'
        }
      });
    } catch (err) {
      setError(err.message || 'Failed to update vendor');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading vendor...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!formData) return <div className="p-8 text-center">Vendor not found.</div>;

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Edit Vendor</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Legal Name</label>
              <Input
                value={formData.legalName}
                onChange={e => setFormData({ ...formData, legalName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Business Name</label>
              <Input
                value={formData.businessName}
                onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Street Number</label>
              <Input
                value={formData.streetNumber}
                onChange={e => handleStreetNumberChange(e.target.value, (value) => setFormData({ ...formData, streetNumber: value }))}
                placeholder="123"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Street Name</label>
              <Input
                value={formData.streetName}
                onChange={e => setFormData({ ...formData, streetName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Apt/Unit/Bldg</label>
              <Input
                value={formData.aptUnitBldg}
                onChange={e => setFormData({ ...formData, aptUnitBldg: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Postal Code</label>
              <Input
                value={formData.postalCode}
                onChange={e => handlePostalCodeChange(e.target.value, (value) => setFormData({ ...formData, postalCode: value }))}
                placeholder="A1A 1A1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <Input
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                type="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Phone Number</label>
              <Input
                value={formData.phoneNumber}
                onChange={e => handlePhoneNumberChange(e.target.value, (value) => setFormData({ ...formData, phoneNumber: value }))}
                placeholder="+1 (555) 123-4567"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Status</label>
              <select
                className="w-full border rounded px-2 py-1"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditVendorForm; 