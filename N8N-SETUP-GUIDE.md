# n8n Setup Guide for Cyber Crime Complaint Portal

## 📋 Overview
This guide will help you set up n8n workflows to handle all backend operations for your cyber crime complaint portal.

## 🚀 Quick Start

### Step 1: Install n8n
```bash
# Option 1: Using npm (Recommended for development)
npm install -g n8n

# Option 2: Using Docker (Recommended for production)
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### Step 2: Start n8n
```bash
# If installed via npm
n8n start

# Access n8n at: http://localhost:5678
```

### Step 3: Setup Database

1. **Install PostgreSQL** (if not already installed)
```bash
# macOS
brew install postgresql
brew services start postgresql

# Create database
createdb cybercrime_db
```

2. **Run the schema**
```bash
psql -d cybercrime_db -f n8n-workflows/database-schema.sql
```

### Step 4: Configure n8n Credentials

1. Open n8n: http://localhost:5678
2. Go to **Credentials** menu
3. Add these credentials:

#### PostgreSQL Credential
- Type: PostgreSQL
- Name: `PostgreSQL account`
- Host: `localhost`
- Database: `cybercrime_db`
- User: `your_postgres_user`
- Password: `your_postgres_password`
- Port: `5432`

#### SMTP/Email Credential
- Type: SMTP
- Name: `SMTP account`
- User: `your-email@gmail.com`
- Password: `your-app-password`
- Host: `smtp.gmail.com`
- Port: `587`
- SSL/TLS: Enable

#### SMS API (Optional - MSG91 example)
- Type: HTTP Header Auth
- Header Name: `authkey`
- Header Value: `your-msg91-api-key`

### Step 5: Import Workflows

1. Go to **Workflows** in n8n
2. Click **Import from File**
3. Import these workflows one by one:
   - `n8n-workflows/1-complaint-submission.json`
   - `n8n-workflows/2-send-otp.json`
   - `n8n-workflows/3-verify-otp.json`
   - `n8n-workflows/4-track-complaint.json`

4. **Activate** each workflow (toggle switch in top right)

### Step 6: Get Webhook URLs

After importing, click on each workflow and copy the webhook URLs:

1. **Complaint Submission**: 
   - `http://localhost:5678/webhook/submit-complaint`

2. **Send OTP**: 
   - `http://localhost:5678/webhook/send-otp`

3. **Verify OTP**: 
   - `http://localhost:5678/webhook/verify-otp`

4. **Track Complaint**: 
   - `http://localhost:5678/webhook/track-complaint/:tokenNumber`

## 🔧 Configure Frontend

Update your `.env` file with the n8n server URL:

```env
VITE_API_URL=http://localhost:5678/webhook
VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook
```

## 📊 What Each Workflow Does

### 1. Complaint Submission Workflow
**Trigger**: When user submits complaint form
- Receives complaint data from frontend
- Saves to database with unique token
- Sends confirmation email to victim
- Sends SMS notification
- Notifies police station via email
- Returns success response with token number

### 2. Send OTP Workflow
**Trigger**: When user requests OTP for verification
- Generates 6-digit OTP
- Stores in database with 5-minute expiry
- Sends via email or SMS based on user choice
- Returns success response

### 3. Verify OTP Workflow
**Trigger**: When user submits OTP for verification
- Checks OTP against database
- Validates expiry time
- Deletes OTP after successful verification
- Returns verified status

### 4. Track Complaint Workflow
**Trigger**: When user requests complaint status
- Retrieves complaint details from database
- Fetches all status updates
- Returns complete complaint information

## 🔐 Security Configuration

### Enable Authentication (Production)
```bash
# Set environment variables
export N8N_BASIC_AUTH_ACTIVE=true
export N8N_BASIC_AUTH_USER=admin
export N8N_BASIC_AUTH_PASSWORD=your-secure-password
```

### Enable HTTPS (Production)
```bash
export N8N_PROTOCOL=https
export N8N_SSL_KEY=/path/to/ssl/key.pem
export N8N_SSL_CERT=/path/to/ssl/cert.pem
```

## 🌐 Production Deployment

### Option 1: VPS Deployment
```bash
# Install n8n as service
npm install -g n8n pm2

# Start with PM2
pm2 start n8n -- start

# Save configuration
pm2 save
pm2 startup
```

### Option 2: Docker Deployment
```bash
docker-compose up -d
```

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  n8n:
    image: n8nio/n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=changeme
    volumes:
      - ~/.n8n:/home/node/.n8n
  
  postgres:
    image: postgres:14
    restart: always
    environment:
      - POSTGRES_DB=cybercrime_db
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=changeme
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:
```

## 📝 Customization Guide

### Add More Workflows
You can create additional workflows for:
- **Auto-escalation**: Escalate old complaints
- **Reports**: Generate daily/weekly reports
- **Reminders**: Send status update reminders
- **Analytics**: Track complaint statistics

### Modify Email Templates
Edit the "Prepare Email" nodes in workflows to customize:
- Email subject lines
- Email body content
- Add attachments
- Add CC/BCC recipients

### Add File Upload
1. Add HTTP Request node to receive files
2. Save files to cloud storage (S3, MinIO)
3. Store file URLs in `evidence_files` table

## 🐛 Troubleshooting

### Workflow Not Triggering
- Check if workflow is **activated** (green toggle)
- Verify webhook URL is correct
- Check n8n logs: `n8n start --tunnel`

### Database Connection Error
- Verify PostgreSQL is running
- Check credentials in n8n
- Test connection in PostgreSQL credential

### Email Not Sending
- Use app-specific password for Gmail
- Enable "Less secure app access" if needed
- Check SMTP settings

## 📞 Support

For issues:
1. Check n8n logs: `~/.n8n/logs/`
2. n8n Community: https://community.n8n.io
3. Documentation: https://docs.n8n.io

## 🎯 Next Steps

1. ✅ Complete all 6 setup steps above
2. ✅ Test each workflow individually
3. ✅ Test complete flow from frontend
4. ✅ Configure email/SMS providers
5. ✅ Deploy to production server
6. ✅ Setup monitoring and backups
