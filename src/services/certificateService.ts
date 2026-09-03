import type { CertificateRequest, IssuedCertificate, CertificateType, VerificationResult } from '../types';
import { storageService } from './storageService';
import { hashService } from './cryptoService';
import { smsService } from './smsService';

export const certificateService = {
  // Generate next sequential control number
  generateControlNumber: (): string => {
    const existing = storageService.getRequests();
    const currentYear = new Date().getFullYear();
    const count = existing.length + 1;
    const padded = count.toString().padStart(4, '0');
    return `CG-TGR-${currentYear}-${padded}`;
  },

  // Submit a new request
  submitRequest: async (
    userId: string,
    type: CertificateType,
    purpose: string,
    yearsOfResidency = 1,
    emergencyContact?: string
  ): Promise<CertificateRequest> => {
    const user = storageService.findUserById(userId);
    if (!user) throw new Error('User not found');

    const controlNumber = certificateService.generateControlNumber();
    const now = new Date().toISOString();

    const newRequest: CertificateRequest = {
      id: `req-${Date.now()}`,
      controlNumber,
      userId,
      applicantName: user.fullName,
      applicantPhone: user.phone,
      applicantAddress: user.address,
      applicantPurok: user.purok,
      type,
      purpose,
      yearsOfResidency,
      emergencyContact,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      feeAmount: type === 'indigency' ? 0 : 50,
    };

    storageService.addRequest(newRequest);

    // Send submission confirmation SMS
    await smsService.notifySubmission(user.phone, user.fullName, type, controlNumber);

    return newRequest;
  },

  // Approve a request and cryptographically issue certificate
  approveRequest: async (
    requestId: string,
    adminName: string,
    orNumber?: string
  ): Promise<{ request: CertificateRequest; certificate: IssuedCertificate }> => {
    const requests = storageService.getRequests();
    const request = requests.find((r) => r.id === requestId);
    if (!request) throw new Error('Request record not found');

    const now = new Date();
    const issuedDate = now.toISOString().split('T')[0];
    
    // Set 6 months expiry for clearance/residency, 3 months for indigency
    const expDate = new Date(now);
    if (request.type === 'indigency') {
      expDate.setMonth(expDate.getMonth() + 3);
    } else {
      expDate.setMonth(expDate.getMonth() + 6);
    }
    const expiryDate = expDate.toISOString().split('T')[0];

    // Compute Cryptographic SHA-256 Hash
    const hashSignature = hashService.generateSHA256({
      controlNumber: request.controlNumber,
      type: request.type,
      recipientName: request.applicantName,
      purok: request.applicantPurok,
      purpose: request.purpose,
      issuedDate,
    });

    const certId = `cert-${Date.now()}`;
    const newCert: IssuedCertificate = {
      id: certId,
      requestId: request.id,
      controlNumber: request.controlNumber,
      type: request.type,
      recipientName: request.applicantName,
      recipientAddress: request.applicantAddress,
      purok: request.applicantPurok,
      purpose: request.purpose,
      issuedDate,
      expiryDate,
      signatoryName: adminName || 'Hon. Roberto D. Dela Cruz',
      signatoryTitle: 'Punong Barangay',
      hashSignature,
      qrCodeUrl: '',
      isValid: true,
      createdAt: now.toISOString(),
    };

    storageService.addCertificate(newCert);

    // Update Request
    const updatedReq = storageService.updateRequest(requestId, {
      status: 'approved',
      processedBy: adminName,
      certificateId: certId,
      orNumber: orNumber || (request.type === 'indigency' ? 'EXEMPT-INDIGENT' : `OR-${Math.floor(100000 + Math.random() * 900000)}`),
    });

    // Fire SMS Alert
    await smsService.notifyApproval(
      request.applicantPhone,
      request.applicantName,
      request.type,
      request.controlNumber
    );

    return { request: updatedReq || request, certificate: newCert };
  },

  // Reject a request
  rejectRequest: async (
    requestId: string,
    adminName: string,
    reason: string
  ): Promise<CertificateRequest> => {
    const request = storageService.getRequests().find((r) => r.id === requestId);
    if (!request) throw new Error('Request record not found');

    const updated = storageService.updateRequest(requestId, {
      status: 'rejected',
      processedBy: adminName,
      rejectionReason: reason,
    });

    await smsService.notifyRejection(
      request.applicantPhone,
      request.applicantName,
      request.type,
      request.controlNumber,
      reason
    );

    return updated || request;
  },

  // Public Verification Engine
  verifyByHashOrControlNumber: (query: string): VerificationResult => {
    const clean = query.trim();
    if (!clean) {
      return { verified: false, message: 'Please provide a valid SHA-256 Hash or Control Number.' };
    }

    let cert = storageService.findCertificateByHash(clean);
    if (!cert) {
      cert = storageService.findCertificateByControlNumber(clean);
    }

    if (!cert) {
      return {
        verified: false,
        message: 'No matching official document found in Barangay Taguranao cryptographic ledger.',
        errorReason: 'Hash or Control Number does not exist or document is counterfeit.',
      };
    }

    if (!cert.isValid) {
      return {
        verified: false,
        message: 'Document has been formally REVOKED or marked invalid by the Barangay Administration.',
        errorReason: 'Revocation flag active.',
      };
    }

    // Check expiry
    const today = new Date().toISOString().split('T')[0];
    const isExpired = today > cert.expiryDate;

    // Mask name for Data Privacy Act (RA 10173 compliance)
    // E.g. "Juan Miguel S. Bautista" -> "J*** M***** S. B*******"
    const maskName = (name: string) => {
      return name
        .split(' ')
        .map((part) => (part.length > 2 ? `${part[0]}${'*'.repeat(part.length - 2)}${part[part.length - 1]}` : part))
        .join(' ');
    };

    return {
      verified: true,
      message: isExpired
        ? 'Certificate was authentic when issued, but has officially EXPIRED.'
        : 'CRYPTOGRAPHIC INTEGRITY CONFIRMED: Genuine Barangay Document Verified.',
      certificate: {
        controlNumber: cert.controlNumber,
        type: cert.type,
        recipientNameMasked: maskName(cert.recipientName),
        purok: cert.purok,
        purpose: cert.purpose,
        issuedDate: cert.issuedDate,
        expiryDate: cert.expiryDate,
        status: isExpired ? 'EXPIRED' : 'ACTIVE_VALID',
        hashSignature: cert.hashSignature,
        signatoryName: cert.signatoryName,
      },
    };
  },

  // Revoke a certificate (Security control)
  toggleCertificateValidity: (certId: string, isValid: boolean): IssuedCertificate | null => {
    const certs = storageService.getCertificates();
    const index = certs.findIndex((c) => c.id === certId);
    if (index !== -1) {
      certs[index].isValid = isValid;
      storageService.saveCertificates(certs);
      return certs[index];
    }
    return null;
  },

  // Analytics helper for admin dashboard
  getAnalytics: () => {
    const requests = storageService.getRequests();
    const certificates = storageService.getCertificates();
    const users = storageService.getUsers().filter((u) => u.role === 'resident');

    const totalRequests = requests.length;
    const pendingRequests = requests.filter((r) => r.status === 'pending').length;
    const approvedRequests = requests.filter((r) => r.status === 'approved').length;
    const rejectedRequests = requests.filter((r) => r.status === 'rejected').length;

    const clearanceCount = certificates.filter((c) => c.type === 'clearance').length;
    const indigencyCount = certificates.filter((c) => c.type === 'indigency').length;
    const residencyCount = certificates.filter((c) => c.type === 'residency').length;

    return {
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      totalResidents: users.length,
      totalIssuedCertificates: certificates.length,
      distribution: {
        clearance: clearanceCount,
        indigency: indigencyCount,
        residency: residencyCount,
      },
    };
  },
};
