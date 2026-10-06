-- ==============================================================================
-- CERTIGUARD: BARANGAY TAGURANAO RESIDENT & CERTIFICATE MANAGEMENT SYSTEM
-- SUPABASE POSTGRESQL PRODUCTION DATABASE SCHEMA & INITIAL SEED SCRIPT
-- ==============================================================================
-- Instructions:
-- 1. Open your Supabase Project Dashboard (https://supabase.com/dashboard)
-- 2. Navigate to "SQL Editor" on the left menu
-- 3. Click "New Query", paste this entire SQL script, and click "RUN"
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop legacy circular constraint if it exists from previous run
DO $$
BEGIN
    ALTER TABLE IF EXISTS public.certificate_requests DROP CONSTRAINT IF EXISTS fk_requests_certificate;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- ==============================================================================
-- 2. TABLE DEFINITIONS
-- ==============================================================================

-- Table 1: USERS (Citizens, Barangay Admin / Captain, Secretary)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY DEFAULT ('user-' || extract(epoch from now())::bigint || '-' || substr(md5(random()::text), 1, 6)),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    purok VARCHAR(50) NOT NULL,
    civil_status VARCHAR(20) NOT NULL CHECK (civil_status IN ('Single', 'Married', 'Widowed', 'Separated')),
    birth_date DATE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'resident' CHECK (role IN ('resident', 'admin', 'staff')),
    password VARCHAR(255) NOT NULL,
    verification_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    verified_by VARCHAR(150),
    verified_at TIMESTAMPTZ,
    verification_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 2: RESIDENT VALID IDS (Government ID attachments for verification)
CREATE TABLE IF NOT EXISTS public.resident_valid_ids (
    id TEXT PRIMARY KEY DEFAULT ('valid-id-' || extract(epoch from now())::bigint),
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(50) NOT NULL,
    storage_path VARCHAR(255) NOT NULL,
    preview_url TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 3: CERTIFICATE REQUESTS (Applications filed by residents)
CREATE TABLE IF NOT EXISTS public.certificate_requests (
    id TEXT PRIMARY KEY DEFAULT ('req-' || extract(epoch from now())::bigint),
    control_number VARCHAR(50) UNIQUE NOT NULL,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    applicant_name VARCHAR(150) NOT NULL,
    applicant_phone VARCHAR(20) NOT NULL,
    applicant_address TEXT NOT NULL,
    applicant_purok VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('clearance', 'indigency', 'residency')),
    purpose TEXT NOT NULL,
    emergency_contact VARCHAR(100),
    years_of_residency INT DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'ready')),
    processed_by VARCHAR(150),
    rejection_reason TEXT,
    certificate_id TEXT,
    or_number VARCHAR(50),
    fee_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'exempted')),
    payment_method VARCHAR(20) CHECK (payment_method IN ('gcash', 'maya', 'bank_transfer', 'cash')),
    payment_ref VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 4: ISSUED CERTIFICATES (Cryptographically hashed certificates with SHA-256)
CREATE TABLE IF NOT EXISTS public.issued_certificates (
    id TEXT PRIMARY KEY DEFAULT ('cert-' || extract(epoch from now())::bigint),
    request_id TEXT NOT NULL REFERENCES public.certificate_requests(id) ON DELETE CASCADE UNIQUE,
    control_number VARCHAR(50) UNIQUE NOT NULL,
    releasing_staff_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('clearance', 'indigency', 'residency')),
    recipient_name VARCHAR(150) NOT NULL,
    recipient_address TEXT NOT NULL,
    purok VARCHAR(50) NOT NULL,
    purpose TEXT NOT NULL,
    issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE NOT NULL,
    signatory_name VARCHAR(150) NOT NULL DEFAULT 'HON. ROBERTO D. DELA CRUZ',
    signatory_title VARCHAR(100) NOT NULL DEFAULT 'Punong Barangay',
    hash_signature VARCHAR(64) UNIQUE NOT NULL,
    qr_code_url TEXT,
    is_valid BOOLEAN NOT NULL DEFAULT TRUE,
    tamper_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Remove circular constraint to avoid deadlock between certificate_requests and issued_certificates
DO $$
BEGIN
    ALTER TABLE public.certificate_requests DROP CONSTRAINT IF EXISTS fk_requests_certificate;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Table 5: SMS LOGS (Transaction and status alert gateway audit)
CREATE TABLE IF NOT EXISTS public.sms_logs (
    id TEXT PRIMARY KEY DEFAULT ('sms-' || extract(epoch from now())::bigint),
    request_id TEXT REFERENCES public.certificate_requests(id) ON DELETE CASCADE,
    recipient_phone VARCHAR(20) NOT NULL,
    recipient_name VARCHAR(150) NOT NULL,
    control_number VARCHAR(50),
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed')),
    type VARCHAR(30) NOT NULL DEFAULT 'status_update' CHECK (type IN ('status_update', 'approved', 'rejected', 'security_alert')),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 6: SYSTEM AUDIT TRAILS (Administrative accountability and action logs)
CREATE TABLE IF NOT EXISTS public.system_audit_trails (
    id TEXT PRIMARY KEY DEFAULT ('audit-' || extract(epoch from now())::bigint),
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action VARCHAR(150) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 7: VERIFICATION LOGS (Document integrity scan records & anti-forgery detection)
CREATE TABLE IF NOT EXISTS public.verification_logs (
    id TEXT PRIMARY KEY DEFAULT ('vlog-' || extract(epoch from now())::bigint),
    certificate_id TEXT NOT NULL REFERENCES public.issued_certificates(id) ON DELETE CASCADE,
    verifier_ip VARCHAR(45) NOT NULL,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    result VARCHAR(30) NOT NULL CHECK (result IN ('authentic', 'counterfeit', 'revoked', 'expired'))
);

-- ==============================================================================
-- 3. INDEXES FOR HIGH-PERFORMANCE SEARCH & VERIFICATION
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON public.certificate_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_control_number ON public.certificate_requests(control_number);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.certificate_requests(status);
CREATE INDEX IF NOT EXISTS idx_issued_certs_hash ON public.issued_certificates(hash_signature);
CREATE INDEX IF NOT EXISTS idx_issued_certs_control ON public.issued_certificates(control_number);
CREATE INDEX IF NOT EXISTS idx_issued_certs_staff ON public.issued_certificates(releasing_staff_id);
CREATE INDEX IF NOT EXISTS idx_sms_request ON public.sms_logs(request_id);
CREATE INDEX IF NOT EXISTS idx_sms_phone ON public.sms_logs(recipient_phone);
CREATE INDEX IF NOT EXISTS idx_audit_user ON public.system_audit_trails(user_id);
CREATE INDEX IF NOT EXISTS idx_vlogs_cert ON public.verification_logs(certificate_id);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resident_valid_ids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issued_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_audit_trails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Public can view valid certificates by hash" ON public.issued_certificates;
DROP POLICY IF EXISTS "Allow all access to issued_certificates" ON public.issued_certificates;
DROP POLICY IF EXISTS "Allow all access to users" ON public.users;
DROP POLICY IF EXISTS "Allow all access to resident_valid_ids" ON public.resident_valid_ids;
DROP POLICY IF EXISTS "Allow all access to certificate_requests" ON public.certificate_requests;
DROP POLICY IF EXISTS "Allow all access to sms_logs" ON public.sms_logs;
DROP POLICY IF EXISTS "Allow all access to system_audit_trails" ON public.system_audit_trails;
DROP POLICY IF EXISTS "Allow all access to verification_logs" ON public.verification_logs;

-- Permissive policies for Prototype & Academic Demonstration (Client Anon Key)
CREATE POLICY "Allow all access to users" 
ON public.users FOR ALL 
USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to resident_valid_ids" 
ON public.resident_valid_ids FOR ALL 
USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to certificate_requests" 
ON public.certificate_requests FOR ALL 
USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to issued_certificates" 
ON public.issued_certificates FOR ALL 
USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to sms_logs" 
ON public.sms_logs FOR ALL 
USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to system_audit_trails" 
ON public.system_audit_trails FOR ALL 
USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to verification_logs" 
ON public.verification_logs FOR ALL 
USING (true) WITH CHECK (true);

-- ==============================================================================
-- 5. SUPABASE STORAGE BUCKET CONFIGURATION (For Resident Valid IDs)
-- ==============================================================================
-- Setup 'Files' bucket (user's preferred bucket) and 'resident-valid-ids'
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('Files', 'Files', true),
    ('resident-valid-ids', 'resident-valid-ids', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies for uploads and downloads
DROP POLICY IF EXISTS "Public bucket access for Files" ON storage.objects;
DROP POLICY IF EXISTS "Public bucket access for valid IDs" ON storage.objects;

CREATE POLICY "Public bucket access for Files"
ON storage.objects FOR ALL
USING (bucket_id = 'Files')
WITH CHECK (bucket_id = 'Files');

CREATE POLICY "Public bucket access for valid IDs"
ON storage.objects FOR ALL
USING (bucket_id = 'resident-valid-ids')
WITH CHECK (bucket_id = 'resident-valid-ids');

-- ==============================================================================
-- 6. INITIAL SEED DATA (Official Barangay Staff & Sample Certificates)
-- ==============================================================================

-- Insert Barangay Admin (Captain) and Staff (Secretary)
INSERT INTO public.users (id, full_name, email, phone, address, purok, civil_status, birth_date, role, password, verification_status, created_at)
VALUES 
(
    'user-admin-01',
    'HON. ROBERTO D. DELA CRUZ',
    'admin@taguranao.gov.ph',
    '09171234567',
    'Barangay Hall, Provincial Road, Purok 1 Centro',
    'Purok 1 (Centro)',
    'Married',
    '1975-06-12',
    'admin',
    'password123',
    'approved',
    '2026-01-01T00:00:00Z'
),
(
    'user-staff-01',
    'Maria Elena Santos',
    'secretary@taguranao.gov.ph',
    '09189876543',
    'Barangay Hall Administration Office',
    'Purok 1 (Centro)',
    'Single',
    '1988-11-20',
    'staff',
    'password123',
    'approved',
    '2026-01-01T00:00:00Z'
),
(
    'user-staff-02',
    'Maria Elena Santos',
    'staff@taguranao.gov.ph',
    '09189876543',
    'Barangay Hall Administration Office',
    'Purok 1 (Centro)',
    'Single',
    '1988-11-20',
    'staff',
    'password123',
    'approved',
    '2026-01-01T00:00:00Z'
)
ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    password = EXCLUDED.password;

-- Insert Seed Resident Citizens
INSERT INTO public.users (id, full_name, email, phone, address, purok, civil_status, birth_date, role, password, verification_status, verified_by, verified_at, created_at)
VALUES 
(
    'user-res-01',
    'Juan Miguel S. Bautista',
    'juan.bautista@example.com',
    '09192345678',
    'Block 4 Lot 12, Sunrise Village, Purok 2',
    'Purok 2 (Silangan)',
    'Single',
    '1999-04-15',
    'resident',
    'password123',
    'approved',
    'Maria Elena Santos',
    '2026-02-15T10:00:00Z',
    '2026-02-15T09:30:00Z'
),
(
    'user-res-01b',
    'Juan Miguel S. Bautista',
    'juan@gmail.com',
    '09192345678',
    'Block 4 Lot 12, Sunrise Village, Purok 2',
    'Purok 2 (Silangan)',
    'Single',
    '1999-04-15',
    'resident',
    'password123',
    'approved',
    'Maria Elena Santos',
    '2026-02-15T10:00:00Z',
    '2026-02-15T09:30:00Z'
),
(
    'user-res-02',
    'Clarissa Marie C. Gomez',
    'clarissa.gomez@example.com',
    '09203456789',
    '142 Rizal Street, Purok 4',
    'Purok 4 (Pag-asa)',
    'Married',
    '1992-09-08',
    'resident',
    'password123',
    'approved',
    'Maria Elena Santos',
    '2026-02-20T11:00:00Z',
    '2026-02-20T10:15:00Z'
),
(
    'user-res-02b',
    'Clarissa Marie C. Gomez',
    'clarissa@gmail.com',
    '09203456789',
    '142 Rizal Street, Purok 4',
    'Purok 4 (Pag-asa)',
    'Married',
    '1992-09-08',
    'resident',
    'password123',
    'approved',
    'Maria Elena Santos',
    '2026-02-20T11:00:00Z',
    '2026-02-20T10:15:00Z'
),
(
    'user-res-03',
    'Eduardo Mateo F. Reyes',
    'eduardo@gmail.com',
    '09224567890',
    'Sitio Riverside, Purok 5',
    'Purok 5 (Riverside)',
    'Married',
    '1968-12-03',
    'resident',
    'password123',
    'approved',
    'Maria Elena Santos',
    '2026-02-22T08:30:00Z',
    '2026-02-22T08:00:00Z'
),
(
    'user-res-04',
    'Ramon Alcantara Jr.',
    'ramon@gmail.com',
    '09289998877',
    'Purok 3 Mabini, Near Elementary School',
    'Purok 3 (Mabini)',
    'Single',
    '2001-08-19',
    'resident',
    'password123',
    'pending',
    NULL,
    NULL,
    '2026-03-04T09:00:00Z'
)
ON CONFLICT (email) DO NOTHING;

-- Insert Seed Certificate Requests (Set certificate_id initially to NULL)
INSERT INTO public.certificate_requests (id, control_number, user_id, applicant_name, applicant_phone, applicant_address, applicant_purok, type, purpose, years_of_residency, status, processed_by, certificate_id, or_number, fee_amount, created_at, updated_at)
VALUES 
(
    'req-2026-001',
    'CG-TGR-2026-0001',
    'user-res-01',
    'Juan Miguel S. Bautista',
    '09192345678',
    'Block 4 Lot 12, Sunrise Village, Purok 2',
    'Purok 2 (Silangan)',
    'clearance',
    'Local Employment requirement at Tech Logistics Corp',
    5,
    'approved',
    'Maria Elena Santos',
    NULL,
    'OR-882194',
    50.00,
    '2026-02-28T09:00:00Z',
    '2026-02-28T10:30:00Z'
),
(
    'req-2026-002',
    'CG-TGR-2026-0002',
    'user-res-02',
    'Clarissa Marie C. Gomez',
    '09203456789',
    '142 Rizal Street, Purok 4',
    'Purok 4 (Pag-asa)',
    'indigency',
    'Medical Assistance and Subsidy for Hospitalization at District General Hospital',
    12,
    'approved',
    'Maria Elena Santos',
    NULL,
    'EXEMPT-INDIGENT',
    0.00,
    '2026-03-01T08:20:00Z',
    '2026-03-01T09:00:00Z'
)
ON CONFLICT (control_number) DO NOTHING;

-- Insert Seed Issued Certificates (With Verified SHA-256 Hashes and Hon. Roberto D. Dela Cruz)
INSERT INTO public.issued_certificates (id, request_id, control_number, type, recipient_name, recipient_address, purok, purpose, issued_date, expiry_date, signatory_name, signatory_title, hash_signature, qr_code_url, is_valid, tamper_count, created_at)
VALUES 
(
    'cert-2026-001',
    'req-2026-001',
    'CG-TGR-2026-0001',
    'clearance',
    'Juan Miguel S. Bautista',
    'Block 4 Lot 12, Sunrise Village, Purok 2',
    'Purok 2 (Silangan)',
    'Local Employment requirement at Tech Logistics Corp',
    '2026-02-28',
    '2026-08-28',
    'HON. ROBERTO D. DELA CRUZ',
    'Punong Barangay',
    '74ba7c00b93f27b0385b9b9f31608638185e78e726241e0e033e1d7f1e38ebef',
    '',
    true,
    0,
    '2026-02-28T10:30:00Z'
),
(
    'cert-2026-002',
    'req-2026-002',
    'CG-TGR-2026-0002',
    'indigency',
    'Clarissa Marie C. Gomez',
    '142 Rizal Street, Purok 4',
    'Purok 4 (Pag-asa)',
    'Medical Assistance and Subsidy for Hospitalization at District General Hospital',
    '2026-03-01',
    '2026-06-01',
    'HON. ROBERTO D. DELA CRUZ',
    'Punong Barangay',
    'df3d8137798db28f5056c3374db0d4f5080dd618a5748b2d435a0399335e0cb6',
    '',
    true,
    0,
    '2026-03-01T09:00:00Z'
)
ON CONFLICT (control_number) DO NOTHING;

-- Link issued certificates back to requests now that both records exist
UPDATE public.certificate_requests SET certificate_id = 'cert-2026-001' WHERE id = 'req-2026-001' AND certificate_id IS NULL;
UPDATE public.certificate_requests SET certificate_id = 'cert-2026-002' WHERE id = 'req-2026-002' AND certificate_id IS NULL;

-- Insert Seed SMS Logs
INSERT INTO public.sms_logs (id, recipient_phone, recipient_name, control_number, message, status, type, timestamp)
VALUES 
(
    'sms-001',
    '09192345678',
    'Juan Miguel S. Bautista',
    'CG-TGR-2026-0001',
    'BARANGAY TAGURANAO: Maayong adlaw Juan! Your application for Barangay Clearance (CG-TGR-2026-0001) has been APPROVED and digitally signed. You may now download your verified PDF certificate from the portal.',
    'delivered',
    'approved',
    '2026-02-28T10:30:15Z'
),
(
    'sms-002',
    '09203456789',
    'Clarissa Marie C. Gomez',
    'CG-TGR-2026-0002',
    'BARANGAY TAGURANAO: Hello Clarissa! Your Certificate of Indigency (CG-TGR-2026-0002) is APPROVED and validated under zero-fee exemption. SHA-256 ledger integrity verified.',
    'delivered',
    'approved',
    '2026-03-01T09:00:20Z'
)
ON CONFLICT (id) DO NOTHING;

-- Done!
SELECT 'Supabase schema and seed data created successfully!' AS result;
