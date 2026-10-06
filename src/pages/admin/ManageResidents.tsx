import React, { useState } from 'react';
import { storageService } from '../../services/storageService';
import type { User } from '../../types';
import { Search, Phone, MapPin, Calendar, Mail, Image, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const ManageResidents: React.FC = () => {
  const { user } = useAuth();
  const [residents, setResidents] = useState<User[]>(() =>
    storageService.getUsers().filter((u) => u.role === 'resident')
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResident, setSelectedResident] = useState<User | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  const refreshResidents = () => setResidents(storageService.getUsers().filter((u) => u.role === 'resident'));

  React.useEffect(() => {
    const unsub = storageService.onStorageSync(() => {
      refreshResidents();
    });
    storageService.syncFromSupabase().then(() => refreshResidents());
    return unsub;
  }, []);

  const reviewResident = async (status: 'approved' | 'rejected') => {
    if (!selectedResident || !user) return;
    await storageService.updateUserAsync(selectedResident.id, {
      verificationStatus: status,
      verifiedBy: user.fullName,
      verifiedAt: new Date().toISOString(),
      verificationNote: reviewNote.trim() || undefined,
    });
    toast.success(status === 'approved' ? 'Resident ID verified and registration approved.' : 'Registration marked as not approved.');
    setSelectedResident(null);
    setReviewNote('');
    refreshResidents();
  };

  const filtered = residents.filter(
    (r) =>
      r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.purok.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.includes(searchQuery)
  );

  return (
    <div style={{ padding: '2rem 2.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
          Barangay Resident Registry
        </h1>
        <p style={{ fontSize: '0.88rem', color: '#64748B', marginTop: '4px' }}>
          Review resident profiles and submitted valid IDs before approving access to certificate services.
        </p>
      </div>

      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '1rem 1.25rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <Search size={18} color="#94A3B8" />
        <input
          type="text"
          placeholder="Search by resident name, purok, or phone number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', border: 'none', fontSize: '0.9rem', outline: 'none' }}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {filtered.map((res) => (
          <div
            key={res.id}
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'rgba(0, 56, 168, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  color: '#0038A8',
                }}
              >
                {res.fullName.charAt(0)}
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', color: '#0F172A', margin: 0 }}>{res.fullName}</h3>
                <span style={{ fontSize: '0.75rem', color: res.verificationStatus === 'approved' ? '#10B981' : res.verificationStatus === 'rejected' ? '#DC2626' : '#D97706', fontWeight: 600 }}>
                  {res.verificationStatus === 'approved' ? '✓ Verified Resident' : res.verificationStatus === 'rejected' ? '✕ Registration Not Approved' : '● ID Verification Pending'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: '#475569' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={14} color="#64748B" />
                <span>{res.purok}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} color="#64748B" />
                <span style={{ fontFamily: 'monospace' }}>{res.phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={14} color="#64748B" />
                <span>{res.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={14} color="#64748B" />
                <span>DOB: {res.birthDate || 'Not specified'}</span>
              </div>
            </div>

            <div
              style={{
                marginTop: '1rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid #F1F5F9',
                fontSize: '0.75rem',
                color: '#94A3B8',
              }}
            >
              Address: {res.address}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
              {res.validId ? (
                <button type="button" className="btn-secondary" onClick={() => setSelectedResident(res)} style={{ padding: '7px 10px', fontSize: '0.76rem' }}>
                  <Image size={14} /> Review Valid ID
                </button>
              ) : (
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>No ID file attached</span>
              )}
              {res.verifiedBy && <span style={{ fontSize: '0.72rem', color: '#64748B', alignSelf: 'center' }}>Reviewed by {res.verifiedBy}</span>}
            </div>
          </div>
        ))}
      </div>

      {selectedResident && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, padding: '1rem', background: 'rgba(15, 23, 42, 0.58)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#FFF', borderRadius: '16px', width: '100%', maxWidth: '680px', maxHeight: '92vh', overflowY: 'auto', padding: '1.5rem' }}>
            <h2 style={{ margin: 0, color: '#0F172A', fontSize: '1.2rem' }}>Resident ID Verification</h2>
            <p style={{ color: '#64748B', fontSize: '0.84rem', marginTop: '6px' }}>Review the submitted valid ID for {selectedResident.fullName}.</p>
            {selectedResident.validId && <img src={selectedResident.validId.previewUrl} alt={`Valid ID uploaded by ${selectedResident.fullName}`} style={{ display: 'block', width: '100%', maxHeight: '360px', objectFit: 'contain', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC' }} />}
            <textarea value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} rows={3} placeholder="Optional verification note" style={{ marginTop: '1rem', width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1rem', flexWrap: 'wrap' }}>
              <button type="button" className="btn-secondary" onClick={() => { setSelectedResident(null); setReviewNote(''); }}>Close</button>
              <button type="button" className="btn-danger" onClick={() => reviewResident('rejected')}><XCircle size={16} /> Reject</button>
              <button type="button" className="btn-primary" onClick={() => reviewResident('approved')}><CheckCircle size={16} /> Approve Resident</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
