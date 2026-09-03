import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Lock,
  Key,
} from 'lucide-react';
import { certificateService } from '../services/certificateService';
import type { VerificationResult } from '../types';
import barangayLogo from '../assets/barangay-logo.png';
import toast from 'react-hot-toast';

export const VerifyPage: React.FC = () => {
  const { hash: urlHash } = useParams<{ hash?: string }>();
  const [inputQuery, setInputQuery] = useState('');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (urlHash) {
      setInputQuery(urlHash);
      performVerification(urlHash);
    }
  }, [urlHash]);

  const performVerification = (query: string) => {
    if (!query.trim()) {
      toast.error('Please enter a SHA-256 Hash or Control Number.');
      return;
    }

    const res = certificateService.verifyByHashOrControlNumber(query);
    setResult(res);
    setHasSearched(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performVerification(inputQuery);
  };

  return (
    <div style={{ maxWidth: '960px', margin: '3rem auto', padding: '0 1.5rem' }}>
      {/* Verification Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <img
          src={barangayLogo}
          alt="Barangay Taguranao Official Seal"
          style={{
            width: '76px',
            height: '76px',
            borderRadius: '50%',
            margin: '0 auto 16px',
            display: 'block',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
          }}
        />
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0066FF', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>
          PUBLIC TRUST & INTEGRITY PORTAL
        </div>
        <h1 style={{ fontSize: '2.3rem', fontWeight: 800, color: '#0F172A', marginTop: '4px', marginBottom: '8px' }}>
          Official Document Verification
        </h1>
        <p style={{ color: '#64748B', maxWidth: '620px', margin: '0 auto', fontSize: '1rem', lineHeight: '1.6' }}>
          Real-time cryptographic database verification for certificates issued by Barangay Taguranao. Protects
          employers, schools, and institutions against physical tampering and digital forgery.
        </p>
      </div>

      {/* Input Search Box */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #CBD5E1',
          boxShadow: 'var(--shadow-lg)',
          padding: '1.75rem',
          marginBottom: '2rem',
        }}
      >
        <form onSubmit={handleSearch}>
          <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#1E293B', marginBottom: '8px' }}>
            Enter 64-Character SHA-256 Hash or Control Number (e.g. CG-TGR-2026-0001)
          </label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
              <Search
                size={18}
                color="#94A3B8"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Paste SHA-256 digital fingerprint or control number..."
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                }}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '12px 24px' }}>
              <ShieldCheck size={18} />
              <span>Validate Integrity</span>
            </button>
          </div>
        </form>

        {/* Quick Demo Pre-fill */}
        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '0.78rem', color: '#64748B' }}>
          <span>Try sample valid hash:</span>
          <button
            type="button"
            onClick={() => {
              const hash = '8f4c2e6b91a7d5c3f0e8b2a4c6d8e0f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3';
              setInputQuery(hash);
              performVerification(hash);
            }}
            style={{
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              padding: '3px 8px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '0.75rem',
            }}
          >
            8f4c2e6b... (Juan Miguel Clearance)
          </button>
          <button
            type="button"
            onClick={() => {
              const ctrl = 'CG-TGR-2026-0002';
              setInputQuery(ctrl);
              performVerification(ctrl);
            }}
            style={{
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              padding: '3px 8px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '0.75rem',
            }}
          >
            CG-TGR-2026-0002 (Indigency)
          </button>
        </div>
      </div>

      {/* Verification Result Output */}
      {hasSearched && result && (
        <div className="animate-fade-in">
          {result.verified ? (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '2px solid #10B981',
                boxShadow: 'var(--shadow-xl)',
                overflow: 'hidden',
              }}
            >
              {/* Success Banner */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #065F46 0%, #047857 100%)',
                  padding: '1.5rem 2rem',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircle2 size={32} color="#A7F3D0" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: '#FFFFFF', margin: 0 }}>
                    CRYPTOGRAPHIC INTEGRITY CONFIRMED
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#D1FAE5', marginTop: '2px' }}>
                    {result.message}
                  </p>
                </div>
              </div>

              {/* Data Privacy & Certificate Metadata */}
              <div style={{ padding: '2rem' }}>
                <div
                  style={{
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.8rem',
                    color: '#166534',
                    marginBottom: '1.5rem',
                  }}
                >
                  <Lock size={16} />
                  <span>
                    <strong>RA 10173 Privacy Compliance:</strong> Citizen full name is masked and sensitive contact
                    details are withheld in this public verification interface.
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>CONTROL NUMBER</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#002664', fontFamily: 'monospace' }}>
                      {result.certificate?.controlNumber}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>DOCUMENT TYPE</span>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase' }}>
                      {result.certificate?.type === 'clearance' && 'Barangay Clearance'}
                      {result.certificate?.type === 'indigency' && 'Certificate of Indigency'}
                      {result.certificate?.type === 'residency' && 'Certificate of Residency'}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>BEARER (MASKED)</span>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
                      {result.certificate?.recipientNameMasked}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>JURISDICTION / PUROK</span>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155' }}>
                      {result.certificate?.purok}, Barangay Taguranao
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>DATE ISSUED</span>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155' }}>
                      {result.certificate?.issuedDate}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>EXPIRATION DATE</span>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155' }}>
                      {result.certificate?.expiryDate}
                    </div>
                  </div>
                </div>

                {/* Purpose */}
                <div style={{ marginBottom: '1.5rem', background: '#F8FAFC', padding: '1rem', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                    Certified Purpose:
                  </span>
                  <div style={{ fontSize: '0.95rem', color: '#1E293B', fontWeight: 600, marginTop: '4px' }}>
                    "{result.certificate?.purpose}"
                  </div>
                </div>

                {/* SHA-256 Fingerprint Display */}
                <div
                  style={{
                    background: '#001A4D',
                    borderRadius: '10px',
                    padding: '1.25rem',
                    color: '#FFFFFF',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Key size={16} color="#FCD116" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FCD116', textTransform: 'uppercase' }}>
                      IMMUTABLE LEDGER SHA-256 DIGITAL FINGERPRINT
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      color: '#E2E8F0',
                      wordBreak: 'break-all',
                      background: 'rgba(255, 255, 255, 0.08)',
                      padding: '10px',
                      borderRadius: '6px',
                    }}
                  >
                    {result.certificate?.hashSignature}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '8px' }}>
                    Signatory: <strong>{result.certificate?.signatoryName}</strong> (Punong Barangay)
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Warning / Counterfeit Result */
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '2px solid #EF4444',
                boxShadow: 'var(--shadow-xl)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  background: 'linear-gradient(135deg, #991B1B 0%, #DC2626 100%)',
                  padding: '1.5rem 2rem',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <XCircle size={32} color="#FECACA" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: '#FFFFFF', margin: 0 }}>
                    VERIFICATION FAILED: RECORD NOT AUTHENTICATED
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#FEE2E2', marginTop: '2px' }}>
                    {result.message}
                  </p>
                </div>
              </div>

              <div style={{ padding: '2rem' }}>
                <div
                  style={{
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: '10px',
                    padding: '1.25rem',
                    color: '#991B1B',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.9rem' }}>
                    <AlertTriangle size={18} />
                    <span>Potential Document Forgery or Alteration Detected</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', marginTop: '8px', lineHeight: '1.5' }}>
                    The submitted hash signature or control number does not match any genuine issuance record in the
                    official Barangay Taguranao cryptographic repository. If this was scanned from a physical paper,
                    the document may have been digitally falsified or modified.
                  </p>
                  <div style={{ marginTop: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                    Report fraudulent documents to: <strong>admin@taguranao.gov.ph</strong> or call (088) 123-4567.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
