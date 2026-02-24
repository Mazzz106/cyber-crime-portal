# Video Tutorial Script - n8n Setup

## 🎬 Video 1: Installation & Setup (10 minutes)

### Part 1: Prerequisites (2 min)
```
[SCREEN: Terminal]
Hi! Let's set up your cyber crime portal with n8n.

First, check if you have Node.js:
$ node --version
$ npm --version

If not installed, download from nodejs.org
[SHOW: Browser - nodejs.org - Download LTS]

Install it, then verify:
$ node --version
v18.17.0 ✅
```

### Part 2: Install n8n (1 min)
```
[SCREEN: Terminal]
Now install n8n globally:
$ npm install -g n8n

This takes ~30 seconds...
[WAIT FOR INSTALLATION]

Verify:
$ n8n --version
1.0.0 ✅
```

### Part 3: Install PostgreSQL (2 min)
```
[SCREEN: Terminal]
Install PostgreSQL:
$ brew install postgresql@14
[WAIT]

Start the service:
$ brew services start postgresql@14

Create database:
$ createdb cybercrime_db

Verify:
$ psql -l
[SHOW: Database list with cybercrime_db]
```

### Part 4: Setup Database Schema (1 min)
```
[SCREEN: Terminal]
Navigate to project:
$ cd /Users/manavpatel/Documents/project/project

Load database structure:
$ psql -d cybercrime_db -f n8n-workflows/database-schema.sql

Check tables created:
$ psql -d cybercrime_db -c "\dt"
[SHOW: 5 tables listed]
```

### Part 5: Start n8n (1 min)
```
[SCREEN: Terminal]
Start n8n:
$ n8n start

[SHOW: Terminal output with URL]
Opening at: http://localhost:5678
```

### Part 6: First Login (1 min)
```
[SCREEN: Browser - http://localhost:5678]
First time setup:
- Email: your-email@example.com
- Password: [create secure password]

[SHOW: n8n welcome screen]
```

### Part 7: Add Database Credential (2 min)
```
[SCREEN: n8n UI]
1. Click "Credentials" in left menu
2. Click "Add Credential"
3. Search: "PostgreSQL"
4. Fill in:
   - Name: PostgreSQL account
   - Host: localhost
   - Database: cybercrime_db
   - User: [your mac username]
   - Password: [leave blank]
   - Port: 5432
5. Click "Save"

[SHOW: Green checkmark - Connection successful]
```

---

## 🎬 Video 2: Import Workflows (8 minutes)

### Part 1: Understanding Workflows (2 min)
```
[SCREEN: Finder - n8n-workflows folder]
We have 6 workflow files:
1. complaint-submission.json - Saves complaints
2. send-otp.json - Sends verification codes
3. verify-otp.json - Checks OTP
4. track-complaint.json - Shows status
5. ongoing-complaints.json - Lists active cases
6. resolved-complaints.json - Shows results

Each workflow = One backend feature
```

### Part 2: Import First Workflow (3 min)
```
[SCREEN: n8n UI]
1. Click "Workflows" in top menu
2. Click "Import from File"
3. Select: 1-complaint-submission.json
4. Click "Import"

[SHOW: Workflow canvas with nodes]

This workflow:
- Receives complaint from website
- Saves to database
- Sends emails
- Returns confirmation

5. Click toggle in top right: Inactive → Active ✅
```

### Part 3: Import Remaining Workflows (2 min)
```
[SCREEN: n8n UI - Fast forward]
Repeat for all 6 workflows:
- Import file
- Activate (toggle to Active)

[SHOW: Workflows page with 6 active workflows]
All green = All working! ✅
```

### Part 4: Verify Webhooks (1 min)
```
[SCREEN: n8n UI - Workflow view]
Click on "1-complaint-submission"
Click on "Webhook" node
[SHOW: Webhook URL]
Copy: http://localhost:5678/webhook/submit-complaint

This is your API endpoint!
```

---

## 🎬 Video 3: Configure Email (5 minutes)

### Part 1: Get Gmail App Password (3 min)
```
[SCREEN: Browser - Gmail]
1. Go to: myaccount.google.com
2. Click "Security"
3. Find "2-Step Verification" - Enable it
4. Go back to Security
5. Click "App passwords"
6. Select:
   - App: Mail
   - Device: Other (n8n)
7. Click "Generate"

[SHOW: 16-character password]
Copy this password!
```

### Part 2: Add SMTP Credential (2 min)
```
[SCREEN: n8n UI]
1. Go to "Credentials"
2. Click "Add Credential"
3. Search: "SMTP"
4. Fill in:
   - Name: SMTP account
   - User: your-email@gmail.com
   - Password: [paste app password]
   - Host: smtp.gmail.com
   - Port: 587
   - SSL/TLS: Enable ✅
5. Click "Save"

[SHOW: Test connection - Success]
```

---

## 🎬 Video 4: Test Everything (7 minutes)

### Part 1: Start Frontend (1 min)
```
[SCREEN: Terminal - New tab]
$ cd /Users/manavpatel/Documents/project/project
$ npm install
$ npm run dev

[SHOW: Vite dev server starting]
Local: http://localhost:5173
```

### Part 2: Submit Test Complaint (3 min)
```
[SCREEN: Browser - http://localhost:5173]
Fill form:
- Name: John Doe
- Email: your-test@email.com
- Phone: 9876543210
- Aadhaar: 123456789012
- PAN: ABCDE1234F
- Address: 123 Test Street
- City: Mumbai
- State: Maharashtra
- PIN: 400001

Incident Details:
- Type: Financial Fraud
- Date: Today
- Description: Test complaint

Click "Request OTP"
[SHOW: OTP sent message]

Enter OTP: 123456 (demo)
Click "Verify"
[SHOW: Verified checkmark]

Click "Submit Complaint"
[SHOW: Success message with token]
```

### Part 3: Check Database (1 min)
```
[SCREEN: Terminal]
$ psql -d cybercrime_db
> SELECT complaint_token, reporter_name, status FROM complaints;

[SHOW: Test complaint in table]
✅ Data saved!
```

### Part 4: Check Email (1 min)
```
[SCREEN: Browser - Email inbox]
[SHOW: New email]
Subject: Complaint Registered - CYB202602123456
[SHOW: Email content]
✅ Email sent!
```

### Part 5: Test Tracking (1 min)
```
[SCREEN: Browser - Portal]
Click "Track Complaint"
Enter token: CYB202602123456
Click "Track"

[SHOW: Complaint details and timeline]
✅ Tracking works!
```

---

## 🎬 Video 5: Production Deployment (15 minutes)

### Part 1: Get VPS Server (3 min)
```
[SCREEN: Browser]
Options:
1. DigitalOcean - $5/month
2. AWS EC2 - Free tier
3. Linode - $5/month
4. Hetzner - €4/month

[SHOW: DigitalOcean signup]
Create droplet:
- Ubuntu 22.04
- 2GB RAM minimum
- Choose datacenter near you
```

### Part 2: SSH Setup (2 min)
```
[SCREEN: Terminal]
$ ssh root@your-server-ip

First time:
$ apt update
$ apt upgrade -y

Install Node.js:
$ curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
$ apt install -y nodejs

Verify:
$ node --version
$ npm --version
```

### Part 3: Install n8n on Server (3 min)
```
[SCREEN: Terminal - SSH]
Install n8n:
$ npm install -g n8n pm2

Install PostgreSQL:
$ apt install postgresql postgresql-contrib

Setup database:
$ sudo -u postgres createdb cybercrime_db

Start n8n with PM2:
$ pm2 start n8n
$ pm2 save
$ pm2 startup
```

### Part 4: Setup Nginx (3 min)
```
[SCREEN: Terminal - SSH]
Install Nginx:
$ apt install nginx

Create config:
$ nano /etc/nginx/sites-available/n8n

[SHOW: Config file]
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}

Enable:
$ ln -s /etc/nginx/sites-available/n8n /etc/nginx/sites-enabled/
$ nginx -t
$ systemctl restart nginx
```

### Part 5: Setup SSL (2 min)
```
[SCREEN: Terminal - SSH]
Install Certbot:
$ apt install certbot python3-certbot-nginx

Get certificate:
$ certbot --nginx -d your-domain.com

[SHOW: Certificate issued]
Auto-renewal enabled ✅
```

### Part 6: Update Frontend (2 min)
```
[SCREEN: Local terminal]
Update .env:
VITE_API_URL=https://your-domain.com/webhook

Build:
$ npm run build

Deploy dist folder to server or Netlify/Vercel

Update in Netlify:
[SHOW: Drag & drop dist folder]
```

---

## 🎬 Video 6: Monitoring & Maintenance (10 minutes)

### Part 1: Check Logs (3 min)
```
[SCREEN: Terminal - SSH]
View n8n logs:
$ pm2 logs n8n

View PostgreSQL logs:
$ tail -f /var/log/postgresql/postgresql-14-main.log

View Nginx logs:
$ tail -f /var/log/nginx/access.log
$ tail -f /var/log/nginx/error.log
```

### Part 2: Database Backup (3 min)
```
[SCREEN: Terminal - SSH]
Manual backup:
$ pg_dump cybercrime_db > backup_$(date +%Y%m%d).sql

Automated daily backup:
$ crontab -e

Add:
0 2 * * * pg_dump cybercrime_db > /backups/backup_$(date +\%Y\%m\%d).sql

Keep last 7 days:
0 3 * * * find /backups -name "*.sql" -mtime +7 -delete
```

### Part 3: Monitor Performance (2 min)
```
[SCREEN: Terminal - SSH]
Check system:
$ htop
[SHOW: CPU, RAM usage]

Check disk:
$ df -h

Check database size:
$ psql -c "SELECT pg_size_pretty(pg_database_size('cybercrime_db'));"
```

### Part 4: Scaling (2 min)
```
[SCREEN: Diagram on screen]
When to scale:
- 1000+ complaints/day → Add Redis cache
- 5000+ complaints/day → Add load balancer
- 10000+ complaints/day → Database replicas

[SHOW: Architecture diagram with multiple servers]
```

---

## 📝 Quick Reference Card

```
┌──────────────────────────────────────────┐
│         QUICK COMMANDS                   │
├──────────────────────────────────────────┤
│ Start n8n:        n8n start             │
│ Start frontend:   npm run dev            │
│ Check database:   psql -d cybercrime_db  │
│ View logs:        pm2 logs n8n           │
│ Restart n8n:      pm2 restart n8n        │
│ Backup DB:        pg_dump cybercrime_db  │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│         URLS                             │
├──────────────────────────────────────────┤
│ n8n UI:          http://localhost:5678   │
│ Frontend:        http://localhost:5173   │
│ API:             localhost:5678/webhook  │
└──────────────────────────────────────────┘
```

---

**END OF VIDEO SERIES**

Total Duration: ~55 minutes
Recommended: Watch at 1.5x speed after first viewing
