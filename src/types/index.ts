export type UserRole = 'resident' | 'admin' | 'staff';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  purok: string;
  civilStatus: 'Single' | 'Married' | 'Widowed' | 'Separated';
  birthDate: string;
  role: UserRole;
  password?: string;
  createdAt: string;
}

export type CertificateType = 'clearance' | 'indigency' | 'residency';

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'ready';

export interface CertificateRequest {
  id: string;
  controlNumber: string;
  userId: string;
  applicantName: string;
  applicantPhone: string;
  applicantAddress: string;
  applicantPurok: string;
  type: CertificateType;
  purpose: string;
  emergencyContact?: string;
  yearsOfResidency?: number;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  processedBy?: string;
  rejectionReason?: string;
  certificateId?: string;
  orNumber?: string; // Official receipt / tracking
  feeAmount?: number;
}

export interface IssuedCertificate {
  id: string;
  requestId: string;
  controlNumber: string;
  type: CertificateType;
  recipientName: string;
  recipientAddress: string;
  purok: string;
  purpose: string;
  issuedDate: string;
  expiryDate: string;
  signatoryName: string;
  signatoryTitle: string;
  hashSignature: string; // 64-char SHA-256
  qrCodeUrl: string; // Data URL or target verification link
  isValid: boolean;
  tamperCount?: number;
  createdAt: string;
}

export interface SMSMessage {
  id: string;
  recipientPhone: string;
  recipientName: string;
  controlNumber: string;
  message: string;
  status: 'sent' | 'delivered' | 'failed';
  timestamp: string;
  type: 'status_update' | 'approved' | 'rejected' | 'security_alert';
}

export interface VerificationResult {
  verified: boolean;
  message: string;
  certificate?: {
    controlNumber: string;
    type: CertificateType;
    recipientNameMasked: string;
    purok: string;
    purpose: string;
    issuedDate: string;
    expiryDate: string;
    status: 'ACTIVE_VALID' | 'REVOKED' | 'EXPIRED';
    hashSignature: string;
    signatoryName: string;
  };
  errorReason?: string;
}
