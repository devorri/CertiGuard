import type { User, CertificateRequest, IssuedCertificate, SMSMessage } from '../types';
import { supabaseDataService } from './supabaseDataService';

const STORAGE_KEYS = {
  USERS: 'certiguard_users_prod',
  REQUESTS: 'certiguard_requests_prod',
  CERTIFICATES: 'certiguard_certificates_prod',
  SMS: 'certiguard_sms_prod',
  SESSION: 'certiguard_session_prod',
};

// In-memory / localStorage cache layer for instant synchronous UI rendering
let isSyncing = false;
let hasSynced = false;
const syncListeners: Array<() => void> = [];

export const onStorageSync = (callback: () => void) => {
  syncListeners.push(callback);
  return () => {
    const idx = syncListeners.indexOf(callback);
    if (idx !== -1) syncListeners.splice(idx, 1);
  };
};

const notifyListeners = () => {
  syncListeners.forEach((cb) => {
    try {
      cb();
    } catch (e) {
      console.warn('Sync listener error:', e);
    }
  });
};

/**
 * Sync all tables live from Supabase PostgreSQL cloud repository.
 * Stores into local cache so synchronous UI components remain snappy.
 */
export const syncFromSupabase = async (): Promise<boolean> => {
  if (isSyncing) return false;
  isSyncing = true;
  try {
    const [cloudUsers, cloudRequests, cloudCerts, cloudSms] = await Promise.all([
      supabaseDataService.fetchUsers(),
      supabaseDataService.fetchRequests(),
      supabaseDataService.fetchCertificates(),
      supabaseDataService.fetchSMSLogs(),
    ]);

    // Save fetched records into cache
    if (cloudUsers && cloudUsers.length > 0) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(cloudUsers));
    }
    if (cloudRequests && cloudRequests.length > 0) {
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(cloudRequests));
    }
    if (cloudCerts && cloudCerts.length > 0) {
      localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(cloudCerts));
    }
    if (cloudSms && cloudSms.length > 0) {
      localStorage.setItem(STORAGE_KEYS.SMS, JSON.stringify(cloudSms));
    }

    hasSynced = true;
    notifyListeners();
    return true;
  } catch (err) {
    console.warn('Supabase sync notice:', err);
    return false;
  } finally {
    isSyncing = false;
  }
};

/**
 * Initialize storage without any fake mock data.
 * Purely pulls live data from Supabase.
 */
export const initStorage = () => {
  // Fire cloud sync in background on boot
  syncFromSupabase();
};

export const storageService = {
  initStorage,
  syncFromSupabase,
  onStorageSync,
  hasSynced: () => hasSynced,

  // ==========================================================================
  // USERS
  // ==========================================================================
  getUsers: (): User[] => {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  saveUsers: (users: User[]) => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    notifyListeners();
  },

  addUser: (user: User) => {
    const users = storageService.getUsers();
    // Prevent duplicate ID in local array
    const filtered = users.filter((u) => u.id !== user.id && u.email.toLowerCase() !== user.email.toLowerCase());
    filtered.unshift(user);
    storageService.saveUsers(filtered);

    // Push live to Supabase
    supabaseDataService.insertUser(user).catch((e) => {
      console.warn('Background Supabase user insert warning:', e);
    });
  },

  async addUserAsync(user: User): Promise<boolean> {
    const users = storageService.getUsers();
    const filtered = users.filter((u) => u.id !== user.id && u.email.toLowerCase() !== user.email.toLowerCase());
    filtered.unshift(user);
    storageService.saveUsers(filtered);

    return await supabaseDataService.insertUser(user);
  },

  updateUser: (id: string, updates: Partial<User>) => {
    const users = storageService.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    users[index] = { ...users[index], ...updates };
    storageService.saveUsers(users);

    // Push live to Supabase
    supabaseDataService.updateUser(id, updates).catch((e) => {
      console.warn('Background Supabase user update warning:', e);
    });

    return users[index];
  },

  async updateUserAsync(id: string, updates: Partial<User>): Promise<boolean> {
    storageService.updateUser(id, updates);
    return await supabaseDataService.updateUser(id, updates);
  },

  findUserByEmail: (email: string): User | undefined => {
    const users = storageService.getUsers();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  },

  async findUserByEmailAsync(email: string): Promise<User | null> {
    // 1. Direct Supabase query
    const cloudUser = await supabaseDataService.findUserByEmail(email);
    if (cloudUser) {
      // Refresh cache with this cloud user
      const users = storageService.getUsers();
      const idx = users.findIndex((u) => u.id === cloudUser.id);
      if (idx !== -1) {
        users[idx] = cloudUser;
      } else {
        users.push(cloudUser);
      }
      storageService.saveUsers(users);
      return cloudUser;
    }
    // 2. Cache fallback
    const local = storageService.findUserByEmail(email);
    return local || null;
  },

  findUserById: (id: string): User | undefined => {
    const users = storageService.getUsers();
    return users.find((u) => u.id === id);
  },

  async findUserByIdAsync(id: string): Promise<User | null> {
    const cloudUser = await supabaseDataService.findUserById(id);
    if (cloudUser) return cloudUser;
    const local = storageService.findUserById(id);
    return local || null;
  },

  // ==========================================================================
  // CERTIFICATE REQUESTS
  // ==========================================================================
  getRequests: (): CertificateRequest[] => {
    const data = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    return data ? JSON.parse(data) : [];
  },

  saveRequests: (requests: CertificateRequest[]) => {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    notifyListeners();
  },

  addRequest: (req: CertificateRequest) => {
    const requests = storageService.getRequests();
    const filtered = requests.filter((r) => r.id !== req.id);
    filtered.unshift(req);
    storageService.saveRequests(filtered);

    // Push live to Supabase
    supabaseDataService.insertRequest(req).catch((e) => {
      console.warn('Background Supabase request insert warning:', e);
    });
  },

  async addRequestAsync(req: CertificateRequest): Promise<boolean> {
    const requests = storageService.getRequests();
    const filtered = requests.filter((r) => r.id !== req.id);
    filtered.unshift(req);
    storageService.saveRequests(filtered);

    return await supabaseDataService.insertRequest(req);
  },

  updateRequest: (id: string, updates: Partial<CertificateRequest>) => {
    const requests = storageService.getRequests();
    const index = requests.findIndex((r) => r.id === id);
    if (index !== -1) {
      requests[index] = { ...requests[index], ...updates, updatedAt: new Date().toISOString() };
      storageService.saveRequests(requests);

      // Push live to Supabase
      supabaseDataService.updateRequest(id, updates).catch((e) => {
        console.warn('Background Supabase request update warning:', e);
      });

      return requests[index];
    }
    return null;
  },

  async updateRequestAsync(id: string, updates: Partial<CertificateRequest>): Promise<boolean> {
    storageService.updateRequest(id, updates);
    return await supabaseDataService.updateRequest(id, updates);
  },

  // ==========================================================================
  // ISSUED CERTIFICATES
  // ==========================================================================
  getCertificates: (): IssuedCertificate[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
    return data ? JSON.parse(data) : [];
  },

  saveCertificates: (certs: IssuedCertificate[]) => {
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certs));
    notifyListeners();
  },

  addCertificate: (cert: IssuedCertificate) => {
    const certs = storageService.getCertificates();
    const filtered = certs.filter((c) => c.id !== cert.id && c.controlNumber !== cert.controlNumber);
    filtered.unshift(cert);
    storageService.saveCertificates(filtered);

    // Push live to Supabase
    supabaseDataService.insertCertificate(cert).catch((e) => {
      console.warn('Background Supabase cert insert warning:', e);
    });
  },

  async addCertificateAsync(cert: IssuedCertificate): Promise<boolean> {
    const certs = storageService.getCertificates();
    const filtered = certs.filter((c) => c.id !== cert.id && c.controlNumber !== cert.controlNumber);
    filtered.unshift(cert);
    storageService.saveCertificates(filtered);

    return await supabaseDataService.insertCertificate(cert);
  },

  findCertificateByHash: (hash: string): IssuedCertificate | undefined => {
    const certs = storageService.getCertificates();
    return certs.find((c) => c.hashSignature.toLowerCase() === hash.trim().toLowerCase());
  },

  findCertificateByControlNumber: (controlNo: string): IssuedCertificate | undefined => {
    const certs = storageService.getCertificates();
    return certs.find((c) => c.controlNumber.toLowerCase() === controlNo.trim().toLowerCase());
  },

  findCertificateById: (id: string): IssuedCertificate | undefined => {
    const certs = storageService.getCertificates();
    return certs.find((c) => c.id === id);
  },

  // ==========================================================================
  // SMS LOGS
  // ==========================================================================
  getSMSMessages: (): SMSMessage[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SMS);
    return data ? JSON.parse(data) : [];
  },

  addSMSMessage: (sms: SMSMessage) => {
    const list = storageService.getSMSMessages();
    const filtered = list.filter((m) => m.id !== sms.id);
    filtered.unshift(sms);
    localStorage.setItem(STORAGE_KEYS.SMS, JSON.stringify(filtered));
    notifyListeners();

    // Push live to Supabase
    supabaseDataService.insertSMS(sms).catch((e) => {
      console.warn('Background Supabase SMS insert warning:', e);
    });
  },

  async addSMSMessageAsync(sms: SMSMessage): Promise<boolean> {
    storageService.addSMSMessage(sms);
    return await supabaseDataService.insertSMS(sms);
  },

  // ==========================================================================
  // AUTH SESSION (Active client session token)
  // ==========================================================================
  getSessionUser: (): User | null => {
    const session = localStorage.getItem(STORAGE_KEYS.SESSION);
    return session ? JSON.parse(session) : null;
  },

  setSessionUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    }
  },
};
