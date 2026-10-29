import React, { useState, useEffect } from 'react';
import type { UserRole, Language } from '../types';
import {
  Shield,
  QrCode,
  Award,
  Tv,
  Settings,
  Wifi
} from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  language: Language;
  onToggleLanguage: (lang: Language) => void;
  onOpenQRModal: () => void;
  onOpenLanModal: () => void;
  arenaName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onSelectRole,
  onOpenQRModal,
  onOpenLanModal,
  arenaName
}) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('ta-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const roles = [
    { id: 'operator' as UserRole, label: 'ஆபரேட்டர்', icon: QrCode },
    { id: 'judge1' as UserRole, label: 'நடுவர் 1', icon: Award },
    { id: 'judge2' as UserRole, label: 'நடுவர் 2', icon: Award },
    { id: 'judge3' as UserRole, label: 'நடுவர் 3', icon: Award },
    { id: 'led' as UserRole, label: 'LED பலகை', icon: Tv },
    { id: 'admin' as UserRole, label: 'நிர்வாகம்', icon: Settings }
  ];

  return (
    <header className="app-header no-print">
      <div style={{
        maxWidth: '1360px',
        margin: '0 auto',
        padding: '0.75rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        {/* Brand & Arena */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'var(--primary-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.2)'
          }}>
            <Shield size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="font-tamil" style={{
                fontSize: '1.15rem',
                fontWeight: 900,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em'
              }}>
                போர்க்கலைத் திருவிழா 2027
              </span>
              <span className="badge-blue-pill" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                நேரலை 2027
              </span>
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <span>{arenaName}</span>
              <span>•</span>
              <span style={{ color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
                ஒத்திசைக்கப்பட்டது
              </span>
            </div>
          </div>
        </div>

        {/* Center: CaseKarao Role Pill Selector in pure Tamil */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          background: '#f1f5f9',
          padding: '0.25rem',
          borderRadius: 'var(--radius-full)',
          overflowX: 'auto',
          maxWidth: '100%'
        }}>
          {roles.map(role => {
            const Icon = role.icon;
            const isActive = currentRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => onSelectRole(role.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.95rem',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  background: isActive ? 'var(--primary-dark)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 2px 8px rgba(15, 23, 42, 0.2)' : 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={14} />
                <span>{role.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Tools: QR Badges Modal, LAN Cross-PC & Live Clock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            onClick={onOpenLanModal}
            className="btn-case-light"
            style={{
              padding: '0.45rem 0.95rem',
              fontSize: '0.825rem',
              fontWeight: 700,
              background: '#fffbeb',
              borderColor: '#fde68a',
              color: '#92400e'
            }}
          >
            <Tv size={15} color="#d97706" />
            <span>LED திரை இணைப்பு (LAN)</span>
          </button>

          <button
            onClick={onOpenQRModal}
            className="btn-case-light"
            style={{ padding: '0.45rem 0.95rem', fontSize: '0.825rem', fontWeight: 700 }}
          >
            <QrCode size={15} color="var(--accent-blue)" />
            <span>QR அடையாள அட்டை</span>
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.75rem',
            background: '#f8fafc',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-secondary)'
          }}>
            <Wifi size={13} color="#10b981" />
            <span>{time}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
