import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { certificateService } from '../../services/certificateService';
import type { CertificateType } from '../../types';
import { FileCheck, Award, Users, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import barangayLogo from '../../assets/barangay-logo.png';
import toast from 'react-hot-toast';

export const RequestCertificate: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [certType, setCertType] = useState<CertificateType>('clearance');
  const [purpose, setPurpose] = useState('');
  const [yearsOfResidency, setYearsOfResidency] = useState<number>(3);
  const [emergencyContact, setEmergencyContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!purpose.trim()) {
      toast.error('Please specify the official purpose for this certificate.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newReq = await certificateService.submitRequest(
        user.id,
        certType,
        purpose.trim(),
        yearsOfResidency,
        emergencyContact
      );

      toast.success(`Application submitted! Tracking Ref: ${newReq.controlNumber}`);
      navigate('/resident/dashboard');
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '840px', margin: '2.5rem auto', padding: '0 1.5rem' }}>
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: '#FFFFFF',
            padding: '2.5rem 2rem 1.75rem',
            color: '#0F172A',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
          }}
        >
          <img
            src={barangayLogo}
            alt="Barangay Taguranao Seal"
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              objectFit: 'contain',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
            }}
          />
          <div>
            <div style={{ fontSize: '0.78rem', color: '#0066FF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>
              BARANGAY TAGURANAO E-SERVICES
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Official Certificate Application
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px' }}>
              Fill out the form below. Your request will be evaluated by the Barangay Secretary and Punong Barangay.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
          {/* Certificate Type Selection Cards */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>
              Select Required Certificate Type:
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {/* Clearance */}
              <div
                onClick={() => setCertType('clearance')}
                style={{
                  border: certType === 'clearance' ? '2px solid #0066FF' : '1px solid #E2E8F0',
                  background: certType === 'clearance' ? '#EFF6FF' : '#FFFFFF',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                {certType === 'clearance' && (
                  <CheckCircle2
                    size={20}
                    color="#0066FF"
                    style={{ position: 'absolute', top: '12px', right: '12px' }}
                  />
                )}
                <FileCheck size={26} color="#0066FF" style={{ marginBottom: '10px' }} />
                <h4 style={{ fontSize: '1rem', color: '#0F172A', margin: '0 0 6px' }}>Barangay Clearance</h4>
                <p style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: '1.4' }}>
                  For employment, business permit, and judicial clearances.
                </p>
                <div style={{ marginTop: '10px', fontSize: '0.75rem', fontWeight: 700, color: '#0066FF' }}>
                  Standard Fee: ₱50.00
                </div>
              </div>

              {/* Indigency */}
              <div
                onClick={() => setCertType('indigency')}
                style={{
                  border: certType === 'indigency' ? '2px solid #CE1126' : '1px solid #E2E8F0',
                  background: certType === 'indigency' ? 'rgba(206, 17, 38, 0.04)' : '#FFFFFF',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                {certType === 'indigency' && (
                  <CheckCircle2
                    size={20}
                    color="#CE1126"
                    style={{ position: 'absolute', top: '12px', right: '12px' }}
                  />
                )}
                <Award size={26} color="#CE1126" style={{ marginBottom: '10px' }} />
                <h4 style={{ fontSize: '1rem', color: '#002664', margin: '0 0 6px' }}>Cert. of Indigency</h4>
                <p style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: '1.4' }}>
                  For financial aid, hospital medical bills, and PAO legal aid.
                </p>
                <div style={{ marginTop: '10px', fontSize: '0.75rem', fontWeight: 700, color: '#10B981' }}>
                  Fee: ₱0.00 (Exempted)
                </div>
              </div>

              {/* Residency */}
              <div
                onClick={() => setCertType('residency')}
                style={{
                  border: certType === 'residency' ? '2px solid #D4A903' : '1px solid #E2E8F0',
                  background: certType === 'residency' ? 'rgba(252, 209, 22, 0.08)' : '#FFFFFF',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                {certType === 'residency' && (
                  <CheckCircle2
                    size={20}
                    color="#D4A903"
                    style={{ position: 'absolute', top: '12px', right: '12px' }}
                  />
                )}
                <Users size={26} color="#D4A903" style={{ marginBottom: '10px' }} />
                <h4 style={{ fontSize: '1rem', color: '#002664', margin: '0 0 6px' }}>Cert. of Residency</h4>
                <p style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: '1.4' }}>
                  Proof of residence for bank accounts, passport, and PhilSys.
                </p>
                <div style={{ marginTop: '10px', fontSize: '0.75rem', fontWeight: 700, color: '#0038A8' }}>
                  Standard Fee: ₱50.00
                </div>
              </div>
            </div>
          </div>

          {/* Applicant Pre-Filled Credentials (Read-only for integrity) */}
          <div
            style={{
              background: '#F8FAFC',
              borderRadius: '12px',
              padding: '1.25rem',
              border: '1px solid #E2E8F0',
              marginBottom: '1.5rem',
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Applicant Verified Profile
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '8px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Full Legal Name:</span>
                <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.88rem' }}>{user?.fullName}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Purok / Zone:</span>
                <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.88rem' }}>{user?.purok}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>SMS Mobile Notification:</span>
                <div style={{ fontWeight: 600, color: '#0038A8', fontSize: '0.88rem' }}>{user?.phone}</div>
              </div>
            </div>
          </div>

          {/* Detailed Purpose Field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Specific Purpose of Request *
            </label>
            <textarea
              required
              rows={3}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder={
                certType === 'clearance'
                  ? 'e.g. Local Employment at Taguranao Commercial Hub'
                  : certType === 'indigency'
                  ? 'e.g. Financial Assistance for Hospital Bill Subsidy'
                  : 'e.g. Requirement for Bank Account Opening (Landbank)'
              }
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.9rem',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Years Residing in Taguranao
              </label>
              <input
                type="number"
                min={1}
                max={99}
                value={yearsOfResidency}
                onChange={(e) => setYearsOfResidency(Number(e.target.value))}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Emergency Contact Person / Mobile (Optional)
              </label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="e.g. Juanita Dela Cruz (0917-000-0000)"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
              />
            </div>
          </div>

          {/* Academic Prototype Notice */}
          <div
            style={{
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              gap: '10px',
              marginBottom: '1.75rem',
            }}
          >
            <AlertCircle size={20} color="#D97706" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.78rem', color: '#92400E', lineHeight: '1.4' }}>
              Upon submission, an automated SMS notification will be recorded. Once approved by the Barangay Office,
              a tamper-evident PDF with a verifiable SHA-256 QR code will be made available for download.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={() => navigate('/resident/dashboard')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{ padding: '12px 28px' }}
            >
              <span>{isSubmitting ? 'Submitting to Ledger...' : 'Submit Official Application'}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
