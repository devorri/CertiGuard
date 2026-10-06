import React from 'react';
import { certificateService } from '../../services/certificateService';
import { storageService } from '../../services/storageService';
import { Printer } from 'lucide-react';
import barangayLogo from '../../assets/barangay-logo.png';

export const OfficialReports: React.FC = () => {
  const [, setTick] = React.useState(0);

  React.useEffect(() => {
    const unsub = storageService.onStorageSync(() => setTick((t) => t + 1));
    storageService.syncFromSupabase().then(() => setTick((t) => t + 1));
    return unsub;
  }, []);

  const analytics = certificateService.getAnalytics();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ padding: '2rem 2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Official Administrative Reports
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#64748B', marginTop: '4px' }}>
            Consolidated certificate issuance audit and statistics for Sangguniang Barangay Taguranao session presentation.
          </p>
        </div>

        <button onClick={handlePrint} className="btn-secondary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
          <Printer size={16} />
          <span>Print / Export Report</span>
        </button>
      </div>

      {/* Official Header for Print */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '2rem',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '2rem',
        }}
      >
        <div style={{ textAlign: 'center', borderBottom: '2px solid #0066FF', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
          <img
            src={barangayLogo}
            alt="Barangay Taguranao Seal"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              margin: '0 auto 10px',
              display: 'block',
              objectFit: 'contain',
            }}
          />
          <div style={{ fontSize: '0.82rem', color: '#475569' }}>Republic of the Philippines</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>BARANGAY TAGURANAO • MATALAM, COTABATO</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0066FF', marginTop: '4px' }}>
            MONTHLY DOCUMENT ISSUANCE & VERIFICATION AUDIT
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>
            Generated on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} •
            CertiGuard Cryptographic Framework
          </div>
        </div>

        {/* High Level Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>TOTAL CITIZEN REQUESTS</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#002664', marginTop: '4px' }}>
              {analytics.totalRequests}
            </div>
          </div>
          <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>OFFICIALLY ISSUED</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
              {analytics.approvedRequests}
            </div>
          </div>
          <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>DISAPPROVED</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#DC2626', marginTop: '4px' }}>
              {analytics.rejectedRequests}
            </div>
          </div>
          <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>REVENUE ACCRUED</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#B45309', marginTop: '4px' }}>
              ₱{analytics.distribution.clearance * 50 + analytics.distribution.residency * 50}.00
            </div>
          </div>
        </div>

        {/* Certificate Breakdown Table */}
        <h4 style={{ fontSize: '0.95rem', color: '#0F172A', marginBottom: '1rem' }}>
          Service Performance by Document Category
        </h4>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem', marginBottom: '2rem' }}>
          <thead>
            <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #CBD5E1' }}>
              <th style={{ padding: '10px 14px' }}>Certificate Title</th>
              <th style={{ padding: '10px 14px' }}>Volume Issued</th>
              <th style={{ padding: '10px 14px' }}>Standard Fee</th>
              <th style={{ padding: '10px 14px' }}>Turnaround Target</th>
              <th style={{ padding: '10px 14px' }}>Verification Status</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
              <td style={{ padding: '10px 14px', fontWeight: 600 }}>Barangay Clearance</td>
              <td style={{ padding: '10px 14px' }}>{analytics.distribution.clearance}</td>
              <td style={{ padding: '10px 14px' }}>₱50.00</td>
              <td style={{ padding: '10px 14px' }}>&lt; 24 Hours</td>
              <td style={{ padding: '10px 14px', color: '#059669', fontWeight: 600 }}>SHA-256 Active</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
              <td style={{ padding: '10px 14px', fontWeight: 600 }}>Certificate of Indigency</td>
              <td style={{ padding: '10px 14px' }}>{analytics.distribution.indigency}</td>
              <td style={{ padding: '10px 14px' }}>₱0.00 (Exempted)</td>
              <td style={{ padding: '10px 14px' }}>&lt; 12 Hours</td>
              <td style={{ padding: '10px 14px', color: '#059669', fontWeight: 600 }}>SHA-256 Active</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
              <td style={{ padding: '10px 14px', fontWeight: 600 }}>Certificate of Residency</td>
              <td style={{ padding: '10px 14px' }}>{analytics.distribution.residency}</td>
              <td style={{ padding: '10px 14px' }}>₱50.00</td>
              <td style={{ padding: '10px 14px' }}>&lt; 24 Hours</td>
              <td style={{ padding: '10px 14px', color: '#059669', fontWeight: 600 }}>SHA-256 Active</td>
            </tr>
          </tbody>
        </table>

        {/* Signatures Area */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginTop: '3rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Prepared by:</div>
            <div style={{ marginTop: '2.5rem', fontWeight: 700, borderTop: '1px solid #000', paddingTop: '4px' }}>
              MARIA ELENA SANTOS
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Barangay Secretary, Barangay Taguranao</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Attested & Approved by:</div>
            <div style={{ marginTop: '2.5rem', fontWeight: 700, borderTop: '1px solid #000', paddingTop: '4px' }}>
              HON. ROBERTO D. DELA CRUZ
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Punong Barangay, Barangay Taguranao</div>
          </div>
        </div>
      </div>
    </div>
  );
};
