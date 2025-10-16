# Configuration Guide

## Environment Configuration

VERA uses environment variables and configuration files to customize behavior across different deployment environments.

## Environment Variables

### Required Variables

Create a `.env` file in your project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# App Configuration  
VITE_APP_NAME=VERA
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production

# Monitoring Configuration
VITE_MONITORING_INTERVAL=5000
VITE_DATA_RETENTION_DAYS=30
VITE_ENABLE_REAL_TIME=true

# Debug Configuration (development only)
VITE_DEBUG_MODE=false
VITE_ENABLE_DEVTOOLS=false
```

### Environment-Specific Configuration

#### Development (.env.development)
```bash
VITE_APP_ENV=development
VITE_DEBUG_MODE=true
VITE_ENABLE_DEVTOOLS=true
VITE_MONITORING_INTERVAL=1000
VITE_API_TIMEOUT=10000
```

#### Production (.env.production)
```bash
VITE_APP_ENV=production
VITE_DEBUG_MODE=false
VITE_ENABLE_DEVTOOLS=false
VITE_MONITORING_INTERVAL=5000
VITE_API_TIMEOUT=5000
```

#### Testing (.env.test)
```bash
VITE_APP_ENV=test
VITE_SUPABASE_URL=https://test-project.supabase.co
VITE_DEBUG_MODE=true
VITE_MONITORING_INTERVAL=10000
```

## Application Configuration

### Tauri Configuration (tauri.conf.json)

```json
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devPath": "http://localhost:1420",
    "distDir": "../dist"
  },
  "package": {
    "productName": "VERA Environmental Awareness",
    "version": "1.0.0"
  },
  "tauri": {
    "allowlist": {
      "all": false,
      "shell": {
        "all": false,
        "open": true
      },
      "fs": {
        "all": true,
        "readFile": true,
        "writeFile": true,
        "createDir": true,
        "removeDir": true
      },
      "dialog": {
        "all": false,
        "open": true,
        "save": true
      },
      "notification": {
        "all": true
      },
      "system": {
        "all": true
      }
    },
    "bundle": {
      "active": true,
      "category": "Utility",
      "copyright": "",
      "deb": {
        "depends": []
      },
      "externalBin": [],
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ],
      "identifier": "com.vera.app",
      "longDescription": "Environmental awareness and system monitoring tool",
      "macOS": {
        "entitlements": null,
        "exceptionDomain": "",
        "frameworks": [],
        "providerShortName": null,
        "signingIdentity": null
      },
      "resources": [],
      "shortDescription": "VERA Environmental Monitor",
      "targets": "all",
      "windows": {
        "certificateThumbprint": null,
        "digestAlgorithm": "sha256",
        "timestampUrl": ""
      }
    },
    "security": {
      "csp": null
    },
    "updater": {
      "active": false
    },
    "windows": [
      {
        "fullscreen": false,
        "height": 800,
        "resizable": true,
        "title": "VERA Environmental Awareness",
        "width": 1200,
        "minWidth": 800,
        "minHeight": 600
      }
    ]
  }
}
```

### Vite Configuration (vite.config.ts)

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/styles': path.resolve(__dirname, './src/styles')
    }
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    }
  },
  server: {
    port: 1420,
    strictPort: true
  },
  envPrefix: ['VITE_', 'TAURI_'],
  clearScreen: false
})
```

## Database Configuration

### Supabase Setup

1. **Create Project**: Visit [supabase.com](https://supabase.com)
2. **Get API Keys**: Project Settings → API
3. **Configure Database**: See Database.md for schema setup

### Connection Pooling

```typescript
// supabase/client.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public'
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})
```

## Monitoring Configuration

### System Monitor Settings

```typescript
// config/monitoring.ts
export const monitoringConfig = {
  // Data collection interval (milliseconds)
  interval: Number(import.meta.env.VITE_MONITORING_INTERVAL) || 5000,
  
  // Data retention period (days)
  retentionDays: Number(import.meta.env.VITE_DATA_RETENTION_DAYS) || 30,
  
  // Enable real-time updates
  realTime: import.meta.env.VITE_ENABLE_REAL_TIME === 'true',
  
  // Batch size for data uploads
  batchSize: 50,
  
  // Metrics to collect
  metrics: {
    cpu: true,
    memory: true,
    disk: true,
    network: true,
    power: true,
    temperature: true
  },
  
  // Performance thresholds
  thresholds: {
    cpu: {
      warning: 70,
      critical: 90
    },
    memory: {
      warning: 80,
      critical: 95
    },
    temperature: {
      warning: 70,
      critical: 85
    }
  }
}
```

## Security Configuration

### Content Security Policy

```typescript
// security/csp.ts
export const cspConfig = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", "data:", "https:"],
  connectSrc: ["'self'", "https://*.supabase.co"],
  fontSrc: ["'self'", "https://fonts.gstatic.com"],
  objectSrc: ["'none'"],
  mediaSrc: ["'self'"],
  frameSrc: ["'none'"]
}
```

### Authentication Configuration

```typescript
// config/auth.ts
export const authConfig = {
  // Session duration (seconds)
  sessionDuration: 24 * 60 * 60, // 24 hours
  
  // Refresh token before expiry (seconds)
  refreshBefore: 5 * 60, // 5 minutes
  
  // Password requirements
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false
  },
  
  // OAuth providers
  providers: {
    google: {
      enabled: false
    },
    github: {
      enabled: false
    }
  }
}
```

## Performance Configuration

### Memory Management

```typescript
// config/performance.ts
export const performanceConfig = {
  // Maximum data points in memory
  maxDataPoints: 1000,
  
  // Cleanup interval (milliseconds)
  cleanupInterval: 60000, // 1 minute
  
  // Enable service worker
  serviceWorker: true,
  
  // Lazy loading configuration
  lazyLoading: {
    enabled: true,
    threshold: 100 // pixels
  },
  
  // Chart optimization
  charts: {
    maxPoints: 500,
    animationDuration: 300,
    throttleResize: 100
  }
}
```

### Caching Configuration

```typescript
// config/cache.ts
export const cacheConfig = {
  // Cache duration for different data types
  durations: {
    userData: 5 * 60 * 1000, // 5 minutes
    systemData: 30 * 1000, // 30 seconds
    staticData: 24 * 60 * 60 * 1000 // 24 hours
  },
  
  // Cache storage limits
  limits: {
    localStorage: 5 * 1024 * 1024, // 5MB
    indexedDB: 50 * 1024 * 1024 // 50MB
  },
  
  // Cache strategies
  strategies: {
    userData: 'stale-while-revalidate',
    systemData: 'network-first',
    staticData: 'cache-first'
  }
}
```

## Logging Configuration

### Log Levels

```typescript
// config/logging.ts
export const loggingConfig = {
  level: import.meta.env.VITE_DEBUG_MODE === 'true' ? 'debug' : 'info',
  
  // Console logging
  console: {
    enabled: true,
    colorize: true,
    timestamp: true
  },
  
  // File logging (desktop only)
  file: {
    enabled: true,
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    directory: 'logs'
  },
  
  // Remote logging
  remote: {
    enabled: false,
    endpoint: '',
    batchSize: 100,
    flushInterval: 30000 // 30 seconds
  }
}
```

## Notification Configuration

```typescript
// config/notifications.ts
export const notificationConfig = {
  // Default notification settings
  default: {
    duration: 5000, // 5 seconds
    position: 'top-right',
    showCloseButton: true
  },
  
  // Notification types
  types: {
    info: {
      icon: 'info',
      color: 'blue'
    },
    success: {
      icon: 'check',
      color: 'green'
    },
    warning: {
      icon: 'warning',
      color: 'yellow'
    },
    error: {
      icon: 'error',
      color: 'red',
      duration: 10000 // Longer duration for errors
    }
  },
  
  // System notifications (desktop)
  system: {
    enabled: true,
    icon: './icons/icon.png',
    badge: './icons/badge.png'
  }
}
```

## Theme Configuration

```typescript
// config/theme.ts
export const themeConfig = {
  default: 'system', // 'light', 'dark', or 'system'
  
  // Color schemes
  colors: {
    light: {
      primary: '#10b981',
      secondary: '#6b7280',
      background: '#ffffff',
      surface: '#f9fafb',
      text: '#111827'
    },
    dark: {
      primary: '#34d399',
      secondary: '#9ca3af',
      background: '#111827',
      surface: '#1f2937',
      text: '#f9fafb'
    }
  },
  
  // Font configuration
  fonts: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Consolas', 'monospace']
  },
  
  // Animation preferences
  animations: {
    enabled: true,
    duration: 200,
    easing: 'ease-in-out'
  }
}
```

## Build Configuration

### Environment-Specific Builds

```json
// package.json scripts
{
  "scripts": {
    "dev": "tauri dev",
    "build": "tauri build",
    "build:debug": "tauri build --debug",
    "build:release": "tauri build --config src-tauri/tauri.release.conf.json",
    "build:portable": "tauri build --config src-tauri/tauri.portable.conf.json"
  }
}
```

### Bundle Configuration

```json
// Windows installer configuration
{
  "windows": {
    "wix": {
      "language": ["en-US"],
      "template": "src-tauri/installer/main.wxs"
    },
    "nsis": {
      "license": "LICENSE",
      "installerIcon": "icons/icon.ico",
      "headerImage": "icons/header.bmp",
      "sidebarImage": "icons/sidebar.bmp"
    }
  }
}
```

## Troubleshooting Configuration Issues

### Common Configuration Problems

1. **Environment Variables Not Loading**
   - Check file naming (.env vs .env.local)
   - Verify VITE_ prefix for frontend variables
   - Restart development server after changes

2. **Database Connection Issues**
   - Verify Supabase URL and key
   - Check network connectivity
   - Validate database schema

3. **Build Failures**
   - Check tauri.conf.json syntax
   - Verify icon files exist
   - Ensure all dependencies are installed

### Configuration Validation

```typescript
// utils/validateConfig.ts
export const validateConfig = () => {
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ]
  
  const missing = requiredEnvVars.filter(
    key => !import.meta.env[key]
  )
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
  
  return true
}
```