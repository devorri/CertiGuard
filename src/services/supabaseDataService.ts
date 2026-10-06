import { supabase, isSupabaseConfigured } from './supabaseClient';
import type {
  User,
  CertificateRequest,
  IssuedCertificate,
  SMSMessage,
} from '../types';

// ============================================================================
// DATA MAPPERS (PostgreSQL snake_case <-> TypeScript camelCase)
// ============================================================================

export const mapDbUserToApp = (u: any, validIdObj?: any): User => ({
  id: u.id,
  fullName: u.full_name,
  email: u.email,
  phone: u.phone,
  address: u.address,
  purok: u.purok,
  civilStatus: u.civil_status,
  birthDate: u.birth_date,
  role: u.role,
  password: u.password,
  createdAt: u.created_at,
  verificationStatus: u.verification_status || 'pending',
  verifiedBy: u.verified_by || undefined,
  verifiedAt: u.verified_at || undefined,
  verificationNote: u.verification_note || undefined,
  validId: validIdObj
    ? {
        fileName: validIdObj.file_name,
        mimeType: validIdObj.mime_type,
        storagePath: validIdObj.storage_path,
        previewUrl: validIdObj.preview_url,
        uploadedAt: validIdObj.uploaded_at,
      }
    : undefined,
});

export const mapAppUserToDb = (u: User) => ({
  id: u.id,
  full_name: u.fullName,
  email: u.email.toLowerCase().trim(),
  phone: u.phone,
  address: u.address,
  purok: u.purok,
  civil_status: u.civilStatus,
  birth_date: u.birthDate,
  role: u.role,
  password: u.password,
  verification_status: u.verificationStatus || 'pending',
  verified_by: u.verifiedBy || null,
  verified_at: u.verifiedAt || null,
  verification_note: u.verificationNote || null,
  created_at: u.createdAt || new Date().toISOString(),
});

export const mapDbRequestToApp = (r: any): CertificateRequest => ({
  id: r.id,
  controlNumber: r.control_number,
  userId: r.user_id,
  applicantName: r.applicant_name,
  applicantPhone: r.applicant_phone,
  applicantAddress: r.applicant_address,
  applicantPurok: r.applicant_purok,
  type: r.type,
  purpose: r.purpose,
  emergencyContact: r.emergency_contact || undefined,
  yearsOfResidency: r.years_of_residency != null ? Number(r.years_of_residency) : 1,
  status: r.status,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  processedBy: r.processed_by || undefined,
  rejectionReason: r.rejection_reason || undefined,
  certificateId: r.certificate_id || undefined,
  orNumber: r.or_number || undefined,
  feeAmount: r.fee_amount != null ? Number(r.fee_amount) : 0,
  paymentStatus: r.payment_status || 'unpaid',
  paymentMethod: r.payment_method || undefined,
  paymentRef: r.payment_ref || undefined,
});

export const mapAppRequestToDb = (r: CertificateRequest) => ({
  id: r.id,
  control_number: r.controlNumber,
  user_id: r.userId,
  applicant_name: r.applicantName,
  applicant_phone: r.applicantPhone,
  applicant_address: r.applicantAddress,
  applicant_purok: r.applicantPurok,
  type: r.type,
  purpose: r.purpose,
  emergency_contact: r.emergencyContact || null,
  years_of_residency: r.yearsOfResidency || 1,
  status: r.status,
  created_at: r.createdAt,
  updated_at: r.updatedAt,
  processed_by: r.processedBy || null,
  rejection_reason: r.rejectionReason || null,
  certificate_id: r.certificateId || null,
  or_number: r.orNumber || null,
  fee_amount: r.feeAmount ?? 0,
  payment_status: r.paymentStatus || 'unpaid',
  payment_method: r.paymentMethod || null,
  payment_ref: r.paymentRef || null,
});

export const mapDbCertToApp = (c: any): IssuedCertificate => ({
  id: c.id,
  requestId: c.request_id,
  controlNumber: c.control_number,
  releasingStaffId: c.releasing_staff_id || undefined,
  type: c.type,
  recipientName: c.recipient_name,
  recipientAddress: c.recipient_address,
  purok: c.purok,
  purpose: c.purpose,
  issuedDate: c.issued_date,
  expiryDate: c.expiry_date,
  signatoryName: c.signatory_name || 'HON. ROBERTO D. DELA CRUZ',
  signatoryTitle: c.signatory_title || 'Punong Barangay',
  hashSignature: c.hash_signature,
  qrCodeUrl: c.qr_code_url || '',
  isValid: c.is_valid !== false,
  tamperCount: c.tamper_count || 0,
  createdAt: c.created_at,
});

export const mapAppCertToDb = (c: IssuedCertificate) => ({
  id: c.id,
  request_id: c.requestId,
  control_number: c.controlNumber,
  releasing_staff_id: c.releasingStaffId || null,
  type: c.type,
  recipient_name: c.recipientName,
  recipient_address: c.recipientAddress,
  purok: c.purok,
  purpose: c.purpose,
  issued_date: c.issuedDate,
  expiry_date: c.expiryDate,
  signatory_name: c.signatoryName || 'HON. ROBERTO D. DELA CRUZ',
  signatory_title: c.signatoryTitle || 'Punong Barangay',
  hash_signature: c.hashSignature,
  qr_code_url: c.qrCodeUrl || '',
  is_valid: c.isValid !== false,
  tamper_count: c.tamperCount || 0,
  created_at: c.createdAt,
});

export const mapDbSmsToApp = (s: any): SMSMessage => ({
  id: s.id,
  requestId: s.request_id || undefined,
  recipientPhone: s.recipient_phone,
  recipientName: s.recipient_name,
  controlNumber: s.control_number || '',
  message: s.message,
  status: s.status || 'sent',
  timestamp: s.timestamp,
  type: s.type || 'status_update',
});

export const mapAppSmsToDb = (s: SMSMessage) => ({
  id: s.id,
  request_id: s.requestId || null,
  recipient_phone: s.recipientPhone,
  recipient_name: s.recipientName,
  control_number: s.controlNumber || null,
  message: s.message,
  status: s.status,
  type: s.type,
  timestamp: s.timestamp,
});

// ============================================================================
// SUPABASE API CRUD SERVICES (LIVE PRODUCTION DATABASE)
// ============================================================================

export const supabaseDataService = {
  /** Check if database connection is operational */
  isConfigured: isSupabaseConfigured,

  // --------------------------------------------------------------------------
  // USERS
  // --------------------------------------------------------------------------
  async fetchUsers(): Promise<User[]> {
    if (!isSupabaseConfigured()) return [];
    try {
      const { data: usersData, error: usersErr } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersErr) {
        console.warn('Supabase fetchUsers notice:', usersErr.message);
        return [];
      }
      if (!usersData || usersData.length === 0) return [];

      // Fetch corresponding valid IDs
      const { data: idsData } = await supabase.from('resident_valid_ids').select('*');
      const idsMap = new Map<string, any>();
      if (idsData) {
        idsData.forEach((idRow: any) => idsMap.set(idRow.user_id, idRow));
      }

      return usersData.map((u: any) => mapDbUserToApp(u, idsMap.get(u.id)));
    } catch (err) {
      console.error('Supabase fetchUsers exception:', err);
      return [];
    }
  },

  async findUserByEmail(email: string): Promise<User | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();

      if (error || !data) return null;

      // Check for attached ID
      const { data: idRow } = await supabase
        .from('resident_valid_ids')
        .select('*')
        .eq('user_id', data.id)
        .maybeSingle();

      return mapDbUserToApp(data, idRow);
    } catch (err) {
      console.error('Supabase findUserByEmail exception:', err);
      return null;
    }
  },

  async findUserById(id: string): Promise<User | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) return null;

      const { data: idRow } = await supabase
        .from('resident_valid_ids')
        .select('*')
        .eq('user_id', data.id)
        .maybeSingle();

      return mapDbUserToApp(data, idRow);
    } catch (err) {
      console.error('Supabase findUserById exception:', err);
      return null;
    }
  },

  async insertUser(user: User): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const dbPayload = mapAppUserToDb(user);
      const { error: userErr } = await supabase.from('users').upsert(dbPayload);
      if (userErr) {
        console.error('Failed to insert user to Supabase:', userErr.message);
        return false;
      }

      // If validId object is provided, store in resident_valid_ids
      if (user.validId) {
        const idPayload = {
          id: `valid-id-${Date.now()}`,
          user_id: user.id,
          file_name: user.validId.fileName,
          mime_type: user.validId.mimeType,
          storage_path: user.validId.storagePath,
          preview_url: user.validId.previewUrl,
          uploaded_at: user.validId.uploadedAt || new Date().toISOString(),
        };
        const { error: idErr } = await supabase.from('resident_valid_ids').upsert(idPayload);
        if (idErr) {
          console.warn('Failed to insert resident valid ID metadata:', idErr.message);
        }
      }

      // Audit trail
      await supabaseDataService.logAudit(user.id, `Resident registered: ${user.fullName}`);
      return true;
    } catch (err) {
      console.error('Supabase insertUser exception:', err);
      return false;
    }
  },

  async updateUser(id: string, updates: Partial<User>): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const dbUpdates: any = {};
      if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
      if (updates.email !== undefined) dbUpdates.email = updates.email.toLowerCase().trim();
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.address !== undefined) dbUpdates.address = updates.address;
      if (updates.purok !== undefined) dbUpdates.purok = updates.purok;
      if (updates.civilStatus !== undefined) dbUpdates.civil_status = updates.civilStatus;
      if (updates.birthDate !== undefined) dbUpdates.birth_date = updates.birthDate;
      if (updates.role !== undefined) dbUpdates.role = updates.role;
      if (updates.verificationStatus !== undefined) dbUpdates.verification_status = updates.verificationStatus;
      if (updates.verifiedBy !== undefined) dbUpdates.verified_by = updates.verifiedBy;
      if (updates.verifiedAt !== undefined) dbUpdates.verified_at = updates.verifiedAt;
      if (updates.verificationNote !== undefined) dbUpdates.verification_note = updates.verificationNote;

      const { error } = await supabase.from('users').update(dbUpdates).eq('id', id);
      if (error) {
        console.error('Supabase updateUser error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Supabase updateUser exception:', err);
      return false;
    }
  },

  // --------------------------------------------------------------------------
  // CERTIFICATE REQUESTS
  // --------------------------------------------------------------------------
  async fetchRequests(): Promise<CertificateRequest[]> {
    if (!isSupabaseConfigured()) return [];
    try {
      const { data, error } = await supabase
        .from('certificate_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetchRequests notice:', error.message);
        return [];
      }
      return (data || []).map(mapDbRequestToApp);
    } catch (err) {
      console.error('Supabase fetchRequests exception:', err);
      return [];
    }
  },

  async insertRequest(req: CertificateRequest): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const dbPayload = mapAppRequestToDb(req);
      const { error } = await supabase.from('certificate_requests').insert(dbPayload);
      if (error) {
        console.error('Supabase insertRequest error:', error.message);
        return false;
      }
      await supabaseDataService.logAudit(req.userId, `Submitted application ${req.controlNumber} (${req.type})`);
      return true;
    } catch (err) {
      console.error('Supabase insertRequest exception:', err);
      return false;
    }
  },

  async updateRequest(id: string, updates: Partial<CertificateRequest>): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const dbUpdates: any = { updated_at: new Date().toISOString() };
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.processedBy !== undefined) dbUpdates.processed_by = updates.processedBy;
      if (updates.rejectionReason !== undefined) dbUpdates.rejection_reason = updates.rejectionReason;
      if (updates.certificateId !== undefined) dbUpdates.certificate_id = updates.certificateId;
      if (updates.orNumber !== undefined) dbUpdates.or_number = updates.orNumber;
      if (updates.feeAmount !== undefined) dbUpdates.fee_amount = updates.feeAmount;

      const { error } = await supabase.from('certificate_requests').update(dbUpdates).eq('id', id);
      if (error) {
        console.error('Supabase updateRequest error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Supabase updateRequest exception:', err);
      return false;
    }
  },

  // --------------------------------------------------------------------------
  // ISSUED CERTIFICATES
  // --------------------------------------------------------------------------
  async fetchCertificates(): Promise<IssuedCertificate[]> {
    if (!isSupabaseConfigured()) return [];
    try {
      const { data, error } = await supabase
        .from('issued_certificates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetchCertificates notice:', error.message);
        return [];
      }
      return (data || []).map(mapDbCertToApp);
    } catch (err) {
      console.error('Supabase fetchCertificates exception:', err);
      return [];
    }
  },

  async insertCertificate(cert: IssuedCertificate): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const dbPayload = mapAppCertToDb(cert);
      const { error } = await supabase.from('issued_certificates').upsert(dbPayload);
      if (error) {
        console.error('Supabase insertCertificate error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Supabase insertCertificate exception:', err);
      return false;
    }
  },

  async updateCertificateValidity(id: string, isValid: boolean): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const { error } = await supabase
        .from('issued_certificates')
        .update({ is_valid: isValid })
        .eq('id', id);

      if (error) {
        console.error('Supabase updateCertificateValidity error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Supabase updateCertificateValidity exception:', err);
      return false;
    }
  },

  async findCertificateByHashOrControl(query: string): Promise<IssuedCertificate | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const clean = query.trim();

      // Try exact match on hash_signature first
      const { data: hashData, error: hashErr } = await supabase
        .from('issued_certificates')
        .select('*')
        .eq('hash_signature', clean)
        .maybeSingle();

      if (!hashErr && hashData) {
        console.log('[CertiGuard] Found certificate by hash_signature in Supabase');
        return mapDbCertToApp(hashData);
      }

      // Try exact match on control_number
      const { data: ctrlData, error: ctrlErr } = await supabase
        .from('issued_certificates')
        .select('*')
        .eq('control_number', clean)
        .maybeSingle();

      if (!ctrlErr && ctrlData) {
        console.log('[CertiGuard] Found certificate by control_number in Supabase');
        return mapDbCertToApp(ctrlData);
      }

      // Try case-insensitive match as fallback
      const { data: iData, error: iErr } = await supabase
        .from('issued_certificates')
        .select('*')
        .ilike('control_number', clean)
        .maybeSingle();

      if (!iErr && iData) {
        console.log('[CertiGuard] Found certificate by ilike control_number in Supabase');
        return mapDbCertToApp(iData);
      }

      console.log('[CertiGuard] Certificate NOT found in Supabase for query:', clean);
      return null;
    } catch (err) {
      console.error('Supabase findCertificate exception:', err);
      return null;
    }
  },

  // --------------------------------------------------------------------------
  // SMS LOGS
  // --------------------------------------------------------------------------
  async fetchSMSLogs(): Promise<SMSMessage[]> {
    if (!isSupabaseConfigured()) return [];
    try {
      const { data, error } = await supabase
        .from('sms_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.warn('Supabase fetchSMSLogs notice:', error.message);
        return [];
      }
      return (data || []).map(mapDbSmsToApp);
    } catch (err) {
      console.error('Supabase fetchSMSLogs exception:', err);
      return [];
    }
  },

  async insertSMS(sms: SMSMessage): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const dbPayload = mapAppSmsToDb(sms);
      const { error } = await supabase.from('sms_logs').insert(dbPayload);
      if (error) {
        console.warn('Supabase insertSMS notice:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Supabase insertSMS exception:', err);
      return false;
    }
  },

  // --------------------------------------------------------------------------
  // AUDIT TRAILS & VERIFICATION LOGS
  // --------------------------------------------------------------------------
  async logAudit(userId: string, action: string): Promise<void> {
    if (!isSupabaseConfigured()) return;
    try {
      await supabase.from('system_audit_trails').insert({
        id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        user_id: userId,
        action,
        ip_address: '127.0.0.1 (Web Portal)',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Supabase logAudit notice:', err);
    }
  },

  async logVerification(certificateId: string, result: 'authentic' | 'counterfeit' | 'revoked' | 'expired'): Promise<void> {
    if (!isSupabaseConfigured()) return;
    try {
      await supabase.from('verification_logs').insert({
        id: `vlog-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        certificate_id: certificateId,
        verifier_ip: 'Web QR Scanner Device',
        verified_at: new Date().toISOString(),
        result,
      });
    } catch (err) {
      console.warn('Supabase logVerification notice:', err);
    }
  },
};
