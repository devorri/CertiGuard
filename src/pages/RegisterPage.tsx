import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, MapPin, Mail, Lock, Calendar, Upload, FileImage } from 'lucide-react';
import { storageService } from '../services/storageService';
import { uploadValidIdImage } from '../services/supabaseClient';
import barangayLogo from '../assets/barangay-logo.png';
import toast from 'react-hot-toast';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

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
  const [validId, setValidId] = useState<File | null>(null);

  const purokList = [
    'Purok 1 (Centro)',
    'Purok 2 (Silangan)',
    'Purok 3 (Mabini)',
    'Purok 4 (Pag-asa)',
    'Purok 5 (Riverside)',
    'Purok 6 (Maharlika)',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreedToPrivacy) {
      toast.error('Please agree to the Data Privacy Act terms to register.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (!validId) {
      toast.error('Please upload a dummy valid ID image for Secretary review.');
      return;
    }

    // Check existing
    const existing = (await storageService.findUserByEmailAsync(formData.email)) || storageService.findUserByEmail(formData.email);
    if (existing) {
      toast.error('An account already exists with this email in the database.');
      return;
    }

    const previewUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Unable to read the ID image.'));
      reader.readAsDataURL(validId);
    });

    const userId = `user-${Date.now()}`;
    // Attempt cloud upload to Supabase Storage 'Files' bucket
    const uploadedCloud = await uploadValidIdImage(validId, userId);

    const newUser = {
      id: userId,
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
      verificationStatus: 'pending' as const,
      validId: {
        fileName: validId.name,
        mimeType: validId.type,
        storagePath: uploadedCloud?.storagePath || `resident-valid-ids/${Date.now()}-${validId.name}`,
        previewUrl: uploadedCloud?.publicUrl || previewUrl,
        uploadedAt: new Date().toISOString(),
      },
    };

    await storageService.addUserAsync(newUser);
    toast.success('Registration submitted to Supabase! Please wait for the Barangay Secretary to verify your ID.');
    navigate('/login');
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

          <div style={{ marginTop: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Upload Valid ID for Verification
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', border: '1px dashed #93C5FD', borderRadius: '8px', background: '#EFF6FF', cursor: 'pointer', color: '#1D4ED8' }}>
              {validId ? <FileImage size={18} /> : <Upload size={18} />}
              <span style={{ fontSize: '0.84rem' }}>{validId ? validId.name : 'Choose a dummy ID image (JPG, PNG, or WEBP; max 2 MB)'}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                required
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  if (file && file.size > 2 * 1024 * 1024) {
                    toast.error('Use an image smaller than 2 MB for the prototype.');
                    e.currentTarget.value = '';
                    setValidId(null);
                    return;
                  }
                  setValidId(file);
                }}
                style={{ display: 'none' }}
              />
            </label>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
              <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748B', lineHeight: 1.45, flex: 1, minWidth: '240px' }}>
                For academic testing, upload a dummy ID only. It is visible only to authorized staff for residency verification and never appears on a certificate.
              </p>
              <button
                type="button"
                onClick={() => {
                  const svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
                    <rect width="600" height="380" rx="16" fill="#1E293B"/>
                    <rect x="20" y="20" width="560" height="340" rx="12" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2"/>
                    <rect x="20" y="20" width="560" height="70" rx="12" fill="#0038A8"/>
                    <circle cx="60" cy="55" r="22" fill="#CE1126"/>
                    <text x="95" y="48" fill="#FFFFFF" font-family="sans-serif" font-size="18" font-weight="bold">REPUBLIC OF THE PHILIPPINES</text>
                    <text x="95" y="68" fill="#FCD34D" font-family="sans-serif" font-size="13" font-weight="bold">BARANGAY TAGURANAO RESIDENT ID (DUMMY DEMO)</text>
                    <rect x="40" y="110" width="130" height="160" rx="8" fill="#E2E8F0" stroke="#94A3B8"/>
                    <circle cx="105" cy="160" r="35" fill="#94A3B8"/>
                    <path d="M65,240 C65,200 145,200 145,240 Z" fill="#94A3B8"/>
                    <text x="190" y="130" fill="#64748B" font-family="sans-serif" font-size="12">FULL NAME / PANGALAN</text>
                    <text x="190" y="152" fill="#0F172A" font-family="sans-serif" font-size="16" font-weight="bold">${formData.fullName || 'TEST CITIZEN'}</text>
                    <text x="190" y="185" fill="#64748B" font-family="sans-serif" font-size="12">ID NUMBER / CONTROL NO.</text>
                    <text x="190" y="207" fill="#0038A8" font-family="sans-serif" font-size="15" font-weight="bold">TEST-ID-2026-DEMO</text>
                    <text x="190" y="240" fill="#64748B" font-family="sans-serif" font-size="12">VERIFICATION STATUS</text>
                    <text x="190" y="262" fill="#059669" font-family="sans-serif" font-size="14" font-weight="bold">OFFICIAL ACADEMIC DEMO ID</text>
                    <rect x="40" y="295" width="520" height="45" rx="6" fill="#EFF6FF" stroke="#BFDBFE"/>
                    <text x="50" y="322" fill="#1E40AF" font-family="sans-serif" font-size="11">NOTICE: Dummy photo ID strictly generated for system prototype residency verification testing.</text>
                  </svg>`;
                  const blob = new Blob([svgData], { type: 'image/svg+xml' });
                  const testFile = new File([blob], 'dummy_resident_id_sample.svg', { type: 'image/svg+xml' });
                  setValidId(testFile);
                  toast.success('Attached sample dummy ID card for testing!');
                }}
                style={{
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  color: '#0F172A',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                ⚡ Use Sample Dummy ID
              </button>
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
