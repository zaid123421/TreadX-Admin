# TreadX Sales Management Frontend

A modern, user-friendly React frontend for tire storage service sales management, designed specifically for tire vendors and mechanics.

## 🚀 Features

### Core Functionality
- **Dashboard**: Overview of key metrics, recent activities, and quick actions
- **Leads Management**: Complete CRUD operations for sales opportunities
- **Vendor Management**: Manage tire vendors, distributors, and service providers
- **Authentication**: Role-based access control with different user permissions
- **Responsive Design**: Mobile-friendly interface that works on all devices

### User Roles
- **Admin**: Full system access and user management
- **Manager**: Lead and vendor management, team oversight
- **Sales Rep**: Lead creation and management, vendor interaction
- **Mechanic**: Inventory access and basic lead viewing

### Key Features
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- **Type Safety**: JavaScript with comprehensive type definitions
- **State Management**: React Context for global state, React Query for server state
- **Form Handling**: React Hook Form with validation
- **File Uploads**: Drag-and-drop file upload capabilities
- **Search & Filtering**: Advanced filtering and search functionality
- **Real-time Updates**: Optimistic updates for better user experience

## 🛠 Technology Stack

- **React 18** - Modern React with hooks and concurrent features
- **React Router v6** - Client-side routing and navigation
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality, accessible UI components
- **Lucide React** - Beautiful, customizable icons
- **Axios** - HTTP client for API requests
- **React Hook Form** - Performant form handling
- **React Dropzone** - File upload functionality
- **Vite** - Fast build tool and development server

## 📦 Installation

1. **Clone or extract the project**
   ```bash
   cd treadx-sales-management
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Start the development server**
   ```bash
   pnpm run dev
   # or
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔐 Demo Credentials

The application includes demo authentication with the following credentials:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| Admin | admin@treadx.com | admin123 | Full system access |
| Manager | manager@treadx.com | manager123 | Lead & vendor management |
| Sales Rep | sales@treadx.com | sales123 | Lead creation & management |

## 🏗 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   ├── auth/            # Authentication components
│   └── layout/          # Layout components
├── pages/               # Page components
│   ├── leads/           # Lead management pages
│   ├── vendors/         # Vendor management pages
│   └── Dashboard.jsx    # Main dashboard
├── contexts/            # React contexts
│   └── AuthContext.jsx # Authentication context
├── services/            # API service functions
│   ├── authService.js   # Authentication API
│   ├── leadsService.js  # Leads API
│   └── vendorsService.js # Vendors API
├── types/               # Type definitions
├── lib/                 # Utility functions
└── App.jsx             # Main application component
```

## 🔌 API Integration

The frontend is designed to work with a REST API backend. Currently, it uses mock data for demonstration purposes.

### API Endpoints Expected

```
Authentication:
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me

Leads:
GET    /api/leads
POST   /api/leads
GET    /api/leads/:id
PUT    /api/leads/:id
DELETE /api/leads/:id

Vendors:
GET    /api/vendors
POST   /api/vendors
GET    /api/vendors/:id
PUT    /api/vendors/:id
DELETE /api/vendors/:id

Files:
POST   /api/files/upload
GET    /api/files/:id
DELETE /api/files/:id
```

### Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:8080/api
```

## 🎨 Customization

### Styling
- Modify `src/App.css` for global styles
- Update Tailwind configuration in `tailwind.config.js`
- Customize component styles in individual component files

### Branding
- Update logo and branding in `src/components/layout/Sidebar.jsx`
- Modify color scheme in `src/App.css` CSS variables
- Update application title in `index.html`

### Features
- Add new pages in `src/pages/`
- Create new components in `src/components/`
- Extend API services in `src/services/`

## 📱 Responsive Design

The application is fully responsive and includes:
- Mobile-first design approach
- Collapsible sidebar navigation
- Touch-friendly interactions
- Adaptive layouts for different screen sizes

## ♿ Accessibility

Built with accessibility in mind:
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- High contrast support

## 🚀 Deployment

### Build for Production

```bash
pnpm run build
# or
npm run build
```

### Deploy to Static Hosting

The built files in the `dist/` directory can be deployed to any static hosting service:
- Vercel
- Netlify
- AWS S3
- GitHub Pages
- Any web server

### Environment Configuration

For production deployment, ensure:
1. Set the correct `REACT_APP_API_URL` environment variable
2. Configure CORS on your backend API
3. Set up proper authentication token handling
4. Configure any necessary proxy settings

## 🔧 Development

### Available Scripts

- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run preview` - Preview production build
- `pnpm run lint` - Run ESLint

### Code Quality

The project includes:
- ESLint configuration for code quality
- Prettier for code formatting
- Component-based architecture
- Consistent naming conventions

## 🤝 Contributing

1. Follow the existing code style and conventions
2. Create reusable components when possible
3. Add proper error handling and loading states
4. Test responsive design on multiple devices
5. Ensure accessibility standards are met

## 📄 License

This project is part of the TreadX tire storage service platform.

## 🆘 Support

For technical support or questions about the TreadX Sales Management system, please contact the development team.

---

**TreadX Sales Management** - Streamlining tire sales for vendors and mechanics.

