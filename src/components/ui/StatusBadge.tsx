import React from 'react';
import { Clock, CheckCircle, XCircle, FileCheck } from 'lucide-react';
import type { RequestStatus } from '../../types';

interface StatusBadgeProps {
  status: RequestStatus | 'ACTIVE_VALID' | 'EXPIRED' | 'REVOKED';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'approved':
    case 'ACTIVE_VALID':
      return (
        <span className="badge badge-approved">
          <CheckCircle size={12} />
          {status === 'ACTIVE_VALID' ? 'Authentic / Valid' : 'Approved'}
        </span>
      );
    case 'pending':
      return (
        <span className="badge badge-pending">
          <Clock size={12} />
          Pending Review
        </span>
      );
    case 'rejected':
    case 'REVOKED':
      return (
        <span className="badge badge-rejected">
          <XCircle size={12} />
          {status === 'REVOKED' ? 'Revoked' : 'Disapproved'}
        </span>
      );
    case 'EXPIRED':
      return (
        <span
          className="badge"
          style={{ background: '#F1F5F9', color: '#64748B', border: '1px solid #CBD5E1' }}
        >
          <Clock size={12} />
          Expired
        </span>
      );
    default:
      return (
        <span className="badge badge-approved">
          <FileCheck size={12} />
          Ready
        </span>
      );
  }
};
