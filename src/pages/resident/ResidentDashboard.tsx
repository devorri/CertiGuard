import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { pdfService } from '../../services/pdfService';
import { smsService } from '../../services/smsService';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import {
  FileText,
  Clock,
  CheckCircle2,
  PlusCircle,
  Download,
  MessageSquare,
} from 'lucide-react';
import barangayLogo from '../../assets/barangay-logo.png';
import toast from 'react-hot-toast';

export const ResidentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'requests' | 'sms'>('requests');

  const allRequests = storageService.getRequests().filter((r) => r.userId === user?.id);
  const approvedRequests = allRequests.filter((r) => r.status === 'approved');
  const pendingRequests = allRequests.filter((r) => r.status === 'pending');
  const userSMS = user ? smsService.getUserMessages(user.phone) : [];

  const handleDownloadPDF = async (certId?: string) => {
    if (!certId) {
      toast.error('Certificate record is still compiling.');
      return;
    }
    const cert = storageService.findCertificateById(certId);
    if (!cert) {
      toast.error('Certificate not found in cryptographic database.');
      return;
    }

    toast.loading('Generating tamper-evident official PDF with QR code...', { id: 'pdf-dl' });
    try {
      await pdfService.downloadCertificatePDF(cert);
      toast.success('Certificate downloaded successfully!', { id: 'pdf-dl' });
    } catch (err) {
      console.error(err);
      toast.error('Error compiling PDF certificate.', { id: 'pdf-dl' });
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
      {/* Resident Welcome Header */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E5E7EB',
          padding: '2rem 2.25rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
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
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#0066FF', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <span>Barangay Taguranao Resident Portal</span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Mabuhay, {user?.fullName}!
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#64748B', marginTop: '4px' }}>
              {user?.purok} • {user?.address} • Verified Citizen Account
            </p>
          </div>
        </div>

        <Link
          to="/resident/request"
          className="btn-primary"
          style={{ padding: '12px 24px', fontSize: '0.95rem', textDecoration: 'none' }}
        >
          <PlusCircle size={18} />
          <span>Apply for New Certificate</span>
        </Link>
      </div>

      {/* Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <StatCard
          title="Total Applied"
          value={allRequests.length}
          icon={FileText}
          description="Lifetime submissions"
          colorVariant="blue"
        />
        <StatCard
          title="Pending Evaluation"
          value={pendingRequests.length}
          icon={Clock}
          description="In review at Barangay Hall"
          colorVariant="gold"
        />
        <StatCard
          title="Approved Documents"
          value={approvedRequests.length}
          icon={CheckCircle2}
          description="Cryptographically signed"
          colorVariant="green"
        />
        <StatCard
          title="SMS Alert Logs"
          value={userSMS.length}
          icon={MessageSquare}
          description="Dispatches to your mobile"
          colorVariant="blue"
        />
      </div>

      {/* Tab Switcher */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          borderBottom: '2px solid #E2E8F0',
          marginBottom: '1.5rem',
        }}
      >
        <button
          onClick={() => setActiveTab('requests')}
          style={{
            padding: '10px 18px',
            fontSize: '0.95rem',
            fontWeight: 700,
            background: 'transparent',
            color: activeTab === 'requests' ? '#0038A8' : '#64748B',
            borderBottom: activeTab === 'requests' ? '3px solid #0038A8' : '3px solid transparent',
            marginBottom: '-2px',
          }}
        >
          My Certificate Applications ({allRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('sms')}
          style={{
            padding: '10px 18px',
            fontSize: '0.95rem',
            fontWeight: 700,
            background: 'transparent',
            color: activeTab === 'sms' ? '#0038A8' : '#64748B',
            borderBottom: activeTab === 'sms' ? '3px solid #0038A8' : '3px solid transparent',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <MessageSquare size={16} />
          <span>Real-time SMS Feed ({userSMS.length})</span>
        </button>
      </div>

      {/* Main Table or SMS View */}
      {activeTab === 'requests' ? (
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            boxShadow: 'var(--shadow-md)',
            overflowX: 'auto',
          }}
        >
          {allRequests.length === 0 ? (
            <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
              <FileText size={48} color="#94A3B8" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ color: '#0F172A', fontSize: '1.1rem' }}>No Certificate Requests Yet</h3>
              <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                You haven't requested any official documents. Click below to file your first request.
              </p>
              <Link to="/resident/request" className="btn-primary">
                <PlusCircle size={18} /> Request Certificate Now
              </Link>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Control Ref #</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Certificate Type</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Purpose</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Date Filed</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allRequests.map((req) => (
                  <tr
                    key={req.id}
                    style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                  >
                    <td style={{ padding: '16px 18px', fontFamily: 'monospace', fontWeight: 700, color: '#002664' }}>
                      {req.controlNumber}
                    </td>
                    <td style={{ padding: '16px 18px', textTransform: 'uppercase', fontWeight: 600 }}>
                      {req.type === 'clearance' && 'Barangay Clearance'}
                      {req.type === 'indigency' && 'Certificate of Indigency'}
                      {req.type === 'residency' && 'Certificate of Residency'}
                    </td>
                    <td style={{ padding: '16px 18px', color: '#475569', maxWidth: '280px' }}>
                      {req.purpose}
                    </td>
                    <td style={{ padding: '16px 18px', color: '#64748B' }}>
                      {new Date(req.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td style={{ padding: '16px 18px' }}>
                      <StatusBadge status={req.status} />
                      {req.rejectionReason && (
                        <div style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '4px' }}>
                          Reason: {req.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                      {req.status === 'approved' && req.certificateId ? (
                        <button
                          onClick={() => handleDownloadPDF(req.certificateId)}
                          className="btn-primary"
                          style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                          title="Download Cryptographically Authenticated PDF"
                        >
                          <Download size={14} />
                          <span>PDF + QR</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                          {req.status === 'pending' ? 'Evaluation in progress' : 'Disapproved'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        /* SMS Feed */
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            boxShadow: 'var(--shadow-md)',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
            <MessageSquare size={20} color="#0038A8" />
            <h3 style={{ fontSize: '1.1rem', color: '#0F172A', margin: 0 }}>
              Automated SMS Transaction Gateway Feed
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.5rem' }}>
            Official transaction notifications sent to your registered mobile (<strong>{user?.phone}</strong>).
          </p>

          {userSMS.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>
              No SMS alerts sent yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {userSMS.map((sms) => (
                <div
                  key={sms.id}
                  style={{
                    background: '#F8FAFC',
                    borderLeft: '4px solid #0038A8',
                    padding: '1rem',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748B' }}>
                    <span style={{ fontWeight: 700, color: '#002664' }}>Ref: {sms.controlNumber}</span>
                    <span>{new Date(sms.timestamp).toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#1E293B', lineHeight: '1.5' }}>
                    {sms.message}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 600 }}>
                    ✓ Delivered via CertiGuard Automated Node
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
