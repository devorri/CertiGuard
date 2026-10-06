import type { SMSMessage } from '../types';
import { storageService } from './storageService';
import toast from 'react-hot-toast';

export const smsService = {
  /**
   * Dispatches an SMS notification to the resident applicant.
   * Currently logs to local state & displays animated toast alerts.
   * Architected for easy drop-in with Semaphore API.
   */
  sendSMS: async (
    recipientPhone: string,
    recipientName: string,
    controlNumber: string,
    message: string,
    type: 'status_update' | 'approved' | 'rejected' | 'security_alert' = 'status_update',
    requestId?: string
  ): Promise<SMSMessage> => {
    // In future:
    // const response = await fetch('https://api.semaphore.co/api/v4/messages', { ... });

    const newSMS: SMSMessage = {
      id: `sms-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      requestId,
      recipientPhone,
      recipientName,
      controlNumber,
      message,
      status: 'delivered',
      timestamp: new Date().toISOString(),
      type,
    };

    // Store in message repository
    storageService.addSMSMessage(newSMS);

    // Provide immediate UI feedback (simulating actual telco dispatch)
    toast(
      `📱 SMS Sent to ${recipientPhone} (${recipientName}): "${message.slice(0, 45)}..."`,
      {
        icon: '✉️',
        duration: 5000,
        style: {
          borderRadius: '10px',
          background: '#0B2545',
          color: '#fff',
          fontSize: '13px',
          border: '1px solid #FCD116',
        },
      }
    );

    return newSMS;
  },

  /**
   * Helper templates for standard Barangay notifications
   */
  notifyApproval: async (recipientPhone: string, recipientName: string, certType: string, controlNumber: string, requestId?: string) => {
    const text = `CertiGuard Notice: Magandang araw ${recipientName}! Ang inyong ${certType.toUpperCase()} (Ref #${controlNumber}) ay OPISYAL NANG NA-APRUBAHAN at may SHA-256 cryptographic QR seal. Maaari na itong ma-download sa inyong Resident Portal. Salamat sa Barangay Taguranao!`;
    return smsService.sendSMS(recipientPhone, recipientName, controlNumber, text, 'approved', requestId);
  },

  notifyRejection: async (recipientPhone: string, recipientName: string, certType: string, controlNumber: string, reason: string, requestId?: string) => {
    const text = `CertiGuard Notice: Paumanhin ${recipientName}, ang inyong aplikasyon para sa ${certType.toUpperCase()} (#${controlNumber}) ay HINDI NAAPRUBAHAN. Dahilan: ${reason}. Mangyaring sumadya sa Barangay Hall o mag-file muli ng tamang impormasyon.`;
    return smsService.sendSMS(recipientPhone, recipientName, controlNumber, text, 'rejected', requestId);
  },

  notifySubmission: async (recipientPhone: string, recipientName: string, certType: string, controlNumber: string, requestId?: string) => {
    const text = `CertiGuard Notice: Natanggap ng Barangay Taguranao ang inyong hiling para sa ${certType.toUpperCase()}. Ang inyong Tracking No. ay ${controlNumber}. Makatatanggap kayo ng SMS update oras na ma-evaluate ito.`;
    return smsService.sendSMS(recipientPhone, recipientName, controlNumber, text, 'status_update', requestId);
  },

  getAllMessages: (): SMSMessage[] => {
    return storageService.getSMSMessages();
  },

  getUserMessages: (phone: string): SMSMessage[] => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    return storageService.getSMSMessages().filter((m) => {
      const matchPhone = m.recipientPhone.replace(/[^0-9]/g, '');
      return matchPhone.includes(cleanPhone) || cleanPhone.includes(matchPhone);
    });
  }
};
