import React, { useState } from 'react';
import { smsService } from '../../services/smsService';
import { storageService } from '../../services/storageService';
import type { SMSMessage } from '../../types';
import { Send, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export const SMSLogs: React.FC = () => {
  const [messages, setMessages] = useState<SMSMessage[]>(() => smsService.getAllMessages());
  const [searchQuery, setSearchQuery] = useState('');

  // Quick Dispatch Box
  const [customPhone, setCustomPhone] = useState('');
  const [customRecipient, setCustomRecipient] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  const refreshLogs = () => {
    setMessages(smsService.getAllMessages());
  };

  React.useEffect(() => {
    const unsub = storageService.onStorageSync(() => {
      refreshLogs();
    });
    storageService.syncFromSupabase().then(() => refreshLogs());
    return unsub;
  }, []);

  const handleSendCustomSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPhone || !customMessage) {
      toast.error('Please enter mobile number and message text.');
      return;
    }

    await smsService.sendSMS(
      customPhone,
      customRecipient || 'Citizen',
      'MANUAL-DISPATCH',
      customMessage,
      'status_update'
    );

    toast.success(`Dispatched SMS to ${customPhone}`);
    setCustomPhone('');
    setCustomRecipient('');
    setCustomMessage('');
    refreshLogs();
  };

  const filtered = messages.filter(
    (m) =>
      m.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.recipientPhone.includes(searchQuery) ||
      m.controlNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem 2.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
          SMS Notification Gateway Logs
        </h1>
        <p style={{ fontSize: '0.88rem', color: '#64748B', marginTop: '4px' }}>
          Real-time record of all status alerts dispatched to residents. Prepared for Semaphore API deployment.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        {/* Manual SMS Broadcast Card */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <Send size={18} color="#0038A8" />
            <h3 style={{ fontSize: '1rem', color: '#0F172A', margin: 0 }}>
              Manual Citizen SMS Broadcast / Notice
            </h3>
          </div>

          <form onSubmit={handleSendCustomSMS} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>Recipient Mobile Number</label>
              <input
                type="tel"
                required
                placeholder="09191234567"
                value={customPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>Recipient Name (Optional)</label>
              <input
                type="text"
                placeholder="Juan Miguel Bautista"
                value={customRecipient}
                onChange={(e) => setCustomRecipient(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>SMS Message Body</label>
              <textarea
                required
                rows={2}
                placeholder="CertiGuard Notice: Mangyaring sumadya sa Barangay Hall para sa..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <Send size={14} /> Send Real-Time SMS
            </button>
          </form>
        </div>

        {/* Semaphore Readiness Notice */}
        <div
          style={{
            background: 'linear-gradient(135deg, #001A4D 0%, #002664 100%)',
            borderRadius: '14px',
            color: '#FFFFFF',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: '#FCD116', fontWeight: 700, textTransform: 'uppercase' }}>
              TELECOMMUNICATION NODE
            </span>
            <h3 style={{ fontSize: '1.15rem', color: '#FFFFFF', marginTop: '4px' }}>
              Semaphore SMS Integration Ready
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#CBD5E1', lineHeight: '1.5', marginTop: '8px' }}>
              CertiGuard includes an abstracted communication architecture. Once the production Semaphore API key is
              configured, messages will immediately route via Philippine telcos (Globe, Smart, DITO) with zero code changes.
            </p>
          </div>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '10px',
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              color: '#FCD116',
            }}
          >
            ENDPOINT: https://api.semaphore.co/api/v4/messages<br />
            STATUS: Simulated Local Adapter (Active)
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          boxShadow: 'var(--shadow-sm)',
          overflowX: 'auto',
        }}
      >
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Search size={18} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search sent SMS messages by recipient or reference number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', border: 'none', fontSize: '0.9rem', outline: 'none' }}
          />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569' }}>
              <th style={{ padding: '12px 18px', fontWeight: 700 }}>Timestamp</th>
              <th style={{ padding: '12px 18px', fontWeight: 700 }}>Recipient</th>
              <th style={{ padding: '12px 18px', fontWeight: 700 }}>Phone</th>
              <th style={{ padding: '12px 18px', fontWeight: 700 }}>Control Ref</th>
              <th style={{ padding: '12px 18px', fontWeight: 700 }}>Message Content</th>
              <th style={{ padding: '12px 18px', fontWeight: 700 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: '#94A3B8' }}>
                  No SMS logs found.
                </td>
              </tr>
            ) : (
              filtered.map((msg) => (
                <tr key={msg.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 18px', color: '#64748B', fontSize: '0.78rem' }}>
                    {new Date(msg.timestamp).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 18px', fontWeight: 600, color: '#0F172A' }}>
                    {msg.recipientName}
                  </td>
                  <td style={{ padding: '12px 18px', color: '#0038A8', fontFamily: 'monospace' }}>
                    {msg.recipientPhone}
                  </td>
                  <td style={{ padding: '12px 18px', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                    {msg.controlNumber}
                  </td>
                  <td style={{ padding: '12px 18px', color: '#334155', maxWidth: '350px' }}>
                    {msg.message}
                  </td>
                  <td style={{ padding: '12px 18px' }}>
                    <span style={{ color: '#059669', fontWeight: 600, fontSize: '0.78rem' }}>
                      ✓ Delivered
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
