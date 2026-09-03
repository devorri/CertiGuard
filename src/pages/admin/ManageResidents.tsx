import React, { useState } from 'react';
import { storageService } from '../../services/storageService';
import type { User } from '../../types';
import { Search, Phone, MapPin, Calendar, Mail } from 'lucide-react';

export const ManageResidents: React.FC = () => {
  const [residents] = useState<User[]>(() =>
    storageService.getUsers().filter((u) => u.role === 'resident')
  );
  const [searchQuery, setSearchQuery] = useState('');

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
          Census and registered citizen profiles for Barangay Taguranao certificate applicants.
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
                <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>
                  ✓ Bonafide Resident
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
          </div>
        ))}
      </div>
    </div>
  );
};
