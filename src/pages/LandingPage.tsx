import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Download,
  User,
  Zap,
  Shield,
  Eye,
  Lock,
  Smartphone,
  ArrowRight,
  Search,
  CheckCircle2,
  FileText,
  Award,
  Users,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import barangayLogo from '../assets/barangay-logo.png';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [quickHash, setQuickHash] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleQuickVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickHash.trim()) {
      navigate(`/verify/${encodeURIComponent(quickHash.trim())}`);
    } else {
      navigate('/verify');
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'How does third-party verification work for employers and universities?',
      a: 'Every issued certificate contains an official QR code and a 64-character SHA-256 cryptographic signature. Anyone can scan the QR code with any mobile phone camera or enter the hash in this portal to view the authentic verification status and verify that the document has not been altered.',
    },
    {
      q: 'How long does it take for a certificate to be approved?',
      a: 'Online requests are typically processed within 4 to 24 business hours by the Barangay Taguranao secretariat. You will receive an instant SMS notification on your registered mobile number the moment your request is reviewed and approved.',
    },
    {
      q: 'Is there a fee for requesting certificates online?',
      a: 'Standard statutory fees apply: Barangay Clearance is ₱50.00, Certificate of Residency is ₱50.00, and Certificate of Indigency is completely FREE (₱0.00) for qualifying low-income households in accordance with social welfare regulations.',
    },
    {
      q: 'Is my personal data protected under Republic Act 10173?',
      a: 'Yes. CertiGuard strictly complies with the Data Privacy Act of 2012 (RA 10173) and National Privacy Commission regulations. Public verification pages only display masked bearer credentials to safeguard citizen privacy while confirming document validity.',
    },
  ];

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', color: '#0F172A' }}>
      {/* 1. HERO SECTION (eGov.ph Clean & Simple Aesthetic) */}
      <section
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0, 102, 255, 0.08) 0%, rgba(255, 255, 255, 1) 100%)',
          padding: '4.5rem 1.5rem 4rem',
          textAlign: 'center',
          borderBottom: '1px solid #F1F5F9',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Official Seal */}
          <img
            src={barangayLogo}
            alt="Barangay Taguranao Official Seal"
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              margin: '0 auto 16px',
              display: 'block',
              objectFit: 'contain',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            }}
          />

          {/* Subtle Top Government Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '9999px',
              background: '#EFF6FF',
              border: '1px solid #DBEAFE',
              color: '#0066FF',
              fontSize: '0.82rem',
              fontWeight: 600,
              marginBottom: '1.75rem',
            }}
          >
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#0066FF' }} />
            <span>Republic of the Philippines • Barangay Taguranao Digital eServices</span>
          </div>

          {/* Main Hero Headline */}
          <h1
            style={{
              fontSize: 'clamp(2.3rem, 4.5vw, 3.5rem)',
              fontWeight: 800,
              lineHeight: '1.18',
              letterSpacing: '-0.03em',
              color: '#0F172A',
              marginBottom: '1.25rem',
            }}
          >
            Official Barangay Documents,{' '}
            <span style={{ color: '#0066FF' }}>Simplified & Secure</span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '1.12rem',
              lineHeight: '1.65',
              color: '#475569',
              maxWidth: '680px',
              margin: '0 auto 2.5rem',
            }}
          >
            Request Barangay Clearances, Certificates of Indigency, and Residency online.
            Protected by tamper-evident cryptographic SHA-256 verification and real-time SMS notifications.
          </p>

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
            <Link
              to="/register"
              className="btn-primary"
              style={{
                padding: '13px 30px',
                fontSize: '0.98rem',
                textDecoration: 'none',
              }}
            >
              <span>Request a Certificate</span>
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/verify"
              className="btn-secondary"
              style={{
                padding: '13px 26px',
                fontSize: '0.98rem',
                textDecoration: 'none',
              }}
            >
              <Search size={18} color="#0066FF" />
              <span>Verify Document Authenticity</span>
            </Link>
          </div>

          {/* Inline Quick Verification Bar (eGov style) */}
          <div
            style={{
              maxWidth: '680px',
              margin: '0 auto',
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '8px 10px 8px 18px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <Search size={20} color="#94A3B8" />
            <form onSubmit={handleQuickVerify} style={{ display: 'flex', flex: 1, gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                value={quickHash}
                onChange={(e) => setQuickHash(e.target.value)}
                placeholder="Enter 64-character SHA-256 Hash or Control Number..."
                style={{
                  border: 'none',
                  fontSize: '0.92rem',
                  color: '#0F172A',
                  width: '100%',
                  background: 'transparent',
                }}
              />
              <button
                type="submit"
                className="btn-primary"
                style={{
                  padding: '9px 20px',
                  fontSize: '0.85rem',
                  whiteSpace: 'nowrap',
                }}
              >
                Verify Now
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 2. "HOW IT WORKS" SECTION — EXACT eGov.ph INSPO MATCH */}
      <section id="how-it-works" style={{ padding: '6rem 1.5rem', background: '#FFFFFF' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', textAlign: 'center' }}>
          {/* Section Category Tag */}
          <div
            style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              color: '#0066FF',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: '0.75rem',
            }}
          >
            HOW IT WORKS
          </div>

          {/* Headline */}
          <h2
            style={{
              fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#0F172A',
              marginBottom: '0.75rem',
            }}
          >
            Get Started in <span style={{ color: '#0066FF' }}>3 Easy Steps</span>
          </h2>

          {/* Subheadline */}
          <p
            style={{
              fontSize: '1.05rem',
              color: '#64748B',
              maxWidth: '620px',
              margin: '0 auto 4rem',
              lineHeight: '1.6',
            }}
          >
            From request to issuance — it only takes minutes to start using CertiGuard.
          </p>

          {/* 3 Step Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '3rem',
              alignItems: 'flex-start',
            }}
          >
            {/* Step 01 */}
            <div
              className="step-card-hover"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              {/* Icon Box with 01 Badge */}
              <div
                style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '20px',
                  border: '1.5px solid #E2E8F0',
                  background: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  boxShadow: '0 4px 20px -2px rgba(0, 102, 255, 0.08)',
                }}
              >
                {/* Blue Badge 01 */}
                <span
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: '#0066FF',
                    color: '#FFFFFF',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    boxShadow: '0 2px 6px rgba(0, 102, 255, 0.4)',
                  }}
                >
                  01
                </span>
                <Download size={32} color="#0066FF" strokeWidth={1.75} />
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginTop: '1.75rem', marginBottom: '0.75rem' }}>
                Submit Request Online
              </h3>

              <p style={{ fontSize: '0.92rem', color: '#64748B', lineHeight: '1.6', maxWidth: '300px' }}>
                Fill out your certificate request online from your computer or smartphone. Available 24/7 without physical queues.
              </p>
            </div>

            {/* Step 02 */}
            <div
              className="step-card-hover"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              {/* Icon Box with 02 Badge */}
              <div
                style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '20px',
                  border: '1.5px solid #E2E8F0',
                  background: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  boxShadow: '0 4px 20px -2px rgba(0, 102, 255, 0.08)',
                }}
              >
                {/* Blue Badge 02 */}
                <span
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: '#0066FF',
                    color: '#FFFFFF',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    boxShadow: '0 2px 6px rgba(0, 102, 255, 0.4)',
                  }}
                >
                  02
                </span>
                <User size={32} color="#0066FF" strokeWidth={1.75} />
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginTop: '1.75rem', marginBottom: '0.75rem' }}>
                Verify Your Identity
              </h3>

              <p style={{ fontSize: '0.92rem', color: '#64748B', lineHeight: '1.6', maxWidth: '300px' }}>
                Barangay officials validate your registered residency profile and attach an immutable SHA-256 digital signature.
              </p>
            </div>

            {/* Step 03 */}
            <div
              className="step-card-hover"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              {/* Icon Box with 03 Badge */}
              <div
                style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '20px',
                  border: '1.5px solid #E2E8F0',
                  background: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  boxShadow: '0 4px 20px -2px rgba(0, 102, 255, 0.08)',
                }}
              >
                {/* Blue Badge 03 */}
                <span
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: '#0066FF',
                    color: '#FFFFFF',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    boxShadow: '0 2px 6px rgba(0, 102, 255, 0.4)',
                  }}
                >
                  03
                </span>
                <Zap size={32} color="#0066FF" strokeWidth={1.75} />
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginTop: '1.75rem', marginBottom: '0.75rem' }}>
                Access Services Instantly
              </h3>

              <p style={{ fontSize: '0.92rem', color: '#64748B', lineHeight: '1.6', maxWidth: '300px' }}>
                Download your official PDF with embedded verification QR code and receive automated SMS updates immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. "TRUST & SECURITY" SECTION — EXACT eGov.ph INSPO MATCH */}
      <section id="security" style={{ padding: '5.5rem 1.5rem', background: '#F8FAFC', borderTop: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', alignItems: 'flex-start' }}>
            {/* Left Header Box */}
            <div>
              <div
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#0066FF',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  marginBottom: '0.75rem',
                }}
              >
                TRUST & SECURITY
              </div>

              <h2
                style={{
                  fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: '#0F172A',
                  lineHeight: '1.2',
                  marginBottom: '1.25rem',
                }}
              >
                Your Data is <span style={{ color: '#0066FF' }}>Safe With Us</span>
              </h2>

              <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: '1.7', marginBottom: '2rem' }}>
                CertiGuard implements bank-grade cryptographic SHA-256 fingerprinting and localized Data Privacy compliance to safeguard citizen records and eliminate paper document tampering.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem', color: '#334155' }}>
                  <CheckCircle2 size={18} color="#0066FF" />
                  <span>Compliant with Data Privacy Act of 2012 (RA 10173)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem', color: '#334155' }}>
                  <CheckCircle2 size={18} color="#0066FF" />
                  <span>Public QR scans show masked citizen credentials only</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.92rem', color: '#334155' }}>
                  <CheckCircle2 size={18} color="#0066FF" />
                  <span>Immutable 64-character SHA-256 audit ledger</span>
                </div>
              </div>
            </div>

            {/* Right 4 Cards Grid (matching eGov.ph inspo) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {/* Card 1: Government-Backed Platform */}
              <div className="trust-card">
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: '#EFF6FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem',
                  }}
                >
                  <Shield size={24} color="#0066FF" />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
                  Government-Backed Platform
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: '1.6' }}>
                  Officially developed and maintained for Barangay Taguranao governance under DICT and local standards.
                </p>
              </div>

              {/* Card 2: Data Privacy Compliance */}
              <div className="trust-card">
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: '#EFF6FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem',
                  }}
                >
                  <Eye size={24} color="#0066FF" />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
                  Data Privacy Compliance
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: '1.6' }}>
                  Fully compliant with the Data Privacy Act of 2012 and National Privacy Commission regulations.
                </p>
              </div>

              {/* Card 3: Cryptographic Anti-Forgery */}
              <div className="trust-card">
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: '#EFF6FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem',
                  }}
                >
                  <Lock size={24} color="#0066FF" />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
                  SHA-256 Anti-Forgery
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: '1.6' }}>
                  Every certificate receives a 64-character mathematical signature. Physical paper modifications fail instantly when scanned.
                </p>
              </div>

              {/* Card 4: Real-Time SMS Gateway */}
              <div className="trust-card">
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: '#EFF6FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem',
                  }}
                >
                  <Smartphone size={24} color="#0066FF" />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
                  Real-Time SMS Alerts
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: '1.6' }}>
                  Residents receive automated status messages at each phase: filing, verification, approval, and release.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. "DOCUMENT SERVICES CATALOG" SECTION */}
      <section id="services" style={{ padding: '6rem 1.5rem', background: '#FFFFFF' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#0066FF',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: '0.75rem',
              }}
            >
              AVAILABLE SERVICES
            </div>
            <h2
              style={{
                fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#0F172A',
                marginBottom: '0.75rem',
              }}
            >
              Official Barangay Taguranao Certificates
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#64748B', maxWidth: '580px', margin: '0 auto' }}>
              Standard statutory documents available for digital filing, verification, and instant official PDF download.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
            }}
          >
            {/* Card 1: Barangay Clearance */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                border: '1px solid #E5E7EB',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: '#EFF6FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FileText size={24} color="#0066FF" />
                </div>
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#0066FF',
                    background: '#EFF6FF',
                    padding: '4px 12px',
                    borderRadius: '9999px',
                  }}
                >
                  Fee: ₱50.00
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.75rem' }}>
                Barangay Clearance
              </h3>

              <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: '1.6', marginBottom: '1.5rem', flex: 1 }}>
                Certifies good moral standing and zero derogatory records within the community. Widely required for local and overseas employment.
              </p>

              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#10B981" /> Validity: 6 Months
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#10B981" /> Turnaround: &lt; 24 Hours
                </div>
              </div>

              <Link
                to="/register"
                className="btn-primary"
                style={{ width: '100%', textDecoration: 'none', textAlign: 'center' }}
              >
                Apply for Clearance
              </Link>
            </div>

            {/* Card 2: Certificate of Indigency */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                border: '1px solid #E5E7EB',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: '#FEF2F2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Award size={24} color="#DC2626" />
                </div>
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#059669',
                    background: '#ECFDF5',
                    padding: '4px 12px',
                    borderRadius: '9999px',
                  }}
                >
                  Fee: ₱0.00 (Exempted)
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.75rem' }}>
                Certificate of Indigency
              </h3>

              <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: '1.6', marginBottom: '1.5rem', flex: 1 }}>
                Issued to low-income resident families for social welfare programs, medical assistance, legal aid, scholarship applications, and burial aid.
              </p>

              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#10B981" /> Validity: 3 Months
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#10B981" /> Turnaround: &lt; 12 Hours
                </div>
              </div>

              <Link
                to="/register"
                className="btn-primary"
                style={{ width: '100%', textDecoration: 'none', textAlign: 'center' }}
              >
                Apply for Indigency
              </Link>
            </div>

            {/* Card 3: Certificate of Residency */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                border: '1px solid #E5E7EB',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: '#FFFBEB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Users size={24} color="#B45309" />
                </div>
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#0066FF',
                    background: '#EFF6FF',
                    padding: '4px 12px',
                    borderRadius: '9999px',
                  }}
                >
                  Fee: ₱50.00
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.75rem' }}>
                Certificate of Residency
              </h3>

              <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: '1.6', marginBottom: '1.5rem', flex: 1 }}>
                Formal certification confirming that the citizen permanently resides in a specific purok in Barangay Taguranao for government ID registration.
              </p>

              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#10B981" /> Validity: 6 Months
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#10B981" /> Turnaround: &lt; 24 Hours
                </div>
              </div>

              <Link
                to="/register"
                className="btn-primary"
                style={{ width: '100%', textDecoration: 'none', textAlign: 'center' }}
              >
                Apply for Residency
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. "FREQUENTLY ASKED QUESTIONS" (FAQ) */}
      <section id="faq" style={{ padding: '5.5rem 1.5rem', background: '#F8FAFC', borderTop: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#0066FF',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: '0.75rem',
              }}
            >
              FAQ
            </div>
            <h2
              style={{
                fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#0F172A',
                marginBottom: '0.75rem',
              }}
            >
              Frequently Asked Questions
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#64748B' }}>
              Common inquiries about online filing, validation, and privacy protection.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E5E7EB',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s ease',
                }}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  style={{
                    width: '100%',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'transparent',
                    textAlign: 'left',
                    color: '#0F172A',
                    fontSize: '1.02rem',
                    fontWeight: 600,
                  }}
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp size={20} color="#0066FF" />
                  ) : (
                    <ChevronDown size={20} color="#94A3B8" />
                  )}
                </button>
                {openFaq === idx && (
                  <div
                    style={{
                      padding: '0 1.5rem 1.25rem',
                      color: '#475569',
                      fontSize: '0.92rem',
                      lineHeight: '1.65',
                      borderTop: '1px solid #F1F5F9',
                      paddingTop: '1rem',
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION SECTION (Clean eGov Blue Pill) */}
      <section
        style={{
          background: '#0066FF',
          padding: '5rem 1.5rem',
          color: '#FFFFFF',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800, color: '#FFFFFF', marginBottom: '1rem' }}>
            Experience Seamless Barangay Governance Today
          </h2>
          <p style={{ color: '#DBEAFE', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '2.25rem' }}>
            Skip the lines at the Barangay Hall. Register your resident account in under 2 minutes and track all your document requests in real time.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <Link
              to="/register"
              style={{
                background: '#FFFFFF',
                color: '#0066FF',
                fontWeight: 700,
                fontSize: '0.95rem',
                padding: '12px 28px',
                borderRadius: '9999px',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
              }}
            >
              Create Resident Account
            </Link>
            <Link
              to="/verify"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '0.95rem',
                padding: '12px 24px',
                borderRadius: '9999px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>Public Verification Engine</span>
              <ExternalLink size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
