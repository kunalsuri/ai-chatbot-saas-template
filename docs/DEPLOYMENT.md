# Deployment Guide

## Prerequisites

### System Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 2 cores | 4+ cores |
| RAM | 4GB | 8GB+ |
| Storage | 20GB SSD | 50GB+ SSD |
| Node.js | v18.0.0+ | v18.0.0+ |
| Database | Not required (local JSON) | Optional (PostgreSQL) |
| Web Server | Nginx 1.20+ | Nginx 1.20+ |

### Required Software

- Node.js & npm
- (Optional) PostgreSQL
- Nginx (reverse proxy)
- PM2 (process manager)
- SSL Certificate (Let's Encrypt recommended)
- Git

## Quick Start (Docker)

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/saas-ai-chatbot.git
   cd saas-ai-chatbot
   ```

2. Copy and configure environment:
   ```bash
   cp .env.example .env
   nano .env  # Update with your configuration
   ```

3. Start with Docker Compose:
   ```bash
   docker-compose up -d
   ```

## Manual Deployment (VPS)

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

<!-- PostgreSQL installation optional; local JSON storage does not require a database -->

# Install Nginx
sudo apt install nginx -y
```

### 2. Database Setup (Optional)

```bash
# Create database and user
sudo -u postgres psql -c "CREATE DATABASE saas_chatbot;"
sudo -u postgres psql -c "CREATE USER chatbot_user WITH PASSWORD 'your_secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE saas_chatbot TO chatbot_user;"
```

### 3. Application Setup

```bash
# Create app directory
sudo mkdir -p /var/www/saas-chatbot
sudo chown $USER:$USER /var/www/saas-chatbot

# Clone repository
git clone https://github.com/your-username/saas-ai-chatbot.git /var/www/saas-chatbot
cd /var/www/saas-chatbot

# Install dependencies
npm ci --production

# Configure environment
cp .env.example .env
nano .env  # Update with your settings
```

### 4. Nginx Configuration

Create a new Nginx config:

```bash
sudo nano /etc/nginx/sites-available/saas-chatbot
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site and test configuration:

```bash
sudo ln -s /etc/nginx/sites-available/saas-chatbot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test renewal
sudo certbot renew --dry-run
```

### 6. Start Application

```bash
# Start with PM2
pm2 start npm --name "saas-chatbot" -- start

# Save PM2 process list
pm2 save

# Configure PM2 to start on boot
pm2 startup
```

## Environment Variables

Required environment variables for production:

```env
NODE_ENV=production
PORT=3000
SESSION_SECRET=your-secure-session-secret
# Add other required variables from .env.example
```

## Updating the Application

```bash
# Pull latest changes
cd /var/www/saas-chatbot
git pull origin main

# Install new dependencies
npm ci --production

# Restart the application
pm2 restart saas-chatbot

# Check logs if needed
pm2 logs saas-chatbot
```

## Monitoring

### PM2 Monitoring

```bash
# List processes
pm2 list

# Monitor logs
pm2 logs

# Monitor resources
pm2 monit
```

### Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

## Backup

### Database Backup

```bash
# Create backup
pg_dump -U postgres saas_chatbot > saas_chatbot_backup_$(date +%Y%m%d).sql

# Restore from backup
psql -U postgres saas_chatbot < saas_chatbot_backup_20250101.sql
```

### Application Backup

```bash
# Create backup of application
tar -czvf saas-chatbot-backup-$(date +%Y%m%d).tar.gz /var/www/saas-chatbot
```

## Troubleshooting

### Common Issues

1. **Port in use**
   ```bash
   sudo lsof -i :3000
   sudo kill -9 <PID>
   ```

2. **Permission issues**
   ```bash
   sudo chown -R $USER:$USER /var/www/saas-chatbot
   ```

3. **Node.js version**
   ```bash
   node -v
   nvm install 18
   ```

4. **Database connection**
   - Verify PostgreSQL is running
   - Check connection string in `.env`
   - Ensure user has proper permissions

## Scaling

### Vertical Scaling
- Upgrade server resources (CPU, RAM)
- Optimize database queries
- Enable caching with Redis

### Horizontal Scaling
- Set up load balancing
- Use read replicas for database
- Implement session storage with Redis

## Security

### Firewall Rules

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP/HTTPS
sudo ufw allow 'Nginx Full'
```

### Security Headers

Add to Nginx config:

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

## Maintenance

### Log Rotation

Add to `/etc/logrotate.d/nginx`:

```
/var/log/nginx/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
```

### Monitoring

Consider setting up monitoring with:
- PM2 monitoring
- New Relic
- Datadog
- Prometheus + Grafana
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://yourdomain.com

# Database
DATABASE_URL=postgresql://chatbot_user:your_secure_password@localhost:5432/saas_chatbot_ai

# Security
SESSION_SECRET=your_very_long_random_session_secret_here
CSRF_SECRET=your_csrf_secret_here

# AI Services
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
TRANSLATION_API_KEY=your_translation_api_key

# Ollama (if using local LLM)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2

# Performance
SLOW_REQUEST_THRESHOLD=2000
CRITICAL_REQUEST_THRESHOLD=8000
AI_REQUEST_THRESHOLD=12000

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/saas-chatbot-ai/app.log
```

#### Step 5: Build Application

```bash
# Build the application
npm run build

# Run database migrations (if using PostgreSQL)
npm run db:push
```

#### Step 6: PM2 Configuration

Create PM2 ecosystem file:

```bash
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'saas-chatbot-ai',
    script: 'server/index.js',
    cwd: '/var/www/saas-chatbot-ai',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 'max',
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    error_file: '/var/log/saas-chatbot-ai/err.log',
    out_file: '/var/log/saas-chatbot-ai/out.log',
    log_file: '/var/log/saas-chatbot-ai/combined.log',
    time: true,
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

#### Step 7: Start Application

```bash
# Create log directory
sudo mkdir -p /var/log/saas-chatbot-ai
sudo chown $USER:$USER /var/log/saas-chatbot-ai

# Start application with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

#### Step 8: Nginx Configuration

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/saas-chatbot-ai
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.gemini.com https://api.openai.com;";

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;

    # Static Files
    location /assets/ {
        alias /var/www/saas-chatbot-ai/dist/public/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API Routes with Rate Limiting
    location /api/auth/ {
        limit_req zone=auth burst=5 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeout for AI endpoints
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Main Application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Step 9: SSL Certificate Setup

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

#### Step 10: Enable and Start Services

```bash
# Enable Nginx site
sudo ln -s /etc/nginx/sites-available/saas-chatbot-ai /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Start services
sudo systemctl enable nginx
sudo systemctl start nginx
<!-- PostgreSQL service steps removed: not required -->
```

### Method 2: Docker Deployment

#### Step 1: Create Dockerfile

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --production && npm cache clean --force

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start application
CMD ["node", "server/index.js"]
```

#### Step 2: Create Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - db
      - redis
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs

  # Optional services (databases, caches) can be added here if needed

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - app
    restart: unless-stopped

volumes: {}
```

#### Step 3: Deploy with Docker

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f app

# Scale application
docker-compose up -d --scale app=3
```

### Method 3: Cloud Platform Deployment

#### Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod

# Configure environment variables in Vercel dashboard
```

**vercel.json:**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/client/dist/$1"
    }
  ]
}
```

#### Railway Deployment

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### DigitalOcean App Platform

Create `app.yaml`:

```yaml
name: saas-chatbot-ai
services:
- name: web
  source_dir: /
  github:
    repo: your-username/saas-ai-chatbot
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: DATABASE_URL
    value: ${db.DATABASE_URL}
databases:
- name: db
  engine: PG
  version: "14"
```

## Post-Deployment Configuration

### Monitoring Setup

#### Application Monitoring

```bash
# Install monitoring tools
npm install --save @sentry/node @sentry/tracing

# Configure Sentry (in server/index.ts)
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

#### Server Monitoring

```bash
# Install system monitoring
sudo apt install htop iotop nethogs -y

# Setup log rotation
sudo nano /etc/logrotate.d/saas-chatbot-ai
```

```
/var/log/saas-chatbot-ai/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 nodejs nodejs
    postrotate
        pm2 reload saas-chatbot-ai
    endscript
}
```

### Backup Strategy

#### Database Backup

```bash
# Create backup script
nano /home/ubuntu/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="saas_chatbot_ai"

mkdir -p $BACKUP_DIR

# Create database backup
pg_dump -U chatbot_user -h localhost $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete

echo "Database backup completed: db_backup_$DATE.sql.gz"
```

```bash
# Make executable and add to crontab
chmod +x /home/ubuntu/backup-db.sh
crontab -e

# Add daily backup at 2 AM
0 2 * * * /home/ubuntu/backup-db.sh
```

#### Application Backup

```bash
# Backup application files
tar -czf /home/ubuntu/backups/app_backup_$(date +%Y%m%d).tar.gz \
  -C /var/www/saas-chatbot-ai \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=dist \
  .
```

### Performance Optimization

#### Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);

-- Analyze tables
ANALYZE users;
ANALYZE chat_sessions;
ANALYZE chat_messages;
```

#### Application Optimization

```bash
# Enable Node.js production optimizations
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=4096"

# Configure PM2 for optimal performance
pm2 set pm2:sysmonit true
pm2 install pm2-logrotate
```

### Security Hardening

#### Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

#### Fail2Ban Setup

```bash
# Install Fail2Ban
sudo apt install fail2ban -y

# Configure Fail2Ban for Nginx
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[nginx-http-auth]
enabled = true

[nginx-noscript]
enabled = true

[nginx-badbots]
enabled = true

[nginx-noproxy]
enabled = true
```

### Health Checks and Monitoring

#### Application Health Check

Create `healthcheck.js`:

```javascript
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/health',
  method: 'GET',
  timeout: 2000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

req.on('error', () => {
  process.exit(1);
});

req.on('timeout', () => {
  req.destroy();
  process.exit(1);
});

req.end();
```

#### Uptime Monitoring

```bash
# Create uptime monitoring script
nano /home/ubuntu/monitor-uptime.sh
```

```bash
#!/bin/bash
URL="https://yourdomain.com/api/health"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $URL)

if [ $STATUS -ne 200 ]; then
    echo "$(date): Site down - Status: $STATUS" >> /var/log/uptime-monitor.log
    # Send alert (email, Slack, etc.)
    pm2 restart saas-chatbot-ai
fi
```

## Troubleshooting

### Common Issues

#### Application Won't Start

```bash
# Check PM2 status
pm2 status

# View application logs
pm2 logs saas-chatbot-ai

# Check system resources
htop
df -h
```

#### Database Connection Issues

```bash
# Test database connection
psql -U chatbot_user -h localhost -d saas_chatbot_ai

# Check PostgreSQL status
sudo systemctl status postgresql

# View PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

#### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Test SSL configuration
openssl s_client -connect yourdomain.com:443
```

### Performance Issues

#### High Memory Usage

```bash
# Monitor memory usage
free -h
ps aux --sort=-%mem | head

# Restart application if needed
pm2 restart saas-chatbot-ai
```

#### Slow Database Queries

```sql
-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();

-- View slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

## Maintenance

### Regular Maintenance Tasks

#### Weekly Tasks

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Check disk space
df -h

# Review logs
sudo journalctl --since "1 week ago" | grep ERROR

# Check SSL certificate expiration
sudo certbot certificates
```

#### Monthly Tasks

```bash
# Analyze database performance
sudo -u postgres psql -d saas_chatbot_ai -c "VACUUM ANALYZE;"

# Review backup integrity
ls -la /home/ubuntu/backups/

# Update Node.js dependencies
npm audit
npm update
```

### Scaling Considerations

#### Horizontal Scaling

```bash
# Add load balancer configuration
upstream app_servers {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

server {
    location / {
        proxy_pass http://app_servers;
    }
}
```

#### Database Scaling

```sql
-- Setup read replicas
-- Configure connection pooling
-- Implement database sharding strategies
```

This deployment guide provides a comprehensive foundation for production deployment. Adjust configurations based on your specific requirements and infrastructure constraints.
