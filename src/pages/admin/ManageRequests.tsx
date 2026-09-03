import React, { useState } from 'react';
import { storageService } from '../../services/storageService';
import { certificateService } from '../../services/certificateService';
import { pdfService } from '../../services/pdfService';
import { StatusBadge } from '../../components/ui/StatusBadge';
import type { CertificateRequest } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ManageRequests: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<CertificateRequest[]>(() => storageService.getRequests());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Modal State for Reject / Approve
  const [activeRequest, setActiveRequest] = useState<CertificateRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const refreshList = () => {
    setRequests(storageService.getRequests());
  };

  const handleApproveConfirm = async () => {
    if (!activeRequest || !user) return;
    setIsProcessing(true);

    try {
      await certificateService.approveRequest(activeRequest.id, user.fullName);
      toast.success(`Request ${activeRequest.controlNumber} approved and cryptographically hashed!`);
      setActionType(null);
      setActiveRequest(null);
      refreshList();
    } catch (err) {
      console.error(err);
      toast.error('Failed to approve request.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!activeRequest || !user) return;
    if (!rejectionReason.trim()) {
      toast.error('Please specify a valid reason for rejection.');
      return;
    }
    setIsProcessing(true);

    try {
      await certificateService.rejectRequest(activeRequest.id, user.fullName, rejectionReason.trim());
      toast.success(`Request ${activeRequest.controlNumber} disapproved.`);
      setActionType(null);
      setActiveRequest(null);
      setRejectionReason('');
      refreshList();
    } catch (err) {
      console.error(err);
      toast.error('Failed to reject request.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPDF = async (certId?: string) => {
    if (!certId) return;
    const cert = storageService.findCertificateById(certId);
    if (!cert) return;
    toast.loading('Preparing official PDF with QR...', { id: 'admin-pdf' });
    try {
      await pdfService.downloadCertificatePDF(cert);
      toast.success('Downloaded!', { id: 'admin-pdf' });
    } catch (err) {
      toast.error('Download error.', { id: 'admin-pdf' });
    }
  };

  // Filter logic
  const filtered = requests.filter((r) => {
    const matchesSearch =
      r.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.controlNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.applicantPurok.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesType = typeFilter === 'all' || r.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div style={{ padding: '2rem 2.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
          Certificate Applications Queue
        </h1>
        <p style={{ fontSize: '0.88rem', color: '#64748B', marginTop: '4px' }}>
          Evaluate citizen requests, execute SHA-256 digital signing, and dispatch automatic SMS status updates.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '1.25rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search
            size={16}
            color="#94A3B8"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search by resident name, purok, or control no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '0.88rem',
            }}
          />
        </div>

        {/* Status Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={16} color="#64748B" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              fontSize: '0.88rem',
            }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Evaluation</option>
            <option value="approved">Approved & Signed</option>
            <option value="rejected">Disapproved</option>
          </select>
        </div>

        {/* Certificate Type */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #CBD5E1',
            background: '#FFFFFF',
            fontSize: '0.88rem',
          }}
        >
          <option value="all">All Types</option>
          <option value="clearance">Barangay Clearance</option>
          <option value="indigency">Certificate of Indigency</option>
          <option value="residency">Certificate of Residency</option>
        </select>
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
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Applicant Citizen</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Document Type</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Purpose</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Mobile / SMS</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Date Filed</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Status</th>
              <th style={{ padding: '14px 18px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '2.5rem', textAlign: 'center', color: '#94A3B8' }}>
                  No matching certificate requests found.
                </td>
              </tr>
            ) : (
              filtered.map((req) => (
                <tr
                  key={req.id}
                  style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                >
                  <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontWeight: 700, color: '#002664' }}>
                    {req.controlNumber}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>{req.applicantName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{req.applicantPurok}</div>
                  </td>
                  <td style={{ padding: '14px 18px', textTransform: 'uppercase', fontWeight: 600 }}>
                    {req.type === 'clearance' && 'Clearance'}
                    {req.type === 'indigency' && 'Indigency'}
                    {req.type === 'residency' && 'Residency'}
                  </td>
                  <td style={{ padding: '14px 18px', color: '#475569', maxWidth: '220px' }}>
                    {req.purpose}
                  </td>
                  <td style={{ padding: '14px 18px', color: '#0038A8', fontWeight: 600 }}>
                    {req.applicantPhone}
                  </td>
                  <td style={{ padding: '14px 18px', color: '#64748B' }}>
                    {new Date(req.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <StatusBadge status={req.status} />
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    {req.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => {
                            setActiveRequest(req);
                            setActionType('approve');
                          }}
                          className="btn-primary"
                          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                          title="Sign & Issue SHA-256 Certificate"
                        >
                          <CheckCircle size={14} />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveRequest(req);
                            setActionType('reject');
                          }}
                          className="btn-danger"
                          style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                          title="Disapprove Application"
                        >
                          <XCircle size={14} />
                        </button>
                      </div>
                    ) : req.status === 'approved' && req.certificateId ? (
                      <button
                        onClick={() => handleDownloadPDF(req.certificateId)}
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                      >
                        <Download size={14} />
                        <span>PDF</span>
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#DC2626' }}>
                        Disapproved
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Approval Confirmation Modal */}
      {actionType === 'approve' && activeRequest && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              padding: '2rem',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#047857', marginBottom: '1rem' }}>
              <ShieldCheck size={28} />
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#065F46' }}>Confirm Official Approval</h3>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.5', marginBottom: '1.25rem' }}>
              You are about to issue an official <strong>{activeRequest.type.toUpperCase()}</strong> to{' '}
              <strong>{activeRequest.applicantName}</strong>.
            </p>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.82rem' }}>
              <div>• Control Number: <strong>{activeRequest.controlNumber}</strong></div>
              <div>• SHA-256 Hash will be computed and pinned to the ledger</div>
              <div>• Automated SMS dispatched to: <strong>{activeRequest.applicantPhone}</strong></div>
              <div>• Signatory: <strong>{user?.fullName}</strong></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setActionType(null);
                  setActiveRequest(null);
                }}
                className="btn-secondary"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApproveConfirm}
                className="btn-primary"
                disabled={isProcessing}
              >
                {isProcessing ? 'Signing & Sending SMS...' : 'Confirm & Cryptographically Sign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {actionType === 'reject' && activeRequest && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              padding: '2rem',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#B91C1C', marginBottom: '1rem' }}>
              <XCircle size={28} />
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#991B1B' }}>Disapprove Application</h3>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.5', marginBottom: '1rem' }}>
              Please specify the official reason for disapproving <strong>{activeRequest.applicantName}</strong>'s request.
              This reason will be transmitted to their mobile via SMS.
            </p>

            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Incomplete residency documentation or non-matching purok record."
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.88rem',
                marginBottom: '1.5rem',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setActionType(null);
                  setActiveRequest(null);
                  setRejectionReason('');
                }}
                className="btn-secondary"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                className="btn-danger"
                disabled={isProcessing}
              >
                {isProcessing ? 'Recording...' : 'Confirm Disapproval & Notify via SMS'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
