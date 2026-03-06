import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import LoginForm from './components/auth/LoginForm';
import Dashboard from './pages/Dashboard';
import LeadsList from './pages/leads/LeadsList';
import AddLead from './pages/leads/AddLead';
import EditLead from './pages/leads/EditLead';
import LeadDetail from './pages/leads/LeadDetail';
import LeadsApproval from './pages/leads/LeadsApproval';
import VendorsList from './pages/vendors/VendorsList';
import AddVendor from './pages/vendors/AddVendor';
import EditVendor from './pages/vendors/EditVendor';
import VendorDetail from './pages/vendors/VendorDetail';
import SubscriptionPlans from './pages/subscription-plans/SubscriptionPlans';
import ErrorBoundary from './components/ui/ErrorBoundary';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="leads" element={<LeadsList />} />
              <Route path="leads/add" element={<AddLead />} />
              <Route path="leads/:id" element={<LeadDetail />} />
              <Route path="leads/:id/edit" element={<EditLead />} />
              <Route path="leads-approval" element={<LeadsApproval />} />
              <Route path="vendors" element={<VendorsList />} />
              <Route path="vendors/add" element={<AddVendor />} />
              <Route path="vendors/:id" element={<VendorDetail />} />
              <Route path="vendors/:id/edit" element={<EditVendor />} />
              <Route path="subscription-plans" element={<SubscriptionPlans />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

