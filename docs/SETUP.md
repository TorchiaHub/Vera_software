# VERA Setup Guide

## Overview

This guide will help you set up the VERA Environmental Awareness application on your development machine. VERA is a comprehensive monorepo application built with modern web technologies including React, Express.js, TypeScript, and Tauri.

## Prerequisites

### System Requirements

**Minimum Requirements:**
- **OS**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **RAM**: 8GB (16GB recommended)
- **Storage**: 5GB free space
- **Network**: Internet connection for package downloads

**Required Software:**
- **Node.js**: v18.0.0 or later
- **npm**: v9.0.0 or later (comes with Node.js)
- **Git**: Latest version
- **Rust**: Latest stable version (for Tauri desktop app)

### Installation of Prerequisites

#### Node.js and npm

**Windows:**
1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Run the installer and follow the setup wizard
3. Verify installation:
   ```cmd
   node --version
   npm --version
   ```

**macOS:**
```bash
# Using Homebrew
brew install node

# Or download from nodejs.org
```

**Linux (Ubuntu/Debian):**
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### Rust (for Tauri Desktop App)

**Windows:**
1. Download rustup from [rustup.rs](https://rustup.rs/)
2. Run the installer
3. Restart your terminal
4. Verify installation:
   ```cmd
   rustc --version
   cargo --version
   ```

**macOS/Linux:**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
rustc --version
```

#### Git

**Windows:**
- Download from [git-scm.com](https://git-scm.com/)

**macOS:**
```bash
# Using Homebrew
brew install git

# Or use Xcode Command Line Tools
xcode-select --install
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt-get install git

# CentOS/RHEL
sudo yum install git
```

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/vera-environmental-awareness.git
cd vera-environmental-awareness
```

### 2. Install Dependencies

The project uses npm workspaces for monorepo management. Install all dependencies with:

```bash
npm install
```

This will install dependencies for:
- Root workspace
- Frontend workspace (`./frontend`)
- Backend workspace (`./backend`)
- Shared utilities (`./shared`)

### 3. Environment Configuration

#### Backend Environment

Create a `.env` file in the `backend/` directory:

```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=3001
HOST=localhost

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/vera_db
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=vera_db
DATABASE_USER=your_username
DATABASE_PASSWORD=your_password

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# Password Reset
RESET_TOKEN_SECRET=your-reset-token-secret
RESET_TOKEN_EXPIRES_IN=1h

# Email Configuration (optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=VERA <noreply@vera.com>

# External APIs
CARBON_INTENSITY_API_KEY=your-carbon-intensity-api-key
WEATHER_API_KEY=your-weather-api-key

# Security
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug
LOG_FILE=logs/vera.log

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads/
```

#### Frontend Environment

Create a `.env` file in the `frontend/` directory:

```bash
cd frontend
cp .env.example .env
```

Edit the `.env` file:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api
VITE_API_TIMEOUT=10000

# Application Configuration
VITE_APP_NAME=VERA
VITE_APP_VERSION=2.0.0
VITE_APP_DESCRIPTION=Environmental Awareness Application

# Authentication
VITE_AUTH_TOKEN_KEY=vera_auth_token
VITE_AUTH_REFRESH_KEY=vera_refresh_token

# Features
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_OFFLINE_MODE=true

# Development
VITE_DEV_TOOLS=true
VITE_MOCK_API=false

# External Services
VITE_SENTRY_DSN=your-sentry-dsn
VITE_GOOGLE_ANALYTICS_ID=your-ga-id
```

### 4. Database Setup

#### PostgreSQL Installation

**Windows:**
1. Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run the installer
3. Remember the password you set for the `postgres` user

**macOS:**
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql

# Create user and database
createuser -s your_username
createdb vera_db
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create user and database
sudo -u postgres createuser -s your_username
sudo -u postgres createdb vera_db
```

#### Database Schema

Run the database migrations:

```bash
cd backend
npm run db:migrate
npm run db:seed  # Optional: load sample data
```

### 5. Development Setup

#### Start Development Servers

The project includes several npm scripts for development:

```bash
# Start all services (recommended)
npm run dev

# Or start services individually:

# Start backend only
npm run dev:backend

# Start frontend only  
npm run dev:frontend

# Start Tauri desktop app
npm run dev:tauri
```

#### Access the Application

- **Frontend Web App**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api-docs
- **Desktop App**: Automatically opens when running `npm run dev:tauri`

### 6. Building for Production

#### Build All Components

```bash
# Build everything
npm run build

# Or build individually:
npm run build:frontend
npm run build:backend
npm run build:tauri
```

#### Output Locations

- **Frontend**: `frontend/dist/`
- **Backend**: `backend/dist/`
- **Desktop App**: `src-tauri/target/release/`

## Development Workflow

### Project Structure

```
vera-environmental-awareness/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API services
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── dist/                # Built frontend (after build)
├── backend/                 # Express.js backend API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── services/        # Business logic
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   └── types/           # TypeScript types
│   └── dist/                # Compiled JavaScript (after build)
├── shared/                  # Shared utilities and types
├── src-tauri/              # Tauri desktop application
├── docs/                   # Project documentation
├── tests/                  # Test suites
├── scripts/                # Automation scripts
└── .github/                # GitHub Actions workflows
```

### Common Development Tasks

#### Adding New Features

1. **Backend API Endpoint:**
   ```bash
   # Create controller, service, and route files
   touch backend/src/controllers/newFeatureController.ts
   touch backend/src/services/newFeatureService.ts
   touch backend/src/routes/newFeatureRoutes.ts
   ```

2. **Frontend Page:**
   ```bash
   # Create page component
   touch frontend/src/pages/NewFeaturePage.tsx
   ```

3. **Update Documentation:**
   ```bash
   # Update API documentation
   # Edit docs/API.md
   ```

#### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:frontend
npm run test:backend
npm run test:e2e

# Run tests in watch mode
npm run test:watch
```

#### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type checking
npm run type-check
```

### Environment-Specific Configuration

#### Development Environment

- Hot reload enabled
- Debug logging
- Mock data available
- Source maps included

#### Production Environment

- Optimized builds
- Error logging only
- Real database connections
- Security headers enabled

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Kill process using port 3001 (backend)
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3001 | xargs kill -9
```

#### Database Connection Issues

1. Verify PostgreSQL is running:
   ```bash
   # Check PostgreSQL status
   pg_isready -h localhost -p 5432
   ```

2. Check database credentials in `.env` file
3. Ensure database exists:
   ```bash
   psql -h localhost -U your_username -d vera_db
   ```

#### Node.js Version Issues

```bash
# Check Node.js version
node --version

# Update Node.js if needed
# Using nvm (recommended)
nvm install 18
nvm use 18
```

#### Dependency Installation Issues

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Tauri Build Issues

1. Ensure Rust is installed and up to date:
   ```bash
   rustup update
   ```

2. Install Tauri prerequisites:
   
   **Windows:**
   - Install Microsoft C++ Build Tools
   - Install Windows 10 SDK

   **Linux:**
   ```bash
   sudo apt-get install libwebkit2gtk-4.0-dev build-essential curl wget libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
   ```

#### Performance Issues

1. **High Memory Usage:**
   - Reduce the number of concurrent processes
   - Close unused browser tabs
   - Check for memory leaks in code

2. **Slow Build Times:**
   - Use faster storage (SSD)
   - Increase available RAM
   - Use incremental builds

### Getting Help

1. **Check Documentation:**
   - [API Documentation](./API.md)
   - [Deployment Guide](./DEPLOYMENT.md)
   - [Troubleshooting Guide](./TROUBLESHOOTING.md)

2. **Community Support:**
   - GitHub Issues: Report bugs and feature requests
   - Discord: Join our community chat
   - Stack Overflow: Tag questions with `vera-environmental`

3. **Development Team:**
   - Email: dev@vera.com
   - Slack: #vera-development

## Next Steps

After completing the setup:

1. **Explore the Application:**
   - Register a new user account
   - Navigate through different pages
   - Test energy monitoring features

2. **Review the Code:**
   - Examine the project structure
   - Read through component implementations
   - Understand the API endpoints

3. **Contribute:**
   - Check open issues on GitHub
   - Read the contributing guidelines
   - Set up your development environment

4. **Deploy:**
   - Follow the [Deployment Guide](./DEPLOYMENT.md)
   - Set up production environments
   - Configure monitoring and logging

---

**Need Help?** Check our [Troubleshooting Guide](./TROUBLESHOOTING.md) or create an issue on GitHub.