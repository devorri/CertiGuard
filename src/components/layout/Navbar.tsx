import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User as UserIcon, LogOut, Menu, X, CheckCircle, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import barangayLogo from '../../assets/barangay-logo.png';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
      {/* Subtle Government Top Strip */}
      <div
        style={{
          background: '#F8FAFC',
          borderBottom: '1px solid #F1F5F9',
          padding: '4px 1.5rem',
          fontSize: '0.75rem',
          color: '#64748B',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#0066FF' }} />
          <span>Republic of the Philippines • Barangay Taguranao Digital eServices</span>
        </div>
        <div style={{ display: 'none', gap: '16px' }} className="desktop-top-strip">
          <span>Data Privacy Compliant (RA 10173)</span>
          <span style={{ color: '#CBD5E1' }}>|</span>
          <Link to="/verify" style={{ color: '#0066FF', fontWeight: 600, textDecoration: 'none' }}>
            Verify Document
          </Link>
        </div>
      </div>

      {/* Main Clean Navbar */}
      <nav
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0.85rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo eGov.ph inspired */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <img
            src={barangayLogo}
            alt="Barangay Taguranao Official Seal"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              objectFit: 'contain',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0066FF', letterSpacing: '-0.02em' }}>
              Certi<span style={{ color: '#0F172A' }}>Guard</span>
            </span>
            <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, background: '#F1F5F9', border: '1px solid #E2E8F0', padding: '2px 8px', borderRadius: '6px' }}>
              Barangay Taguranao
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div style={{ display: 'none', alignItems: 'center', gap: '28px' }} className="desktop-nav">
          <a href="/#features" className="egov-nav-link">
            Features
          </a>
          <a href="/#how-it-works" className="egov-nav-link">
            How It Works
          </a>
          <a href="/#security" className="egov-nav-link">
            Security
          </a>
          <a href="/#services" className="egov-nav-link">
            Services
          </a>
          <Link to="/verify" className="egov-nav-link" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <CheckCircle size={14} color="#0066FF" />
            Verify
          </Link>
          <a href="/#faq" className="egov-nav-link">
            FAQ
          </a>
        </div>

        {/* Desktop CTA Action Button */}
        <div style={{ display: 'none', alignItems: 'center', gap: '12px' }} className="desktop-actions">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                style={{
                  color: '#374151',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  padding: '8px 14px',
                  textDecoration: 'none',
                }}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn-primary"
                style={{
                  background: '#0066FF',
                  color: '#FFFFFF',
                  borderRadius: '9999px',
                  padding: '9px 22px',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(0, 102, 255, 0.28)',
                }}
              >
                Get Started
              </Link>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Link
                to={isAdmin ? '/admin/dashboard' : '/resident/dashboard'}
                style={{
                  color: '#0066FF',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  textDecoration: 'none',
                  background: '#EFF6FF',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                }}
              >
                <FileText size={15} />
                {isAdmin ? 'Admin Portal' : 'My Requests'}
              </Link>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#F8FAFC',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#0066FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <UserIcon size={14} color="#FFFFFF" />
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1E293B' }}>
                  {user?.fullName?.split(' ')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  style={{
                    background: 'transparent',
                    color: '#EF4444',
                    padding: '2px',
                    marginLeft: '4px',
                    cursor: 'pointer',
                  }}
                >
                  <LogOut size={15} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Nav Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'flex',
            background: 'transparent',
            color: '#1E293B',
            padding: '6px',
          }}
          className="mobile-nav-toggle"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            background: '#FFFFFF',
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid #F1F5F9',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <a
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: '#374151', fontWeight: 500, padding: '6px 0', textDecoration: 'none' }}
          >
            Features
          </a>
          <a
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: '#374151', fontWeight: 500, padding: '6px 0', textDecoration: 'none' }}
          >
            How It Works
          </a>
          <a
            href="/#security"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: '#374151', fontWeight: 500, padding: '6px 0', textDecoration: 'none' }}
          >
            Security
          </a>
          <a
            href="/#services"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: '#374151', fontWeight: 500, padding: '6px 0', textDecoration: 'none' }}
          >
            Services
          </a>
          <Link
            to="/verify"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: '#0066FF', fontWeight: 600, padding: '6px 0', textDecoration: 'none' }}
          >
            🔍 Verify Document
          </Link>

          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '10px', marginTop: '4px' }}>
            {!isAuthenticated ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary"
                  style={{ textAlign: 'center', width: '100%', textDecoration: 'none' }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary"
                  style={{ textAlign: 'center', width: '100%', textDecoration: 'none' }}
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link
                  to={isAdmin ? '/admin/dashboard' : '/resident/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary"
                  style={{ textAlign: 'center', width: '100%', textDecoration: 'none' }}
                >
                  {isAdmin ? 'Go to Admin Console' : 'Go to Resident Portal'}
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="btn-secondary"
                  style={{ width: '100%', color: '#EF4444' }}
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Responsive Breakpoints */}
      <style>{`
        @media (min-width: 840px) {
          .desktop-top-strip { display: flex !important; }
          .desktop-nav { display: flex !important; }
          .desktop-actions { display: flex !important; }
          .mobile-nav-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
};
