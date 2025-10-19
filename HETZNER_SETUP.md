# Hetzner VPS Setup Guide for ExtractIQ

This guide will walk you through deploying ExtractIQ on a Hetzner VPS from scratch.

**Time required**: ~30 minutes
**Monthly cost**: €5-7 (~$5.50-$7.50)
**Difficulty**: Beginner-friendly (copy-paste commands)

---

## Prerequisites

- [ ] GitHub account with your ExtractIQ repository
- [ ] Credit card for Hetzner
- [ ] OpenAI API key (or other AI provider)
- [ ] Domain name (optional, can use IP initially)

---

## Step 1: Create Hetzner Account & VPS

### 1.1 Sign up for Hetzner

1. Go to https://www.hetzner.com/cloud
2. Click "Sign Up" and create an account
3. Verify your email

### 1.2 Create a new server

1. In Hetzner Cloud Console, click "Add Server"
2. **Location**: Choose closest to your users
   - 🇩🇪 Nuremberg (Germany) - Good for EU
   - 🇫🇮 Helsinki (Finland) - Good for EU
   - 🇺🇸 Ashburn (USA) - Good for Americas
3. **Image**: Ubuntu 22.04
4. **Type**: CPX11 (2 vCPU, 2GB RAM) - €5.15/month
5. **SSH Key**: Click "Add SSH Key" (optional but recommended)
   - On Mac/Linux: `cat ~/.ssh/id_rsa.pub`
   - Copy the output and paste in Hetzner
6. **Name**: extractiq-prod
7. Click "Create & Buy now"

### 1.3 Note your server IP

- After ~1 minute, your server is ready
- **Copy the IP address** (e.g., 123.45.67.89)
- **Copy the root password** (if not using SSH key)

---

## Step 2: Connect to Your Server

### Option A: Using SSH Key (Mac/Linux)

```bash
ssh root@YOUR_SERVER_IP
```

### Option B: Using Password

```bash
ssh root@YOUR_SERVER_IP
# Enter password when prompted
```

**First time?** You'll see a message about host authenticity. Type `yes` and press Enter.

---

## Step 3: Initial Server Setup

Copy and paste these commands one by one:

### 3.1 Update system packages

```bash
apt update && apt upgrade -y
```

### 3.2 Install Docker

```bash
curl -fsSL https://get.docker.com | sh
```

This takes ~2 minutes. Wait for it to finish.

### 3.3 Install Docker Compose (if not included)

```bash
apt install docker-compose-plugin -y
```

### 3.4 Verify installation

```bash
docker --version
docker compose version
```

You should see version numbers.

---

## Step 4: Clone Your Repository

### 4.1 Install Git (if needed)

```bash
apt install git -y
```

### 4.2 Clone your repo

```bash
cd /opt
git clone https://github.com/YOUR_USERNAME/extractiq.git
cd extractiq
```

**Replace `YOUR_USERNAME`** with your GitHub username.

**Private repo?** You'll need to set up GitHub SSH key or use personal access token.

---

## Step 5: Configure Environment Variables

### 5.1 Create .env file

```bash
cp .env.production.example .env
nano .env
```

### 5.2 Fill in your secrets

Edit the `.env` file with your values:

```bash
# Database password (generate secure password)
DB_PASSWORD=your-secure-password-here

# Redis password (generate secure password)
REDIS_PASSWORD=another-secure-password-here

# OpenAI API key
OPENAI_API_KEY=sk-your-openai-key-here

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-jwt-secret-here
API_KEY_SECRET=your-api-key-secret-here

# Your domain (or use IP for now)
APP_URL=http://YOUR_SERVER_IP:3000
DOMAIN=YOUR_SERVER_IP
CORS_ORIGIN=http://YOUR_SERVER_IP:3000
ADMIN_EMAIL=your-email@example.com
```

**To generate secure secrets:**
```bash
openssl rand -base64 32
```

**Save and exit**: Press `Ctrl+X`, then `Y`, then `Enter`

---

## Step 6: Build and Start the Application

### 6.1 Build Docker images

```bash
docker compose -f docker-compose.prod.yml build
```

This takes ~5-10 minutes. ☕

### 6.2 Start all services

```bash
docker compose -f docker-compose.prod.yml up -d
```

The `-d` flag runs in background (detached mode).

### 6.3 Check if everything is running

```bash
docker ps
```

You should see 4 containers running:
- ✅ extractiq-app
- ✅ extractiq-db
- ✅ extractiq-redis
- ✅ extractiq-caddy

### 6.4 Check logs

```bash
docker compose -f docker-compose.prod.yml logs -f app
```

Press `Ctrl+C` to exit logs.

---

## Step 7: Test Your Application

### 7.1 Open in browser

Go to: `http://YOUR_SERVER_IP:3000`

You should see your ExtractIQ app! 🎉

### 7.2 Test health check

```bash
curl http://localhost:3000/api/health
```

Should return: `{"status":"ok"}`

---

## Step 8: Setup Domain & HTTPS (Optional but Recommended)

### 8.1 Point your domain to server

In your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.):

1. Create an **A record**:
   - Name: `@` (or subdomain like `app`)
   - Type: `A`
   - Value: `YOUR_SERVER_IP`
   - TTL: 300 (5 minutes)

2. Wait 5-10 minutes for DNS propagation

3. Test: `ping extractiq.xyz` (should return your server IP)

### 8.2 Update environment for HTTPS

```bash
nano .env
```

Update these lines:
```bash
APP_URL=https://extractiq.xyz
DOMAIN=extractiq.xyz
CORS_ORIGIN=https://extractiq.xyz
ADMIN_EMAIL=admin@extractiq.xyz
```

Save and exit.

### 8.3 Restart services

```bash
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

### 8.4 Test HTTPS

Go to: `https://extractiq.xyz`

Caddy automatically gets SSL certificate from Let's Encrypt! 🔒

---

## Step 9: Database Migration

### 9.1 Run database migrations

```bash
docker compose -f docker-compose.prod.yml exec app npm run db:migrate
```

### 9.2 Create first user (optional)

```bash
docker compose -f docker-compose.prod.yml exec app npm run db:seed
```

---

## Common Commands Reference

### View logs
```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f app
docker compose -f docker-compose.prod.yml logs -f db
```

### Restart services
```bash
# All services
docker compose -f docker-compose.prod.yml restart

# Specific service
docker compose -f docker-compose.prod.yml restart app
```

### Stop everything
```bash
docker compose -f docker-compose.prod.yml down
```

### Start everything
```bash
docker compose -f docker-compose.prod.yml up -d
```

### Check running containers
```bash
docker ps
```

### Execute command in container
```bash
docker compose -f docker-compose.prod.yml exec app sh
```

---

## Deploying Updates

When you push new code to GitHub:

```bash
# SSH into server
ssh root@YOUR_SERVER_IP

# Navigate to app directory
cd /opt/extractiq

# Pull latest code
git pull

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build

# Check logs
docker compose -f docker-compose.prod.yml logs -f app
```

**Downtime**: ~30 seconds (while rebuilding)

---

## Backup & Restore

### Backup database

```bash
# Create backup
docker exec extractiq-db pg_dump -U postgres extractiq > backup_$(date +%Y%m%d).sql

# Download backup to your computer
scp root@YOUR_SERVER_IP:/opt/extractiq/backup_*.sql ./
```

### Restore database

```bash
# Upload backup to server
scp backup.sql root@YOUR_SERVER_IP:/tmp/

# Restore
ssh root@YOUR_SERVER_IP
docker exec -i extractiq-db psql -U postgres extractiq < /tmp/backup.sql
```

### Automated daily backups (optional)

```bash
# Create backup script
cat > /opt/extractiq/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/extractiq/backups"
mkdir -p $BACKUP_DIR
docker exec extractiq-db pg_dump -U postgres extractiq > $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql
# Keep only last 7 backups
ls -t $BACKUP_DIR/backup_*.sql | tail -n +8 | xargs rm -f
EOF

chmod +x /opt/extractiq/backup.sh

# Add to crontab (runs daily at 2 AM)
crontab -e
# Add this line:
0 2 * * * /opt/extractiq/backup.sh
```

---

## Monitoring (Optional)

### Free uptime monitoring

1. Sign up at https://uptimerobot.com (free)
2. Add HTTP(s) monitor for `https://extractiq.xyz/api/health`
3. Get email alerts if site goes down

### Check resource usage

```bash
# Disk usage
df -h

# Memory usage
free -h

# CPU usage
top
# Press 'q' to exit
```

---

## Troubleshooting

### App won't start

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs app

# Common issues:
# - Wrong environment variables → check .env
# - Database not ready → wait 30 seconds and retry
# - Port already in use → change port in docker-compose
```

### Database connection error

```bash
# Check if database is running
docker ps | grep extractiq-db

# Check database logs
docker compose -f docker-compose.prod.yml logs db

# Reset database (WARNING: deletes all data)
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d
```

### Out of disk space

```bash
# Remove old Docker images
docker system prune -a

# Check disk usage
df -h
```

### SSL certificate issues

```bash
# Check Caddy logs
docker compose -f docker-compose.prod.yml logs caddy

# Common issues:
# - DNS not pointing to server → wait for propagation
# - Port 80/443 blocked → check firewall
# - Wrong domain in .env → update and restart
```

---

## Security Checklist

- [ ] Change default root password
- [ ] Create non-root user (optional but recommended)
- [ ] Enable firewall (UFW)
  ```bash
  ufw allow 22    # SSH
  ufw allow 80    # HTTP
  ufw allow 443   # HTTPS
  ufw enable
  ```
- [ ] Disable root SSH login (optional)
- [ ] Use strong passwords in .env
- [ ] Keep server updated: `apt update && apt upgrade`
- [ ] Setup automated backups

---

## Cost Breakdown

| Item | Monthly Cost |
|------|--------------|
| Hetzner CPX11 | €5.15 (~$5.50) |
| **Total** | **~$5.50/month** |

Compare to Render: **$24/month** → **Save $18.50/month ($222/year)** 💰

---

## Next Steps

1. ✅ App is running
2. Setup custom domain (if not done)
3. Setup automated backups
4. Add monitoring (Uptime Robot)
5. Test document uploads and processing
6. Invite users!

---

## Need Help?

**Common issues:**
- Check logs: `docker compose logs -f`
- Restart services: `docker compose restart`
- Google the error message
- Check GitHub issues
- Ask in Discord/Slack

**Still stuck?** Open a GitHub issue with:
- What you're trying to do
- What error you're seeing
- Output of `docker compose logs`

---

## Congratulations! 🎉

Your ExtractIQ app is now running on Hetzner VPS!

**You just saved $222/year** compared to Render while learning infrastructure. Nice! 🚀
