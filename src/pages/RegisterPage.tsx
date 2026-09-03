import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, MapPin, Mail, Lock, Calendar } from 'lucide-react';
import { storageService } from '../services/storageService';
import { useAuth } from '../context/AuthContext';
import barangayLogo from '../assets/barangay-logo.png';
import toast from 'react-hot-toast';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    purok: 'Purok 1 (Centro)',
    civilStatus: 'Single' as const,
    birthDate: '',
    password: '',
    confirmPassword: '',
    agreedToPrivacy: false,
  });

  const purokList = [
    'Purok 1 (Centro)',
    'Purok 2 (Silangan)',
    'Purok 3 (Mabini)',
    'Purok 4 (Pag-asa)',
    'Purok 5 (Riverside)',
    'Purok 6 (Maharlika)',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreedToPrivacy) {
      toast.error('Please agree to the Data Privacy Act terms to register.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    // Check existing
    const existing = storageService.findUserByEmail(formData.email);
    if (existing) {
      toast.error('An account already exists with this email.');
      return;
    }

    const newUser = {
      id: `user-${Date.now()}`,
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      purok: formData.purok,
      civilStatus: formData.civilStatus,
      birthDate: formData.birthDate,
      role: 'resident' as const,
      password: formData.password,
      createdAt: new Date().toISOString(),
    };

    storageService.addUser(newUser);
    login(newUser);

    toast.success('Registration successful! Welcome to Barangay Taguranao CertiGuard.');
    navigate('/resident/dashboard');
  };

  return (
    <div style={{ maxWidth: '720px', margin: '3rem auto', padding: '0 1rem' }}>
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
              margin: '0 auto 12px',
              display: 'block',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
            }}
          />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Citizen Profile Registration
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748B', marginTop: '6px' }}>
            Barangay Taguranao Resident Census & Document Issuance Portal
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {/* Full Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Full Legal Name (First, Middle, Last, Suffix)
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Juan Miguel S. Bautista"
                  style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="juan@example.com"
                  style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                />
              </div>
            </div>

            {/* Phone for SMS Notifications */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Mobile Number (For SMS Gateway Alerts)
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="09191234567"
                  style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                />
              </div>
            </div>

            {/* Purok Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Barangay Purok / Zone
              </label>
              <select
                value={formData.purok}
                onChange={(e) => setFormData({ ...formData, purok: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF' }}
              >
                {purokList.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Birth Date */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Date of Birth
              </label>
              <div style={{ position: 'relative' }}>
                <Calendar size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="date"
                  required
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                />
              </div>
            </div>

            {/* Civil Status */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Civil Status
              </label>
              <select
                value={formData.civilStatus}
                onChange={(e) => setFormData({ ...formData, civilStatus: e.target.value as any })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF' }}
              >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Separated">Separated</option>
              </select>
            </div>
          </div>

          {/* Detailed Street Address */}
          <div style={{ marginTop: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Specific Residential Address (House / Block / Lot / Street)
            </label>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <textarea
                required
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. Block 4 Lot 12 Sunrise Subdivision, Taguranao"
                style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
              />
            </div>
          </div>

          {/* Passwords */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                />
              </div>
            </div>
          </div>

          {/* Data Privacy Agreement (RA 10173) */}
          <div
            style={{
              marginTop: '1.75rem',
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '10px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <input
              type="checkbox"
              id="privacy"
              checked={formData.agreedToPrivacy}
              onChange={(e) => setFormData({ ...formData, agreedToPrivacy: e.target.checked })}
              style={{ marginTop: '3px', width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="privacy" style={{ fontSize: '0.8rem', color: '#166534', lineHeight: '1.5', cursor: 'pointer' }}>
              <strong>Compliance with Data Privacy Act of 2012 (R.A. 10173):</strong> I hereby consent that my personal
              information provided will be used exclusively by Barangay Taguranao for official certificate processing,
              ledger verification, and automated transaction SMS alerts.
            </label>
          </div>

          <button
            type="submit"
            className="btn-gold"
            style={{ width: '100%', padding: '14px', marginTop: '1.75rem', fontSize: '1rem' }}
          >
            Complete Registration & Access Portal
          </button>

          <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: '#64748B' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#0038A8', fontWeight: 700 }}>
              Sign In Here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
