import React from 'react';
import { Link } from 'react-router-dom';
import { certificateService } from '../../services/certificateService';
import { storageService } from '../../services/storageService';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import {
  FileCheck2,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Award,
  ArrowRight,
  Building,
} from 'lucide-react';
import barangayLogo from '../../assets/barangay-logo.png';

export const AdminDashboard: React.FC = () => {
  const [, setTick] = React.useState(0);

  React.useEffect(() => {
    const unsub = storageService.onStorageSync(() => {
      setTick((t) => t + 1);
    });
    storageService.syncFromSupabase().then(() => setTick((t) => t + 1));
    return unsub;
  }, []);

  const analytics = certificateService.getAnalytics();
  const requests = storageService.getRequests();
  const pendingQueue = requests.filter((r) => r.status === 'pending').slice(0, 5);
  const recentCerts = storageService.getCertificates().slice(0, 5);

  return (
    <div style={{ padding: '2rem 2.5rem' }}>
      {/* Top Greeting */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.25rem', flexWrap: 'wrap', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img
            src={barangayLogo}
            alt="Barangay Taguranao Seal"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              objectFit: 'contain',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
            }}
          />
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0066FF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              EXECUTIVE CONTROL PANEL
            </span>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A', margin: '2px 0 0' }}>
              Barangay Taguranao Administration
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#64748B', marginTop: '2px' }}>
              Real-time monitoring of document processing, cryptographic verification, and resident registrations.
            </p>
          </div>
        </div>

        <Link to="/admin/requests" className="btn-primary" style={{ padding: '10px 22px', fontSize: '0.88rem', textDecoration: 'none' }}>
          <span>Process Incoming Queue</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Main KPI Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <StatCard
          title="Pending Evaluation"
          value={analytics.pendingRequests}
          icon={Clock}
          description="Awaiting official action"
          colorVariant="gold"
        />
        <StatCard
          title="Approved Documents"
          value={analytics.approvedRequests}
          icon={CheckCircle}
          description="Cryptographically signed"
          colorVariant="green"
        />
        <StatCard
          title="Disapproved / Rejected"
          value={analytics.rejectedRequests}
          icon={XCircle}
          description="Incomplete or non-resident"
          colorVariant="red"
        />
        <StatCard
          title="Registered Residents"
          value={analytics.totalResidents}
          icon={Users}
          description="Census citizen accounts"
          colorVariant="blue"
        />
      </div>

      {/* Certificate Distribution Breakdown */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', color: '#0F172A', margin: 0 }}>
              Certificate Issuance Volume Breakdown
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
              Distribution across official covered certificates in Chapter 1
            </span>
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0038A8' }}>
            Total Issued: {analytics.totalIssuedCertificates}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {/* Clearance */}
          <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCheck2 size={20} color="#0038A8" />
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1E293B' }}>Barangay Clearance</span>
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0038A8' }}>
                {analytics.distribution.clearance}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '6px' }}>
              Standard 6-month validity • ₱50.00 fee
            </div>
          </div>

          {/* Indigency */}
          <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={20} color="#CE1126" />
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1E293B' }}>Certificate of Indigency</span>
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#CE1126' }}>
                {analytics.distribution.indigency}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '6px' }}>
              Social welfare / Medical • ₱0.00 Exempted
            </div>
          </div>

          {/* Residency */}
          <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building size={20} color="#D4A903" />
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1E293B' }}>Certificate of Residency</span>
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#D4A903' }}>
                {analytics.distribution.residency}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '6px' }}>
              Bank & PhilSys requirement • ₱50.00 fee
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Pending Queue & Recent Issued Certificates */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.75rem' }}>
        {/* Pending Submissions Queue */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            boxShadow: 'var(--shadow-sm)',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#0F172A', margin: 0 }}>
              Urgent Pending Requests ({analytics.pendingRequests})
            </h3>
            <Link to="/admin/requests" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0038A8' }}>
              View Full Queue →
            </Link>
          </div>

          {pendingQueue.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>
              All certificate requests have been addressed!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pendingQueue.map((req) => (
                <div
                  key={req.id}
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>
                      {req.applicantName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      {req.applicantPurok} •{' '}
                      <span style={{ textTransform: 'uppercase', fontWeight: 600, color: '#0038A8' }}>
                        {req.type}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '2px' }}>
                      Ref: {req.controlNumber}
                    </div>
                  </div>
                  <Link
                    to="/admin/requests"
                    className="btn-gold"
                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                  >
                    Evaluate
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cryptographic Ledger Recent Entries */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            boxShadow: 'var(--shadow-sm)',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#0F172A', margin: 0 }}>
              Recent Cryptographic Certificates
            </h3>
            <Link to="/admin/records" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0038A8' }}>
              Inspect Ledger →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentCerts.map((cert) => (
              <div
                key={cert.id}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>
                    {cert.recipientName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    {cert.controlNumber} • Issued: {cert.issuedDate}
                  </div>
                  <div
                    style={{
                      fontSize: '0.68rem',
                      fontFamily: 'monospace',
                      color: '#0038A8',
                      marginTop: '2px',
                    }}
                  >
                    SHA: {cert.hashSignature.slice(0, 24)}...
                  </div>
                </div>
                <StatusBadge status="ACTIVE_VALID" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
