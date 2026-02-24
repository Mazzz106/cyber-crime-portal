# 🚨 National Cyber Crime Complaint Portal

A complete government-grade cyber crime reporting system built with **React + TypeScript** frontend and **n8n + PostgreSQL** backend.

## ✨ Features

### 🔐 Security & Verification
- 2FA with Email & Phone OTP verification
- Aadhaar & PAN number validation
- Token-based complaint tracking
- Secure document generation & storage

### 📝 Complaint Management
- Detailed complaint form with personal details
- Address validation with PIN code
- Auto-selection of nearest police station
- Evidence file upload (drag & drop, multiple files)
- Unique token generation (CYB202602XXXXXX)

### 📄 Document Generation
- Professional PDF generation with government styling
- Print, Download, and View PDF options
- Cloud storage integration
- Secure document sharing

### 📊 Tracking & Monitoring
- Real-time complaint tracking
- Status timeline visualization
- Ongoing complaints dashboard
- Resolved cases with verification

### 📧 Notifications
- Automated email confirmations
- SMS notifications (configurable)
- Police station alerts
- Status update notifications

## 🎯 Quick Start

**Want to start immediately?** Follow the [QUICK-START.md](QUICK-START.md) guide (5 minutes setup).

### Prerequisites
- Node.js v18+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# 1. Install n8n globally
npm install -g n8n

# 2. Install project dependencies
cd /Users/manavpatel/Documents/project/project
npm install

# 3. Setup PostgreSQL
createdb cybercrime_db
psql -d cybercrime_db -f n8n-workflows/database-schema.sql

# 4. Start n8n
n8n start

# 5. Start frontend (in new terminal)
npm run dev
```

### Import Workflows

1. Open n8n at http://localhost:5678
2. Create account
3. Setup PostgreSQL credential (host: localhost, db: cybercrime_db)
4. Setup SMTP credential (Gmail recommended)
5. Import all 6 workflows from `n8n-workflows/` folder
6. Activate each workflow (toggle to Active)

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [QUICK-START.md](QUICK-START.md) | 5-minute setup guide for beginners |
| [N8N-SETUP-GUIDE.md](N8N-SETUP-GUIDE.md) | Complete n8n configuration guide |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System architecture & data flow |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Common issues & solutions |
| [VIDEO-SCRIPT.md](VIDEO-SCRIPT.md) | Video tutorial transcript |

## 🏗️ Architecture

```
React Frontend (Vite + TypeScript + Tailwind CSS)
                    ↓
          n8n Automation Server
                    ↓
            PostgreSQL Database
                    ↓
    External Services (Email, SMS)
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed diagrams.

## 📁 Project Structure

```
project/
├── src/
│   ├── components/
│   │   ├── ComplaintForm.tsx       # Main complaint form
│   │   ├── Header.tsx              # Navigation header
│   │   └── Footer.tsx              # Footer component
│   ├── pages/
│   │   ├── Home.tsx                # Landing page
│   │   ├── TrackComplaint.tsx      # Track by token
│   │   ├── OngoingComplaints.tsx   # Active cases
│   │   └── Results.tsx             # Resolved cases
│   ├── utils/
│   │   └── api.ts                  # n8n API helpers
│   └── App.tsx                     # Main app with routing
├── n8n-workflows/
│   ├── 1-complaint-submission.json # Submit & notify
│   ├── 2-send-otp.json            # Generate OTP
│   ├── 3-verify-otp.json          # Validate OTP
│   ├── 4-track-complaint.json     # Get status
│   ├── 5-ongoing-complaints.json  # List active
│   ├── 6-resolved-complaints.json # Get results
│   └── database-schema.sql        # DB structure
├── .env                            # Configuration
├── package.json                    # Dependencies
└── README.md                       # This file
```

## 🔧 Configuration

### Environment Variables

Create `.env` file:

```env
# n8n Server
VITE_API_URL=http://localhost:5678/webhook
VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook

# Production (update when deployed)
# VITE_API_URL=https://your-domain.com/webhook
```

### n8n Credentials

1. **PostgreSQL**
   - Host: localhost
   - Database: cybercrime_db
   - Port: 5432

2. **SMTP (Gmail)**
   - User: your-email@gmail.com
   - Password: [App Password from Google]
   - Host: smtp.gmail.com
   - Port: 587

3. **SMS (Optional)**
   - MSG91, Twilio, or similar
   - API key in HTTP Header Auth

## 🧪 Testing

### Demo Credentials
- OTP Code: `123456` (for testing)
- Test complaints are created with mock data

### Manual Testing

1. **Submit Complaint**
   ```
   - Fill form with test data
   - Verify OTP (use 123456)
   - Check token generated
   - Verify email received
   ```

2. **Track Complaint**
   ```
   - Use generated token
   - Check status display
   - Verify timeline shown
   ```

3. **Check Database**
   ```bash
   psql -d cybercrime_db
   SELECT * FROM complaints ORDER BY created_at DESC LIMIT 5;
   ```

## 🚀 Deployment

### Development
Already configured! Just run:
```bash
n8n start        # Terminal 1
npm run dev      # Terminal 2
```

### Production

#### Option 1: VPS (DigitalOcean, AWS)
```bash
# On server
npm install -g n8n pm2
pm2 start n8n
pm2 save
pm2 startup

# Setup Nginx reverse proxy
# Setup SSL with Let's Encrypt
# See N8N-SETUP-GUIDE.md for details
```

#### Option 2: Docker
```bash
docker-compose up -d
# See N8N-SETUP-GUIDE.md for docker-compose.yml
```

## 📊 Database Schema

### Main Tables
- `complaints` - Complaint details
- `otp_verification` - OTP codes with expiry
- `complaint_updates` - Status timeline
- `evidence_files` - Uploaded documents
- `resolved_complaints` - Resolution details

See [database-schema.sql](n8n-workflows/database-schema.sql) for complete structure.

## 🔌 API Endpoints

All endpoints are n8n webhooks:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/webhook/submit-complaint` | POST | Submit new complaint |
| `/webhook/send-otp` | POST | Send OTP code |
| `/webhook/verify-otp` | POST | Verify OTP |
| `/webhook/track-complaint/:token` | GET | Get complaint status |
| `/webhook/ongoing-complaints` | GET | List active complaints |
| `/webhook/resolved-complaints` | POST | Get resolved complaints |

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **jsPDF** - PDF generation
- **Lucide React** - Icons

### Backend
- **n8n** - Workflow automation
- **PostgreSQL** - Database
- **SMTP** - Email delivery
- **MSG91/Twilio** - SMS (optional)

## 🐛 Troubleshooting

Common issues and solutions in [TROUBLESHOOTING.md](TROUBLESHOOTING.md):

- Installation errors
- Database connection issues
- Email not sending
- n8n workflow problems
- Frontend build errors

## 📝 License

This is a government project template. Modify as needed for your implementation.

## 🤝 Contributing

This is a demonstration project. For production use:

1. Add authentication for admin panel
2. Implement real file upload to cloud storage
3. Add CAPTCHA for spam prevention
4. Setup monitoring and logging
5. Add comprehensive test suite
6. Implement rate limiting

## 📞 Support

- **n8n Issues**: https://community.n8n.io
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **React Docs**: https://react.dev

## 🎓 Learning Resources

1. **n8n Basics**: https://docs.n8n.io
2. **React Tutorial**: https://react.dev/learn
3. **PostgreSQL Tutorial**: https://www.postgresqltutorial.com
4. **TypeScript Handbook**: https://www.typescriptlang.org/docs/

## 🔄 Updates & Maintenance

### Regular Tasks
- Backup database daily
- Monitor n8n logs
- Update dependencies monthly
- Review and optimize queries
- Clean up old OTP records

### Automated Maintenance
Already configured in workflows:
- OTP cleanup (expired codes)
- Email notifications
- Status updates

## 📈 Scaling Considerations

| Load | Setup | Cost |
|------|-------|------|
| < 100 complaints/day | Current setup | ~$5/month |
| 100-1000/day | Add Redis cache | ~$15/month |
| 1000-5000/day | Load balancer + replicas | ~$50/month |
| 5000+/day | Multiple regions + CDN | ~$200/month |

## ✅ Production Checklist

Before going live:

- [ ] Setup SSL/HTTPS
- [ ] Configure real SMTP service
- [ ] Setup SMS provider
- [ ] Enable database backups
- [ ] Add monitoring (Sentry, LogRocket)
- [ ] Implement rate limiting
- [ ] Add CAPTCHA
- [ ] Setup admin authentication
- [ ] Configure file upload to S3/Cloud
- [ ] Test all workflows
- [ ] Load testing
- [ ] Security audit

## 🎯 Next Steps

1. ✅ **Setup** - Follow [QUICK-START.md](QUICK-START.md)
2. ✅ **Configure** - Setup credentials in n8n
3. ✅ **Test** - Submit test complaint
4. ✅ **Customize** - Modify workflows as needed
5. ✅ **Deploy** - Follow production deployment guide

---

**Ready to start?** Open [QUICK-START.md](QUICK-START.md) and get your portal running in 5 minutes! 🚀

---

Made with ❤️ for secure cyber crime reporting

**Version**: 1.0.0  
**Last Updated**: February 20, 2026
