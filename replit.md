# MotherLine - Medical Records & Wellness Management Platform

## Overview

MotherLine is a full-stack web application designed for managing medical records and tracking wellness entries. Built with a modern tech stack, it provides secure user authentication, file upload capabilities, and wellness tracking features. The application follows a clean architecture pattern with separate client and server directories, shared schema definitions, and comprehensive UI components.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI primitives with custom shadcn/ui components
- **Styling**: Tailwind CSS with custom design tokens and dark mode support
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: Firebase Firestore (NoSQL document database)
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **File Handling**: Multer for multipart form uploads with local storage

### Development Environment
- **Bundling**: ESBuild for production server builds
- **Development**: TSX for TypeScript execution in development
- **Hot Reload**: Vite HMR with development middleware integration
- **Error Handling**: Runtime error overlay for development debugging

## Key Components

### Authentication System
- JWT token-based authentication with 7-day expiration
- Password hashing using bcrypt with salt rounds
- Protected routes with middleware authentication
- Local storage for token and user data persistence
- Registration and login endpoints with validation

### File Management
- Medical record file uploads (PDF, JPG, JPEG supported)
- 5MB file size limit with type validation
- Local file storage in uploads directory
- File metadata tracking in database
- Secure file serving through Express static middleware

### Database Schema
- **Users**: Username, email, password with unique constraints
- **Medical Records**: File metadata with user associations
- **Wellness Entries**: Mood tracking (1-5 scale) with optional notes
- Foreign key relationships with cascade deletion
- Timestamp tracking for all entities

### UI Components
- Comprehensive component library based on Radix UI primitives
- Consistent design system with CSS variables
- Responsive design with mobile-first approach
- Toast notifications for user feedback
- Progress indicators for file uploads
- Dropdown menus and dialog modals

## Data Flow

### Authentication Flow
1. User registers/logs in through form submission
2. Server validates credentials and generates JWT token
3. Token stored in localStorage with user information
4. Protected routes verify token on each request
5. Middleware authenticates and attaches user context

### File Upload Flow
1. Client selects file through drag-and-drop or file picker
2. File validation occurs on both client and server
3. Progress tracking during multipart upload
4. Server stores file locally and saves metadata to database
5. Client receives confirmation and refreshes record list

### Wellness Tracking Flow
1. User selects mood rating (1-5 scale)
2. Optional notes can be added to entry
3. Data validated and stored with user association
4. Dashboard displays wellness statistics and trends

## External Dependencies

### Core Framework Dependencies
- React ecosystem (React, React DOM, React Hook Form)
- Express.js with TypeScript support
- Drizzle ORM with PostgreSQL adapter
- TanStack React Query for data fetching

### UI and Styling
- Radix UI primitives for accessible components
- Tailwind CSS for utility-first styling
- Lucide React for consistent iconography
- Class Variance Authority for component variants

### Development Tools
- Vite with React plugin and TypeScript support
- ESBuild for production bundling
- TSX for TypeScript execution
- PostCSS with Autoprefixer

### Authentication and Security
- JWT for token generation and verification
- bcrypt for password hashing
- Multer for secure file uploads

## Deployment Strategy

### Build Process
1. Frontend builds to `dist/public` directory using Vite
2. Backend bundles to `dist/index.js` using ESBuild
3. Static assets served from built frontend
4. Environment variables required for database connection

### Production Configuration
- Express serves built React application as static files
- API routes prefixed with `/api` for clear separation
- File uploads stored in `uploads` directory
- Database migrations managed through Drizzle Kit

### Environment Requirements
- `DATABASE_URL` for PostgreSQL connection (required)
- `JWT_SECRET` for token signing (defaults to development key)
- Node.js runtime with ES module support

## Recent Changes
- July 02, 2025: Migrated from PostgreSQL to Firebase Firestore database
- July 02, 2025: Updated data models to use string IDs instead of numeric IDs
- July 02, 2025: Created temporary in-memory storage for development until Firebase credentials are provided
- July 02, 2025: Added separate page navigation with dedicated Medical Records, Wellness, and Appointments pages
- July 02, 2025: Fixed database storage issues and implemented proper routing
- July 02, 2025: Created comprehensive doctor appointment booking system for women's health
- July 02, 2025: Enhanced header navigation with proper page links
- July 02, 2025: Initial setup with authentication, file upload, and wellness tracking

## User Preferences

Preferred communication style: Simple, everyday language.