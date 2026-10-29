import React, { useState, useEffect } from 'react';
import {
  Tv,
  Wifi,
  Copy,
  Check,
  ExternalLink,
  X,
  Laptop,
  Award,
  Trophy,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import { getNetworkSyncStatus, subscribeToNetworkStatus } from '../services/storage';

interface LanConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanConnectModal: React.FC<LanConnectModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [networkStatus, setNetworkStatus] = useState(getNetworkSyncStatus());

  useEffect(() => {
    const unsub = subscribeToNetworkStatus(status => {
      setNetworkStatus(status);
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.host : 'localhost:5173';
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
  const baseUrl = `${protocol}//${currentHost}`;

  const links = [
    {
      key: 'led',
      title: 'LED நேரலைப் பலகை (அரங்கத் திரை)',
      titleEn: 'LED Scoreboard Display',
      url: `${baseUrl}/?role=led`,
      desc: 'இரண்டாவது கணினியில் (PC 2) அல்லது LED பலகை திரையில் திறக்க வேண்டிய இணைப்பு.',
      icon: Tv,
      color: '#fbbf24',
      badge: 'பரிந்துரைக்கப்பட்டது'
    },
    {
      key: 'rankings',
      title: 'நேரலைத் தரவரிசைப் பலகை',
      titleEn: 'Live Leaderboard Display',
      url: `${baseUrl}/?view=rankings`,
      desc: 'பொது மக்கள் & பார்வையாளர் திரைகளுக்கான நேரலைத் தரவரிசை.',
      icon: Trophy,
      color: '#38bdf8'
    },
    {
      key: 'judge1',
      title: 'நடுவர் 1 (Judge 1 Tablet / PC)',
      titleEn: 'Judge 1 Scoring Interface',
      url: `${baseUrl}/?role=judge1`,
      desc: 'நடுவர் 1 தனியாக மதிப்பெண் வழங்க உதவும் நேரடி இணைப்பு.',
      icon: Award,
      color: '#34d399'
    },
    {
      key: 'judge2',
      title: 'நடுவர் 2 (Judge 2 Tablet / PC)',
      titleEn: 'Judge 2 Scoring Interface',
      url: `${baseUrl}/?role=judge2`,
      desc: 'நடுவர் 2 தனியாக மதிப்பெண் வழங்க உதவும் நேரடி இணைப்பு.',
      icon: Award,
      color: '#34d399'
    },
    {
      key: 'judge3',
      title: 'நடுவர் 3 (Judge 3 Tablet / PC)',
      titleEn: 'Judge 3 Scoring Interface',
      url: `${baseUrl}/?role=judge3`,
      desc: 'நடுவர் 3 தனியாக மதிப்பெண் வழங்க உதவும் நேரடி இணைப்பு.',
      icon: Award,
      color: '#34d399'
    }
  ];

  const handleCopy = (key: string, url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }).catch(() => {});
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '750px',
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4)',
          background: '#ffffff'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(37, 99, 235, 0.3)',
              border: '1px solid rgba(59, 130, 246, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#60a5fa'
            }}>
              <Laptop size={22} />
            </div>
            <div>
              <h2 className="font-tamil" style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                மற்றொரு கணினியில் LED திரை இணைப்பு (Cross-PC Setup)
              </h2>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  color: networkStatus.connected ? '#34d399' : '#f87171',
                  fontWeight: 600
                }}>
                  <Wifi size={13} />
                  {networkStatus.connected ? 'உள்ளூர் பிணைய நேரலை தயார் (WebSocket Active)' : 'இணைப்பு காத்திருக்கிறது...'}
                </span>
                <span>•</span>
                <span>இணைக்கப்பட்ட சாதனங்கள்: {networkStatus.clientCount}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Quick 3-Step Guide */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1rem 1.25rem'
          }}>
            <h4 className="font-tamil" style={{ margin: '0 0 0.6rem 0', fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <HelpCircle size={16} color="var(--accent-blue)" />
              இரண்டாவது கணினியில் இணைக்கும் வழிமுறை (3 எளிய படிகள்):
            </h4>
            <ol className="font-tamil" style={{ margin: 0, paddingLeft: '1.3rem', fontSize: '0.825rem', color: '#475569', lineHeight: 1.6 }}>
              <li>இரண்டு கணினிகளையும் <strong>ஒரே Wi-Fi அல்லது Router உள்ளூர் பிணையத்தில் (LAN)</strong> இணைக்கவும்.</li>
              <li>இரண்டாவது கணினியில் (PC 2) Chrome அல்லது Edge உலாவியைத் திறந்து கீழே உள்ள <strong>LED பலகை இணைப்பை (URL)</strong> உள்ளிடவும்.</li>
              <li>முழுத்திரை காட்சிக்கு <kbd style={{ background: '#e2e8f0', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontFamily: 'monospace' }}>F11</kbd> அழுத்தவும். நீங்கள் இங்கு உள்ளிடும் மதிப்பெண்கள் அங்கு உடனடியாகத் தோன்றும்!</li>
            </ol>
          </div>

          {/* Links List */}
          <div>
            <div className="font-tamil" style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              நேரலை இணைப்புகள் (Direct Device Links):
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {links.map((item) => {
                const Icon = item.icon;
                const isCopied = copiedKey === item.key;
                return (
                  <div
                    key={item.key}
                    style={{
                      border: item.key === 'led' ? '2px solid #fbbf24' : '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '0.85rem 1rem',
                      background: item.key === 'led' ? '#fffbeb' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: '#0f172a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: item.color,
                        flexShrink: 0
                      }}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="font-tamil" style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                            {item.title}
                          </span>
                          {item.badge && (
                            <span style={{
                              background: '#fef3c7',
                              color: '#92400e',
                              border: '1px solid #fde68a',
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              padding: '0.1rem 0.4rem',
                              borderRadius: '4px'
                            }}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                          {item.desc}
                        </div>
                        <div style={{
                          fontFamily: 'monospace',
                          fontSize: '0.8rem',
                          color: '#2563eb',
                          marginTop: '0.35rem',
                          background: 'rgba(37, 99, 235, 0.08)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          display: 'inline-block',
                          wordBreak: 'break-all'
                        }}>
                          {item.url}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleCopy(item.key, item.url)}
                        className="font-tamil"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.45rem 0.85rem',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          borderRadius: '6px',
                          border: isCopied ? '1px solid #10b981' : '1px solid #cbd5e1',
                          background: isCopied ? '#ecfdf5' : '#ffffff',
                          color: isCopied ? '#059669' : '#334155',
                          cursor: 'pointer'
                        }}
                      >
                        {isCopied ? <Check size={14} /> : <Copy size={14} />}
                        <span>{isCopied ? 'நகலெடுக்கப்பட்டது!' : 'முகவரியை நகலெடு'}</span>
                      </button>

                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#64748b',
                          textDecoration: 'none'
                        }}
                        title="புதிய தாவலில் சோதிக்கவும்"
                      >
                        <ExternalLink size={15} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Wi-Fi Note Alert */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.65rem',
            padding: '0.75rem 1rem',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            fontSize: '0.78rem',
            color: '#166534'
          }}>
            <ShieldAlert size={16} color="#15803d" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            <div>
              <strong>குறிப்பு:</strong> இரண்டாவது கணினியில் localhost வேலை செய்யாது; மேலே காட்டப்பட்டுள்ள IP முகவரியை (<span style={{ fontFamily: 'monospace' }}>{baseUrl}</span>) மட்டுமே பயன்படுத்த வேண்டும்.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '0.85rem 1.5rem',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            className="btn-case-dark font-tamil"
            style={{ padding: '0.45rem 1.25rem', fontSize: '0.85rem' }}
          >
            சரி (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
