import { INITIAL_USERS, INITIAL_REQUESTS, INITIAL_CERTIFICATES, INITIAL_SMS } from '../data/seedData';
import type { User, CertificateRequest, IssuedCertificate, SMSMessage } from '../types';

const STORAGE_KEYS = {
  USERS: 'certiguard_users_v1',
  REQUESTS: 'certiguard_requests_v1',
  CERTIFICATES: 'certiguard_certificates_v1',
  SMS: 'certiguard_sms_v1',
  SESSION: 'certiguard_session_v1',
};

// Auto-seed if not present
export const initStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REQUESTS)) {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CERTIFICATES)) {
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(INITIAL_CERTIFICATES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SMS)) {
    localStorage.setItem(STORAGE_KEYS.SMS, JSON.stringify(INITIAL_SMS));
  }
};

export const storageService = {
  initStorage,
  // Users
  getUsers: (): User[] => {
    initStorage();
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },
  saveUsers: (users: User[]) => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },
  addUser: (user: User) => {
    const users = storageService.getUsers();
    users.push(user);
    storageService.saveUsers(users);
  },
  findUserByEmail: (email: string): User | undefined => {
    const users = storageService.getUsers();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },
  findUserById: (id: string): User | undefined => {
    const users = storageService.getUsers();
    return users.find((u) => u.id === id);
  },

  // Requests
  getRequests: (): CertificateRequest[] => {
    initStorage();
    const data = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    return data ? JSON.parse(data) : [];
  },
  saveRequests: (requests: CertificateRequest[]) => {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  },
  addRequest: (req: CertificateRequest) => {
    const requests = storageService.getRequests();
    requests.unshift(req);
    storageService.saveRequests(requests);
  },
  updateRequest: (id: string, updates: Partial<CertificateRequest>) => {
    const requests = storageService.getRequests();
    const index = requests.findIndex((r) => r.id === id);
    if (index !== -1) {
      requests[index] = { ...requests[index], ...updates, updatedAt: new Date().toISOString() };
      storageService.saveRequests(requests);
      return requests[index];
    }
    return null;
  },

  // Certificates
  getCertificates: (): IssuedCertificate[] => {
    initStorage();
    const data = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
    return data ? JSON.parse(data) : [];
  },
  saveCertificates: (certs: IssuedCertificate[]) => {
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certs));
  },
  addCertificate: (cert: IssuedCertificate) => {
    const certs = storageService.getCertificates();
    certs.unshift(cert);
    storageService.saveCertificates(certs);
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

  // SMS
  getSMSMessages: (): SMSMessage[] => {
    initStorage();
    const data = localStorage.getItem(STORAGE_KEYS.SMS);
    return data ? JSON.parse(data) : [];
  },
  addSMSMessage: (sms: SMSMessage) => {
    const list = storageService.getSMSMessages();
    list.unshift(sms);
    localStorage.setItem(STORAGE_KEYS.SMS, JSON.stringify(list));
  },

  // Session
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

  // System Reset to Seed
  resetToDefault: () => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(INITIAL_CERTIFICATES));
    localStorage.setItem(STORAGE_KEYS.SMS, JSON.stringify(INITIAL_SMS));
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }
};
