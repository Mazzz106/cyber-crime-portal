-- Optional sample data for quick UI testing
-- Run after supabase-temp-setup.sql

INSERT INTO public.complaints (
  complaint_token,
  reporter_name,
  reporter_email,
  reporter_phone,
  address_line1,
  city,
  state,
  pincode,
  nearest_police_station,
  incident_date,
  incident_type,
  incident_description,
  financial_loss,
  status
)
VALUES
(
  'CYB2026009001',
  'Test User One',
  'user1@example.com',
  '9999999991',
  '123 Test Street',
  'Mumbai',
  'Maharashtra',
  '400001',
  'Mumbai Cyber Cell',
  '2026-02-20',
  'Online Fraud',
  'Test pending complaint for ongoing dashboard.',
  25000,
  'under_investigation'
),
(
  'CYB2026009002',
  'Test User Two',
  'user2@example.com',
  '9999999992',
  '45 Demo Avenue',
  'Pune',
  'Maharashtra',
  '411001',
  'Pune Cyber Police',
  '2026-02-10',
  'Phishing',
  'Test resolved complaint for results page.',
  15000,
  'resolved'
)
ON CONFLICT (complaint_token) DO NOTHING;

INSERT INTO public.complaint_updates (complaint_token, update_message, updated_by)
VALUES
('CYB2026009001', 'Complaint registered successfully', 'System'),
('CYB2026009001', 'Case assigned to investigating officer', 'System'),
('CYB2026009002', 'Complaint registered successfully', 'System'),
('CYB2026009002', 'Investigation completed', 'System')
ON CONFLICT DO NOTHING;

INSERT INTO public.resolved_complaints (
  complaint_token,
  resolution_date,
  resolution_status,
  resolution_description,
  action_taken
)
VALUES
(
  'CYB2026009002',
  '2026-02-22',
  'successful',
  'Fraud account identified and blocked.',
  'Notified bank, blocked beneficiary account, initiated legal action.'
)
ON CONFLICT (complaint_token) DO NOTHING;
