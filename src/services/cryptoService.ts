import CryptoJS from 'crypto-js';
import QRCode from 'qrcode';

export interface HashPayload {
  controlNumber: string;
  type: string;
  recipientName: string;
  purok: string;
  purpose: string;
  issuedDate: string;
  secretSalt?: string;
}

const BARANGAY_CRYPTO_SALT = 'BARANGAY_TAGURANAO_CERTIGUARD_SECURE_TOKEN_2026';

export const hashService = {
  /**
   * Generates a deterministic 64-character SHA-256 digital fingerprint hash
   * based on document metadata and administrative cryptographic salt.
   */
  generateSHA256: (data: HashPayload): string => {
    // Structured canonical format to ensure integrity
    const canonicalString = [
      data.controlNumber.trim().toUpperCase(),
      data.type.trim().toLowerCase(),
      data.recipientName.trim().toUpperCase(),
      data.purok.trim(),
      data.purpose.trim(),
      data.issuedDate.trim(),
      BARANGAY_CRYPTO_SALT,
    ].join('||');

    const hash = CryptoJS.SHA256(canonicalString).toString(CryptoJS.enc.Hex);
    return hash;
  },

  /**
   * Generates high-density QR Code as DataURL containing direct verification link
   */
  generateQRCodeDataURL: async (verificationUrl: string): Promise<string> => {
    try {
      const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
        errorCorrectionLevel: 'H', // High error resilience
        margin: 2,
        width: 300,
        color: {
          dark: '#002664', // Philippine Official Deep Navy
          light: '#FFFFFF',
        },
      });
      return qrDataUrl;
    } catch (err) {
      console.error('Error generating QR code:', err);
      throw err;
    }
  },

  /**
   * Verify whether a given hash matches the payload reconstruction
   */
  verifyIntegrity: (providedHash: string, data: HashPayload): boolean => {
    const calculated = hashService.generateSHA256(data);
    return calculated.toLowerCase() === providedHash.trim().toLowerCase();
  },
};
