# Common Issues & Solutions

## 🔧 Installation Issues

### Issue 1: "npm: command not found"
**Problem:** Node.js is not installed

**Solution:**
```bash
# Install Node.js from official website
# Visit: https://nodejs.org/
# Download LTS version and install

# Verify installation
node --version
npm --version
```

---

### Issue 2: "n8n: command not found" after installation
**Problem:** Global npm packages not in PATH

**Solution:**
```bash
# Find npm global path
npm config get prefix

# Add to PATH (add to ~/.zshrc or ~/.bashrc)
export PATH="$PATH:$(npm config get prefix)/bin"

# Reload shell
source ~/.zshrc
```

---

### Issue 3: "Permission denied" during npm install
**Problem:** Need sudo for global install

**Solution:**
```bash
# Option 1: Use sudo (quick fix)
sudo npm install -g n8n

# Option 2: Fix npm permissions (better)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
npm install -g n8n
```

---

## 🗄️ Database Issues

### Issue 1: "psql: command not found"
**Problem:** PostgreSQL not installed

**Solution:**
```bash
# macOS
brew install postgresql@14
brew services start postgresql@14

# Add to PATH
echo 'export PATH="/usr/local/opt/postgresql@14/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify
psql --version
```

---

### Issue 2: "createdb: error: connection to server failed"
**Problem:** PostgreSQL service not running

**Solution:**
```bash
# Check status
brew services list

# Start PostgreSQL
brew services start postgresql@14

# Or restart
brew services restart postgresql@14
```

---

### Issue 3: "FATAL: database does not exist"
**Problem:** Database not created yet

**Solution:**
```bash
# Create database
createdb cybercrime_db

# Verify
psql -l | grep cybercrime
```

---

### Issue 4: "ERROR: relation does not exist"
**Problem:** Database tables not created

**Solution:**
```bash
# Run schema file
cd /Users/manavpatel/Documents/project/project
psql -d cybercrime_db -f n8n-workflows/database-schema.sql

# Verify tables created
psql -d cybercrime_db -c "\dt"
```

---

## 📧 Email Issues

### Issue 1: "Authentication failed" for Gmail
**Problem:** Using regular password instead of App Password

**Solution:**
1. Go to: https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to: https://myaccount.google.com/apppasswords
4. Generate App Password
5. Use that password in n8n SMTP settings

---

### Issue 2: "Connection timeout" SMTP error
**Problem:** Wrong port or SSL/TLS settings

**Solution:**
```
Gmail Settings:
- Host: smtp.gmail.com
- Port: 587 (NOT 465)
- SSL/TLS: Enable
- User: your-email@gmail.com
- Password: [app-password]
```

---

### Issue 3: Emails going to spam
**Problem:** No SPF/DKIM records

**Solution for Production:**
1. Use custom domain email
2. Setup SPF records
3. Setup DKIM
4. Use professional email service (SendGrid, Mailgun)

**Quick Fix:**
- Ask recipients to mark as "Not Spam"
- Use professional subject lines
- Add unsubscribe link

---

## 🔗 n8n Connection Issues

### Issue 1: "Cannot GET /webhook/..."
**Problem:** Workflow not activated

**Solution:**
1. Open n8n: http://localhost:5678
2. Go to each workflow
3. Click **Inactive** toggle to make it **Active** (green)
4. Refresh frontend and try again

---

### Issue 2: "Network Error" from frontend
**Problem:** n8n not running or wrong URL

**Solution:**
```bash
# Check if n8n is running
ps aux | grep n8n

# If not running, start it
n8n start

# Check .env file
cat .env
# Should have: VITE_API_URL=http://localhost:5678/webhook
```

---

### Issue 3: "404 Not Found" on webhook
**Problem:** Workflow not imported or wrong path

**Solution:**
1. Open workflow in n8n
2. Click on Webhook node
3. Copy the exact path
4. Update API calls in frontend if different

---

## 🚀 Frontend Issues

### Issue 1: "Failed to resolve import"
**Problem:** Missing dependencies

**Solution:**
```bash
cd /Users/manavpatel/Documents/project/project
npm install
```

---

### Issue 2: "Module not found: Can't resolve 'utils/api'"
**Problem:** Wrong import path

**Solution:**
```typescript
// Change from:
import api from 'utils/api';

// To:
import api from '../utils/api';
// or
import api from './utils/api';
```

---

### Issue 3: "VITE_API_URL is undefined"
**Problem:** .env file not loaded

**Solution:**
```bash
# Stop dev server (Ctrl+C)
# Check .env exists
cat .env

# Restart dev server
npm run dev
```

---

## 📱 SMS Issues

### Issue 1: SMS not sending (MSG91)
**Problem:** Not configured yet

**Solution:**
For now, skip SMS and use email only. To enable later:

1. Sign up at: https://msg91.com
2. Get API key
3. Add to n8n:
   - Go to Credentials
   - Add HTTP Header Auth
   - Header: `authkey`
   - Value: `your-api-key`
4. Update workflow #2 (send-otp.json)

---

## 🔍 Testing Issues

### Issue 1: "OTP verification failed"
**Problem:** OTP expired or incorrect

**Solution:**
```bash
# Check OTP in database
psql -d cybercrime_db -c "SELECT * FROM otp_verification ORDER BY created_at DESC LIMIT 5;"

# For testing, use demo OTP: 123456
# Or disable OTP validation temporarily
```

---

### Issue 2: "Complaint not found"
**Problem:** Token doesn't exist

**Solution:**
```bash
# Check complaints in database
psql -d cybercrime_db -c "SELECT complaint_token, reporter_name, status FROM complaints ORDER BY created_at DESC LIMIT 5;"

# Use one of these tokens for testing
```

---

## 🐳 Docker Issues

### Issue 1: "docker: command not found"
**Problem:** Docker not installed

**Solution:**
1. Download Docker Desktop: https://www.docker.com/products/docker-desktop
2. Install and start Docker Desktop
3. Verify: `docker --version`

---

### Issue 2: "Cannot connect to Docker daemon"
**Problem:** Docker Desktop not running

**Solution:**
1. Open Docker Desktop application
2. Wait for it to start (whale icon in menu bar)
3. Try command again

---

## 🔐 Production Issues

### Issue 1: "Refused to connect" on public URL
**Problem:** Firewall blocking port 5678

**Solution:**
```bash
# Open port in firewall
sudo ufw allow 5678

# Or use reverse proxy (Nginx)
# Configure Nginx to proxy to localhost:5678
```

---

### Issue 2: "SSL certificate error"
**Problem:** No HTTPS configured

**Solution:**
```bash
# Use Let's Encrypt with certbot
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com

# Configure n8n with SSL
export N8N_PROTOCOL=https
export N8N_SSL_KEY=/etc/letsencrypt/live/your-domain.com/privkey.pem
export N8N_SSL_CERT=/etc/letsencrypt/live/your-domain.com/fullchain.pem
```

---

## 📊 Performance Issues

### Issue 1: "Slow response times"
**Problem:** Too many requests or large data

**Solution:**
```bash
# Add indexes to database
psql -d cybercrime_db

CREATE INDEX IF NOT EXISTS idx_complaint_token ON complaints(complaint_token);
CREATE INDEX IF NOT EXISTS idx_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_email ON complaints(reporter_email);
```

---

### Issue 2: "Out of memory" error
**Problem:** Not enough RAM

**Solution:**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
n8n start
```

---

## 🆘 Emergency Quick Fixes

### Complete Reset (When everything breaks)
```bash
# 1. Stop everything
pkill n8n
brew services stop postgresql

# 2. Restart database
brew services start postgresql

# 3. Recreate database (WARNING: Deletes all data)
dropdb cybercrime_db
createdb cybercrime_db
psql -d cybercrime_db -f n8n-workflows/database-schema.sql

# 4. Restart n8n
n8n start

# 5. Reactivate all workflows in UI

# 6. Restart frontend
npm run dev
```

---

## 📞 Get Help

### Check Logs
```bash
# n8n logs
~/.n8n/logs/

# PostgreSQL logs
tail -f /usr/local/var/log/postgresql@14.log

# Frontend logs
# Check browser console (F12 > Console tab)
```

### Useful Commands
```bash
# Check what's running on port
lsof -i :5678    # n8n
lsof -i :5173    # Frontend
lsof -i :5432    # PostgreSQL

# Kill process on port
kill -9 $(lsof -t -i:5678)

# Check system resources
top
df -h    # Disk space
free -h  # RAM (Linux)
```

### Community Help
- n8n Forum: https://community.n8n.io
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Stack Overflow: Tag questions with `n8n`, `postgresql`, `react`

---

## ✅ Health Check Checklist

Run this before asking for help:

```bash
# 1. Check Node.js
node --version    # Should be v18+

# 2. Check PostgreSQL
psql --version    # Should show version
psql -l           # Should list databases

# 3. Check n8n
n8n --version     # Should show version

# 4. Check database tables
psql -d cybercrime_db -c "\dt"    # Should show 5 tables

# 5. Check n8n is running
curl http://localhost:5678        # Should NOT error

# 6. Check frontend is running
curl http://localhost:5173        # Should return HTML

# 7. Check .env file
cat .env                          # Should have VITE_API_URL
```

If all pass ✅ - System is healthy!
If any fail ❌ - Follow relevant solution above
