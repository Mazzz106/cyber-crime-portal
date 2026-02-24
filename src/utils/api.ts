import { createClient, SupabaseClient } from '@supabase/supabase-js';

type VerificationMethod = 'email' | 'phone';

interface ComplaintPayload {
  complaint_token: string;
  reporter_name: string;
  reporter_email: string;
  reporter_phone: string;
  aadhaar_number?: string;
  pan_number?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  nearest_police_station: string;
  incident_date: string;
  incident_type: string;
  incident_description: string;
  suspect_information?: string;
  evidence_details?: string;
  financial_loss?: string;
  submission_date?: string;
  pdf_url?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5678/webhook';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL
  || (SUPABASE_URL ? SUPABASE_URL.replace('.supabase.co', '.functions.supabase.co') : '');
const BACKEND_PROVIDER = (import.meta.env.VITE_BACKEND_PROVIDER || '').toLowerCase();

const hasSupabaseConfig = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const useSupabase = BACKEND_PROVIDER === 'supabase' || (BACKEND_PROVIDER !== 'n8n' && hasSupabaseConfig);

const supabase: SupabaseClient | null = hasSupabaseConfig
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

const ensureSupabaseConfigured = () => {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
  }
  return supabase;
};

const n8nPost = async (path: string, payload: unknown) => {
  const response = await fetch(`${API_URL}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Failed request: ${path}`);
  }

  return response.json();
};

const n8nGet = async (path: string) => {
  const response = await fetch(`${API_URL}/${path}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Failed request: ${path}`);
  }

  return response.json();
};

const callSupabaseFunction = async (functionName: string, payload: unknown) => {
  if (!SUPABASE_FUNCTIONS_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase functions are not configured. Add VITE_SUPABASE_FUNCTIONS_URL and VITE_SUPABASE_ANON_KEY');
  }

  const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/${functionName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result?.message || `Supabase function failed: ${functionName}`);
  }

  return result;
};

export const api = {
  async submitComplaint(complaintData: ComplaintPayload) {
    try {
      if (!useSupabase) {
        return await n8nPost('submit-complaint', complaintData);
      }

      const client = ensureSupabaseConfigured();
      const insertData = {
        ...complaintData,
        financial_loss: Number(complaintData.financial_loss || 0),
        submission_date: complaintData.submission_date ? new Date(complaintData.submission_date).toISOString() : new Date().toISOString(),
      };

      const { error } = await client.from('complaints').insert(insertData);
      if (error) {
        throw error;
      }

      await client.from('complaint_updates').insert({
        complaint_token: complaintData.complaint_token,
        update_message: 'Complaint registered successfully',
        updated_by: 'System',
      });

      return {
        success: true,
        message: 'Complaint submitted successfully',
        complaintNumber: complaintData.complaint_token,
      };
    } catch (error) {
      console.error('Error submitting complaint:', error);
      throw error;
    }
  },

  async sendOTP(contact: string, method: VerificationMethod, tokenNumber?: string) {
    try {
      if (!useSupabase) {
        return await n8nPost('send-otp', { contact, method, tokenNumber });
      }

      if (!tokenNumber) {
        throw new Error('Token number is required for OTP');
      }

      return await callSupabaseFunction('send-otp', {
        contact,
        method,
        tokenNumber,
      });
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  },

  async verifyOTP(tokenNumber: string, contact: string, otp: string) {
    try {
      if (!useSupabase) {
        return await n8nPost('verify-otp', { tokenNumber, contact, otp });
      }

      return await callSupabaseFunction('verify-otp', {
        tokenNumber,
        contact,
        otp,
      });
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  },

  async notifyComplaint(complaintData: {
    tokenNumber: string;
    victimName: string;
    victimContact: string;
    incidentType: string;
    description: string;
    dateTime: string;
    location: string;
    suspectInfo?: string;
    evidenceUrls?: string[];
  }) {
    try {
      if (!useSupabase) {
        // For n8n, skip notification
        return { success: true };
      }

      return await callSupabaseFunction('notify-complaint', complaintData);
    } catch (error) {
      console.error('Error notifying complaint:', error);
      // Don't throw error - notification failure shouldn't block submission
      return { success: false, message: error.message };
    }
  },

  async sendWhatsApp(phoneNumber: string, tokenNumber: string, pdfUrl: string, victimName: string) {
    try {
      if (!useSupabase) {
        // For n8n, skip WhatsApp
        return { success: true };
      }

      return await callSupabaseFunction('send-whatsapp', {
        to: phoneNumber,
        tokenNumber,
        pdfUrl,
        victimName,
      });
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      // Don't throw error - WhatsApp failure shouldn't block submission
      return { success: false, message: error.message };
    }
  },

  async trackComplaint(tokenNumber: string) {
    try {
      if (!useSupabase) {
        return await n8nGet(`track-complaint/${tokenNumber}`);
      }

      const client = ensureSupabaseConfigured();
      const { data: complaint, error: complaintError } = await client
        .from('complaints')
        .select('*')
        .eq('complaint_token', tokenNumber)
        .maybeSingle();

      if (complaintError) {
        throw complaintError;
      }

      if (!complaint) {
        return { success: false, complaint: null, updates: [] };
      }

      const { data: updates, error: updatesError } = await client
        .from('complaint_updates')
        .select('*')
        .eq('complaint_token', tokenNumber)
        .order('update_date', { ascending: false });

      if (updatesError) {
        throw updatesError;
      }

      return {
        success: true,
        complaint,
        updates: updates || [],
      };
    } catch (error) {
      console.error('Error tracking complaint:', error);
      throw error;
    }
  },

  async getOngoingComplaints() {
    try {
      if (!useSupabase) {
        return await n8nGet('ongoing-complaints');
      }

      const client = ensureSupabaseConfigured();
      const { data, error } = await client
        .from('complaints')
        .select('*')
        .in('status', ['pending', 'under_investigation', 'assigned'])
        .order('submission_date', { ascending: false });

      if (error) {
        throw error;
      }

      return {
        success: true,
        complaints: data || [],
      };
    } catch (error) {
      console.error('Error fetching ongoing complaints:', error);
      throw error;
    }
  },

  async getResolvedComplaints(tokenNumber: string, contact: string) {
    try {
      if (!useSupabase) {
        return await n8nPost('resolved-complaints', { tokenNumber, contact });
      }

      const client = ensureSupabaseConfigured();
      const { data: complaint, error: complaintError } = await client
        .from('complaints')
        .select('*')
        .eq('complaint_token', tokenNumber)
        .eq('status', 'resolved')
        .or(`reporter_email.eq.${contact},reporter_phone.eq.${contact}`)
        .maybeSingle();

      if (complaintError) {
        throw complaintError;
      }

      if (!complaint) {
        return { success: false, complaint: null, resolution: null, message: 'No resolved complaint found' };
      }

      const { data: resolution, error: resolutionError } = await client
        .from('resolved_complaints')
        .select('*')
        .eq('complaint_token', tokenNumber)
        .maybeSingle();

      if (resolutionError) {
        throw resolutionError;
      }

      return {
        success: true,
        complaint,
        resolution,
      };
    } catch (error) {
      console.error('Error fetching resolved complaints:', error);
      throw error;
    }
  },

  async uploadFile(file: File, complaintToken: string) {
    try {
      if (!useSupabase) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('complaintToken', complaintToken);

        const response = await fetch(`${API_URL}/upload-file`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload file');
        }

        return response.json();
      }

      const localUrl = URL.createObjectURL(file);
      return {
        success: true,
        fileUrl: localUrl,
        complaintToken,
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },
};

export default api;
