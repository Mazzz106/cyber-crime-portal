import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const OTP_FROM_EMAIL = Deno.env.get('OTP_FROM_EMAIL') || 'onboarding@resend.dev';
const CYBERCRIME_EMAIL = '2403031267010@paruluniversity.ac.in'; // Parul University cyber crime branch

interface ComplaintData {
  tokenNumber: string;
  victimName: string;
  victimContact: string;
  incidentType: string;
  description: string;
  dateTime: string;
  location: string;
  suspectInfo?: string;
  evidenceUrls?: string[];
}

const sendComplaintEmail = async (complaint: ComplaintData) => {
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is missing.');
  }

  const emailBody = `
NEW CYBER CRIME COMPLAINT RECEIVED
====================================

Token Number: ${complaint.tokenNumber}

VICTIM INFORMATION:
-------------------
Name: ${complaint.victimName}
Contact: ${complaint.victimContact}

INCIDENT DETAILS:
-----------------
Type: ${complaint.incidentType}
Date & Time: ${complaint.dateTime}
Location: ${complaint.location}

Description:
${complaint.description}

${complaint.suspectInfo ? `Suspect Information:\n${complaint.suspectInfo}\n` : ''}
${complaint.evidenceUrls && complaint.evidenceUrls.length > 0 ? `\nEvidence Files: ${complaint.evidenceUrls.length} file(s) attached` : ''}

---
This complaint can be tracked using Token Number: ${complaint.tokenNumber}
`.trim();

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: OTP_FROM_EMAIL,
      to: [CYBERCRIME_EMAIL],
      subject: `🚨 New Cyber Crime Complaint - ${complaint.tokenNumber}`,
      text: emailBody,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Email send failed: ${JSON.stringify(error)}`);
  }

  return response.json();
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const complaint: ComplaintData = await req.json();

    if (!complaint.tokenNumber || !complaint.victimName || !complaint.victimContact) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required complaint fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await sendComplaintEmail(complaint);

    return new Response(
      JSON.stringify({ success: true, message: 'Complaint notification sent to cyber crime branch' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending complaint notification:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
