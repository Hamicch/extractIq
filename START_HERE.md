# 👋 START HERE - Your Deployment Roadmap

## 🎯 Mission: Get ExtractIQ Live on Hetzner

**Time needed**: 1 hour
**Cost**: $5.50/month
**Difficulty**: Beginner (copy-paste commands)

---

## 📖 Reading Order

Read these files in this exact order:

### 1. **DEPLOYMENT_READY.md** (10 min read) ← START HERE
- Understand what you need to learn (spoiler: not much!)
- See the big picture
- Get excited about how simple it is

### 2. **HETZNER_SETUP.md** (30 min to execute)
- Complete step-by-step guide
- Copy-paste every command
- Deploy your app

### 3. **QUICK_DEPLOY.md** (reference later)
- Quick command reference
- Use after first deployment

---

## ✅ Pre-Flight Checklist

Before you start, make sure you have:

- [ ] **GitHub account** with ExtractIQ code
- [ ] **OpenAI API key** from platform.openai.com
- [ ] **Credit card** for Hetzner (€5.15/month)
- [ ] **30 minutes** of focused time
- [ ] **Terminal open** (Mac: Terminal app, Windows: PowerShell)

---

## 🚀 Quick Start (If You're Impatient)

1. **Create Hetzner server** → https://console.hetzner.cloud
2. **SSH in**: `ssh root@YOUR_SERVER_IP`
3. **Run these**:
   ```bash
   curl -fsSL https://get.docker.com | sh
   git clone https://github.com/YOUR_USERNAME/extractiq.git /opt/extractiq
   cd /opt/extractiq
   cp .env.production.example .env
   nano .env  # Add your secrets
   docker compose -f docker-compose.prod.yml up -d
   ```
4. **Open**: `http://YOUR_SERVER_IP:3000`

**Done!** See? Simple. 🎉

But seriously, read the full guide first.

---

## 📁 Files You'll Use

| File | When You Need It |
|------|------------------|
| **DEPLOYMENT_READY.md** | Read first (overview) |
| **HETZNER_SETUP.md** | Follow during deployment |
| **QUICK_DEPLOY.md** | Daily reference |
| **.env.production.example** | Copy to .env, fill in secrets |
| **scripts/backup-db.sh** | Weekly backups |

---

## 🎓 What You'll Learn

By the end of this, you'll understand:

- ✅ SSH (remote server access)
- ✅ Docker (containerization)
- ✅ docker-compose (orchestration)
- ✅ Linux basics (cd, ls, nano)
- ✅ Server management

**All practical, hands-on learning.** No theory, just doing.

---

## 💰 Cost Comparison

| Platform | Monthly | Yearly | Management |
|----------|---------|--------|------------|
| **Hetzner** | $5.50 | $66 | You (15 min/month) |
| Render | $24 | $288 | Them |
| Railway | $15 | $180 | Them |

**You save**: $222/year (Hetzner vs Render)

**Your time cost**: ~15 min/month maintenance = $0.75/hour value

**Worth it?** Hell yes. Plus you learn infrastructure!

---

## 🆘 Common Questions

### "Is this hard?"
No. If you can use `git push`, you can do this. It's just commands.

### "What if I break something?"
You can't really break Hetzner. Worst case: delete server, start over (costs $0.17/day).

### "Do I need to know Linux?"
Nope. The guide has every command. Just copy-paste.

### "What about HTTPS/SSL?"
Automatic! Caddy handles it. Zero configuration needed.

### "Can I switch to Render later?"
Yep! Database exports/imports are easy. Not locked in.

### "Is $5.50/month really enough?"
For 0-10,000 users? Absolutely. For reference, the CPX11 can handle:
- 100+ requests/second
- 1000s of documents/month
- Multiple concurrent users

---

## 🎯 Your Mission (If You Choose to Accept)

1. ☕ Get coffee
2. 📖 Read DEPLOYMENT_READY.md (understand the plan)
3. 🖥️ Read HETZNER_SETUP.md (see the steps)
4. 🚀 Execute HETZNER_SETUP.md (deploy!)
5. 🎉 Celebrate your live app
6. 💰 Enjoy saving $222/year

**Total time**: 1 hour
**Difficulty**: Easier than you think
**Reward**: Live production app + infrastructure skills

---

## 📞 Need Help?

**During deployment:**
1. Check the logs: `docker compose logs -f`
2. Google the error message
3. Check HETZNER_SETUP.md troubleshooting section

**After deployment:**
- Check QUICK_DEPLOY.md for common commands
- All scripts in `scripts/` folder

---

## 🎉 Ready?

**Next step**: Open [DEPLOYMENT_READY.md](DEPLOYMENT_READY.md)

You got this! 🚀

---

## 📊 Progress Tracker

Track your journey:

- [ ] Read DEPLOYMENT_READY.md
- [ ] Read HETZNER_SETUP.md
- [ ] Created Hetzner account
- [ ] Created server
- [ ] SSH'd into server
- [ ] Installed Docker
- [ ] Cloned repository
- [ ] Configured .env
- [ ] Started containers
- [ ] Accessed app in browser
- [ ] Set up domain (optional)
- [ ] Set up backups
- [ ] Deployed first update
- [ ] 🎉 **Celebrated!**

---

**Let's go! →** [DEPLOYMENT_READY.md](DEPLOYMENT_READY.md)
