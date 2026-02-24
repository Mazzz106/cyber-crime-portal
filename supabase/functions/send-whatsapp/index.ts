import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID') || '';
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN') || '';
const TWILIO_WHATSAPP_FROM = Deno.env.get('TWILIO_WHATSAPP_FROM') || 'whatsapp:+14155238886'; // Twilio sandbox number

interface WhatsAppMessageBody {
  to: string; // Phone number with country code (e.g., +919876543210)
  tokenNumber: string;
  pdfUrl: string;
  victimName: string;
}

const sendWhatsAppMessage = async (to: string, message: string, mediaUrl?: string) => {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    throw new Error('Twilio credentials are missing.');
  }

  const body = new URLSearchParams({
    To: `whatsapp:${to}`,
    From: TWILIO_WHATSAPP_FROM,
    Body: message,
  });

  if (mediaUrl) {
    body.append('MediaUrl', mediaUrl);
  }

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WhatsApp send failed: ${errorText}`);
  }

  return response.json();
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, tokenNumber, pdfUrl, victimName }: WhatsAppMessageBody = await req.json();

    if (!to || !tokenNumber || !pdfUrl) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required fields: to, tokenNumber, pdfUrl' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const message = `🚨 *Cyber Crime Complaint Registered*

Dear ${victimName},

Your complaint has been successfully registered with the Cyber Crime Portal.

*Token Number:* ${tokenNumber}

Please save this token number for tracking your complaint status.

Your complaint acknowledgement PDF is attached.

Thank you for reporting.
- Cyber Crime Branch`;

    await sendWhatsAppMessage(to, message, pdfUrl);

    return new Response(
      JSON.stringify({ success: true, message: 'WhatsApp message sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
