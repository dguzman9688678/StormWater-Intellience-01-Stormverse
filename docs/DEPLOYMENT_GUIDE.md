# Deployment Guide - StormVerse Environmental Intelligence Platform

## Overview

This guide provides comprehensive instructions for deploying StormVerse locally, on Replit, or in production environments with full ARCSEC security protocol implementation.

---

## 🚀 Local Development Deployment

### Prerequisites
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher
- **PostgreSQL**: Version 13+ (optional - in-memory storage available)
- **Git**: For repository management
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Quick Start
```bash
# Clone the repository
git clone https://github.com/stormverse/environmental-intelligence.git
cd environmental-intelligence

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

### Environment Configuration
Create `.env` file with required variables:
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/stormverse
NODE_ENV=development

# Cesium Configuration
CESIUM_ION_TOKEN=your_cesium_ion_access_token

# Weather Data APIs (Optional)
NOAA_API_KEY=your_noaa_api_key
NHC_RSS_ENDPOINT=https://www.nhc.noaa.gov/nhc_atlantic.xml

# ARCSEC Security
ARCSEC_PRIVATE_KEY=your_arcsec_private_key
ARCSEC_PUBLIC_KEY=your_arcsec_public_key

# Development Settings
VITE_DEV_MODE=true
LOG_LEVEL=debug
```

### Database Setup
```bash
# Using PostgreSQL
createdb stormverse
npm run db:migrate

# Using in-memory storage (development only)
# No additional setup required
```

---

## 🔧 Replit Deployment

### Replit Configuration
StormVerse is optimized for Replit deployment with automatic configuration:

#### 1. Repository Setup
```bash
# Fork or import repository to Replit
# Repository URL: https://github.com/stormverse/environmental-intelligence
```

#### 2. Environment Variables in Replit
Add the following in Replit Secrets:
```
DATABASE_URL=<replit_database_url>
CESIUM_ION_TOKEN=<your_cesium_token>
NOAA_API_KEY=<optional_noaa_key>
ARCSEC_PRIVATE_KEY=<generated_private_key>
```

#### 3. Automatic Deployment
```bash
# Replit automatically detects package.json and runs:
npm install
npm run dev

# Application available at your-repl-name.replit.app
```

#### 4. Replit-Specific Features
- **Automatic HTTPS**: SSL certificates provided automatically
- **Database Integration**: Neon PostgreSQL database included
- **Real-time Collaboration**: Multiple developers can work simultaneously
- **Version Control**: Built-in Git integration
- **Custom Domains**: Map custom domains to your deployment

### Replit Optimization Tips
```javascript
// In vite.config.ts - Replit optimization
export default defineConfig({
  server: {
    host: '0.0.0.0', // Replit requirement
    port: 3000,
    hmr: {
      port: 443, // Replit proxy
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
  },
});
```

---

## 🌐 Production Deployment

### Production Environment Setup

#### Server Requirements
- **CPU**: 4+ cores (8+ recommended for high traffic)
- **RAM**: 8GB minimum (16GB recommended)
- **Storage**: 100GB SSD (for data caching and logs)
- **Network**: High-speed internet with low latency to weather APIs
- **OS**: Ubuntu 20.04 LTS or CentOS 8+

#### Production Installation
```bash
# 1. System Preparation
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx postgresql redis-server certbot

# 2. Node.js Installation (using NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Application Deployment
git clone https://github.com/stormverse/environmental-intelligence.git
cd environmental-intelligence
npm ci --production

# 4. Build Application
npm run build

# 5. Environment Configuration
sudo cp .env.production /etc/stormverse/config
sudo chown stormverse:stormverse /etc/stormverse/config
sudo chmod 600 /etc/stormverse/config
```

#### Production Environment Variables
```env
# Production Configuration
NODE_ENV=production
PORT=5000

# Database (Production PostgreSQL)
DATABASE_URL=postgresql://stormverse:secure_password@localhost:5432/stormverse_prod
DATABASE_POOL_SIZE=20

# Security
ARCSEC_PRIVATE_KEY_FILE=/etc/stormverse/arcsec_private.pem
ARCSEC_PUBLIC_KEY_FILE=/etc/stormverse/arcsec_public.pem
SESSION_SECRET=long_random_secure_session_secret

# External Services
CESIUM_ION_TOKEN=production_cesium_token
NOAA_API_KEY=production_noaa_key

# Performance
REDIS_URL=redis://localhost:6379
CACHE_TTL=300
MAX_UPLOAD_SIZE=52428800

# Monitoring
LOG_LEVEL=info
SENTRY_DSN=your_sentry_dsn_for_error_tracking
```

### Reverse Proxy Configuration (Nginx)
```nginx
# /etc/nginx/sites-available/stormverse
server {
    listen 80;
    server_name stormverse.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name stormverse.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/stormverse.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/stormverse.yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubdomains" always;

    # Serve static files
    location /static/ {
        alias /var/www/stormverse/dist/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support for real-time updates
    location /ws {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }
}
```

### Process Management (PM2)
```bash
# Install PM2
npm install -g pm2

# PM2 Configuration
# Create ecosystem.config.js
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'stormverse',
    script: 'npm',
    args: 'start',
    cwd: '/opt/stormverse',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/stormverse/error.log',
    out_file: '/var/log/stormverse/access.log',
    log_file: '/var/log/stormverse/combined.log',
    time: true
  }]
};
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 🔗 External Service Integration

### NOAA API Setup
```bash
# Register for NOAA API access
# Visit: https://www.weather.gov/documentation/services-web-api

# Configure API endpoints
export NOAA_BASE_URL="https://api.weather.gov"
export NHC_BASE_URL="https://www.nhc.noaa.gov"

# Test API connectivity
curl -H "User-Agent: StormVerse/1.0 (contact@stormverse.org)" \
     https://api.weather.gov/alerts/active
```

### Cesium Ion Configuration
```javascript
// Configure Cesium Ion token
// client/public/js/cesium-config.js
window.CESIUM_BASE_URL = 'https://cesiumjs.org/releases/1.118/Build/Cesium/';

if (window.Cesium) {
  window.Cesium.Ion.defaultAccessToken = process.env.CESIUM_ION_TOKEN;
  
  // Configure terrain and imagery providers
  const viewer = new window.Cesium.Viewer('cesiumContainer', {
    terrainProvider: window.Cesium.createWorldTerrain(),
    imageryProvider: new window.Cesium.IonImageryProvider({ assetId: 3 })
  });
}
```

### KMZ/GeoJSON Data Loading
```bash
# Create data directory structure
mkdir -p /opt/stormverse/data/{hurricanes,alerts,user_uploads}

# Set permissions
chown -R stormverse:stormverse /opt/stormverse/data
chmod 755 /opt/stormverse/data
chmod 755 /opt/stormverse/data/*

# Download sample NOAA data
wget -O /opt/stormverse/data/hurricanes/al092024.kmz \
     https://www.nhc.noaa.gov/gis/forecast/archive/al092024_fcst_latest.kmz
```

---

## 🔒 ARCSEC Security Implementation

### Generate ARCSEC Keys
```bash
# Generate RSA key pair for ARCSEC
openssl genrsa -out arcsec_private.pem 4096
openssl rsa -in arcsec_private.pem -pubout -out arcsec_public.pem

# Secure key storage
sudo mkdir -p /etc/stormverse/keys
sudo mv arcsec_*.pem /etc/stormverse/keys/
sudo chown root:stormverse /etc/stormverse/keys/*
sudo chmod 640 /etc/stormverse/keys/*
```

### ARCSEC Configuration
```javascript
// server/config/arcsec.js
const arcsecConfig = {
  signature: {
    algorithm: 'RSA-SHA256',
    keyLength: 4096,
    privateKeyPath: process.env.ARCSEC_PRIVATE_KEY_FILE,
    publicKeyPath: process.env.ARCSEC_PUBLIC_KEY_FILE
  },
  
  validation: {
    strictMode: process.env.NODE_ENV === 'production',
    timestampTolerance: 300, // 5 minutes
    requiredFields: ['source', 'timestamp', 'integrity_hash'],
    hashAlgorithm: 'sha256'
  },
  
  audit: {
    logLevel: 'detailed',
    retentionDays: 90,
    alertThreshold: 0.1 // 10% validation failures
  }
};
```

---

## 📊 Monitoring and Maintenance

### Health Checks
```bash
# Application health endpoint
curl -f http://localhost:5000/health || exit 1

# Database connectivity check
curl -f http://localhost:5000/health/db || exit 1

# External API connectivity
curl -f http://localhost:5000/health/apis || exit 1
```

### Log Management
```bash
# Log rotation configuration
cat > /etc/logrotate.d/stormverse << EOF
/var/log/stormverse/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 644 stormverse stormverse
    postrotate
        pm2 reload stormverse
    endscript
}
EOF
```

### Backup Procedures
```bash
# Database backup
pg_dump stormverse_prod | gzip > /backup/stormverse_$(date +%Y%m%d).sql.gz

# Application data backup
tar -czf /backup/stormverse_data_$(date +%Y%m%d).tar.gz /opt/stormverse/data

# Configuration backup
tar -czf /backup/stormverse_config_$(date +%Y%m%d).tar.gz /etc/stormverse
```

---

## 🔧 Troubleshooting

### Common Issues

#### Cesium Loading Problems
```javascript
// Check Cesium availability
if (!window.Cesium) {
  console.error('Cesium failed to load. Check:');
  console.error('1. Internet connectivity');
  console.error('2. Cesium Ion token validity');
  console.error('3. Browser compatibility');
}
```

#### Database Connection Issues
```bash
# Test database connectivity
psql $DATABASE_URL -c "SELECT version();"

# Check connection pool
npm run db:status
```

#### NOAA API Issues
```bash
# Test NOAA API connectivity
curl -H "User-Agent: StormVerse/1.0" https://api.weather.gov/alerts/active

# Check rate limiting
grep "429" /var/log/stormverse/access.log
```

### Performance Optimization
- **Enable Redis caching** for frequently accessed weather data
- **Configure CDN** for static assets and Cesium libraries
- **Implement database indexing** for weather event queries
- **Use connection pooling** for database connections
- **Enable Gzip compression** for all text-based responses

---

This deployment guide ensures StormVerse operates reliably across all environments while maintaining ARCSEC security standards and professional performance requirements.