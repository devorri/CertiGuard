import type { CertificateRequest, IssuedCertificate, CertificateType, VerificationResult } from '../types';
import { storageService } from './storageService';
import { hashService } from './cryptoService';
import { smsService } from './smsService';
import { supabaseDataService } from './supabaseDataService';

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
    emergencyContact?: string,
    paymentMethod?: 'gcash' | 'maya' | 'bank_transfer' | 'cash',
    paymentRef?: string
  ): Promise<CertificateRequest> => {
    const user = (await storageService.findUserByIdAsync(userId)) || storageService.findUserById(userId);
    if (!user) throw new Error('User not found');

    const controlNumber = certificateService.generateControlNumber();
    const now = new Date().toISOString();
    const feeAmount = type === 'indigency' ? 0 : 50;

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
      feeAmount,
      paymentStatus: feeAmount === 0 ? 'exempted' : (paymentMethod ? 'paid' : 'unpaid'),
      paymentMethod: paymentMethod || undefined,
      paymentRef: paymentRef || undefined,
    };

    await storageService.addRequestAsync(newRequest);

    // Send submission confirmation SMS
    await smsService.notifySubmission(user.phone, user.fullName, type, controlNumber, newRequest.id);

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
      releasingStaffId: 'user-staff-01',
      type: request.type,
      recipientName: request.applicantName,
      recipientAddress: request.applicantAddress,
      purok: request.applicantPurok,
      purpose: request.purpose,
      issuedDate,
      expiryDate,
      signatoryName: 'HON. ROBERTO D. DELA CRUZ',
      signatoryTitle: 'Punong Barangay',
      hashSignature,
      qrCodeUrl: '',
      isValid: true,
      createdAt: now.toISOString(),
    };

    // Store in Supabase database
    await storageService.addCertificateAsync(newCert);

    // Update Request in Supabase database
    const assignedOrNumber = orNumber || (request.type === 'indigency' ? 'EXEMPT-INDIGENT' : `OR-${Math.floor(100000 + Math.random() * 900000)}`);
    await storageService.updateRequestAsync(requestId, {
      status: 'approved',
      processedBy: adminName,
      certificateId: certId,
      orNumber: assignedOrNumber,
    });

    // Audit Trail
    await supabaseDataService.logAudit(
      request.userId,
      `Certificate ${request.controlNumber} approved and signed by ${adminName}`
    );

    // Fire SMS Alert
    await smsService.notifyApproval(
      request.applicantPhone,
      request.applicantName,
      request.type,
      request.controlNumber,
      request.id
    );

    return { request: (storageService.getRequests().find((r) => r.id === requestId) || request), certificate: newCert };
  },

  // Reject a request
  rejectRequest: async (
    requestId: string,
    adminName: string,
    reason: string
  ): Promise<CertificateRequest> => {
    const request = storageService.getRequests().find((r) => r.id === requestId);
    if (!request) throw new Error('Request record not found');

    await storageService.updateRequestAsync(requestId, {
      status: 'rejected',
      processedBy: adminName,
      rejectionReason: reason,
    });

    await supabaseDataService.logAudit(
      request.userId,
      `Request ${request.controlNumber} disapproved: ${reason}`
    );

    await smsService.notifyRejection(
      request.applicantPhone,
      request.applicantName,
      request.type,
      request.controlNumber,
      reason,
      request.id
    );

    return storageService.getRequests().find((r) => r.id === requestId) || request;
  },

  // Synchronous verification for local checks
  verifyByHashOrControlNumber: (input: string): VerificationResult => {
    const clean = input.trim();
    if (!clean) {
      return {
        verified: false,
        message: 'No verification query provided.',
        errorReason: 'EMPTY_INPUT',
      };
    }

    let cert = storageService.findCertificateByHash(clean);
    if (!cert) {
      cert = storageService.findCertificateByControlNumber(clean);
    }

    if (!cert) {
      return {
        verified: false,
        message: 'DOCUMENT NOT FOUND: No issued certificate matches this hash or control number in the registry.',
        errorReason: 'RECORD_NOT_FOUND',
      };
    }

    // Verify cryptographic integrity
    const recomputedHash = hashService.generateSHA256({
      controlNumber: cert.controlNumber,
      type: cert.type,
      recipientName: cert.recipientName,
      purok: cert.purok,
      purpose: cert.purpose,
      issuedDate: cert.issuedDate,
    });

    const isTampered = recomputedHash.toLowerCase() !== cert.hashSignature.toLowerCase();
    if (isTampered) {
      return {
        verified: false,
        message: 'TAMPER DETECTED: The cryptographic signature does not match stored document parameters. Possible forgery!',
        errorReason: 'CRYPTOGRAPHIC_MISMATCH',
      };
    }

    if (!cert.isValid) {
      return {
        verified: false,
        message: 'CERTIFICATE REVOKED: This document has been revoked by Barangay Administration.',
        errorReason: 'REVOKED_STATUS',
      };
    }

    const today = new Date().toISOString().split('T')[0];
    if (cert.expiryDate < today) {
      return {
        verified: false,
        message: 'CERTIFICATE EXPIRED: The validity period for this official document has lapsed.',
        errorReason: 'EXPIRED_DATE',
      };
    }

    // Mask name for Privacy compliance
    const nameParts = cert.recipientName.split(' ');
    const maskedName = nameParts
      .map((part) => {
        if (part.length <= 2) return part;
        return `${part[0]}${'*'.repeat(part.length - 2)}${part[part.length - 1]}`;
      })
      .join(' ');

    return {
      verified: true,
      message: 'AUTHENTIC DOCUMENT: Verified and validated against Barangay Taguranao cryptographic ledger.',
      certificate: {
        controlNumber: cert.controlNumber,
        type: cert.type,
        recipientNameMasked: maskedName,
        purok: cert.purok,
        purpose: cert.purpose,
        issuedDate: cert.issuedDate,
        expiryDate: cert.expiryDate,
        status: 'ACTIVE_VALID',
        hashSignature: cert.hashSignature,
        signatoryName: cert.signatoryName || 'HON. ROBERTO D. DELA CRUZ',
      },
    };
  },

  /**
   * Asynchronous verification:
   * First checks local cache, then queries Supabase PostgreSQL cloud table directly.
   * Logs scan result into verification_logs table.
   */
  verifyByHashOrControlNumberAsync: async (input: string): Promise<VerificationResult> => {
    const clean = input.trim();
    if (!clean) {
      return {
        verified: false,
        message: 'No verification query provided.',
        errorReason: 'EMPTY_INPUT',
      };
    }

    // 1. Try local cache
    const localResult = certificateService.verifyByHashOrControlNumber(clean);
    if (localResult.verified) {
      if (localResult.certificate) {
        const cert = storageService.findCertificateByControlNumber(localResult.certificate.controlNumber);
        if (cert) {
          supabaseDataService.logVerification(cert.id, 'authentic');
        }
      }
      return localResult;
    }

    // 2. Query Supabase Cloud
    const cloudCert = await supabaseDataService.findCertificateByHashOrControl(clean);
    if (cloudCert) {
      // Cache locally
      storageService.addCertificate(cloudCert);

      // Verify cryptographic integrity
      const recomputedHash = hashService.generateSHA256({
        controlNumber: cloudCert.controlNumber,
        type: cloudCert.type,
        recipientName: cloudCert.recipientName,
        purok: cloudCert.purok,
        purpose: cloudCert.purpose,
        issuedDate: cloudCert.issuedDate,
      });

      const isTampered = recomputedHash.toLowerCase() !== cloudCert.hashSignature.toLowerCase();
      if (isTampered) {
        supabaseDataService.logVerification(cloudCert.id, 'counterfeit');
        return {
          verified: false,
          message: 'TAMPER DETECTED: The cryptographic signature does not match stored document parameters.',
          errorReason: 'CRYPTOGRAPHIC_MISMATCH',
        };
      }

      if (!cloudCert.isValid) {
        supabaseDataService.logVerification(cloudCert.id, 'revoked');
        return {
          verified: false,
          message: 'CERTIFICATE REVOKED: This document has been revoked by Barangay Administration.',
          errorReason: 'REVOKED_STATUS',
        };
      }

      const today = new Date().toISOString().split('T')[0];
      if (cloudCert.expiryDate < today) {
        supabaseDataService.logVerification(cloudCert.id, 'expired');
        return {
          verified: false,
          message: 'CERTIFICATE EXPIRED: The validity period for this official document has lapsed.',
          errorReason: 'EXPIRED_DATE',
        };
      }

      supabaseDataService.logVerification(cloudCert.id, 'authentic');

      const nameParts = cloudCert.recipientName.split(' ');
      const maskedName = nameParts
        .map((part) => (part.length <= 2 ? part : `${part[0]}${'*'.repeat(part.length - 2)}${part[part.length - 1]}`))
        .join(' ');

      return {
        verified: true,
        message: 'AUTHENTIC DOCUMENT: Verified and validated against Barangay Taguranao Supabase Cloud ledger.',
        certificate: {
          controlNumber: cloudCert.controlNumber,
          type: cloudCert.type,
          recipientNameMasked: maskedName,
          purok: cloudCert.purok,
          purpose: cloudCert.purpose,
          issuedDate: cloudCert.issuedDate,
          expiryDate: cloudCert.expiryDate,
          status: 'ACTIVE_VALID',
          hashSignature: cloudCert.hashSignature,
          signatoryName: cloudCert.signatoryName || 'HON. ROBERTO D. DELA CRUZ',
        },
      };
    }

    return localResult;
  },

  // Revoke/Reinstate a certificate
  toggleCertificateValidity: async (certId: string, isValid: boolean): Promise<IssuedCertificate | null> => {
    const certs = storageService.getCertificates();
    const index = certs.findIndex((c) => c.id === certId);
    if (index !== -1) {
      certs[index].isValid = isValid;
      storageService.saveCertificates(certs);
      await supabaseDataService.updateCertificateValidity(certId, isValid);
      return certs[index];
    }
    return null;
  },

  // Analytics helper for admin dashboard
  getAnalytics: () => {
    const requests = storageService.getRequests();
    const certificates = storageService.getCertificates();
    const users = storageService.getUsers().filter((u) => u.role === 'resident');

    const totalIssued = certificates.length;
    const totalRequests = requests.length;
    const pendingRequests = requests.filter((r) => r.status === 'pending').length;
    const approvedRequests = requests.filter((r) => r.status === 'approved').length;
    const rejectedRequests = requests.filter((r) => r.status === 'rejected').length;
    const clearanceCount = certificates.filter((c) => c.type === 'clearance').length;
    const indigencyCount = certificates.filter((c) => c.type === 'indigency').length;
    const residencyCount = certificates.filter((c) => c.type === 'residency').length;
    const totalResidents = users.length;
    const pendingResidentVerifications = users.filter((u) => u.verificationStatus === 'pending').length;

    return {
      totalRequests,
      approvedRequests,
      rejectedRequests,
      totalIssued,
      totalIssuedCertificates: totalIssued,
      pendingRequests,
      clearanceCount,
      indigencyCount,
      residencyCount,
      totalResidents,
      pendingResidentVerifications,
      tamperDetections: 0,
      distribution: {
        clearance: clearanceCount,
        indigency: indigencyCount,
        residency: residencyCount,
      },
    };
  },
};
