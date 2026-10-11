import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Printer, ExternalLink } from 'lucide-react';
import { hashService } from '../services/cryptoService';
import { storageService } from '../services/storageService';

/**
 * Panel demo helper: renders one GENUINE QR (linked to a real issued certificate)
 * and two FORGED QRs (fabricated / tampered hashes) so the anti-forgery response
 * ("VERIFICATION FAILED: RECORD NOT AUTHENTICATED") can be shown live with a phone camera.
 * The QR links always use the current domain, so open this page on the deployed site.
 */
export const ForgeryDemoPage: React.FC = () => {
  const origin = window.location.origin;
  const genuineCert = useMemo(
    () => storageService.getCertificates().find((c) => c.isValid) || storageService.getCertificates()[0],
    []
  );

  // Forged #1: a hash that was never issued (forger made up their own QR)
  const fabricatedHash = useMemo(
    () => hashService.generateSHA256({
      controlNumber: 'CG-TGR-2026-9999',
      type: 'clearance',
      recipientName: 'JUAN FAKE DELA PENA',
      purok: 'Purok 1 (Centro)',
      purpose: 'Employment',
      issuedDate: '2026-01-01',
      secretSalt: 'FORGER',
    }).replace(/^./, 'f'),
    []
  );

  // Forged #2: a real hash with ONE character altered (photoshopped QR)
  const tamperedHash = useMemo(() => {
    if (!genuineCert) return '0'.repeat(64);
    const h = genuineCert.hashSignature;
    const last = h[h.length - 1];
    return h.slice(0, -1) + (last === '0' ? '1' : '0');
  }, [genuineCert]);

  const cards = useMemo(
    () => [
      {
        id: 'genuine',
        title: 'GENUINE QR',
        subtitle: genuineCert ? `Real certificate ${genuineCert.controlNumber}` : 'No issued certificate found',
        expected: 'Green: CRYPTOGRAPHIC INTEGRITY CONFIRMED',
        url: genuineCert ? `${origin}/verify/${genuineCert.hashSignature}` : '',
        good: true,
      },
      {
        id: 'fabricated',
        title: 'FAKE QR #1 — Fabricated',
        subtitle: 'Forger generated their own QR code; hash was never issued.',
        expected: 'Red: VERIFICATION FAILED: RECORD NOT AUTHENTICATED',
        url: `${origin}/verify/${fabricatedHash}`,
        good: false,
      },
      {
        id: 'tampered',
        title: 'FAKE QR #2 — Tampered',
        subtitle: 'Real hash with only 1 character changed (edited in Photoshop).',
        expected: 'Red: VERIFICATION FAILED: RECORD NOT AUTHENTICATED',
        url: `${origin}/verify/${tamperedHash}`,
        good: false,
      },
    ],
    [origin, genuineCert, fabricatedHash, tamperedHash]
  );

  const [qrImages, setQrImages] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        cards.filter((c) => c.url).map(async (c) => [c.id, await hashService.generateQRCodeDataURL(c.url)] as const)
      );
      if (!cancelled) setQrImages(Object.fromEntries(entries));
    })();
    return () => {
      cancelled = true;
    };
  }, [cards]);

  const isLocal = /localhost|127\.0\.0\.1/.test(origin);

  return (
    <div style={{ maxWidth: '1080px', margin: '2.5rem auto', padding: '0 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#DC2626', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Anti-Forgery Demonstration
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', margin: '6px 0' }}>Genuine vs. Fake QR Codes</h1>
        <p style={{ color: '#64748B', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6 }}>
          Scan each QR with a phone camera. The genuine code opens the green authentic page; both fake codes open the red
          <strong> VERIFICATION FAILED: RECORD NOT AUTHENTICATED</strong> alert.
        </p>
        {isLocal && (
          <p style={{ marginTop: '12px', color: '#B45309', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '8px 12px', display: 'inline-block', fontSize: '0.82rem' }}>
            You are on {origin}. Phones cannot open localhost links — open this page on the deployed (Netlify) site before scanning.
          </p>
        )}
        <div style={{ marginTop: '14px' }}>
          <button type="button" className="btn-primary" onClick={() => window.print()} style={{ padding: '10px 20px' }}>
            <Printer size={16} />
            <span>Print QR Sheet</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {cards.map((c) => (
          <div
            key={c.id}
            id={`demo-qr-${c.id}`}
            style={{
              background: '#FFFFFF',
              border: `2px solid ${c.good ? '#10B981' : '#EF4444'}`,
              borderRadius: '16px',
              padding: '1.25rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: c.good ? '#047857' : '#B91C1C', fontWeight: 800 }}>
              {c.good ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
              <span>{c.title}</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '6px 0 12px', minHeight: '2.4em' }}>{c.subtitle}</p>
            {qrImages[c.id] ? (
              <img src={qrImages[c.id]} alt={`${c.title} QR code`} style={{ width: '220px', height: '220px' }} />
            ) : (
              <div style={{ width: '220px', height: '220px', margin: '0 auto', background: '#F1F5F9', borderRadius: '8px' }} />
            )}
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: c.good ? '#047857' : '#B91C1C', marginTop: '10px' }}>
              Expected: {c.expected}
            </div>
            {c.url && (
              <Link
                to={c.url.replace(origin, '')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#0038A8', marginTop: '8px' }}
              >
                <ExternalLink size={13} /> Open on this device
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
