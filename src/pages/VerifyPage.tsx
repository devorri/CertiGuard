import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Lock,
  Key,
  Camera,
  QrCode,
  X,
  Upload,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { certificateService } from '../services/certificateService';
import type { VerificationResult } from '../types';
import barangayLogo from '../assets/barangay-logo.png';
import toast from 'react-hot-toast';

export const VerifyPage: React.FC = () => {
  const { hash: urlHash } = useParams<{ hash?: string }>();
  const [inputQuery, setInputQuery] = useState('');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Helper to extract clean hash or control number from raw input or URL
  const extractCleanQuery = (raw: string): string => {
    let clean = raw.trim();
    if (clean.includes('/verify/')) {
      clean = clean.split('/verify/').pop()?.split('?')[0].split('/')[0] || clean;
    }
    return decodeURIComponent(clean).trim();
  };

  useEffect(() => {
    if (urlHash) {
      const clean = extractCleanQuery(urlHash);
      setInputQuery(clean);
      performVerification(clean);
    }
  }, [urlHash]);

  useEffect(() => {
    return () => {
      // Clean up camera stream on unmount
      if (html5QrCodeRef.current) {
        if (html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current.stop().catch(() => {});
        }
        html5QrCodeRef.current.clear();
      }
    };
  }, []);

  const performVerification = async (query: string) => {
    const clean = extractCleanQuery(query);
    if (!clean) {
      toast.error('Please enter a SHA-256 Hash or Control Number.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await certificateService.verifyByHashOrControlNumberAsync(clean);
      setResult(res);
      setHasSearched(true);
    } catch (err) {
      console.error(err);
      toast.error('Error verifying document.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performVerification(inputQuery);
  };

  // QR Camera Scanner Handlers
  const startCameraScanner = async () => {
    setIsScannerOpen(true);
    setCameraLoading(true);

    // Short timeout to ensure the DOM element #qr-reader is mounted
    setTimeout(async () => {
      try {
        const qrElement = document.getElementById('qr-reader');
        if (!qrElement) {
          setCameraLoading(false);
          return;
        }

        const scanner = new Html5Qrcode('qr-reader');
        html5QrCodeRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 260, height: 260 },
          },
          (decodedText) => {
            handleScannedResult(decodedText);
          },
          () => {
            // Frame scan failure - normal while searching for QR
          }
        );
        setCameraLoading(false);
      } catch (err: any) {
        console.error('Camera access exception:', err);
        toast.error('Camera access failed. Please ensure camera permissions are allowed.');
        setCameraLoading(false);
        setIsScannerOpen(false);
      }
    }, 150);
  };

  const stopCameraScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn('Scanner stop error:', e);
      }
      html5QrCodeRef.current = null;
    }
    setIsScannerOpen(false);
    setCameraLoading(false);
  };

  const handleScannedResult = async (decodedText: string) => {
    const clean = extractCleanQuery(decodedText);
    await stopCameraScanner();
    setInputQuery(clean);
    toast.success('Certificate QR code detected!');
    performVerification(clean);
  };

  // Scan from uploaded image file
  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const scanner = html5QrCodeRef.current || new Html5Qrcode('qr-reader-hidden');
      const decodedText = await scanner.scanFile(file, true);
      handleScannedResult(decodedText);
    } catch (err) {
      console.warn('File QR scan error:', err);
      toast.error('No QR code detected in the selected image. Please try a clearer photo.');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '3rem auto', padding: '0 1.5rem' }}>
      {/* Hidden container for file-based QR decoding */}
      <div id="qr-reader-hidden" style={{ display: 'none' }} />

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

      {/* Input Search Box & Camera Scan Bar */}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
            <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E293B' }}>
              Enter 64-Character SHA-256 Hash or Control Number (e.g. CG-TGR-2026-0001)
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={startCameraScanner}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#EFF6FF',
                  color: '#0066FF',
                  border: '1px solid #BFDBFE',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Camera size={15} />
                <span>Scan with Camera</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#F8FAFC',
                  color: '#475569',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Upload size={15} />
                <span>Upload QR Image</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileScan}
              />
            </div>
          </div>

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
                placeholder="Paste SHA-256 digital fingerprint, control number, or scan QR..."
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
            <button type="submit" className="btn-primary" disabled={isLoading} style={{ padding: '12px 24px', opacity: isLoading ? 0.7 : 1 }}>
              <ShieldCheck size={18} />
              <span>{isLoading ? 'Verifying...' : 'Validate Integrity'}</span>
            </button>
          </div>
        </form>

        {/* Live Camera Viewfinder Overlay */}
        {isScannerOpen && (
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1.25rem',
              background: '#0F172A',
              borderRadius: '12px',
              color: '#FFFFFF',
              position: 'relative',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <QrCode size={20} color="#38BDF8" />
                <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>Align Certificate QR Code Within Frame</span>
              </div>
              <button
                type="button"
                onClick={stopCameraScanner}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {cameraLoading && (
              <div style={{ padding: '2rem 0', color: '#94A3B8', fontSize: '0.88rem' }}>
                Initializing camera feed...
              </div>
            )}

            <div
              id="qr-reader"
              style={{
                width: '100%',
                maxWidth: '380px',
                margin: '0 auto',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#000000',
              }}
            />

            <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '10px' }}>
              Point your phone camera directly at the QR code on the lower left of the official certificate.
            </p>
          </div>
        )}
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
