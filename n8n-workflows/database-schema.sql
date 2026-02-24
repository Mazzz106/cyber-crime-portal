-- Cyber Crime Complaint System Database Schema

-- Main complaints table
CREATE TABLE IF NOT EXISTS complaints (
    id SERIAL PRIMARY KEY,
    complaint_token VARCHAR(50) UNIQUE NOT NULL,
    reporter_name VARCHAR(255) NOT NULL,
    reporter_email VARCHAR(255) NOT NULL,
    reporter_phone VARCHAR(20) NOT NULL,
    aadhaar_number VARCHAR(12),
    pan_number VARCHAR(10),
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    nearest_police_station VARCHAR(255) NOT NULL,
    incident_date DATE NOT NULL,
    incident_type VARCHAR(100) NOT NULL,
    incident_description TEXT NOT NULL,
    suspect_information TEXT,
    evidence_details TEXT,
    financial_loss DECIMAL(15, 2) DEFAULT 0,
    submission_date TIMESTAMP DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'pending',
    pdf_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- OTP verification table
CREATE TABLE IF NOT EXISTS otp_verification (
    id SERIAL PRIMARY KEY,
    token_number VARCHAR(50) NOT NULL,
    contact VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL, -- 'email' or 'phone'
    otp_code VARCHAR(6) NOT NULL,
    expiry_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(token_number, contact)
);

-- Complaint updates/timeline table
CREATE TABLE IF NOT EXISTS complaint_updates (
    id SERIAL PRIMARY KEY,
    complaint_token VARCHAR(50) NOT NULL,
    update_date TIMESTAMP DEFAULT NOW(),
    update_message TEXT NOT NULL,
    updated_by VARCHAR(100),
    FOREIGN KEY (complaint_token) REFERENCES complaints(complaint_token) ON DELETE CASCADE
);

-- Evidence files table
CREATE TABLE IF NOT EXISTS evidence_files (
    id SERIAL PRIMARY KEY,
    complaint_token VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(50),
    uploaded_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (complaint_token) REFERENCES complaints(complaint_token) ON DELETE CASCADE
);

-- Resolved complaints table
CREATE TABLE IF NOT EXISTS resolved_complaints (
    id SERIAL PRIMARY KEY,
    complaint_token VARCHAR(50) UNIQUE NOT NULL,
    resolution_date DATE NOT NULL,
    resolution_status VARCHAR(50) NOT NULL, -- 'successful' or 'unsuccessful'
    resolution_description TEXT NOT NULL,
    action_taken TEXT NOT NULL,
    FOREIGN KEY (complaint_token) REFERENCES complaints(complaint_token) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_complaint_token ON complaints(complaint_token);
CREATE INDEX IF NOT EXISTS idx_reporter_email ON complaints(reporter_email);
CREATE INDEX IF NOT EXISTS idx_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_otp_token ON otp_verification(token_number, contact);
CREATE INDEX IF NOT EXISTS idx_updates_token ON complaint_updates(complaint_token);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'update_complaints_updated_at'
    ) THEN
        CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON complaints
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END$$;
