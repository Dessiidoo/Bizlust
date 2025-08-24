# LeadPro

## Overview

LeadPro is a comprehensive lead generation and sales intelligence platform that leverages artificial intelligence to help businesses identify, score, and convert prospects into customers. The application combines market intelligence, lead management, and analytics to provide a complete sales automation solution.

The platform features a modern React frontend with a Node.js/Express backend, utilizing AI-powered lead scoring and market insights to optimize sales processes. It includes user authentication via Replit Auth, PostgreSQL database storage, and integrates with OpenAI for intelligent lead analysis and recommendations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The client-side application is built using **React 18** with **TypeScript** for type safety. The frontend employs a modern component-based architecture with the following key decisions:

- **Routing**: Uses Wouter for lightweight client-side routing, chosen over React Router for its minimal bundle size and simplicity
- **State Management**: Leverages TanStack React Query for server state management, eliminating the need for Redux or similar solutions
- **UI Framework**: Built on shadcn/ui components with Radix UI primitives, providing accessible and customizable components
- **Styling**: Uses Tailwind CSS with CSS variables for theming, enabling consistent design system implementation
- **Build Tool**: Vite for fast development and optimized production builds

The application follows a page-based structure with Dashboard, Leads, Analytics, and Landing pages, each containing specialized components for their respective functionalities.

### Backend Architecture

The server-side is implemented using **Express.js** with **TypeScript** in ESM format. Key architectural decisions include:

- **Database ORM**: Drizzle ORM chosen for its type safety, performance, and lightweight nature compared to alternatives like Prisma
- **Database Schema**: Well-structured relational design with tables for users, companies, leads, market insights, campaigns, and analytics
- **Authentication**: Replit Auth integration using OpenID Connect for seamless user management
- **Session Management**: PostgreSQL-backed session storage using connect-pg-simple
- **AI Integration**: OpenAI API integration for lead scoring, market insights generation, and outreach suggestions
- **API Design**: RESTful API structure with proper error handling and middleware for authentication

### Data Storage Solutions

**PostgreSQL** serves as the primary database, selected for its robustness, ACID compliance, and excellent support for complex queries. The database schema includes:

- User management tables (users, sessions) required for Replit Auth
- Business domain tables (companies, leads, market insights, campaigns, analytics)
- Proper indexing and foreign key relationships for data integrity
- JSON fields for flexible data storage where appropriate

**Neon Database** is used as the PostgreSQL hosting solution, providing serverless PostgreSQL with excellent performance and scaling characteristics.

### Authentication and Authorization

The system implements **Replit Auth** as the primary authentication mechanism:

- OpenID Connect (OIDC) integration for secure authentication
- Session-based authentication with PostgreSQL storage
- User profile management with support for company information
- Protected API routes using authentication middleware
- Automatic session handling and renewal

### AI and Intelligence Layer

**OpenAI GPT-4** integration provides advanced AI capabilities:

- **Lead Scoring**: Analyzes company information, contact details, and market signals to provide AI-powered lead scores
- **Market Insights**: Generates actionable business intelligence and market trend analysis
- **Outreach Suggestions**: Creates personalized outreach recommendations including email templates and timing
- **Data Analysis**: Processes business metrics to identify opportunities and trends

The AI service layer is designed to be modular and extensible, allowing for easy integration of additional AI providers or custom models in the future.

## External Dependencies

### Core Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting for primary data storage
- **Replit Platform**: Development environment and deployment platform with integrated authentication

### AI and Intelligence Services
- **OpenAI API**: GPT-4 model for lead scoring, market insights, and content generation
- **OpenID Connect**: Authentication protocol for secure user authentication via Replit

### Frontend Dependencies
- **Radix UI**: Accessible component primitives for building the user interface
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Recharts**: React charting library for data visualization and analytics dashboards
- **TanStack React Query**: Data fetching and caching library for optimal API interaction

### Backend Dependencies
- **Drizzle ORM**: Type-safe database ORM for PostgreSQL interactions
- **Express.js**: Web framework for API development
- **Passport.js**: Authentication middleware for handling OIDC flows
- **WebSocket Support**: Real-time communication capabilities for live updates

### Development and Build Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type system for both frontend and backend code
- **ESBuild**: JavaScript bundler for production builds
- **Node.js**: Runtime environment for server-side application

The architecture is designed for scalability and maintainability, with clear separation of concerns between the frontend, backend, AI services, and data layer. The use of modern tools and frameworks ensures good developer experience while maintaining production-ready performance and security standards.