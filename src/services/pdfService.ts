import jsPDF from 'jspdf';
import type { IssuedCertificate } from '../types';
import { hashService } from './cryptoService';

export const pdfService = {
  /**
   * Generates a tamper-evident, high-resolution official Barangay Certificate in PDF format
   * containing government heraldic layout, academic watermark, SHA-256 fingerprint, and embedded QR code.
   */
  generateCertificatePDF: async (cert: IssuedCertificate): Promise<Blob> => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4', // 210 x 297 mm
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // 1. Double Border Frame (Official Philippine LGU styling)
    doc.setDrawColor(0, 50, 160); // Official Blue
    doc.setLineWidth(1.5);
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

    doc.setDrawColor(206, 17, 38); // Official Red
    doc.setLineWidth(0.6);
    doc.rect(11, 11, pageWidth - 22, pageHeight - 22);

    // Decorative inner gold line
    doc.setDrawColor(252, 209, 22); // Flag Sun Gold
    doc.setLineWidth(0.4);
    doc.rect(13, 13, pageWidth - 26, pageHeight - 26);

    // 2. Watermark: "FOR ACADEMIC PROTOTYPE TESTING ONLY" (As specified in Chapter 1 Scope)
    doc.saveGraphicsState();
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 220, 230);
    doc.setFontSize(32);
    // Rotate 45 degrees centered
    doc.text('FOR ACADEMIC PROTOTYPE TESTING ONLY', pageWidth / 2, pageHeight / 2 - 10, {
      align: 'center',
      angle: 45,
    });
    doc.text('BARANGAY TAGURANAO - CERTIGUARD', pageWidth / 2, pageHeight / 2 + 15, {
      align: 'center',
      angle: 45,
    });
    doc.restoreGraphicsState();

    // 3. Official Header
    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text('Republic of the Philippines', pageWidth / 2, 22, { align: 'center' });
    doc.text('Province of Bukidnon / Region X', pageWidth / 2, 27, { align: 'center' });
    doc.text('Municipality / City of Taguranao', pageWidth / 2, 32, { align: 'center' });

    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(0, 38, 100);
    doc.text('BARANGAY TAGURANAO', pageWidth / 2, 38, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(206, 17, 38);
    doc.text('OFFICE OF THE PUNONG BARANGAY', pageWidth / 2, 44, { align: 'center' });

    // Thin separator line with gold accent
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(20, 48, pageWidth - 20, 48);

    doc.setDrawColor(252, 209, 22);
    doc.setLineWidth(1.2);
    doc.line(pageWidth / 2 - 40, 48, pageWidth / 2 + 40, 48);

    // 4. Certificate Title
    let titleText = 'BARANGAY CLEARANCE';
    if (cert.type === 'indigency') titleText = 'CERTIFICATE OF INDIGENCY';
    if (cert.type === 'residency') titleText = 'CERTIFICATE OF RESIDENCY';

    doc.setFont('times', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(0, 38, 100);
    doc.text(titleText, pageWidth / 2, 60, { align: 'center' });

    // Tracking & Control Metadata
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    doc.text(`Control No: ${cert.controlNumber}`, 20, 68);
    doc.text(`Date Issued: ${cert.issuedDate}`, pageWidth - 20, 68, { align: 'right' });

    // 5. Salutation
    doc.setFont('times', 'bolditalic');
    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);
    doc.text('TO WHOM IT MAY CONCERN:', 20, 80);

    // 6. Body Paragraphs depending on Certificate Type
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    const lineHeight = 7;
    let y = 92;

    if (cert.type === 'clearance') {
      const p1 = `This is to certify that ${cert.recipientName.toUpperCase()}, of legal age, Filipino citizen, is a bonafide resident of ${cert.recipientAddress}, Barangay Taguranao.`;
      const splitP1 = doc.splitTextToSize(p1, pageWidth - 40);
      doc.text(splitP1, 20, y);
      y += splitP1.length * lineHeight + 4;

      const p2 = `Records of this office show that as of this date, the said person has NOT BEEN CHARGED OR INVOLVED in any derogatory or criminal case, nor has any record of infraction filed before the Lupong Tagapamayapa of this barangay.`;
      const splitP2 = doc.splitTextToSize(p2, pageWidth - 40);
      doc.text(splitP2, 20, y);
      y += splitP2.length * lineHeight + 4;

      const p3 = `This clearance is being issued upon the request of the interested party for the purpose of:`;
      doc.text(p3, 20, y);
      y += lineHeight + 1;

      doc.setFont('times', 'bold');
      doc.text(`"${cert.purpose.toUpperCase()}"`, 25, y);
      y += lineHeight + 4;
      doc.setFont('times', 'normal');

      const p4 = `and is valid until ${cert.expiryDate} unless revoked for cause.`;
      doc.text(p4, 20, y);
      y += lineHeight + 8;
    } else if (cert.type === 'indigency') {
      const p1 = `This is to certify that ${cert.recipientName.toUpperCase()}, of legal age, Filipino citizen, is an indigent resident currently residing at ${cert.recipientAddress}, Barangay Taguranao.`;
      const splitP1 = doc.splitTextToSize(p1, pageWidth - 40);
      doc.text(splitP1, 20, y);
      y += splitP1.length * lineHeight + 4;

      const p2 = `This further certifies that the family of the aforementioned individual belongs to the low-income/indigent bracket of this barangay, with scarce livelihood and insufficient financial capacity to sustain vital needs without external social support.`;
      const splitP2 = doc.splitTextToSize(p2, pageWidth - 40);
      doc.text(splitP2, 20, y);
      y += splitP2.length * lineHeight + 4;

      const p3 = `This certification is issued upon the request of the bearer for the purpose of:`;
      doc.text(p3, 20, y);
      y += lineHeight + 1;

      doc.setFont('times', 'bold');
      doc.text(`"${cert.purpose.toUpperCase()}"`, 25, y);
      y += lineHeight + 4;
      doc.setFont('times', 'normal');

      const p4 = `Issued this ${cert.issuedDate} at the Office of the Punong Barangay, Barangay Taguranao.`;
      doc.text(p4, 20, y);
      y += lineHeight + 8;
    } else {
      // residency
      const p1 = `This is to certify that ${cert.recipientName.toUpperCase()}, of legal age, Filipino citizen, is a permanent and recognized resident of ${cert.recipientAddress}, Barangay Taguranao.`;
      const splitP1 = doc.splitTextToSize(p1, pageWidth - 40);
      doc.text(splitP1, 20, y);
      y += splitP1.length * lineHeight + 4;

      const p2 = `Based on the official resident registry and census of this barangay, the subject person has resided in good standing and continues to reside at the aforementioned address.`;
      const splitP2 = doc.splitTextToSize(p2, pageWidth - 40);
      doc.text(splitP2, 20, y);
      y += splitP2.length * lineHeight + 4;

      const p3 = `This certificate is issued to serve as proof of residency for the purpose of:`;
      doc.text(p3, 20, y);
      y += lineHeight + 1;

      doc.setFont('times', 'bold');
      doc.text(`"${cert.purpose.toUpperCase()}"`, 25, y);
      y += lineHeight + 4;
      doc.setFont('times', 'normal');

      const p4 = `Given this ${cert.issuedDate} at Barangay Taguranao hall.`;
      doc.text(p4, 20, y);
      y += lineHeight + 8;
    }

    // 7. Signatures Section
    const signY = 180;
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);

    // Applicant thumbmark / signature area
    doc.text('Applicant / Bearer:', 25, signY);
    doc.line(25, signY + 20, 75, signY + 20);
    doc.setFont('times', 'italic');
    doc.setFontSize(9);
    doc.text('Signature over Printed Name', 25, signY + 24);

    // Official Signatory
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.text(cert.signatoryName.toUpperCase(), pageWidth - 30, signY + 16, { align: 'right' });
    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    doc.text(cert.signatoryTitle, pageWidth - 30, signY + 22, { align: 'right' });
    doc.text('Barangay Taguranao', pageWidth - 30, signY + 27, { align: 'right' });

    // 8. Cryptographic Verification & QR Code Security Footer (CertiGuard Engine)
    const cryptoBoxY = 220;
    doc.setFillColor(245, 248, 255);
    doc.rect(16, cryptoBoxY, pageWidth - 32, 58, 'F');
    doc.setDrawColor(0, 50, 160);
    doc.setLineWidth(0.8);
    doc.rect(16, cryptoBoxY, pageWidth - 32, 58, 'D');

    // Generate Verification Link & QR
    const verificationUrl = `${window.location.origin}/verify/${cert.hashSignature}`;
    const qrDataUrl = await hashService.generateQRCodeDataURL(verificationUrl);

    // Draw QR on the left side of crypto box
    doc.addImage(qrDataUrl, 'PNG', 20, cryptoBoxY + 4, 48, 48);

    // Cryptographic Details on the right
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 38, 100);
    doc.text('SECURITY VERIFICATION NOTICE (CERTIGUARD FRAMEWORK)', 74, cryptoBoxY + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    doc.text('This document possesses real-time cryptographic database authenticity.', 74, cryptoBoxY + 13);
    doc.text('Scan the QR code or verify the SHA-256 fingerprint at:', 74, cryptoBoxY + 17);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 50, 160);
    doc.text(`${window.location.origin}/verify`, 74, cryptoBoxY + 22);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(70, 70, 70);
    doc.text('Cryptographic Hash Fingerprint (SHA-256):', 74, cryptoBoxY + 28);

    doc.setFont('courier', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(180, 20, 20);
    // Split hash for display across 2 lines
    const half1 = cert.hashSignature.slice(0, 32);
    const half2 = cert.hashSignature.slice(32);
    doc.text(half1, 74, cryptoBoxY + 33);
    doc.text(half2, 74, cryptoBoxY + 37);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('Republic Act 10173 compliant. Any discrepancy between the physical document', 74, cryptoBoxY + 44);
    doc.text('and the database record constitutes criminal falsification under Article 172 RPC.', 74, cryptoBoxY + 48);
    doc.text('Watermark: Academic Research Prototype Only.', 74, cryptoBoxY + 52);

    // Return as Blob
    return doc.output('blob');
  },

  /**
   * Download helper directly triggering browser file download
   */
  downloadCertificatePDF: async (cert: IssuedCertificate) => {
    const blob = await pdfService.generateCertificatePDF(cert);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cert.controlNumber}_${cert.type.toUpperCase()}_OFFICIAL.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
