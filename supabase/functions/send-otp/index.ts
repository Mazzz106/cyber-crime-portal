import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const OTP_FROM_EMAIL = Deno.env.get('OTP_FROM_EMAIL') || 'noreply@yourdomain.com';
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID') || '';
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN') || '';
const TWILIO_FROM_NUMBER = Deno.env.get('TWILIO_FROM_NUMBER') || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

type Method = 'email' | 'phone';

interface SendOtpBody {
  contact: string;
  method: Method;
  tokenNumber: string;
}

const sendEmailOtp = async (to: string, otp: string) => {
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is missing. Configure email provider secret.');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: OTP_FROM_EMAIL,
      to: [to],
      subject: 'Cyber Crime Portal OTP Verification',
      text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Email send failed: ${errorText}`);
  }
};

const sendSmsOtp = async (to: string, otp: string) => {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
    throw new Error('Twilio secrets are missing. Configure SMS provider secrets.');
  }

  const body = new URLSearchParams({
    To: to,
    From: TWILIO_FROM_NUMBER,
    Body: `Your OTP is ${otp}. Valid for 5 minutes.`,
  });

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
    throw new Error(`SMS send failed: ${errorText}`);
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, message: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await req.json()) as SendOtpBody;
    const contact = body.contact?.trim();
    const method = body.method;
    const tokenNumber = body.tokenNumber?.trim();

    if (!contact || !method || !tokenNumber) {
      return new Response(JSON.stringify({ success: false, message: 'contact, method, and tokenNumber are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!['email', 'phone'].includes(method)) {
      return new Response(JSON.stringify({ success: false, message: 'method must be email or phone' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { error: upsertError } = await supabase.from('otp_verification').upsert(
      {
        token_number: tokenNumber,
        contact,
        method,
        otp_code: otp,
        expiry_time: expiryTime,
      },
      { onConflict: 'token_number,contact' }
    );

    if (upsertError) {
      throw upsertError;
    }

    if (method === 'email') {
      await sendEmailOtp(contact, otp);
    } else {
      await sendSmsOtp(contact, otp);
    }

    return new Response(JSON.stringify({ success: true, message: 'OTP sent successfully' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'object' && error && 'message' in error
          ? String((error as { message?: string }).message)
          : JSON.stringify(error);
    return new Response(JSON.stringify({ success: false, message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
