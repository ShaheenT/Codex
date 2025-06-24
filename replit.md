# Ishopp - Snap, Scan & Share Specials Platform

## Overview

Ishopp is a real-time social savings platform where users share live specials from retail stores to help friends and family save money. The core concept is collaborative savings - users "snap, scan and share" current deals so everyone in their network knows where to find the best prices right now. Built with an Instagram-like interface, it enables real-time deal discovery, collaborative shopping lists, product scanning, and instant sharing with directions to stores.

The application uses a full-stack TypeScript architecture with React on the frontend and Express.js on the backend, connected to a PostgreSQL database through Drizzle ORM.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Build Tool**: Vite for fast development and optimized builds
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: Express sessions with PostgreSQL store
- **API Design**: RESTful APIs with JSON responses

### Development Setup
- **Environment**: Replit with Node.js 20, PostgreSQL 16
- **Hot Reload**: Vite dev server with Express middleware integration
- **Package Manager**: npm with lockfile version 3

## Key Components

### Database Schema
The application uses a relational database structure with the following main entities:

- **Stores**: Store information including name, location, address, GPS coordinates, and logo
- **Categories**: Product categories (Produce, Dairy, Meat, Bakery, Frozen) with images and themes
- **Deals**: Core special entities with product info, pricing, descriptions, images, and expiration dates
- **Likes**: User interactions with deals (many-to-many relationship)
- **Users**: Basic user authentication and management
- **Shopping Lists**: User-created lists with sharing capabilities
- **Shopping List Items**: Individual items with quantity, price, completion status, and barcode data
- **Shared Lists**: Collaboration data for shared shopping lists between users

### Frontend Components
- **Header**: Navigation bar with "Ishopp" branding and user actions
- **CategoryStories**: Instagram-style category navigation for product types
- **DealPost**: Individual special cards with social interactions and location button
- **BottomNav**: Mobile-first navigation with "share special" and shopping list access
- **PostModal**: Streamlined form for sharing specials (product name, category, description, price, store, comments)
- **ShoppingLists**: Complete shopping list management with scanning and collaboration features

### API Endpoints
- `GET /api/stores` - Retrieve all stores with location data
- `GET /api/categories` - Retrieve all categories
- `GET /api/deals` - Retrieve deals with like status per user
- `POST /api/deals/:id/like` - Toggle like status for a deal
- `GET /api/shopping-lists` - Get user's shopping lists
- `POST /api/shopping-lists` - Create new shopping list
- `POST /api/shopping-lists/:id/items` - Add item to shopping list
- `PATCH /api/shopping-list-items/:id` - Update list item (completion status)
- `POST /api/shopping-lists/:id/share` - Share list with another user
- `POST /api/scan-barcode` - Simulate barcode scanning for product info

## Data Flow

### Deal Discovery Flow
1. User loads the home page
2. Frontend fetches categories and deals via TanStack Query
3. Categories display as story-style navigation
4. Deals render as social media posts with like/unlike functionality
5. Real-time updates through periodic refetching (30-second intervals)

### Deal Interaction Flow
1. User clicks like/unlike on a deal
2. Optimistic UI update for immediate feedback
3. API call to toggle like status
4. Backend updates both likes table and deal like counts
5. Query cache invalidation to sync across components

### Deal Creation Flow (Snap & Share)
1. User opens "Share a Special" modal
2. Form with specific fields: product name, category, description, price, store name, and comments
3. Photo upload for product image ("snap")
4. Form validation with Zod schemas
5. API submission combines description and comments
6. Immediate display of new special in feed

### Shopping List Flow (Scan & Collaborate)
1. User can create and manage multiple shopping lists
2. Barcode scanning simulation to add products quickly
3. List sharing and collaboration with family/partners
4. Real-time list updates and item completion tracking
5. Price tracking for budget management

### Store Location Integration
1. Each deal post includes location button (map pin icon)
2. Clicking opens Google Maps with directions to store
3. Uses store coordinates or address for navigation
4. Helps users find the physical location of specials

## External Dependencies

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database operations
- **Drizzle Kit**: Database migrations and schema management

### UI & Styling
- **shadcn/ui**: Pre-built accessible components
- **Radix UI**: Unstyled, accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### Development & Build
- **Vite**: Frontend build tool and dev server
- **esbuild**: Backend bundling for production
- **TSX**: TypeScript execution for development

## Deployment Strategy

### Development Environment
- **Runtime**: Replit with automatic environment provisioning
- **Database**: Automatic PostgreSQL setup via replit modules
- **Development Server**: `npm run dev` starts both frontend and backend
- **Hot Reload**: Vite middleware integration with Express

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations via `npm run db:push`
- **Deployment**: Replit autoscale deployment target

### Environment Configuration
- **Database URL**: Required environment variable for PostgreSQL connection
- **Session Management**: PostgreSQL-backed sessions for user state
- **Static Assets**: Express serves built frontend from `/dist/public`

## Changelog

## Recent Changes

- June 23, 2025: Initial setup with basic deal sharing functionality
- June 23, 2025: Rebranded to "Ishopp" with "snap, scan & share" concept
- June 23, 2025: Added location integration with Google Maps directions
- June 23, 2025: Implemented shopping lists with collaboration features
- June 23, 2025: Added barcode scanning simulation for quick product entry
- June 23, 2025: Redesigned post creation form with specific product fields
- June 23, 2025: Enhanced store data with GPS coordinates and addresses
- June 23, 2025: Added user profiles with avatars and follower system
- June 23, 2025: Implemented real-time chat functionality for discussing deals
- June 23, 2025: Added follower avatars display under posts
- June 23, 2025: Created share modal to select followers for deal sharing
- June 23, 2025: Built complete social interaction system (follow, chat, share)
- June 23, 2025: Redesigned post layout with user profile at top and store info below image
- June 23, 2025: Moved store information below deal image for cleaner visual hierarchy
- June 23, 2025: Added overlay action buttons on right side of deal images with modern glass effect
- June 23, 2025: Implemented swipe gestures for mobile interactions (right=like, left=share, up=bookmark)
- June 23, 2025: Added interactive tutorial system for teaching swipe gestures to new users
- June 23, 2025: Enhanced mobile UX with visual feedback and smooth animations for gestures
- June 23, 2025: Converted currency from USD to South African Rand (ZAR) with 18.5 exchange rate
- June 23, 2025: Fixed overlay action buttons display on deal images with proper glass effect styling
- June 23, 2025: Enhanced concept messaging to emphasize real-time retail store specials sharing
- June 23, 2025: Added live indicator to show deals are current and active
- June 23, 2025: Improved sharing language to focus on helping friends and family save money
- June 23, 2025: Added savings messages showing who is helping users save and how much
- June 23, 2025: Updated bottom navigation with trendy camera icon for snapping specials
- June 23, 2025: Changed shopping cart to clipboard list icon for collaborative shopping lists
- June 23, 2025: Enhanced post creation form with brand name field and special price focus
- June 23, 2025: Added search modal with options to find users or stores
- June 23, 2025: Improved camera/snap workflow for capturing real-time retail specials
- June 23, 2025: Updated header logo with custom Ishopp shopping bag icon
- June 23, 2025: Enhanced swipe gesture system with improved velocity detection and visual feedback
- June 23, 2025: Added animated tutorial system for mobile gestures with step-by-step guidance
- June 23, 2025: Implemented swipe feedback overlay showing action confirmation (like, share, bookmark)
- June 23, 2025: Added automatic tutorial display for first-time users with localStorage persistence
- June 23, 2025: Created comprehensive user profile modal with personal info editing capabilities
- June 23, 2025: Implemented Ishopp wallet display showing tokens and rewards system
- June 23, 2025: Added theme mode selection (light/dark/auto) in user settings
- June 23, 2025: Integrated password reset functionality and logout option in profile
- June 23, 2025: Connected profile modal to both header and bottom navigation user icons

## User Preferences

Preferred communication style: Simple, everyday language.