import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  colorVariant?: 'blue' | 'gold' | 'red' | 'green';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  colorVariant = 'blue',
}) => {
  const getColors = () => {
    switch (colorVariant) {
      case 'gold':
        return {
          bgIcon: 'rgba(252, 209, 22, 0.15)',
          iconColor: '#B45309',
          borderColor: 'rgba(252, 209, 22, 0.4)',
        };
      case 'red':
        return {
          bgIcon: 'rgba(206, 17, 38, 0.12)',
          iconColor: '#CE1126',
          borderColor: 'rgba(206, 17, 38, 0.25)',
        };
      case 'green':
        return {
          bgIcon: 'rgba(16, 185, 129, 0.15)',
          iconColor: '#059669',
          borderColor: 'rgba(16, 185, 129, 0.3)',
        };
      case 'blue':
      default:
        return {
          bgIcon: 'rgba(0, 56, 168, 0.12)',
          iconColor: '#0038A8',
          borderColor: 'rgba(0, 56, 168, 0.2)',
        };
    }
  };

  const style = getColors();

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        border: `1px solid ${style.borderColor}`,
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'all 0.2s ease',
      }}
    >
      <div>
        <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>{title}</span>
        <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
          {value}
        </div>
        {description && (
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px' }}>{description}</div>
        )}
      </div>

      <div
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '12px',
          background: style.bgIcon,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={26} color={style.iconColor} />
      </div>
    </div>
  );
};
