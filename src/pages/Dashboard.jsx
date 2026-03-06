import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Truck,
  Package
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { formatCurrency, formatDate, LeadStatus } from '../types';
import { Link } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { leadsService } from '../services/leadsApiService';

const Dashboard = () => {
  const { user } = useAuth();
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalVendors, setTotalVendors] = useState(0);
  const [monthlyRevenue] = useState(0); // Placeholder, update if endpoint is available
  const [leadStatusData, setLeadStatusData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch total leads
        const leadsResponse = await apiClient.get('/api/v1/leads?page=0&size=1');
        setTotalLeads(leadsResponse.data.totalElements || 0);
        
        // Fetch total vendors
        const vendorsResponse = await apiClient.get('/api/v1/vendors?page=0&size=1');
        setTotalVendors(vendorsResponse.data.totalElements || 0);
        
        // Fetch all leads to calculate status distribution
        const allLeadsResponse = await leadsService.getLeads({ page: 0, size: 1000 });
        const leads = allLeadsResponse.content || [];
        
        // Calculate status distribution
        const statusCounts = {};
        leads.forEach(lead => {
          statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
        });
        
        // Create status data with proper colors and labels
        const statusData = [
          { status: LeadStatus.PENDING, count: statusCounts[LeadStatus.PENDING] || 0, color: 'bg-yellow-500', label: 'Pending' },
          { status: LeadStatus.APPROVED, count: statusCounts[LeadStatus.APPROVED] || 0, color: 'bg-green-500', label: 'Approved' },
          { status: LeadStatus.DENIED, count: statusCounts[LeadStatus.DENIED] || 0, color: 'bg-red-500', label: 'Denied' },
          { status: LeadStatus.CONTACTED, count: statusCounts[LeadStatus.CONTACTED] || 0, color: 'bg-blue-500', label: 'Contacted' },
          { status: LeadStatus.ONBOARDED, count: statusCounts[LeadStatus.ONBOARDED] || 0, color: 'bg-purple-500', label: 'Onboarded' },
          { status: LeadStatus.DONE, count: statusCounts[LeadStatus.DONE] || 0, color: 'bg-gray-500', label: 'Completed' }
        ];
        
        setLeadStatusData(statusData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Total Leads',
      value: totalLeads,
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      description: 'from last month'
    },
    {
      title: 'Active Leads',
      value: 42, // Placeholder, update if endpoint is available
      change: '+8%',
      changeType: 'positive',
      icon: Activity,
      description: 'currently in pipeline'
    },
    {
      title: 'Vendors',
      value: totalVendors,
      change: '+3%',
      changeType: 'positive',
      icon: Building2,
      description: 'active partnerships'
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(monthlyRevenue),
      change: '+15%',
      changeType: 'positive',
      icon: DollarSign,
      description: 'vs last month'
    }
  ];



  const getActivityIcon = (type) => {
    switch (type) {
      case 'lead_created':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'lead_updated':
        return <Activity className="h-4 w-4 text-green-500" />;
      case 'vendor_added':
        return <Building2 className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-blue-100">
              Here's what's happening with your tire sales today.
            </p>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ) : (
              <div className="text-2xl font-bold">{totalLeads}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendors</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-12"></div>
              </div>
            ) : (
              <div className="text-2xl font-bold">{totalVendors}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            ) : (
              <div className="text-2xl font-bold">${monthlyRevenue.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead status overview */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Status Overview</CardTitle>
            <CardDescription>
              Current distribution of leads by status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-500">Loading status data...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {leadStatusData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <Badge variant="secondary">{item.count}</Badge>
                  </div>
                ))}
                {leadStatusData.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No leads found
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates and changes in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Placeholder for recent activities */}
              <div className="flex items-start space-x-3">
                <div className="mt-1">
                  <Activity className="h-4 w-4 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    No recent activities recorded.
                  </p>
                  <p className="text-xs text-gray-500">
                    Check back later for updates.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/leads/add" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors block">
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <h3 className="font-medium">Create New Lead</h3>
                  <p className="text-sm text-gray-500">Add a new sales opportunity</p>
                </div>
              </div>
            </Link>
            <Link to="/vendors/new" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors block">
              <div className="flex items-center space-x-3">
                <Building2 className="h-8 w-8 text-green-500" />
                <div>
                  <h3 className="font-medium">Add Vendor</h3>
                  <p className="text-sm text-gray-500">Register a new tire vendor</p>
                </div>
              </div>
            </Link>
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex items-center space-x-3">
                <Package className="h-8 w-8 text-purple-500" />
                <div>
                  <h3 className="font-medium">Inventory Check</h3>
                  <p className="text-sm text-gray-500">Review tire stock levels</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

