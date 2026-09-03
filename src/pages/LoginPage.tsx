import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import barangayLogo from '../assets/barangay-logo.png';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleTab, setRoleTab] = useState<'resident' | 'admin'>('resident');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const user = storageService.findUserByEmail(email);

      if (!user) {
        toast.error('Account not found with this email address.');
        setLoading(false);
        return;
      }

      if (roleTab === 'admin' && user.role !== 'admin' && user.role !== 'staff') {
        toast.error('Access Denied: Account is not authorized as administrative staff.');
        setLoading(false);
        return;
      }

      login(user);
      toast.success(`Welcome back, ${user.fullName}!`);
      setLoading(false);

      if (user.role === 'admin' || user.role === 'staff') {
        navigate('/admin/dashboard');
      } else {
        navigate('/resident/dashboard');
      }
    }, 400);
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 150px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1rem',
        background: '#F8FAFC',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.06)',
          overflow: 'hidden',
        }}
      >
        {/* Top Header Banner */}
        <div
          style={{
            background: '#FFFFFF',
            padding: '2.5rem 1.5rem 1.75rem',
            textAlign: 'center',
            borderBottom: '1px solid #F1F5F9',
          }}
        >
          <img
            src={barangayLogo}
            alt="Barangay Taguranao Official Seal"
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              margin: '0 auto 14px',
              display: 'block',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
            }}
          />
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Sign In to <span style={{ color: '#0066FF' }}>CertiGuard</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '6px' }}>
            Barangay Taguranao Digital Document Portal
          </p>
        </div>

        {/* Resident / Admin Switcher Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            borderBottom: '1px solid #E2E8F0',
            background: '#F8FAFC',
          }}
        >
          <button
            type="button"
            onClick={() => setRoleTab('resident')}
            style={{
              padding: '13px',
              fontSize: '0.9rem',
              fontWeight: 700,
              background: roleTab === 'resident' ? '#FFFFFF' : 'transparent',
              color: roleTab === 'resident' ? '#0066FF' : '#64748B',
              borderBottom: roleTab === 'resident' ? '3px solid #0066FF' : '3px solid transparent',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
            }}
          >
            Resident Portal
          </button>
          <button
            type="button"
            onClick={() => setRoleTab('admin')}
            style={{
              padding: '13px',
              fontSize: '0.9rem',
              fontWeight: 700,
              background: roleTab === 'admin' ? '#FFFFFF' : 'transparent',
              color: roleTab === 'admin' ? '#0066FF' : '#64748B',
              borderBottom: roleTab === 'admin' ? '3px solid #0066FF' : '3px solid transparent',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
            }}
          >
            Barangay Staff / Admin
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ padding: '2rem 1.75rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                color="#94A3B8"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={roleTab === 'resident' ? 'juan.bautista@example.com' : 'admin@taguranao.gov.ph'}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.9rem',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                color="#94A3B8"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.9rem',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={roleTab === 'admin' ? 'btn-danger' : 'btn-primary'}
            style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
          >
            <span>{loading ? 'Authenticating...' : `Enter ${roleTab === 'admin' ? 'Staff Console' : 'Resident Portal'}`}</span>
            <ArrowRight size={18} />
          </button>

          {/* Prototype Demo Switchers */}
          <div
            style={{
              marginTop: '1.75rem',
              padding: '1rem',
              background: '#F8FAFC',
              borderRadius: '10px',
              border: '1px dashed #CBD5E1',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
              <UserCheck size={14} color="#0038A8" />
              <span>TEST SIMULATED ACCOUNTS (1-CLICK FILL):</span>
            </div>

            {roleTab === 'resident' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('juan.bautista@example.com')}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    textAlign: 'left',
                    fontSize: '0.78rem',
                    color: '#334155',
                  }}
                >
                  👤 <strong>Juan Miguel Bautista</strong> (Active Resident)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('clarissa.gomez@example.com')}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    textAlign: 'left',
                    fontSize: '0.78rem',
                    color: '#334155',
                  }}
                >
                  👤 <strong>Clarissa Marie Gomez</strong> (Indigent Resident)
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@taguranao.gov.ph')}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    textAlign: 'left',
                    fontSize: '0.78rem',
                    color: '#334155',
                  }}
                >
                  🛡️ <strong>Hon. Roberto Dela Cruz</strong> (Punong Barangay)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('staff@taguranao.gov.ph')}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    textAlign: 'left',
                    fontSize: '0.78rem',
                    color: '#334155',
                  }}
                >
                  📋 <strong>Maria Elena Santos</strong> (Barangay Secretary)
                </button>
              </div>
            )}
          </div>

          <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.82rem', color: '#64748B' }}>
            Don't have a resident profile yet?{' '}
            <Link to="/register" style={{ fontWeight: 700, color: '#0038A8' }}>
              Register Here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
