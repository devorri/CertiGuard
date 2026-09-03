import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileCheck2, Users, Archive, BarChart3, MessageSquare, ShieldCheck } from 'lucide-react';
import barangayLogo from '../../assets/barangay-logo.png';

export const AdminSidebar: React.FC = () => {
  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { to: '/admin/requests', label: 'Certificate Requests', icon: FileCheck2 },
    { to: '/admin/records', label: 'Cryptographic Ledger', icon: Archive },
    { to: '/admin/residents', label: 'Resident Directory', icon: Users },
    { to: '/admin/sms', label: 'SMS Notification Logs', icon: MessageSquare },
    { to: '/admin/reports', label: 'Official Reports', icon: BarChart3 },
  ];

  return (
    <aside
      style={{
        width: '260px',
        background: '#FFFFFF',
        borderRight: '1px solid #E5E7EB',
        minHeight: 'calc(100vh - 75px)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 1rem',
      }}
    >
      {/* Official Seal & Header */}
      <div style={{ padding: '0 0.5rem 1.25rem', borderBottom: '1px solid #F1F5F9', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img
          src={barangayLogo}
          alt="Barangay Taguranao Seal"
          style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'contain' }}
        />
        <div>
          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>
            Taguranao Admin
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0066FF' }}>
            Executive Console
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '0.88rem',
                fontWeight: 600,
                color: isActive ? '#0066FF' : '#475569',
                background: isActive ? '#EFF6FF' : 'transparent',
                transition: 'all 0.15s ease',
              })}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Security notice widget */}
      <div
        style={{
          marginTop: 'auto',
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0066FF', fontWeight: 700, fontSize: '0.8rem' }}>
          <ShieldCheck size={16} />
          <span>SHA-256 Ledger Active</span>
        </div>
        <p style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '6px', lineHeight: '1.4' }}>
          All issued documents are deterministically signed with 256-bit SHA hashes.
        </p>
      </div>
    </aside>
  );
};
