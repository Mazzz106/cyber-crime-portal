import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface VerifyOtpBody {
  tokenNumber: string;
  contact: string;
  otp: string;
}

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
    const body = (await req.json()) as VerifyOtpBody;
    const tokenNumber = body.tokenNumber?.trim();
    const contact = body.contact?.trim();
    const otp = body.otp?.trim();

    if (!tokenNumber || !contact || !otp) {
      return new Response(JSON.stringify({ success: false, verified: false, message: 'tokenNumber, contact, and otp are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data, error } = await supabase
      .from('otp_verification')
      .select('id')
      .eq('token_number', tokenNumber)
      .eq('contact', contact)
      .eq('otp_code', otp)
      .gt('expiry_time', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return new Response(JSON.stringify({ success: false, verified: false, message: 'Invalid or expired OTP' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { error: deleteError } = await supabase
      .from('otp_verification')
      .delete()
      .eq('token_number', tokenNumber)
      .eq('contact', contact);

    if (deleteError) {
      throw deleteError;
    }

    return new Response(JSON.stringify({ success: true, verified: true, message: 'OTP verified successfully' }), {
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
    return new Response(JSON.stringify({ success: false, verified: false, message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
