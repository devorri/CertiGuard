import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Lock, ExternalLink } from 'lucide-react';
import barangayLogo from '../../assets/barangay-logo.png';

export const Footer: React.FC = () => {
  return (
    <footer style={{ background: '#FFFFFF', color: '#475569', borderTop: '1px solid #E5E7EB' }}>
      {/* Top Academic & Data Privacy Notice */}
      <div
        style={{
          background: '#F8FAFC',
          borderBottom: '1px solid #F1F5F9',
          padding: '0.65rem 1.5rem',
          textAlign: 'center',
          color: '#64748B',
          fontSize: '0.78rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        <Lock size={13} color="#0066FF" />
        <span>
          <strong>Republic of the Philippines • Data Privacy Notice:</strong> Developed in compliance with Republic Act 10173 (Data Privacy Act of 2012) and National Privacy Commission regulations.
        </span>
      </div>

      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '3.5rem 1.5rem 2.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2.5rem',
        }}
      >
        {/* Brand & Mission */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
            <img
              src={barangayLogo}
              alt="Barangay Taguranao Seal"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                objectFit: 'contain',
              }}
            />
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0066FF', letterSpacing: '-0.02em' }}>
              Certi<span style={{ color: '#0F172A' }}>Guard</span>
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748B' }}>
              • Barangay Taguranao
            </span>
          </div>

          <p style={{ fontSize: '0.86rem', lineHeight: '1.65', color: '#64748B', marginBottom: '1.25rem' }}>
            Official digital document issuance and cryptographic verification engine for the community of Barangay Taguranao.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#059669', fontWeight: 600 }}>
            <CheckCircle2 size={15} />
            <span>Cryptographic Ledger Active (SHA-256)</span>
          </div>
        </div>

        {/* eServices Links */}
        <div>
          <h4 style={{ color: '#0F172A', fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Online eServices
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem' }}>
            <li>
              <Link to="/register" style={{ color: '#475569', textDecoration: 'none' }}>
                Barangay Clearance Request
              </Link>
            </li>
            <li>
              <Link to="/register" style={{ color: '#475569', textDecoration: 'none' }}>
                Certificate of Indigency (Welfare)
              </Link>
            </li>
            <li>
              <Link to="/register" style={{ color: '#475569', textDecoration: 'none' }}>
                Certificate of Residency
              </Link>
            </li>
            <li>
              <Link to="/verify" style={{ color: '#0066FF', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>Public Verification Engine</span>
                <ExternalLink size={13} />
              </Link>
            </li>
          </ul>
        </div>

        {/* Governance Details */}
        <div>
          <h4 style={{ color: '#0F172A', fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Barangay Taguranao
          </h4>
          <p style={{ fontSize: '0.86rem', lineHeight: '1.65', color: '#64748B' }}>
            Office of the Punong Barangay<br />
            Barangay Hall Complex, Taguranao<br />
            Office Hours: Monday – Friday, 8:00 AM – 5:00 PM<br />
            Hotline: (088) 123-4567 • 0917-123-4567<br />
            Email: contact@barangaytaguranao.gov.ph
          </p>
        </div>

        {/* Legal & Trust */}
        <div>
          <h4 style={{ color: '#0F172A', fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Trust & Compliance
          </h4>
          <p style={{ fontSize: '0.86rem', lineHeight: '1.65', color: '#64748B', marginBottom: '0.75rem' }}>
            Developed under national digital governance principles to enhance public service delivery, promote transparency, and counter illicit forgery.
          </p>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
            Philippine Standard Time (PST): GMT+8
          </div>
        </div>
      </div>

      {/* Bottom Copyright Strip */}
      <div
        style={{
          borderTop: '1px solid #F1F5F9',
          padding: '1.25rem 1.5rem',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: '#94A3B8',
          background: '#F8FAFC',
        }}
      >
        © {new Date().getFullYear()} Republic of the Philippines • Barangay Taguranao Digital Governance Initiative. All rights reserved.
      </div>
    </footer>
  );
};
