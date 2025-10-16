# VERA Deployment Guide

## Overview

This guide covers deploying VERA Environmental Awareness application to various environments including development, staging, and production. VERA supports multiple deployment strategies including traditional server deployment, containerized deployment with Docker, and cloud platform deployment.

## Architecture Overview

VERA consists of three main components:
- **Frontend**: React SPA served as static files
- **Backend**: Node.js/Express API server
- **Desktop App**: Tauri-based desktop application

## Deployment Strategies

### 1. Traditional Server Deployment

#### Server Requirements

**Minimum Production Requirements:**
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **OS**: Ubuntu 20.04 LTS, CentOS 8, or Windows Server 2019
- **Network**: 1Gbps connection

**Recommended Production Requirements:**
- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 50GB+ SSD
- **Load Balancer**: For high availability
- **CDN**: For static asset delivery

#### Server Setup

##### Ubuntu/Debian Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Install Nginx (reverse proxy)
sudo apt-get install nginx

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Git
sudo apt-get install git

# Create application user
sudo adduser vera
sudo usermod -aG sudo vera
```

##### Database Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE vera_production;
CREATE USER vera_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE vera_production TO vera_user;
\q
```

##### Application Deployment

```bash
# Clone repository
git clone https://github.com/your-org/vera-environmental-awareness.git
cd vera-environmental-awareness

# Install dependencies
npm ci --only=production

# Build applications
npm run build

# Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with production values

# Run database migrations
cd backend
npm run db:migrate
npm run db:seed:production

# Start application with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

##### Nginx Configuration

Create `/etc/nginx/sites-available/vera`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Frontend (React SPA)
    location / {
        root /home/vera/vera-environmental-awareness/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # WebSocket support
    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/vera /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

##### SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Set up auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. Docker Deployment

#### Docker Configuration

##### Dockerfile (Backend)

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

EXPOSE 3001

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
```

##### Dockerfile (Frontend)

Create `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine AS production

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

##### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  # Database
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: vera_db
      POSTGRES_USER: vera_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/sql/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U vera_user -d vera_db"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  # Redis (for caching and sessions)
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://vera_user:${POSTGRES_PASSWORD}@postgres:5432/vera_db
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      PORT: 3001
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./backend/.env:/app/.env:ro
      - ./logs:/app/logs
    restart: unless-stopped

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

  # Nginx Load Balancer (optional, for scaling)
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl:ro
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

##### Environment Configuration

Create `.env` file:

```env
# Database
POSTGRES_PASSWORD=your_secure_postgres_password

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=1h

# Application
NODE_ENV=production
API_URL=https://your-domain.com/api
```

##### Deployment Commands

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Scale backend services
docker-compose up -d --scale backend=3

# Update application
git pull
docker-compose build
docker-compose up -d

# Backup database
docker-compose exec postgres pg_dump -U vera_user vera_db > backup.sql
```

### 3. Cloud Platform Deployment

#### AWS Deployment

##### AWS ECS with Fargate

Create `aws/ecs-task-definition.json`:

```json
{
  "family": "vera-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::account:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "vera-backend",
      "image": "your-account.dkr.ecr.region.amazonaws.com/vera-backend:latest",
      "portMappings": [
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:vera/database-url"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:vera/jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/vera-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "curl -f http://localhost:3001/health || exit 1"
        ],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

##### Terraform Configuration

Create `terraform/main.tf`:

```hcl
# Provider
provider "aws" {
  region = var.aws_region
}

# VPC
resource "aws_vpc" "vera_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "vera-vpc"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "vera_igw" {
  vpc_id = aws_vpc.vera_vpc.id

  tags = {
    Name = "vera-igw"
  }
}

# Subnets
resource "aws_subnet" "vera_subnet_public" {
  count             = 2
  vpc_id            = aws_vpc.vera_vpc.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  map_public_ip_on_launch = true

  tags = {
    Name = "vera-subnet-public-${count.index + 1}"
  }
}

# Security Groups
resource "aws_security_group" "vera_alb_sg" {
  name_prefix = "vera-alb-"
  vpc_id      = aws_vpc.vera_vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Application Load Balancer
resource "aws_lb" "vera_alb" {
  name               = "vera-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.vera_alb_sg.id]
  subnets            = aws_subnet.vera_subnet_public[*].id

  enable_deletion_protection = false
}

# ECS Cluster
resource "aws_ecs_cluster" "vera_cluster" {
  name = "vera-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# RDS Instance
resource "aws_db_instance" "vera_db" {
  identifier     = "vera-db"
  engine         = "postgres"
  engine_version = "15.3"
  instance_class = "db.t3.micro"

  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp2"
  storage_encrypted     = true

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.vera_db_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.vera_db_subnet_group.name

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  skip_final_snapshot = true
  deletion_protection = false

  tags = {
    Name = "vera-db"
  }
}
```

#### Google Cloud Platform (GCP)

##### Cloud Run Deployment

Create `cloudbuild.yaml`:

```yaml
steps:
  # Build backend image
  - name: 'gcr.io/cloud-builders/docker'
    dir: 'backend'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/vera-backend:$BUILD_ID', '.']

  # Push backend image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/vera-backend:$BUILD_ID']

  # Deploy to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: 'gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'vera-backend'
      - '--image'
      - 'gcr.io/$PROJECT_ID/vera-backend:$BUILD_ID'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'

images:
  - 'gcr.io/$PROJECT_ID/vera-backend:$BUILD_ID'
```

##### Kubernetes Deployment

Create `k8s/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vera-backend
  labels:
    app: vera-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: vera-backend
  template:
    metadata:
      labels:
        app: vera-backend
    spec:
      containers:
      - name: vera-backend
        image: gcr.io/PROJECT_ID/vera-backend:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: vera-secrets
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: vera-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: vera-backend-service
spec:
  selector:
    app: vera-backend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3001
  type: LoadBalancer
```

### 4. Desktop App Distribution

#### Windows Distribution

##### Code Signing

1. Obtain a code signing certificate
2. Configure Tauri for code signing:

```json
// tauri.conf.json
{
  "bundle": {
    "windows": {
      "certificateThumbprint": "YOUR_CERTIFICATE_THUMBPRINT",
      "timestampUrl": "http://timestamp.digicert.com"
    }
  }
}
```

##### MSI Installer

```bash
# Build Windows MSI installer
npm run build:tauri -- --target x86_64-pc-windows-msvc
```

##### Microsoft Store Distribution

1. Create Microsoft Partner Center account
2. Package app for Store:

```bash
# Generate MSIX package
npm run build:tauri -- --target x86_64-uwp-windows-msvc
```

#### macOS Distribution

##### Code Signing and Notarization

```bash
# Set up developer certificates
security import developer_id.p12 -k ~/Library/Keychains/login.keychain

# Build and sign
npm run build:tauri

# Notarize with Apple
xcrun notarytool submit "src-tauri/target/release/bundle/dmg/VERA_2.0.0_x64.dmg" \
  --apple-id "your-apple-id@example.com" \
  --password "app-specific-password" \
  --team-id "YOUR_TEAM_ID" \
  --wait
```

##### App Store Distribution

1. Configure App Store Connect
2. Build for App Store:

```bash
npm run build:tauri -- --target universal-apple-darwin
```

#### Linux Distribution

##### AppImage

```bash
# Build AppImage
npm run build:tauri -- --target x86_64-unknown-linux-gnu
```

##### Debian Package

```bash
# Build .deb package
npm run build:tauri -- --features "deb"
```

##### Flatpak Distribution

Create `com.vera.VERA.yml`:

```yaml
app-id: com.vera.VERA
runtime: org.freedesktop.Platform
runtime-version: '22.08'
sdk: org.freedesktop.Sdk
command: vera
finish-args:
  - --share=network
  - --socket=x11
  - --socket=wayland
  - --filesystem=home

modules:
  - name: vera
    buildsystem: simple
    build-commands:
      - install -D vera /app/bin/vera
      - install -D com.vera.VERA.desktop /app/share/applications/com.vera.VERA.desktop
      - install -D icon.png /app/share/icons/hicolor/128x128/apps/com.vera.VERA.png
    sources:
      - type: file
        path: src-tauri/target/release/vera
      - type: file
        path: com.vera.VERA.desktop
      - type: file
        path: icon.png
```

## Environment Management

### Environment Variables

#### Production Environment Variables

```bash
# Backend (.env.production)
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://user:password@prod-db:5432/vera_db
REDIS_URL=redis://prod-redis:6379

# Security
JWT_SECRET=production_jwt_secret_very_long_and_secure
CORS_ORIGIN=https://your-domain.com

# External Services
SENDGRID_API_KEY=your_sendgrid_api_key
S3_BUCKET=vera-prod-assets
AWS_REGION=us-east-1

# Monitoring
SENTRY_DSN=your_sentry_dsn
NEW_RELIC_LICENSE_KEY=your_new_relic_key

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/vera/app.log
```

#### Staging Environment Variables

```bash
# Backend (.env.staging)
NODE_ENV=staging
PORT=3001
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://user:password@staging-db:5432/vera_staging
REDIS_URL=redis://staging-redis:6379

# Security
JWT_SECRET=staging_jwt_secret_secure
CORS_ORIGIN=https://staging.your-domain.com

# Monitoring
LOG_LEVEL=debug
```

### Configuration Management

#### Using AWS Systems Manager Parameter Store

```bash
# Store parameters
aws ssm put-parameter --name "/vera/prod/database-url" --value "postgresql://..." --type "SecureString"
aws ssm put-parameter --name "/vera/prod/jwt-secret" --value "..." --type "SecureString"

# Retrieve in application
const AWS = require('aws-sdk');
const ssm = new AWS.SSM();

const getParameter = async (name) => {
  const result = await ssm.getParameter({
    Name: name,
    WithDecryption: true
  }).promise();
  return result.Parameter.Value;
};
```

## Monitoring and Logging

### Application Monitoring

#### Health Checks

Create `backend/src/routes/health.ts`:

```typescript
import { Router, Request, Response } from 'express';
import { createConnection } from 'typeorm';

const router = Router();

router.get('/health', async (req: Request, res: Response) => {
  try {
    // Check database connection
    const connection = await createConnection();
    await connection.query('SELECT 1');
    await connection.close();
    
    // Check Redis connection
    // ... redis health check
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
```

#### Prometheus Metrics

```typescript
import prometheus from 'prom-client';

// Create metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});

const httpRequestTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

// Middleware to collect metrics
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration);
      
    httpRequestTotal
      .labels(req.method, route, res.statusCode.toString())
      .inc();
  });
  
  next();
};
```

### Logging

#### Structured Logging with Winston

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'vera-backend',
    version: process.env.npm_package_version
  },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export default logger;
```

### Error Tracking

#### Sentry Integration

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0
});

// Error handling middleware
export const sentryErrorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  Sentry.captureException(error);
  next(error);
};
```

## Security Considerations

### SSL/TLS Configuration

#### Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### Security Headers

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https:"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api', limiter);
```

## Backup and Recovery

### Database Backup

#### Automated PostgreSQL Backup

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/var/backups/vera"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="vera_db"
DB_USER="vera_user"

mkdir -p $BACKUP_DIR

# Create backup
pg_dump -U $DB_USER -h localhost $DB_NAME | gzip > $BACKUP_DIR/vera_backup_$DATE.sql.gz

# Upload to S3
aws s3 cp $BACKUP_DIR/vera_backup_$DATE.sql.gz s3://vera-backups/

# Cleanup old backups (keep last 7 days)
find $BACKUP_DIR -name "vera_backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: vera_backup_$DATE.sql.gz"
```

#### Database Restoration

```bash
#!/bin/bash
# restore.sh

BACKUP_FILE=$1
DB_NAME="vera_db"
DB_USER="vera_user"

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file>"
  exit 1
fi

# Stop application
pm2 stop vera-backend

# Drop and recreate database
dropdb -U $DB_USER $DB_NAME
createdb -U $DB_USER $DB_NAME

# Restore backup
gunzip -c $BACKUP_FILE | psql -U $DB_USER -d $DB_NAME

# Start application
pm2 start vera-backend

echo "Database restored from $BACKUP_FILE"
```

## Performance Optimization

### Database Optimization

#### PostgreSQL Configuration

```sql
-- postgresql.conf optimizations
shared_buffers = '256MB'
effective_cache_size = '1GB'
maintenance_work_mem = '64MB'
checkpoint_completion_target = 0.9
wal_buffers = '16MB'
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
```

#### Database Indexing

```sql
-- Performance indexes
CREATE INDEX CONCURRENTLY idx_energy_data_user_timestamp 
ON energy_data(user_id, timestamp DESC);

CREATE INDEX CONCURRENTLY idx_energy_data_device_timestamp 
ON energy_data(device_id, timestamp DESC);

CREATE INDEX CONCURRENTLY idx_users_email 
ON users(email);
```

### Application Performance

#### Caching Strategy

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache middleware
export const cacheMiddleware = (ttl: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `cache:${req.originalUrl}`;
    
    try {
      const cached = await redis.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    } catch (error) {
      logger.warn('Cache read error:', error);
    }
    
    // Override res.json to cache response
    const originalJson = res.json;
    res.json = function(data) {
      redis.setex(key, ttl, JSON.stringify(data)).catch(err => 
        logger.warn('Cache write error:', err)
      );
      return originalJson.call(this, data);
    };
    
    next();
  };
};
```

### CDN Configuration

#### CloudFlare Configuration

```javascript
// cloudflare-worker.js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Cache static assets
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$/)) {
    const cache = caches.default
    const cacheKey = new Request(url.toString(), request)
    const response = await cache.match(cacheKey)
    
    if (response) {
      return response
    }
    
    const originResponse = await fetch(request)
    const responseClone = originResponse.clone()
    
    if (originResponse.status === 200) {
      await cache.put(cacheKey, responseClone)
    }
    
    return originResponse
  }
  
  return fetch(request)
}
```

## Troubleshooting

### Common Deployment Issues

#### 1. Database Connection Issues

```bash
# Check database connectivity
pg_isready -h your-db-host -p 5432 -U vera_user

# Check network connectivity
telnet your-db-host 5432

# Test connection string
psql "postgresql://vera_user:password@your-db-host:5432/vera_db"
```

#### 2. Memory Issues

```bash
# Monitor memory usage
free -h
htop

# Check application memory
pm2 monit

# Optimize Node.js memory
node --max-old-space-size=4096 dist/server.js
```

#### 3. SSL Certificate Issues

```bash
# Check certificate validity
openssl x509 -in certificate.crt -text -noout

# Test SSL connection
openssl s_client -connect your-domain.com:443

# Renew Let's Encrypt certificate
certbot renew --dry-run
```

### Performance Troubleshooting

#### Database Performance

```sql
-- Check slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check database locks
SELECT pid, state, query, query_start
FROM pg_stat_activity
WHERE state = 'active';
```

#### Application Performance

```bash
# CPU profiling
node --prof dist/server.js
node --prof-process isolate-*.log > profile.txt

# Memory profiling
node --inspect dist/server.js
# Use Chrome DevTools for heap analysis
```

### Log Analysis

```bash
# Application logs
tail -f logs/combined.log | grep ERROR

# System logs
journalctl -u vera-backend -f

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## Rollback Procedures

### Application Rollback

```bash
#!/bin/bash
# rollback.sh

PREVIOUS_VERSION=$1

if [ -z "$PREVIOUS_VERSION" ]; then
  echo "Usage: $0 <previous_version>"
  exit 1
fi

# Stop current application
pm2 stop vera-backend

# Checkout previous version
git checkout $PREVIOUS_VERSION

# Install dependencies
npm ci --only=production

# Build application
npm run build

# Run database migrations (if needed)
npm run db:migrate:down

# Start application
pm2 start vera-backend

echo "Rollback to $PREVIOUS_VERSION completed"
```

### Database Rollback

```bash
# Rollback database migration
npm run db:migrate:down

# Restore from backup
./scripts/restore.sh /var/backups/vera/vera_backup_20231015_120000.sql.gz
```

## Support and Maintenance

### Scheduled Maintenance

```bash
# Weekly maintenance script
#!/bin/bash

# Update system packages
sudo apt update && sudo apt upgrade -y

# Restart services
pm2 restart all

# Cleanup logs
find /var/log -name "*.log" -mtime +30 -delete

# Database maintenance
sudo -u postgres vacuumdb --all --analyze

# Backup verification
./scripts/backup-verify.sh

echo "Maintenance completed: $(date)"
```

### Monitoring Alerts

#### Prometheus Alerting Rules

```yaml
# alerts.yml
groups:
- name: vera-alerts
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"
      
  - alert: DatabaseDown
    expr: up{job="postgres"} == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Database is down"
```

---

For additional support, refer to our [Troubleshooting Guide](./TROUBLESHOOTING.md) or contact the operations team.