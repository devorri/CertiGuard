import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  CreditCard,
  Building2,
  CheckCircle2,
  Loader2,
  Shield,
  Receipt,
} from 'lucide-react';

export type PaymentMethod = 'gcash' | 'maya' | 'bank_transfer' | 'cash';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: (method: PaymentMethod, refNumber: string) => void;
  amount: number;
  certificateType: string;
  applicantName: string;
}

const generateRefNumber = (): string => {
  const prefix = 'CG';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `${prefix}${timestamp}${random}`;
};

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentComplete,
  amount,
  certificateType,
  applicantName,
}) => {
  const [step, setStep] = useState<'select' | 'confirm' | 'processing' | 'success'>('select');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [refNumber, setRefNumber] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setStep('select');
      setSelectedMethod(null);
      setRefNumber('');
      setProgress(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (step === 'processing') {
      const ref = generateRefNumber();
      setRefNumber(ref);
      setProgress(0);

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStep('success'), 400);
            return 100;
          }
          return prev + Math.random() * 15 + 5;
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [step]);

  if (!isOpen) return null;

  const isFree = amount === 0;

  const paymentMethods = [
    {
      id: 'gcash' as PaymentMethod,
      name: 'GCash',
      icon: <Smartphone size={24} />,
      color: '#007DFE',
      bgColor: 'rgba(0, 125, 254, 0.08)',
      description: 'Pay via GCash e-wallet',
      logo: '🔵',
    },
    {
      id: 'maya' as PaymentMethod,
      name: 'Maya',
      icon: <CreditCard size={24} />,
      color: '#00B96B',
      bgColor: 'rgba(0, 185, 107, 0.08)',
      description: 'Pay via Maya e-wallet',
      logo: '🟢',
    },
    {
      id: 'bank_transfer' as PaymentMethod,
      name: 'Bank Transfer',
      icon: <Building2 size={24} />,
      color: '#8B5CF6',
      bgColor: 'rgba(139, 92, 246, 0.08)',
      description: 'Online Banking (BPI, BDO, etc.)',
      logo: '🟣',
    },
    {
      id: 'cash' as PaymentMethod,
      name: 'Pay at Barangay Hall',
      icon: <Receipt size={24} />,
      color: '#D97706',
      bgColor: 'rgba(217, 119, 6, 0.08)',
      description: 'Walk-in cash payment',
      logo: '🟡',
    },
  ];

  const getMethodColor = () => {
    const m = paymentMethods.find((pm) => pm.id === selectedMethod);
    return m?.color || '#0066FF';
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '1rem',
        animation: 'fadeIn 0.25s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && step !== 'processing') onClose();
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          maxWidth: '480px',
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          animation: 'slideUp 0.3s ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: step === 'success'
              ? 'linear-gradient(135deg, #059669, #10B981)'
              : 'linear-gradient(135deg, #0038A8, #0066FF)',
            padding: '1.5rem 1.75rem',
            color: '#FFFFFF',
            position: 'relative',
          }}
        >
          {step !== 'processing' && step !== 'success' && (
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#FFFFFF',
              }}
            >
              <X size={18} />
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            {step === 'success' ? <CheckCircle2 size={24} /> : <Shield size={24} />}
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
              {step === 'select' && 'Select Payment Method'}
              {step === 'confirm' && 'Confirm Payment'}
              {step === 'processing' && 'Processing Payment...'}
              {step === 'success' && 'Payment Successful!'}
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.85 }}>
            {step === 'success'
              ? 'Your transaction has been recorded'
              : 'Secure payment for barangay certificate services'}
          </p>
        </div>

        {/* Order Summary — always visible */}
        <div
          style={{
            margin: '1.25rem 1.75rem 0',
            background: '#F8FAFC',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            border: '1px solid #E2E8F0',
          }}
        >
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
            Order Summary
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.85rem', color: '#334155' }}>
              Barangay {certificateType.charAt(0).toUpperCase() + certificateType.slice(1)}
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
              {isFree ? 'FREE' : `₱${amount.toFixed(2)}`}
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
            Applicant: {applicantName}
          </div>
          {isFree && (
            <div
              style={{
                marginTop: '8px',
                padding: '6px 10px',
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: '6px',
                fontSize: '0.75rem',
                color: '#059669',
                fontWeight: 600,
              }}
            >
              ✓ Indigency certificates are exempted from fees
            </div>
          )}
        </div>

        <div style={{ padding: '1.25rem 1.75rem 1.75rem' }}>
          {/* STEP: Select Payment Method */}
          {step === 'select' && (
            <>
              {isFree ? (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <div style={{ fontSize: '0.9rem', color: '#334155', marginBottom: '1.25rem' }}>
                    No payment required. Proceed to submit your application.
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMethod('cash');
                      setStep('processing');
                    }}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '12px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #059669, #10B981)',
                      color: '#FFFFFF',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <CheckCircle2 size={20} />
                    Submit Application (No Fee)
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => {
                        setSelectedMethod(method.id);
                        setStep('confirm');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        border: '1.5px solid #E2E8F0',
                        background: '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = method.color;
                        e.currentTarget.style.background = method.bgColor;
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#E2E8F0';
                        e.currentTarget.style.background = '#FFFFFF';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '12px',
                          background: method.bgColor,
                          color: method.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {method.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A' }}>
                          {method.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          {method.description}
                        </div>
                      </div>
                      <div style={{ color: '#94A3B8', fontSize: '1.1rem' }}>›</div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* STEP: Confirm Payment */}
          {step === 'confirm' && selectedMethod && (
            <div>
              <div
                style={{
                  background: '#F8FAFC',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  border: '1px solid #E2E8F0',
                  marginBottom: '1.25rem',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '4px' }}>
                  Amount to Pay
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: getMethodColor() }}>
                  ₱{amount.toFixed(2)}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '4px' }}>
                  via {paymentMethods.find((m) => m.id === selectedMethod)?.name}
                </div>
              </div>

              {/* Simulated Payment Details */}
              {(selectedMethod === 'gcash' || selectedMethod === 'maya') && (
                <div
                  style={{
                    padding: '1rem',
                    background: selectedMethod === 'gcash' ? 'rgba(0, 125, 254, 0.04)' : 'rgba(0, 185, 107, 0.04)',
                    borderRadius: '10px',
                    border: `1px solid ${selectedMethod === 'gcash' ? 'rgba(0,125,254,0.15)' : 'rgba(0,185,107,0.15)'}`,
                    marginBottom: '1.25rem',
                    fontSize: '0.82rem',
                  }}
                >
                  <div style={{ fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                    {selectedMethod === 'gcash' ? 'GCash' : 'Maya'} Payment Details
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#64748B' }}>Merchant:</span>
                    <span style={{ fontWeight: 600, color: '#0F172A' }}>BRGY TAGURANAO E-SERVICES</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#64748B' }}>Account No:</span>
                    <span style={{ fontWeight: 600, color: '#0F172A', fontFamily: 'monospace' }}>0917-***-8832</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Service:</span>
                    <span style={{ fontWeight: 600, color: '#0F172A' }}>Certificate Fee</span>
                  </div>
                </div>
              )}

              {selectedMethod === 'bank_transfer' && (
                <div
                  style={{
                    padding: '1rem',
                    background: 'rgba(139, 92, 246, 0.04)',
                    borderRadius: '10px',
                    border: '1px solid rgba(139, 92, 246, 0.15)',
                    marginBottom: '1.25rem',
                    fontSize: '0.82rem',
                  }}
                >
                  <div style={{ fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                    Bank Transfer Details
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#64748B' }}>Bank:</span>
                    <span style={{ fontWeight: 600, color: '#0F172A' }}>Land Bank of the Philippines</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#64748B' }}>Account Name:</span>
                    <span style={{ fontWeight: 600, color: '#0F172A' }}>Barangay Taguranao Fund</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Account No:</span>
                    <span style={{ fontWeight: 600, color: '#0F172A', fontFamily: 'monospace' }}>3456-7890-12</span>
                  </div>
                </div>
              )}

              {selectedMethod === 'cash' && (
                <div
                  style={{
                    padding: '1rem',
                    background: 'rgba(217, 119, 6, 0.06)',
                    borderRadius: '10px',
                    border: '1px solid rgba(217, 119, 6, 0.15)',
                    marginBottom: '1.25rem',
                    fontSize: '0.82rem',
                    color: '#92400E',
                    lineHeight: '1.5',
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>Cash Payment</div>
                  Please proceed to the <strong>Barangay Taguranao Hall</strong> and pay ₱{amount.toFixed(2)} at the cashier window.
                  An official receipt (OR) will be issued upon payment.
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    setStep('select');
                    setSelectedMethod(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                  }}
                >
                  Back
                </button>
                <button
                  onClick={() => setStep('processing')}
                  style={{
                    flex: 2,
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: `linear-gradient(135deg, ${getMethodColor()}, ${getMethodColor()}CC)`,
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <Shield size={18} />
                  {selectedMethod === 'cash' ? 'Confirm Walk-in Payment' : 'Pay ₱' + amount.toFixed(2)}
                </button>
              </div>
            </div>
          )}

          {/* STEP: Processing */}
          {step === 'processing' && (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  margin: '0 auto 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'spin 1s linear infinite',
                }}
              >
                <Loader2 size={48} color={getMethodColor()} />
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                {isFree ? 'Submitting Application...' : 'Processing Payment...'}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '1.25rem' }}>
                {isFree
                  ? 'Recording your application in the system'
                  : `Connecting to ${paymentMethods.find((m) => m.id === selectedMethod)?.name || 'payment gateway'}...`}
              </div>

              {/* Progress Bar */}
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  background: '#E2E8F0',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${Math.min(progress, 100)}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${getMethodColor()}, ${getMethodColor()}AA)`,
                    borderRadius: '3px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '8px' }}>
                Please do not close this window
              </div>
            </div>
          )}

          {/* STEP: Success */}
          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  animation: 'scaleIn 0.3s ease',
                }}
              >
                <CheckCircle2 size={40} color="#059669" />
              </div>

              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#065F46', marginBottom: '4px' }}>
                {isFree ? 'Application Submitted!' : 'Payment Confirmed!'}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '1.25rem' }}>
                {isFree
                  ? 'Your application has been submitted for review'
                  : 'Your payment has been received and recorded'}
              </div>

              {/* Receipt Card */}
              <div
                style={{
                  background: '#F8FAFC',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                  border: '1px dashed #CBD5E1',
                  textAlign: 'left',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '10px' }}>
                  {isFree ? 'Submission Receipt' : 'Payment Receipt'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.82rem' }}>
                  <span style={{ color: '#64748B' }}>Reference No:</span>
                  <span style={{ fontWeight: 700, color: '#0F172A', fontFamily: 'monospace' }}>{refNumber}</span>
                </div>
                {!isFree && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.82rem' }}>
                      <span style={{ color: '#64748B' }}>Method:</span>
                      <span style={{ fontWeight: 600, color: '#0F172A' }}>
                        {paymentMethods.find((m) => m.id === selectedMethod)?.name}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.82rem' }}>
                      <span style={{ color: '#64748B' }}>Amount Paid:</span>
                      <span style={{ fontWeight: 700, color: '#059669' }}>₱{amount.toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.82rem' }}>
                  <span style={{ color: '#64748B' }}>Date:</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: '#64748B' }}>Status:</span>
                  <span style={{ fontWeight: 700, color: '#059669' }}>✓ {isFree ? 'SUBMITTED' : 'PAID'}</span>
                </div>
              </div>

              <button
                onClick={() => onPaymentComplete(selectedMethod || 'cash', refNumber)}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #059669, #10B981)',
                  color: '#FFFFFF',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <CheckCircle2 size={20} />
                Continue to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes scaleIn {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
