# Development Guide

## Development Environment Setup

### Prerequisites

#### Rust Installation
```bash
# Windows
winget install Rustlang.Rustup

# macOS
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Linux
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Verify installation
rustc --version
cargo --version
```

#### Node.js Installation
```bash
# Windows
winget install OpenJS.NodeJS

# macOS
brew install node

# Linux
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify (v18+ required)
node --version
npm --version
```

#### Tauri Prerequisites
```bash
# Windows
# Install Visual Studio Build Tools
winget install Microsoft.VisualStudio.2022.BuildTools

# Install WebView2
winget install Microsoft.EdgeWebView2Runtime

# macOS
xcode-select --install

# Linux (Ubuntu/Debian)
sudo apt install libwebkit2gtk-4.0-dev \
  build-essential \
  curl \
  wget \
  libssl-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

## Project Setup

### 1. Clone Repository
```bash
git clone https://github.com/TorchiaHub/Vera_software.git
cd Vera_software
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Environment Configuration
```bash
# Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit configuration files
# backend/.env - Database and API settings
# frontend/.env - Frontend configuration
```

## Development Commands

### Frontend Development
```bash
# Start development server
npm run dev:frontend

# Build for production
npm run build:frontend

# Run tests
npm run test:frontend
```

### Backend Development
```bash
# Start development server
npm run dev:backend

# Build for production
npm run build:backend

# Run tests
npm run test:backend
```

### Desktop Development
```bash
# Start Tauri development
npm run tauri:dev

# Build desktop app
npm run tauri:build

# Debug Rust code
npm run tauri:dev -- --debug
```

### Full Stack Development
```bash
# Start all services
npm run dev

# Build everything
npm run build

# Run all tests
npm run test
```

## Code Standards

### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for formatting
- Write unit tests for utilities
- Document complex functions with JSDoc

### Rust
- Follow Rust standard formatting (rustfmt)
- Use Clippy for linting
- Write unit tests for all modules
- Document public APIs with rustdoc
- Handle errors explicitly

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make atomic commits
git commit -m "feat: add new monitoring feature"

# Push and create PR
git push origin feature/your-feature-name
```

### Commit Convention
```
feat: new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: test changes
chore: maintenance tasks
```

## Authentication Development

### Supabase Setup
1. Create Supabase project
2. Run database migrations from `shared/database-schema-auth.sql`
3. Configure RLS policies
4. Update environment variables

### Auth Integration
```typescript
// Use AuthContext for authentication state
import { useAuth } from '@/contexts/AuthContext';

const { user, signIn, signOut, loading } = useAuth();
```

## System Monitoring Development

### Real-time Data Collection
```typescript
// Use performance hooks
import { usePerformanceData } from '@/hooks/usePerformanceData';

const { data, isCollecting, startCollection, stopCollection } = usePerformanceData();
```

### Tauri Integration
```rust
// Add new system commands in src-tauri/src/main.rs
#[tauri::command]
fn get_system_info() -> SystemInfo {
    // Implementation
}
```

## Testing

### Frontend Testing
```bash
# Unit tests
npm run test:frontend

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

### Backend Testing
```bash
# API tests
npm run test:backend

# Integration tests
npm run test:integration
```

### Desktop Testing
```bash
# Rust tests
cd src-tauri
cargo test

# UI tests
npm run test:tauri
```

## Debugging

### Frontend Debugging
- Use browser DevTools
- React Developer Tools
- Vite debugging features

### Backend Debugging
- Use Node.js debugger
- Add logging with winston
- Monitor with PM2

### Desktop Debugging
- Use Rust debugger (lldb/gdb)
- Tauri DevTools
- Console logging

## Performance Optimization

### Frontend
- Code splitting with React.lazy
- Optimize bundle size
- Use React.memo for expensive components
- Implement virtual scrolling for large lists

### Backend
- Database query optimization
- API response caching
- Connection pooling
- Rate limiting

### Desktop
- Minimize Rust binary size
- Optimize WebView resources
- Efficient IPC communication
- Memory management

## Troubleshooting

See [Troubleshooting.md](./Troubleshooting.md) for common issues and solutions.