import type { User, CertificateRequest, IssuedCertificate, SMSMessage } from '../types';

const createDummyIdSvg = (name: string, idNum: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
    <rect width="600" height="380" rx="16" fill="#1E293B"/>
    <rect x="20" y="20" width="560" height="340" rx="12" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2"/>
    <rect x="20" y="20" width="560" height="70" rx="12" fill="#0038A8"/>
    <circle cx="60" cy="55" r="22" fill="#CE1126"/>
    <text x="95" y="48" fill="#FFFFFF" font-family="sans-serif" font-size="18" font-weight="bold">REPUBLIC OF THE PHILIPPINES</text>
    <text x="95" y="68" fill="#FCD34D" font-family="sans-serif" font-size="13" font-weight="bold">BARANGAY TAGURANAO RESIDENT ID (DUMMY DEMO)</text>
    <rect x="40" y="110" width="130" height="160" rx="8" fill="#E2E8F0" stroke="#94A3B8"/>
    <circle cx="105" cy="160" r="35" fill="#94A3B8"/>
    <path d="M65,240 C65,200 145,200 145,240 Z" fill="#94A3B8"/>
    <text x="190" y="130" fill="#64748B" font-family="sans-serif" font-size="12">FULL NAME / PANGALAN</text>
    <text x="190" y="152" fill="#0F172A" font-family="sans-serif" font-size="16" font-weight="bold">${name}</text>
    <text x="190" y="185" fill="#64748B" font-family="sans-serif" font-size="12">ID NUMBER / CONTROL NO.</text>
    <text x="190" y="207" fill="#0038A8" font-family="sans-serif" font-size="15" font-weight="bold">${idNum}</text>
    <text x="190" y="240" fill="#64748B" font-family="sans-serif" font-size="12">VERIFICATION STATUS</text>
    <text x="190" y="262" fill="#059669" font-family="sans-serif" font-size="14" font-weight="bold">OFFICIAL ACADEMIC DEMO ID</text>
    <rect x="40" y="295" width="520" height="45" rx="6" fill="#EFF6FF" stroke="#BFDBFE"/>
    <text x="50" y="322" fill="#1E40AF" font-family="sans-serif" font-size="11">NOTICE: Dummy photo ID strictly generated for system prototype residency verification testing.</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin-01',
    fullName: 'Hon. Roberto D. Dela Cruz',
    email: 'admin@taguranao.gov.ph',
    phone: '09171234567',
    address: 'Purok 1, Barangay Taguranao',
    purok: 'Purok 1 (Centro)',
    civilStatus: 'Married',
    birthDate: '1975-04-12',
    role: 'admin',
    password: 'password123',
    createdAt: '2026-01-01T08:00:00Z',
    verificationStatus: 'approved',
  },
  {
    id: 'user-staff-01',
    fullName: 'Maria Elena Santos',
    email: 'staff@taguranao.gov.ph',
    phone: '09189876543',
    address: 'Purok 3, Barangay Taguranao',
    purok: 'Purok 3 (Mabini)',
    civilStatus: 'Single',
    birthDate: '1992-08-20',
    role: 'staff',
    password: 'password123',
    createdAt: '2026-01-05T08:00:00Z',
    verificationStatus: 'approved',
  },
  {
    id: 'user-res-01',
    fullName: 'Juan Miguel S. Bautista',
    email: 'juan.bautista@example.com',
    phone: '09192345678',
    address: 'Block 4 Lot 12, Sunrise Village, Purok 2',
    purok: 'Purok 2 (Silangan)',
    civilStatus: 'Single',
    birthDate: '1998-05-14',
    role: 'resident',
    password: 'password123',
    createdAt: '2026-02-10T09:30:00Z',
    verificationStatus: 'approved',
    validId: {
      fileName: 'dummy_philsys_id_juan.png',
      mimeType: 'image/svg+xml',
      storagePath: 'resident-valid-ids/dummy_philsys_id_juan.png',
      previewUrl: createDummyIdSvg('JUAN MIGUEL S. BAUTISTA', 'PSN-2026-88912'),
      uploadedAt: '2026-02-10T09:30:00Z',
    },
  },
  {
    id: 'user-res-02',
    fullName: 'Clarissa Marie C. Gomez',
    email: 'clarissa.gomez@example.com',
    phone: '09203456789',
    address: '142 Rizal Street, Purok 4',
    purok: 'Purok 4 (Pag-asa)',
    civilStatus: 'Married',
    birthDate: '1989-11-23',
    role: 'resident',
    password: 'password123',
    createdAt: '2026-02-15T11:15:00Z',
    verificationStatus: 'approved',
    validId: {
      fileName: 'dummy_drivers_license_clarissa.png',
      mimeType: 'image/svg+xml',
      storagePath: 'resident-valid-ids/dummy_drivers_license_clarissa.png',
      previewUrl: createDummyIdSvg('CLARISSA MARIE C. GOMEZ', 'DL-N02-19-09812'),
      uploadedAt: '2026-02-15T11:15:00Z',
    },
  },
  {
    id: 'user-res-03',
    fullName: 'Eduardo Mateo F. Reyes',
    email: 'eduardo.reyes@example.com',
    phone: '09224567890',
    address: 'Sitio Riverside, Purok 5',
    purok: 'Purok 5 (Riverside)',
    civilStatus: 'Married',
    birthDate: '1970-02-03',
    role: 'resident',
    password: 'password123',
    createdAt: '2026-02-18T14:40:00Z',
    verificationStatus: 'approved',
    validId: {
      fileName: 'dummy_sss_id_eduardo.png',
      mimeType: 'image/svg+xml',
      storagePath: 'resident-valid-ids/dummy_sss_id_eduardo.png',
      previewUrl: createDummyIdSvg('EDUARDO MATEO F. REYES', 'SSS-34-8891023-1'),
      uploadedAt: '2026-02-18T14:40:00Z',
    },
  },
  {
    id: 'user-res-04',
    fullName: 'Mark Anthony D. Ramos',
    email: 'mark.ramos@example.com',
    phone: '09179998877',
    address: 'Purok 6 Maharlika Highway, Taguranao',
    purok: 'Purok 6 (Maharlika)',
    civilStatus: 'Single',
    birthDate: '1995-07-19',
    role: 'resident',
    password: 'password123',
    createdAt: '2026-03-01T10:00:00Z',
    verificationStatus: 'pending',
    validId: {
      fileName: 'dummy_postal_id_mark.png',
      mimeType: 'image/svg+xml',
      storagePath: 'resident-valid-ids/dummy_postal_id_mark.png',
      previewUrl: createDummyIdSvg('MARK ANTHONY D. RAMOS', 'PID-8890-1234'),
      uploadedAt: '2026-03-01T10:00:00Z',
    },
  },
];

export const INITIAL_REQUESTS: CertificateRequest[] = [
  {
    id: 'req-2026-001',
    controlNumber: 'CG-TGR-2026-0001',
    userId: 'user-res-01',
    applicantName: 'Juan Miguel S. Bautista',
    applicantPhone: '09192345678',
    applicantAddress: 'Block 4 Lot 12, Sunrise Village, Purok 2',
    applicantPurok: 'Purok 2 (Silangan)',
    type: 'clearance',
    purpose: 'Local Employment requirement at Tech Logistics Corp',
    yearsOfResidency: 6,
    status: 'approved',
    createdAt: '2026-02-28T09:15:00Z',
    updatedAt: '2026-02-28T10:30:00Z',
    processedBy: 'Hon. Roberto D. Dela Cruz',
    certificateId: 'cert-2026-001',
    orNumber: 'OR-892110',
    feeAmount: 50,
  },
  {
    id: 'req-2026-002',
    controlNumber: 'CG-TGR-2026-0002',
    userId: 'user-res-02',
    applicantName: 'Clarissa Marie C. Gomez',
    applicantPhone: '09203456789',
    applicantAddress: '142 Rizal Street, Purok 4',
    applicantPurok: 'Purok 4 (Pag-asa)',
    type: 'indigency',
    purpose: 'Medical Assistance and Subsidy for Hospitalization at District General Hospital',
    yearsOfResidency: 12,
    status: 'approved',
    createdAt: '2026-03-01T08:20:00Z',
    updatedAt: '2026-03-01T09:00:00Z',
    processedBy: 'Maria Elena Santos',
    certificateId: 'cert-2026-002',
    orNumber: 'EXEMPT-INDIGENT',
    feeAmount: 0,
  },
  {
    id: 'req-2026-003',
    controlNumber: 'CG-TGR-2026-0003',
    userId: 'user-res-03',
    applicantName: 'Eduardo Mateo F. Reyes',
    applicantPhone: '09224567890',
    applicantAddress: 'Sitio Riverside, Purok 5',
    applicantPurok: 'Purok 5 (Riverside)',
    type: 'residency',
    purpose: 'Bank Account Opening / PhilSys ID Verification',
    yearsOfResidency: 25,
    status: 'pending',
    createdAt: '2026-03-02T13:45:00Z',
    updatedAt: '2026-03-02T13:45:00Z',
    feeAmount: 50,
  },
  {
    id: 'req-2026-004',
    controlNumber: 'CG-TGR-2026-0004',
    userId: 'user-res-01',
    applicantName: 'Juan Miguel S. Bautista',
    applicantPhone: '09192345678',
    applicantAddress: 'Block 4 Lot 12, Sunrise Village, Purok 2',
    applicantPurok: 'Purok 2 (Silangan)',
    type: 'residency',
    purpose: 'Application for Barangay Scholarship Program',
    yearsOfResidency: 6,
    status: 'pending',
    createdAt: '2026-03-03T07:10:00Z',
    updatedAt: '2026-03-03T07:10:00Z',
    feeAmount: 50,
  }
];

export const INITIAL_CERTIFICATES: IssuedCertificate[] = [
  {
    id: 'cert-2026-001',
    requestId: 'req-2026-001',
    controlNumber: 'CG-TGR-2026-0001',
    releasingStaffId: 'user-staff-01',
    type: 'clearance',
    recipientName: 'Juan Miguel S. Bautista',
    recipientAddress: 'Block 4 Lot 12, Sunrise Village, Purok 2',
    purok: 'Purok 2 (Silangan)',
    purpose: 'Local Employment requirement at Tech Logistics Corp',
    issuedDate: '2026-02-28',
    expiryDate: '2026-08-28',
    signatoryName: 'HON. ROBERTO D. DELA CRUZ',
    signatoryTitle: 'Punong Barangay',
    hashSignature: '8f4c2e6b91a7d5c3f0e8b2a4c6d8e0f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3',
    qrCodeUrl: '',
    isValid: true,
    createdAt: '2026-02-28T10:30:00Z',
  },
  {
    id: 'cert-2026-002',
    requestId: 'req-2026-002',
    controlNumber: 'CG-TGR-2026-0002',
    releasingStaffId: 'user-staff-01',
    type: 'indigency',
    recipientName: 'Clarissa Marie C. Gomez',
    recipientAddress: '142 Rizal Street, Purok 4',
    purok: 'Purok 4 (Pag-asa)',
    purpose: 'Medical Assistance and Subsidy for Hospitalization at District General Hospital',
    issuedDate: '2026-03-01',
    expiryDate: '2026-06-01',
    signatoryName: 'HON. ROBERTO D. DELA CRUZ',
    signatoryTitle: 'Punong Barangay',
    hashSignature: '4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b',
    qrCodeUrl: '',
    isValid: true,
    createdAt: '2026-03-01T09:00:00Z',
  }
];

export const INITIAL_SMS: SMSMessage[] = [
  {
    id: 'sms-001',
    requestId: 'req-2026-001',
    recipientPhone: '09192345678',
    recipientName: 'Juan Miguel S. Bautista',
    controlNumber: 'CG-TGR-2026-0001',
    message: 'CertiGuard Notice: Your request for Barangay Clearance (Ctrl# CG-TGR-2026-0001) has been APPROVED and signed. Cryptographic QR generated. You may download it from your resident portal.',
    status: 'delivered',
    timestamp: '2026-02-28T10:30:15Z',
    type: 'approved',
  },
  {
    id: 'sms-002',
    requestId: 'req-2026-002',
    recipientPhone: '09203456789',
    recipientName: 'Clarissa Marie C. Gomez',
    controlNumber: 'CG-TGR-2026-0002',
    message: 'CertiGuard Notice: Your Certificate of Indigency (Ctrl# CG-TGR-2026-0002) is READY. SHA-256 authenticated. Download anytime via resident login.',
    status: 'delivered',
    timestamp: '2026-03-01T09:00:20Z',
    type: 'approved',
  },
];
