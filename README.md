# Election Echo Network

A comprehensive, modern election management system built with **React.js** frontend and **FastAPI** backend. This system provides secure, transparent, and user-friendly digital elections with role-based access control.

## 🚀 Features

### 🗳️ Core Functionality
- **Secure Digital Voting**: End-to-end encrypted voting system
- **Real-time Results**: Live vote tracking and instant result publication
- **Role-based Access Control**: Separate admin and user interfaces
- **Candidate Management**: Support for candidate profiles with photos and bios
- **Election Lifecycle**: Draft → Active → Ended → Results Published

### 👥 User Roles

#### **Admin Features**
- Create and manage elections
- Add candidates with photos and detailed information
- Activate/deactivate elections
- Monitor voting progress
- View detailed vote analytics
- Publish election results
- Comprehensive admin dashboard

#### **User Features**
- Browse active elections
- View candidate profiles
- Cast secure votes
- View published results
- Real-time election status updates

### 🎨 Modern UI/UX
- **Dark/Light Theme Support**: Global theme management
- **Responsive Design**: Mobile-first approach
- **Modern Styling**: Built with Tailwind CSS and shadcn/ui
- **Accessible Components**: WCAG compliant interface
- **Smooth Animations**: Enhanced user experience

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router** for client-side routing
- **TanStack Query** for server state management
- **Tailwind CSS** for styling
- **shadcn/ui** for modern UI components
- **Lucide React** for icons

### Backend Integration
- **FastAPI** backend (assumed running on localhost:8000)
- **RESTful API** with OpenAPI/Swagger documentation
- **JWT Authentication** for secure user sessions
- **File Upload Support** for candidate photos

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- FastAPI backend running on `http://localhost:8000`

### Quick Start

```bash
# Clone and install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see your application.

### Environment Configuration
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## 🎯 Quick Start Guide

1. **Start Backend**: Ensure FastAPI is running on port 8000
2. **Install Dependencies**: `npm install`
3. **Start Development**: `npm run dev`
4. **Visit Application**: `http://localhost:5173`
5. **Create Admin Account**: Sign up with role "admin"
6. **Create First Election**: Use admin dashboard
7. **Test Voting**: Create user account and vote

## 📊 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout components (Header, etc.)
│   └── ui/             # shadcn/ui components
├── contexts/           # React contexts (Auth, Theme)
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── pages/              # Route components
├── services/           # API integration layer
└── types/              # TypeScript type definitions
```

## 🔧 Backend Requirements

Your FastAPI backend should implement these key endpoints:

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/signup` - User registration  
- `GET /api/v1/auth/me` - Get current user profile

### Elections
- `GET /api/v1/elections/` - List all elections
- `POST /api/v1/elections/` - Create new election (admin only)
- `GET /api/v1/elections/{id}` - Get election details
- `POST /api/v1/elections/{id}/vote` - Cast vote (users only)
- `GET /api/v1/elections/{id}/results` - Get election results

### Candidates
- `POST /api/v1/elections/{id}/candidates` - Add candidate with photo upload

## 🎨 Theme Management

The system includes a comprehensive theme system:
- **Light/Dark/System modes** with automatic detection
- **Persistent preferences** saved to localStorage
- **Global theme toggle** in the header
- **Customizable color palette** in `src/index.css`

## 🔐 Security Features

- **JWT Authentication** with secure token storage
- **Role-based route protection** (Admin/User)
- **Input validation** and sanitization
- **File upload security** for candidate photos
- **Protected API endpoints** with proper authorization

## 📱 Responsive Design

- **Mobile-first approach** with breakpoint strategy
- **Touch-friendly interface** optimized for all devices
- **Progressive enhancement** for modern browsers
- **Optimized performance** with code splitting

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run preview
```

### Environment Variables
```env
# Production
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1

# Development  
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## 🧪 Testing API Connection

Test your backend connectivity:
```bash
node test-api-simple.js
```

## 📄 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

**Happy Elections! 🗳️✨**
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/0871067c-07a6-494d-b267-21779c442e9c) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
#   E M A T  
 