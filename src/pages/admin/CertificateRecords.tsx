import React, { useState } from 'react';
import { storageService } from '../../services/storageService';
import { certificateService } from '../../services/certificateService';
import { pdfService } from '../../services/pdfService';
import { StatusBadge } from '../../components/ui/StatusBadge';
import type { IssuedCertificate } from '../../types';
import { Search, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export const CertificateRecords: React.FC = () => {
  const [certs, setCerts] = useState<IssuedCertificate[]>(() => storageService.getCertificates());
  const [searchQuery, setSearchQuery] = useState('');

  const refreshCerts = () => {
    setCerts(storageService.getCertificates());
  };

  React.useEffect(() => {
    const unsub = storageService.onStorageSync(() => {
      refreshCerts();
    });
    storageService.syncFromSupabase().then(() => refreshCerts());
    return unsub;
  }, []);

  const handleToggleValidity = async (certId: string, currentValid: boolean) => {
    const updated = await certificateService.toggleCertificateValidity(certId, !currentValid);
    if (updated) {
      toast.success(
        `Certificate ${updated.controlNumber} is now marked as ${updated.isValid ? 'VALID' : 'REVOKED'}.`
      );
      refreshCerts();
    }
  };

  const handleDownloadPDF = async (cert: IssuedCertificate) => {
    toast.loading('Generating official PDF...', { id: 'rec-pdf' });
    try {
      await pdfService.downloadCertificatePDF(cert);
      toast.success('Downloaded!', { id: 'rec-pdf' });
    } catch (err) {
      toast.error('Download failed.', { id: 'rec-pdf' });
    }
  };

  const filtered = certs.filter(
    (c) =>
      c.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.controlNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.hashSignature.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem 2.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
          Cryptographic Ledger & Archive
        </h1>
        <p style={{ fontSize: '0.88rem', color: '#64748B', marginTop: '4px' }}>
          Permanent, tamper-evident repository of all issued Barangay Taguranao certificates with 64-character SHA-256
          signatures and status controls.
        </p>
      </div>

      {/* Search Input */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '1rem 1.25rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <Search size={18} color="#94A3B8" />
        <input
          type="text"
          placeholder="Search by citizen name, control number, or SHA-256 hash..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', border: 'none', fontSize: '0.9rem', outline: 'none' }}
        />
      </div>

      {/* Table */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          boxShadow: 'var(--shadow-sm)',
          overflowX: 'auto',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569' }}>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Control No</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Certificate Bearer</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Document Type</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Issued Date</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Expires</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>SHA-256 Fingerprint</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Status</th>
              <th style={{ padding: '14px 18px', fontWeight: 700, textAlign: 'right' }}>Controls</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '2.5rem', textAlign: 'center', color: '#94A3B8' }}>
                  No certificates found.
                </td>
              </tr>
            ) : (
              filtered.map((cert) => (
                <tr
                  key={cert.id}
                  style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                >
                  <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontWeight: 700, color: '#002664' }}>
                    {cert.controlNumber}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>{cert.recipientName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{cert.purok}</div>
                  </td>
                  <td style={{ padding: '14px 18px', textTransform: 'uppercase', fontWeight: 600 }}>
                    {cert.type}
                  </td>
                  <td style={{ padding: '14px 18px', color: '#64748B' }}>{cert.issuedDate}</td>
                  <td style={{ padding: '14px 18px', color: '#64748B' }}>{cert.expiryDate}</td>
                  <td style={{ padding: '14px 18px', maxWidth: '180px' }}>
                    <div
                      title={cert.hashSignature}
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '0.72rem',
                        color: '#0038A8',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {cert.hashSignature.slice(0, 16)}...{cert.hashSignature.slice(-8)}
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <StatusBadge status={cert.isValid ? 'ACTIVE_VALID' : 'REVOKED'} />
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleDownloadPDF(cert)}
                        className="btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                        title="Download PDF"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={() => handleToggleValidity(cert.id, cert.isValid)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          background: cert.isValid ? '#FEF2F2' : '#ECFDF5',
                          color: cert.isValid ? '#DC2626' : '#059669',
                          border: `1px solid ${cert.isValid ? '#FECACA' : '#A7F3D0'}`,
                        }}
                        title={cert.isValid ? 'Revoke validity' : 'Restore certificate'}
                      >
                        {cert.isValid ? 'Revoke' : 'Restore'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
