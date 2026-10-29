import React, { useState } from 'react';
import type { Participant, Language } from '../types';
import { getStoredParticipants } from '../services/storage';
import {
  QrCode,
  X,
  Printer,
  Copy,
  ExternalLink,
  Check
} from 'lucide-react';

interface QRBadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onSimulateScan: (p: Participant) => void;
}

export const QRBadgesModal: React.FC<QRBadgesModalProps> = ({
  isOpen,
  onClose,
  onSimulateScan
}) => {
  const participants = getStoredParticipants();
  const [selectedP, setSelectedP] = useState<Participant>(participants[0]);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedP.qrIdentifier);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop-clean">
      <div className="modal-content-clean" style={{ maxWidth: '720px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--accent-blue-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-blue)'
            }}>
              <QrCode size={20} />
            </div>
            <div>
              <h3 className="font-tamil" style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                போட்டியாளர் QR அடையாள அட்டைகள்
              </h3>
              <p className="font-tamil" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                அடையாள அட்டையை அச்சிட அல்லது ஆபரேட்டர் திரையில் நேரடியாக சோதிக்க
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Competitor Selector Strip */}
        <div style={{
          display: 'flex',
          gap: '0.4rem',
          overflowX: 'auto',
          paddingBottom: '0.75rem',
          marginBottom: '1.25rem',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          {participants.map(p => {
            const isSel = selectedP.participantId === p.participantId;
            return (
              <button
                key={p.participantId}
                onClick={() => setSelectedP(p)}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-full)',
                  background: isSel ? 'var(--primary-dark)' : '#f1f5f9',
                  color: isSel ? '#ffffff' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>{p.registrationId}</span>
              </button>
            );
          })}
        </div>

        {/* Badge Preview Card */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem',
          alignItems: 'center'
        }}>
          {/* Card */}
          <div style={{
            background: '#ffffff',
            border: '1.5px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div className="font-tamil" style={{
              fontSize: '0.85rem',
              fontWeight: 800,
              color: 'var(--accent-blue)',
              letterSpacing: '0.02em',
              marginBottom: '0.2rem'
            }}>
              போர்க்கலைத் திருவிழா 2027
            </div>
            <div className="font-tamil" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              அதிகாரப்பூர்வ போட்டியாளர் அடையாள அட்டை
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
              <div className="profile-avatar-container" style={{ margin: 0 }}>
                <img
                  src={selectedP.photoUrl}
                  alt={selectedP.participantNameTa}
                  className="profile-avatar-img"
                  style={{ width: '80px', height: '80px' }}
                />
                <div className="avatar-badge-verified">
                  <Check size={12} strokeWidth={3} />
                </div>
              </div>

              {/* QR SVG */}
              <div style={{
                background: '#ffffff',
                padding: '6px',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}>
                <svg width="74" height="74" viewBox="0 0 100 100" fill="#0f172a">
                  <rect x="5" y="5" width="30" height="30" fill="#0f172a" rx="4" />
                  <rect x="10" y="10" width="20" height="20" fill="#fff" />
                  <rect x="15" y="15" width="10" height="10" fill="#0f172a" />

                  <rect x="65" y="5" width="30" height="30" fill="#0f172a" rx="4" />
                  <rect x="70" y="10" width="20" height="20" fill="#fff" />
                  <rect x="75" y="15" width="10" height="10" fill="#0f172a" />

                  <rect x="5" y="65" width="30" height="30" fill="#0f172a" rx="4" />
                  <rect x="10" y="70" width="20" height="20" fill="#fff" />
                  <rect x="15" y="75" width="10" height="10" fill="#0f172a" />

                  <rect x="42" y="10" width="6" height="6" />
                  <rect x="52" y="10" width="6" height="6" />
                  <rect x="42" y="24" width="6" height="6" />
                  <rect x="52" y="24" width="6" height="6" />
                  <rect x="42" y="38" width="6" height="6" />
                  <rect x="52" y="38" width="6" height="6" />
                  <rect x="10" y="42" width="6" height="6" />
                  <rect x="24" y="42" width="6" height="6" />
                  <rect x="38" y="42" width="6" height="6" />
                  <rect x="65" y="42" width="6" height="6" />
                  <rect x="78" y="42" width="6" height="6" />

                  <rect x="42" y="65" width="6" height="6" />
                  <rect x="52" y="65" width="6" height="6" />
                  <rect x="42" y="78" width="6" height="6" />
                  <rect x="52" y="78" width="6" height="6" />
                  <rect x="65" y="65" width="12" height="12" rx="2" />
                  <rect x="80" y="80" width="12" height="12" rx="2" />
                </svg>
              </div>
            </div>

            <div className="font-mono" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {selectedP.registrationId}
            </div>

            <h4 className="font-tamil" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
              {selectedP.participantNameTa}
            </h4>

            <div className="font-tamil" style={{ fontSize: '0.78rem', color: 'var(--accent-blue)', fontWeight: 600, marginTop: '0.35rem' }}>
              {selectedP.competitionNameTa} • {selectedP.ageCategory}
            </div>
            <div className="font-tamil" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {selectedP.clubOrDistrict}
            </div>
          </div>

          {/* Right Action Tools */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{
              background: 'var(--bg-input)',
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div className="font-tamil" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                QR பாதுகாப்புக் குறியீடு (Payload):
              </div>
              <div className="font-mono" style={{ fontSize: '0.825rem', color: 'var(--text-primary)', wordBreak: 'break-all', fontWeight: 600 }}>
                {selectedP.qrIdentifier}
              </div>
              <button
                onClick={handleCopy}
                className="btn-case-light font-tamil"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', marginTop: '0.45rem' }}
              >
                <Copy size={12} />
                <span>{copied ? 'நகலெடுக்கப்பட்டது!' : 'குறியீட்டை நகலெடு'}</span>
              </button>
            </div>

            <button
              onClick={() => {
                onSimulateScan(selectedP);
                onClose();
              }}
              className="btn-case-dark font-tamil"
            >
              <ExternalLink size={16} />
              <span>ஆபரேட்டருக்கு அனுப்பு (நேரடி சோதனை)</span>
            </button>

            <button
              onClick={handlePrint}
              className="btn-case-light font-tamil"
            >
              <Printer size={15} />
              <span>அடையாள அட்டையை அச்சிடு</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
