import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
  handlePostalCodeChange,
  handlePhoneNumberChange,
  handleStreetNumberChange,
} from '../../leads/utils/leadUtils';

export function EditDealerFormView({ formData, setFormData, loading, isSubmitting, error, handleSubmit }) {
  if (loading) return <div className="p-8 text-center">Loading dealer...</div>;
  if (error && !formData) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!formData) return <div className="p-8 text-center">Dealer not found.</div>;

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Edit Dealer</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Legal Name</label>
              <Input
                value={formData.legalName}
                onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Business Name</label>
              <Input
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Street Number</label>
              <Input
                value={formData.streetNumber}
                onChange={(e) =>
                  handleStreetNumberChange(e.target.value, (value) =>
                    setFormData({ ...formData, streetNumber: value })
                  )
                }
                placeholder="123"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Street Name</label>
              <Input
                value={formData.streetName}
                onChange={(e) => setFormData({ ...formData, streetName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Apt/Unit/Bldg</label>
              <Input
                value={formData.aptUnitBldg}
                onChange={(e) => setFormData({ ...formData, aptUnitBldg: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Postal Code</label>
              <Input
                value={formData.postalCode}
                onChange={(e) =>
                  handlePostalCodeChange(e.target.value, (value) =>
                    setFormData({ ...formData, postalCode: value })
                  )
                }
                placeholder="A1A 1A1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <Input
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                type="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Phone Number</label>
              <Input
                value={formData.phoneNumber}
                onChange={(e) =>
                  handlePhoneNumberChange(e.target.value, (value) =>
                    setFormData({ ...formData, phoneNumber: value })
                  )
                }
                placeholder="+1 (555) 123-4567"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Status</label>
              <select
                className="w-full border rounded px-2 py-1"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
}
