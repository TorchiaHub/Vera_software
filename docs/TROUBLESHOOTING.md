# Troubleshooting Guide

## Common Issues and Solutions

### Build Issues

#### Tauri Build Failures

**Problem**: `tauri build` fails with "failed to resolve dependencies"
```
Error: Failed to resolve dependencies in Cargo.toml
```

**Solution**:
```bash
# Clean Rust cache
cd src-tauri
cargo clean

# Update dependencies
cargo update

# Rebuild
cargo build
```

#### Bundle Creation Fails

**Problem**: No installer generated after build
```
Error: Bundle creation failed - no NSIS/WiX found
```

**Solution**:
```powershell
# Install NSIS (Windows)
winget install NSIS.NSIS

# Or download from: https://nsis.sourceforge.io/
# Add to PATH: C:\Program Files (x86)\NSIS
```

#### React Build Errors

**Problem**: Frontend compilation errors
```
Error: Module not found: Can't resolve './components/...'
```

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or use yarn
rm -rf node_modules yarn.lock  
yarn install
```

### Authentication Issues

#### Supabase Connection Failed

**Problem**: Cannot connect to Supabase database
```
Error: Invalid API key or URL
```

**Solution**:
1. Check environment variables:
   ```bash
   # Verify .env file
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

2. Verify API keys in Supabase dashboard
3. Check network connectivity

#### User Session Expired

**Problem**: Users logged out unexpectedly
```
Error: Session expired or invalid
```

**Solution**:
```typescript
// Implement session refresh
const { data: { session }, error } = await supabase.auth.refreshSession()
if (error) {
  // Redirect to login
  router.push('/login')
}
```

#### Login Redirect Loops

**Problem**: Infinite redirects between login and dashboard
```
Error: Authentication redirect loop detected
```

**Solution**:
```typescript
// Check auth state properly
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  
  return children
}
```

### Performance Issues

#### High CPU Usage

**Problem**: Application consuming excessive CPU
```
Symptoms: Fan noise, slow system response
```

**Solutions**:
1. **Reduce monitoring frequency**:
   ```typescript
   // Change from 1s to 5s intervals
   const MONITORING_INTERVAL = 5000
   ```

2. **Optimize data collection**:
   ```typescript
   // Batch data points
   const batchSize = 10
   const dataBuffer = []
   ```

3. **Disable debug mode**:
   ```typescript
   const DEBUG_MODE = false
   ```

#### Memory Leaks

**Problem**: Memory usage constantly increasing
```
Symptoms: Slow performance over time
```

**Solutions**:
```typescript
// Cleanup intervals on component unmount
useEffect(() => {
  const interval = setInterval(collectData, 1000)
  
  return () => {
    clearInterval(interval)
  }
}, [])

// Clear data buffers periodically  
const clearOldData = () => {
  const cutoff = Date.now() - (24 * 60 * 60 * 1000) // 24h
  dataBuffer = dataBuffer.filter(d => d.timestamp > cutoff)
}
```

### System Monitor Issues

#### No Performance Data

**Problem**: System monitoring returns no data
```
Error: Unable to collect system metrics
```

**Platform-specific Solutions**:

**Windows**:
```rust
// Check Windows API permissions
use windows::Win32::System::Performance::*;

// Verify PowerShell execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**macOS**:
```rust
// Check activity monitor permissions
use system_configuration::*;

// Grant Full Disk Access in System Preferences
```

**Linux**:
```bash
# Install required packages
sudo apt-get install lm-sensors
sudo sensors-detect

# Check permissions for /proc files
ls -la /proc/cpuinfo /proc/meminfo
```

#### Inaccurate Power Readings

**Problem**: Power consumption showing 0 or unrealistic values
```
Error: Power readings unavailable or incorrect
```

**Solutions**:
1. **Check hardware support**:
   ```bash
   # Windows - check PowerShell
   Get-Counter "\Processor Information(_Total)\% Processor Utility"
   
   # Linux - check powertop
   sudo powertop --dump
   
   # macOS - check powermetrics  
   sudo powermetrics -n 1
   ```

2. **Use fallback calculations**:
   ```typescript
   // Estimate power from CPU usage
   const estimatePower = (cpuUsage: number) => {
     const basePower = 65 // TDP in watts
     return basePower * (0.3 + 0.7 * cpuUsage / 100)
   }
   ```

### Database Issues

#### SQLite Connection Errors

**Problem**: Cannot access local SQLite database
```
Error: database is locked
```

**Solutions**:
```rust
// Use WAL mode for better concurrency
use rusqlite::{Connection, OpenFlags};

let conn = Connection::open_with_flags(
    "data.db",
    OpenFlags::SQLITE_OPEN_READ_WRITE 
    | OpenFlags::SQLITE_OPEN_CREATE
    | OpenFlags::SQLITE_OPEN_NO_MUTEX
)?;

conn.execute("PRAGMA journal_mode=WAL", [])?;
```

#### Sync Conflicts

**Problem**: Data conflicts between local and remote
```
Error: Sync conflict detected
```

**Solution**:
```typescript
// Implement conflict resolution
const resolveConflict = (local: any, remote: any) => {
  // Use remote timestamp as tiebreaker
  return remote.updated_at > local.updated_at ? remote : local
}
```

### UI/UX Issues

#### Chart Not Displaying

**Problem**: Energy charts show no data
```
Error: Chart component renders empty
```

**Solutions**:
1. **Check data format**:
   ```typescript
   // Ensure data has required structure
   const chartData = data.map(point => ({
     timestamp: new Date(point.timestamp).getTime(),
     value: Number(point.energy_usage) || 0
   }))
   ```

2. **Verify chart library**:
   ```bash
   # Reinstall chart dependencies
   npm uninstall recharts chart.js
   npm install recharts@latest
   ```

#### Dark Mode Issues

**Problem**: Colors not updating properly
```
Symptoms: White text on white background
```

**Solution**:
```css
/* Ensure proper CSS variables */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
}

[data-theme="dark"] {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}
```

### Network Issues

#### Offline Mode Not Working

**Problem**: App crashes when internet disconnected
```
Error: Network request failed
```

**Solution**:
```typescript
// Implement offline detection
const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  return isOnline
}
```

#### Slow Data Loading

**Problem**: Dashboard takes long time to load
```
Symptoms: Spinner shows for >5 seconds
```

**Solutions**:
1. **Implement pagination**:
   ```sql
   SELECT * FROM performance_data 
   WHERE device_id = ? 
   ORDER BY timestamp DESC 
   LIMIT 100 OFFSET ?
   ```

2. **Use data compression**:
   ```typescript
   // Compress large datasets
   const compressData = (data: any[]) => {
     return data.filter((_, index) => index % 5 === 0) // Sample every 5th point
   }
   ```

## Debugging Tools

### Development Mode

**Enable Debug Logging**:
```typescript
// Add to main.tsx
if (process.env.NODE_ENV === 'development') {
  window.DEBUG = true
  console.log('Debug mode enabled')
}
```

### Tauri Debug Mode

**Open DevTools**:
```rust
// In main.rs
#[cfg(debug_assertions)]
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![])
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            window.open_devtools();
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Performance Profiling

**Chrome DevTools**:
1. Open DevTools (F12)
2. Go to Performance tab
3. Click Record
4. Interact with app
5. Stop recording and analyze

**Rust Profiling**:
```bash
# Install flamegraph
cargo install flamegraph

# Profile the application
sudo flamegraph -- ./target/release/vera-app
```

## Log Analysis

### Application Logs

**Location**:
- Windows: `%APPDATA%\com.vera.app\logs\`
- macOS: `~/Library/Logs/com.vera.app/`
- Linux: `~/.local/share/com.vera.app/logs/`

**Log Levels**:
```rust
// Configure logging in main.rs
use tracing::{info, warn, error, debug};
use tracing_subscriber;

fn init_logging() {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::DEBUG)
        .init();
}
```

### Database Query Logging

**Enable SQL Logging**:
```typescript
// Add to Supabase client
const supabase = createClient(url, key, {
  db: {
    schema: 'public',
  },
  debug: process.env.NODE_ENV === 'development'
})
```

## Emergency Recovery

### Reset to Factory Settings

**Clear All Data**:
```bash
# Stop application first
# Then remove data directories

# Windows
rd /s /q "%APPDATA%\com.vera.app"

# macOS  
rm -rf ~/Library/Application\ Support/com.vera.app

# Linux
rm -rf ~/.local/share/com.vera.app
```

### Database Recovery

**Backup and Restore**:
```sql
-- Create backup
.backup backup.db

-- Restore from backup  
.restore backup.db
```

### Configuration Reset

**Reset Config Files**:
```json
// Delete and recreate config.json
{
  "monitoring_interval": 5000,
  "data_retention_days": 30,
  "sync_enabled": true,
  "debug_mode": false
}
```

## Getting Help

### Support Channels
- **GitHub Issues**: https://github.com/TorchiaHub/Vera_software/issues
- **Discussions**: https://github.com/TorchiaHub/Vera_software/discussions
- **Documentation**: Check latest docs/ folder

### Bug Reports

**Include This Information**:
1. Operating System and version
2. Application version
3. Steps to reproduce
4. Expected vs actual behavior
5. Error messages/logs
6. Screenshots if relevant

**Log Collection**:
```bash
# Collect system info
# Windows
systeminfo > system-info.txt

# macOS
system_profiler SPHardwareDataType > system-info.txt

# Linux  
uname -a && lscpu && free -h > system-info.txt
```
df -h / | tail -1 | awk '{print $5}' | sed 's/%//' | {
  read usage
  if [ $usage -gt 80 ]; then
    echo "❌ Disk usage high: ${usage}%"
  else
    echo "✅ Disk usage normal: ${usage}%"
  fi
}
echo

# Check memory
echo "Memory Usage:"
free -m | awk 'NR==2{printf "Memory Usage: %s/%sMB (%.2f%%)\n", $3,$2,$3*100/$2 }'
echo

# Check application processes
echo "Application Processes:"
if pgrep -f "vera" > /dev/null; then
  echo "✅ VERA processes running"
  ps aux | grep vera | grep -v grep
else
  echo "❌ No VERA processes found"
fi
```

## Installation Issues

### Node.js and npm Issues

#### Issue: Node.js version mismatch

**Symptoms:**
- Build errors with incompatible syntax
- Package installation failures
- Runtime errors

**Solution:**
```bash
# Check current version
node --version

# Install Node Version Manager (nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install and use correct Node.js version
nvm install 18
nvm use 18
nvm alias default 18

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x or higher
```

#### Issue: npm permission errors

**Symptoms:**
- `EACCES` errors during `npm install`
- Permission denied when installing global packages

**Solution:**
```bash
# Option 1: Use npm's built-in solution
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Option 2: Fix npm permissions
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}

# Option 3: Use npx instead of global installs
npx create-react-app my-app
```

#### Issue: Package installation timeouts

**Symptoms:**
- `npm install` hangs or times out
- Network timeout errors

**Solution:**
```bash
# Increase timeout
npm config set fetch-timeout 600000
npm config set fetch-retry-mintimeout 20000
npm config set fetch-retry-maxtimeout 120000

# Use different registry
npm config set registry https://registry.npmjs.org/

# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Database Issues

#### Issue: PostgreSQL connection refused

**Symptoms:**
- `ECONNREFUSED` errors
- "database does not exist" errors

**Diagnosis:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql
pg_isready -h localhost -p 5432

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

**Solution:**
```bash
# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
CREATE DATABASE vera_db;
CREATE USER vera_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE vera_db TO vera_user;
\q

# Test connection
psql -h localhost -U vera_user -d vera_db
```

#### Issue: Database migration failures

**Symptoms:**
- Migration scripts fail to run
- Schema version mismatches

**Diagnosis:**
```bash
# Check migration status
npm run db:migrate:status

# Check database schema
psql -U vera_user -d vera_db -c "\dt"
```

**Solution:**
```bash
# Reset database (⚠️ This will delete all data)
npm run db:migrate:reset

# Run migrations step by step
npm run db:migrate

# If migrations are stuck, rollback and retry
npm run db:migrate:down
npm run db:migrate:up

# Check migration table
psql -U vera_user -d vera_db -c "SELECT * FROM schema_migrations;"
```

## Development Issues

### Build and Compilation Errors

#### Issue: TypeScript compilation errors

**Symptoms:**
- `tsc` command fails
- Type errors in IDE
- Build process stops

**Diagnosis:**
```bash
# Check TypeScript version
npx tsc --version

# Run type checking
npx tsc --noEmit

# Check for conflicting types
npm ls @types/
```

**Solution:**
```bash
# Update TypeScript and type definitions
npm update typescript @types/node @types/react @types/express

# Clear TypeScript cache
rm -rf node_modules/.cache
rm -rf dist/
npm run build

# Fix common type issues
# 1. Check tsconfig.json paths
# 2. Ensure all imports are correctly typed
# 3. Add type declarations for untyped modules
```

#### Issue: Module resolution errors

**Symptoms:**
- `Cannot find module` errors
- Import path issues
- Bundler errors

**Solution:**
```bash
# Check module paths in tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@components/*": ["components/*"],
      "@services/*": ["services/*"]
    }
  }
}

# Update package.json imports
{
  "imports": {
    "#components/*": "./src/components/*",
    "#services/*": "./src/services/*"
  }
}

# Clear module cache
rm -rf node_modules/.cache
npm run build
```

### React and Frontend Issues

#### Issue: React hooks errors

**Symptoms:**
- "Hooks can only be called inside function components"
- "Invalid hook call" warnings

**Solution:**
```typescript
// ❌ Incorrect - hook called conditionally
function MyComponent() {
  if (condition) {
    const [state, setState] = useState(0); // Wrong!
  }
}

// ✅ Correct - hooks always called at top level
function MyComponent() {
  const [state, setState] = useState(0);
  
  if (condition) {
    // Use state here
  }
}

// Check for duplicate React versions
npm ls react
# If multiple versions exist, resolve dependencies
npm dedupe
```

#### Issue: State management issues

**Symptoms:**
- State not updating
- Infinite re-renders
- Memory leaks

**Solution:**
```typescript
// ❌ Incorrect - missing dependency
useEffect(() => {
  fetchData(userId);
}, []); // Missing userId dependency

// ✅ Correct - include all dependencies
useEffect(() => {
  fetchData(userId);
}, [userId]);

// ❌ Incorrect - object/array dependency causing infinite re-renders
useEffect(() => {
  // Some effect
}, [{ key: 'value' }]); // New object each render

// ✅ Correct - stable dependency
const stableObj = useMemo(() => ({ key: 'value' }), []);
useEffect(() => {
  // Some effect
}, [stableObj]);
```

### Backend and API Issues

#### Issue: Express server won't start

**Symptoms:**
- Server crashes on startup
- Port already in use errors
- Middleware errors

**Diagnosis:**
```bash
# Check what's using the port
lsof -i :3001
netstat -tulpn | grep 3001

# Check application logs
npm run dev:backend 2>&1 | tee debug.log
```

**Solution:**
```bash
# Kill process using port
kill -9 $(lsof -ti:3001)

# Use different port
export PORT=3002
npm run dev:backend

# Check environment variables
echo $NODE_ENV
echo $DATABASE_URL
```

#### Issue: API authentication failures

**Symptoms:**
- 401 Unauthorized errors
- JWT token issues
- Session problems

**Diagnosis:**
```bash
# Test API endpoint
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Check JWT token
echo "YOUR_JWT_TOKEN" | base64 -d
```

**Solution:**
```typescript
// Check JWT secret configuration
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// Verify token structure
const token = jwt.sign(
  { userId: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

// Add proper error handling
app.use((error, req, res, next) => {
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }
  next(error);
});
```

## Deployment Issues

### Docker and Container Issues

#### Issue: Docker build failures

**Symptoms:**
- Docker build process fails
- Image size too large
- Container won't start

**Diagnosis:**
```bash
# Check Docker status
docker --version
docker system info

# Build with verbose output
docker build --no-cache --progress=plain -t vera-backend .

# Check image sizes
docker images | grep vera
```

**Solution:**
```dockerfile
# Use multi-stage builds to reduce size
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Use alpine images for smaller size
FROM node:18-alpine
# Add non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs
```

#### Issue: Container networking problems

**Symptoms:**
- Containers can't communicate
- Port binding issues
- DNS resolution failures

**Solution:**
```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/vera_db
    depends_on:
      - postgres
    networks:
      - vera-network

  postgres:
    image: postgres:15-alpine
    networks:
      - vera-network

networks:
  vera-network:
    driver: bridge
```

### Tauri Desktop App Issues

#### Issue: Tauri build failures

**Symptoms:**
- Rust compilation errors
- Platform-specific build issues
- Code signing problems

**Diagnosis:**
```bash
# Check Rust installation
rustc --version
cargo --version

# Check Tauri CLI
npm list @tauri-apps/cli

# Verbose build output
npm run build:tauri -- --verbose
```

**Solution:**
```bash
# Update Rust
rustup update

# Install platform-specific dependencies

# Windows
# Install Microsoft C++ Build Tools
# Install Windows 10 SDK

# macOS
xcode-select --install

# Linux (Ubuntu/Debian)
sudo apt-get install libwebkit2gtk-4.0-dev \
  build-essential \
  curl \
  wget \
  libssl-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev

# Clear Tauri cache
rm -rf src-tauri/target
cargo clean --manifest-path=src-tauri/Cargo.toml
```

#### Issue: Tauri frontend integration problems

**Symptoms:**
- White screen in desktop app
- Frontend not loading
- API communication failures

**Solution:**
```json
// tauri.conf.json
{
  "build": {
    "frontendDist": "../frontend/dist",
    "devUrl": "http://localhost:5173"
  },
  "app": {
    "security": {
      "csp": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    }
  }
}
```

```rust
// src-tauri/src/main.rs
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

## Performance Issues

### Slow Application Performance

#### Issue: High memory usage

**Symptoms:**
- Application becomes unresponsive
- Memory leaks
- OOM (Out of Memory) errors

**Diagnosis:**
```bash
# Monitor memory usage
top -p $(pgrep -f vera)
htop

# Node.js memory analysis
node --inspect dist/server.js
# Open Chrome DevTools -> Memory tab

# Check for memory leaks
ps aux | grep vera
cat /proc/$(pgrep -f vera)/status | grep Vm
```

**Solution:**
```typescript
// Fix common memory leaks

// ❌ Event listener not removed
useEffect(() => {
  window.addEventListener('resize', handleResize);
}, []); // Missing cleanup

// ✅ Proper cleanup
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);

// ❌ Circular references
const user = { name: 'John' };
user.self = user; // Circular reference

// ✅ Avoid circular references or use WeakMap
const references = new WeakMap();
references.set(user, metadata);
```

#### Issue: Slow database queries

**Symptoms:**
- API endpoints timing out
- High database CPU usage
- Slow page loads

**Diagnosis:**
```sql
-- Check slow queries
SELECT query, mean_time, calls, total_time, rows, 100.0 * shared_blks_hit /
       nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check table sizes
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND n_distinct > 100
  AND correlation < 0.1;
```

**Solution:**
```sql
-- Add performance indexes
CREATE INDEX CONCURRENTLY idx_energy_data_user_timestamp 
ON energy_data(user_id, timestamp DESC);

CREATE INDEX CONCURRENTLY idx_energy_data_device_id 
ON energy_data(device_id) WHERE device_id IS NOT NULL;

-- Optimize queries
-- ❌ Slow query
SELECT * FROM energy_data WHERE user_id = ? ORDER BY timestamp DESC;

-- ✅ Optimized query
SELECT id, device_id, timestamp, power_consumption 
FROM energy_data 
WHERE user_id = ? 
ORDER BY timestamp DESC 
LIMIT 100;

-- Use query optimization
EXPLAIN ANALYZE SELECT ...;
```

### Network and API Issues

#### Issue: Slow API responses

**Symptoms:**
- High response times
- Timeout errors
- Poor user experience

**Solution:**
```typescript
// Add response caching
import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes

app.get('/api/energy/stats', (req, res) => {
  const cacheKey = `stats:${req.user.id}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return res.json(cached);
  }
  
  // Fetch data and cache
  const data = getEnergyStats(req.user.id);
  cache.set(cacheKey, data);
  res.json(data);
});

// Implement request timeout
app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    res.status(408).json({ error: 'Request timeout' });
  });
  next();
});

// Use compression
import compression from 'compression';
app.use(compression());
```

## Network and Connectivity Issues

### API Connection Problems

#### Issue: CORS errors

**Symptoms:**
- Browser console shows CORS errors
- API requests blocked
- "Access-Control-Allow-Origin" errors

**Solution:**
```typescript
// Backend CORS configuration
import cors from 'cors';

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com', 'https://www.your-domain.com']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));
```

#### Issue: SSL/TLS certificate problems

**Symptoms:**
- "NET::ERR_CERT_AUTHORITY_INVALID"
- SSL handshake failures
- Mixed content errors

**Solution:**
```bash
# Check certificate validity
openssl x509 -in /etc/ssl/certs/your-cert.pem -text -noout

# Test SSL connection
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Fix certificate chain
cat your-cert.pem intermediate.pem root.pem > fullchain.pem

# Update certificate
sudo certbot renew
sudo systemctl reload nginx
```

## Security Issues

### Authentication and Authorization

#### Issue: JWT token problems

**Symptoms:**
- "Invalid token" errors
- Users getting logged out unexpectedly
- Token expiration issues

**Solution:**
```typescript
// Implement proper token refresh
const refreshToken = async (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    
    // Check if token is close to expiration
    const now = Math.floor(Date.now() / 1000);
    const timeToExpiry = decoded.exp - now;
    
    if (timeToExpiry < 300) { // Less than 5 minutes
      const newToken = jwt.sign(
        { userId: decoded.userId, email: decoded.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      return newToken;
    }
    
    return token;
  } catch (error) {
    throw new Error('Token refresh failed');
  }
};

// Add token refresh middleware
app.use('/api', async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (token) {
    try {
      const refreshedToken = await refreshToken(token);
      if (refreshedToken !== token) {
        res.setHeader('X-New-Token', refreshedToken);
      }
    } catch (error) {
      return res.status(401).json({ error: 'Token refresh failed' });
    }
  }
  
  next();
});
```

#### Issue: Session management problems

**Symptoms:**
- Users staying logged in after logout
- Session data persisting incorrectly
- Cross-tab session issues

**Solution:**
```typescript
// Implement proper session management
import session from 'express-session';
import RedisStore from 'connect-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

app.use(session({
  store: new RedisStore({ client: redis }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict'
  }
}));

// Logout endpoint that clears session
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});
```

## Data and Storage Issues

### File Upload Problems

#### Issue: File upload failures

**Symptoms:**
- Upload progress stops
- File size limit errors
- Corrupt uploaded files

**Solution:**
```typescript
import multer from 'multer';
import path from 'path';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    // Allow only specific file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Error handling for file uploads
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files' });
    }
  }
  next(error);
});
```

### Data Corruption Issues

#### Issue: Database data integrity problems

**Symptoms:**
- Inconsistent data between tables
- Foreign key constraint violations
- Data validation failures

**Solution:**
```sql
-- Check data integrity
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type IN ('FOREIGN KEY', 'PRIMARY KEY', 'UNIQUE')
  AND tc.table_schema = 'public';

-- Find orphaned records
SELECT e.* 
FROM energy_data e 
LEFT JOIN users u ON e.user_id = u.id 
WHERE u.id IS NULL;

-- Fix orphaned records
DELETE FROM energy_data 
WHERE user_id NOT IN (SELECT id FROM users);

-- Add proper constraints
ALTER TABLE energy_data 
ADD CONSTRAINT fk_energy_data_user 
FOREIGN KEY (user_id) REFERENCES users(id) 
ON DELETE CASCADE;
```

## Monitoring and Logging Issues

### Log Analysis Problems

#### Issue: Missing or insufficient logs

**Symptoms:**
- Hard to debug issues
- No audit trail
- Performance problems not visible

**Solution:**
```typescript
import winston from 'winston';

// Create comprehensive logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...meta,
        environment: process.env.NODE_ENV,
        service: 'vera-backend'
      });
    })
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

// Add request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id
    });
  });
  
  next();
});

// Log errors with context
app.use((error, req, res, next) => {
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    userId: req.user?.id,
    body: req.body
  });
  
  next(error);
});
```

## Environment-Specific Issues

### Development Environment

#### Issue: Hot reload not working

**Symptoms:**
- Changes not reflected in browser
- Manual refresh required
- Development server issues

**Solution:**
```javascript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Allow external connections
    hmr: {
      overlay: true
    },
    watch: {
      usePolling: true, // For WSL/Docker environments
      interval: 100
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

// For backend hot reload with nodemon
// nodemon.json
{
  "watch": ["src"],
  "ext": "ts,js,json",
  "ignore": ["src/**/*.test.ts"],
  "exec": "node -r ts-node/register src/server.ts"
}
```

### Production Environment

#### Issue: Environment variable problems

**Symptoms:**
- Configuration not loaded
- Default values used instead of production values
- Service failures

**Solution:**
```bash
# Create environment validation script
#!/bin/bash
# validate-env.sh

REQUIRED_VARS=(
  "NODE_ENV"
  "DATABASE_URL"
  "JWT_SECRET"
  "PORT"
)

echo "Validating environment variables..."

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ $var is not set"
    exit 1
  else
    echo "✅ $var is set"
  fi
done

echo "Environment validation passed"
```

```typescript
// Environment validation in application
const requiredEnvVars = [
  'NODE_ENV',
  'DATABASE_URL',
  'JWT_SECRET',
  'PORT'
];

const validateEnvironment = () => {
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    process.exit(1);
  }
};

validateEnvironment();
```

## Getting Help

### Log Collection

Before seeking help, collect relevant logs:

```bash
#!/bin/bash
# collect-logs.sh

echo "Collecting VERA logs for support..."

mkdir -p support-logs
cd support-logs

# System information
echo "=== System Information ===" > system-info.txt
uname -a >> system-info.txt
cat /etc/os-release >> system-info.txt
node --version >> system-info.txt
npm --version >> system-info.txt
docker --version >> system-info.txt 2>/dev/null

# Application logs
cp ../logs/*.log . 2>/dev/null

# Configuration files (remove sensitive data)
cp ../.env.example .env-template
cp ../package.json .
cp ../docker-compose.yml . 2>/dev/null

# Database information
pg_dump --schema-only vera_db > schema.sql 2>/dev/null

# Create archive
tar -czf ../vera-support-$(date +%Y%m%d-%H%M%S).tar.gz .
cd ..
rm -rf support-logs

echo "Support package created: vera-support-*.tar.gz"
```

### Support Channels

1. **GitHub Issues**: [Report bugs and feature requests](https://github.com/your-org/vera/issues)
2. **Documentation**: Check our comprehensive docs
3. **Community Forum**: Join discussions with other users
4. **Email Support**: dev@vera.com for enterprise customers

### Creating Effective Bug Reports

Include the following information:

1. **Environment Details**:
   - OS and version
   - Node.js version
   - npm version
   - Docker version (if applicable)

2. **Steps to Reproduce**:
   - Exact steps that trigger the issue
   - Expected vs actual behavior
   - Screenshots or videos if helpful

3. **Error Messages**:
   - Complete error messages
   - Stack traces
   - Browser console errors

4. **Configuration**:
   - Relevant configuration files
   - Environment variables (without secrets)
   - Database schema if data-related

5. **Logs**:
   - Application logs
   - System logs
   - Database logs

---

For additional support, refer to our [Setup Guide](./SETUP.md) or [Deployment Guide](./DEPLOYMENT.md).