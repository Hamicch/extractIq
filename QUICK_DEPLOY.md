# Quick Deploy to Hetzner - TL;DR Version

This is the ultra-condensed version. For detailed instructions, see [HETZNER_SETUP.md](HETZNER_SETUP.md).

## Prerequisites
- [ ] Hetzner account
- [ ] OpenAI API key
- [ ] Domain (optional)

## Deploy in 10 Commands

### 1. Create Hetzner Server
- Go to https://console.hetzner.cloud
- Create CPX11 server (€5.15/mo), Ubuntu 22.04
- Note IP address

### 2. Connect & Setup

```bash
# SSH into server
ssh root@YOUR_SERVER_IP

# Install Docker
curl -fsSL https://get.docker.com | sh

# Clone repo
git clone https://github.com/YOUR_USERNAME/extractiq.git /opt/extractiq
cd /opt/extractiq

# Setup environment
cp .env.production.example .env
nano .env  # Fill in: DB_PASSWORD, OPENAI_API_KEY, JWT_SECRET, etc.

# Start everything
docker compose -f docker-compose.prod.yml up -d

# Check logs
docker compose -f docker-compose.prod.yml logs -f app
```

### 3. Test
Go to `http://YOUR_SERVER_IP:3000` 🎉

### 4. Setup Domain (Optional)
```bash
# Point DNS A record to YOUR_SERVER_IP
# Update .env with domain
nano .env  # Change APP_URL, DOMAIN, CORS_ORIGIN

# Restart
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

Visit `https://your-domain.com` (HTTPS auto-enabled!) 🔒

## Common Commands

```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f

# Deploy update
cd /opt/extractiq && git pull && docker compose -f docker-compose.prod.yml up -d --build

# Backup database
./scripts/backup-db.sh

# Restart
docker compose -f docker-compose.prod.yml restart
```

## Cost
**€5.15/month (~$5.50)** for everything (app + database + redis + SSL)

## Need Help?
Read [HETZNER_SETUP.md](HETZNER_SETUP.md) for detailed walkthrough.
