# Step-by-Step Quick Start for Non-Technical Users

## What is n8n?
n8n is an automation tool that connects your website to your database. Think of it as the "brain" that:
- Saves complaints to database
- Sends emails/SMS
- Manages OTP verification
- Tracks complaint status

## Installation (Choose One Method)

### METHOD 1: Simple Installation (Mac/Linux)
```bash
# Open Terminal and run:
npm install -g n8n

# Start n8n
n8n start
```
✅ n8n will open at: http://localhost:5678

---

### METHOD 2: Docker Installation (All Operating Systems)
```bash
# Install Docker Desktop first: https://www.docker.com/products/docker-desktop

# Run this command:
docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n
```
✅ n8n will open at: http://localhost:5678

---

## Step-by-Step Setup (5 Minutes)

### STEP 1: Open n8n
- Go to: http://localhost:5678
- Create account (email + password)

### STEP 2: Setup Database
```bash
# Install PostgreSQL (one-time)
brew install postgresql
brew services start postgresql

# Create database
createdb cybercrime_db

# Load database structure
cd /Users/manavpatel/Documents/project/project
psql -d cybercrime_db -f n8n-workflows/database-schema.sql
```

### STEP 3: Add Database Connection in n8n
1. Click **Credentials** (left menu)
2. Click **Add Credential**
3. Search: **PostgreSQL**
4. Fill in:
   - Name: `PostgreSQL account`
   - Host: `localhost`
   - Database: `cybercrime_db`
   - User: `your_mac_username` (your computer username)
   - Password: (leave blank if no password set)
   - Port: `5432`
5. Click **Save**

### STEP 4: Add Email Settings (Gmail Example)
1. Click **Credentials** > **Add Credential**
2. Search: **SMTP**
3. Fill in:
   - Name: `SMTP account`
   - User: `your-email@gmail.com`
   - Password: (Get App Password from: https://myaccount.google.com/apppasswords)
   - Host: `smtp.gmail.com`
   - Port: `587`
   - Enable SSL/TLS: ✅
4. Click **Save**

### STEP 5: Import Workflows
1. Click **Workflows** (left menu)
2. Click **Import from File**
3. Import each file:
   - `n8n-workflows/1-complaint-submission.json` ✅
   - `n8n-workflows/2-send-otp.json` ✅
   - `n8n-workflows/3-verify-otp.json` ✅
   - `n8n-workflows/4-track-complaint.json` ✅

### STEP 6: Activate Workflows
For each workflow:
1. Open it
2. Click **Inactive** toggle (top right) to make it **Active** (green)

---

## Test Your Setup

### Test Frontend Connection
```bash
# Open Terminal in your project folder
cd /Users/manavpatel/Documents/project/project

# Start your website
npm run dev
```

Visit: http://localhost:5173

### Submit a Test Complaint
1. Fill the form
2. Use OTP: `123456` (demo mode)
3. Check if complaint submits successfully

---

## What Each File Does

| Workflow File | What It Does |
|--------------|-------------|
| `1-complaint-submission.json` | Saves complaints, sends emails |
| `2-send-otp.json` | Generates and sends OTP codes |
| `3-verify-otp.json` | Checks if OTP is correct |
| `4-track-complaint.json` | Shows complaint status |

---

## Common Issues & Solutions

### Issue: "Cannot connect to database"
**Solution:** 
```bash
# Check if PostgreSQL is running
brew services list

# Restart if needed
brew services restart postgresql
```

### Issue: "Emails not sending"
**Solution:**
1. For Gmail: Enable 2-Step Verification
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use that password in n8n SMTP settings

### Issue: "Workflow not triggering"
**Solution:**
- Check workflow is **Active** (green toggle)
- Check `.env` file has correct URL

---

## Production Deployment (Later)

When ready to make it live:
1. Get a VPS server (DigitalOcean, AWS, etc.)
2. Install n8n on server
3. Get domain name
4. Update `.env` with your domain
5. Enable HTTPS/SSL

Detailed steps in: `N8N-SETUP-GUIDE.md`

---

## Where to Get Help

1. **n8n Community:** https://community.n8n.io
2. **n8n Docs:** https://docs.n8n.io
3. **YouTube:** Search "n8n tutorial"

---

## Current Status: ✅ READY TO USE

Your system is now configured to:
- ✅ Accept complaints
- ✅ Send OTP verification
- ✅ Store in database
- ✅ Send email notifications
- ✅ Track complaint status

**Next:** Start n8n, activate workflows, and test!
