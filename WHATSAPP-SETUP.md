# WhatsApp Integration Setup Guide

## 🚀 Quick Setup for Twilio WhatsApp

### Step 1: Activate Twilio WhatsApp Sandbox

1. Go to: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
2. You'll see a WhatsApp number (usually +1 415 523 8886)
3. You'll see a sandbox keyword (like "join [word]")

### Step 2: Connect Your WhatsApp

**From YOUR phone (the one you want to receive PDFs):**
1. Open WhatsApp
2. Send a message to: **+1 415 523 8886** (or the number shown in Twilio)
3. Message text: **join [your-sandbox-word]** (e.g., "join happy-tiger")
4. You'll receive a confirmation message

### Step 3: Connect Your Friend's WhatsApp

**Have your friend do the same:**
1. Open WhatsApp
2. Send to: **+1 415 523 8886**
3. Message: **join [your-sandbox-word]**
4. Wait for confirmation

### Step 4: Test the Integration

Once connected, when someone submits a complaint:
- ✅ OTP sent via Email/SMS
- ✅ Complaint saved to database
- ✅ Email notification sent to cyber crime branch (your Parul email)
- ✅ **WhatsApp message with PDF sent to reporter's phone**

## 📱 What the Reporter Will Receive

```
🚨 Cyber Crime Complaint Registered

Dear [Name],

Your complaint has been successfully registered with the Cyber Crime Portal.

Token Number: CC-2024-XXXXX

Please save this token number for tracking your complaint status.

Your complaint acknowledgement PDF is attached.

Thank you for reporting.
- Cyber Crime Branch
```

## ⚠️ Important Notes

**Sandbox Limitations:**
- Only works with numbers that joined the sandbox (max 5-10 numbers)
- Good for testing and demos
- Twilio branding in messages

**To Go Production (Remove Limitations):**
1. Upgrade Twilio account
2. Request WhatsApp Business API approval
3. Verify your business
4. Update `TWILIO_WHATSAPP_FROM` secret with your approved number

## 🔧 Current Configuration

- WhatsApp Function: ✅ Deployed
- Twilio Credentials: ✅ Configured
- Sender Number: `whatsapp:+14155238886` (Sandbox)
- Integration: ✅ Active

## 🧪 Testing

1. Join the sandbox from your phone
2. Submit a test complaint with your phone number
3. Check WhatsApp for the PDF message

---

**Need help?** Check Twilio docs: https://www.twilio.com/docs/whatsapp
