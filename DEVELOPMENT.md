# Development Configuration

This document explains how to configure the development environment for the TreadX frontend.

## 🔧 Configuration

### Real API Mode (Default)

The application is configured to use real API calls by default:

- Connects to actual backend API
- Requires backend server to be running on `http://localhost:9003`
- For production-ready development and testing

### API Configuration

Edit `src/config/development.js` for API settings:

```javascript
export const DEV_CONFIG = {
  // Set to false for real API (default)
  USE_MOCK_DATA: false,
  
  // API base URL for real API calls
  API_BASE_URL: 'http://localhost:9003',
  
  // Development features
  SHOW_DEV_INDICATOR: false,
  ENABLE_DEBUG_LOGGING: true,
};
```

## 🚀 Quick Start

### For Development (Real API)
1. Ensure backend server is running on `http://localhost:9003`
2. Run `pnpm dev`
3. Access the application - will connect to real API

### API Endpoints Required

The following backend endpoints must be available:

**Vendors:**
- `GET /api/v1/vendors` - List vendors
- `POST /api/v1/vendors` - Create vendor
- `GET /api/v1/vendors/{id}` - Get vendor details
- `PUT /api/v1/vendors/{id}` - Update vendor
- `DELETE /api/v1/vendors/{id}` - Delete vendor

**Subscription Plans:**
- `GET /api/v1/subscription-plans/active` - List active plans
- `POST /api/v1/subscription-plans` - Create plan
- `PUT /api/v1/subscription-plans/{id}` - Update plan
- `DELETE /api/v1/subscription-plans/{id}` - Delete plan

## 📊 Real API Data

The application now uses real API data from your backend:

### Vendors
- Real vendor data from your database
- New vendor ID format: `001010001` + vendor ID
- User access configuration included

### Subscription Plans
- Real subscription plans from your database
- Full CRUD operations supported
- Billing cycles and pricing management

## 🔍 Development Features

When running in real API mode:
- Real data from your backend
- Production-ready API calls
- Proper error handling and loading states

## 🛠 Troubleshooting

### White Page Issues
1. Check browser console for errors
2. Verify React Query provider is set up
3. Check if all components are properly imported

### API Connection Issues
1. Ensure backend server is running
2. Check API_BASE_URL configuration
3. Verify network connectivity

### Mock Data Not Loading
1. Check `USE_MOCK_DATA` setting
2. Verify mock service files exist
3. Check console for service errors

## 📝 Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:9003

# Development Settings
VITE_USE_MOCK_DATA=true
VITE_DEBUG_MODE=true
```

## 🔄 Switching Between Modes

### From Mock to Real API
1. Stop the development server
2. Set `USE_MOCK_DATA: false` in `src/config/development.js`
3. Ensure backend is running
4. Restart development server: `pnpm dev`

### From Real API to Mock
1. Stop the development server
2. Set `USE_MOCK_DATA: true` in `src/config/development.js`
3. Restart development server: `pnpm dev`

## 📋 Testing Checklist

### Mock Data Mode
- [ ] Vendors list displays with new ID format
- [ ] Subscription plans page loads
- [ ] User access data shows in vendor details
- [ ] Create/edit/delete operations work
- [ ] Search and pagination work

### Real API Mode
- [ ] Backend server is accessible
- [ ] API endpoints respond correctly
- [ ] Authentication works
- [ ] Data persists between sessions
- [ ] Error handling works properly

## 🎯 Best Practices

1. **Development**: Use mock data for rapid development
2. **Testing**: Use real API for integration testing
3. **Production**: Always use real API
4. **Debugging**: Enable debug logging in development
5. **Documentation**: Update mock data when API changes

## 🔧 Advanced Configuration

### Custom Mock Data
Edit the mock data files:
- `src/services/vendorsApiService.js` - Vendor mock data
- `src/services/subscriptionPlansApiService.js` - Subscription plans mock data

### Custom API Configuration
Edit `src/config/development.js` for:
- Different API endpoints
- Custom timeouts
- Error simulation
- Debug settings 