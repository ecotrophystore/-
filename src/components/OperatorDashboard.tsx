import React, { useState } from 'react';
import type {
  Participant,
  JudgingSession,
  Language
} from '../types';
import {
  startJudgingSession,
  advanceToNextParticipant,
  getStoredParticipants
} from '../services/storage';
import {
  QrCode,
  CheckCircle,
  AlertCircle,
  Play,
  UserCheck,
  Lock,
  ArrowRight,
  Camera,
  Search,
  Check
} from 'lucide-react';

interface OperatorDashboardProps {
  activeSession: JudgingSession | null;
  language: Language;
  onSessionUpdated: () => void;
  onOpenQRModal: () => void;
}

export const OperatorDashboard: React.FC<OperatorDashboardProps> = ({
  activeSession,
  onSessionUpdated,
  onOpenQRModal
}) => {
  const participants = getStoredParticipants();
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [scanInput, setScanInput] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  const currentParticipant = activeSession ? activeSession.participant : selectedParticipant;

  const handleManualScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setScanError(null);
    const cleaned = scanInput.trim().toUpperCase();
    if (!cleaned) return;

    const found = participants.find(
      p => p.qrIdentifier.toUpperCase() === cleaned ||
           p.registrationId.toUpperCase() === cleaned ||
           p.participantId.toUpperCase() === cleaned
    );

    if (found) {
      setSelectedParticipant(found);
      setScanInput('');
    } else {
      setScanError(`பதிவு எண் அல்லது QR குறியீடு '${cleaned}' பட்டியலில் காணப்படவில்லை.`);
    }
  };

  const handleSelectParticipant = (p: Participant) => {
    setScanError(null);
    setSelectedParticipant(p);
  };

  const handleStartSession = () => {
    if (!currentParticipant) return;
    try {
      startJudgingSession(currentParticipant, 'ARENA-1', 'அரங்கம் 1 (முதன்மை அரங்கம்)', 'ஆபரேட்டர் 1');
      setSelectedParticipant(null);
      onSessionUpdated();
    } catch (err: any) {
      setScanError(err.message || 'மதிப்பீட்டு அமர்வைத் தொடங்குவதில் பிழை ஏற்பட்டது.');
    }
  };

  const handleAdvanceToNext = () => {
    try {
      advanceToNextParticipant('QR ஆபரேட்டர் 1');
      setSelectedParticipant(null);
      onSessionUpdated();
    } catch (err: any) {
      alert(err.message || 'அனைத்து நடுவர்களும் முடிக்கும் வரை அடுத்த போட்டியாளருக்கு செல்ல இயலாது.');
    }
  };

  const allJudgesFinished = activeSession
    ? activeSession.judgeStatuses.judge1 === 'finished' &&
      activeSession.judgeStatuses.judge2 === 'finished' &&
      activeSession.judgeStatuses.judge3 === 'finished'
    : false;

  const filteredParticipants = participants.filter(p =>
    !scanInput.trim() ||
    p.participantNameTa.includes(scanInput) ||
    p.registrationId.toLowerCase().includes(scanInput.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div>
          <h1 className="font-tamil" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            QR ஸ்கேனர் &amp; அரங்கு மேலாண்மை
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            போட்டியாளரின் QR குறியீட்டை சரிபார்த்து நடுவர் மதிப்பீட்டைத் தொடங்குங்கள். 3 நடுவர்களும் முடிக்கும் வரை அடுத்தவரை தொடங்க முடியாது.
          </p>
        </div>

        <button
          onClick={onOpenQRModal}
          className="btn-case-light"
          style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
        >
          <QrCode size={16} color="var(--accent-blue)" />
          <span>QR அடையாள அட்டைகள்</span>
        </button>
      </div>

      {/* Main Grid: Left Scan/Select, Right Verification & Consensus */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* Left Card: QR Scanner / Lookup */}
        <div className="card-clean" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 className="font-tamil" style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Camera size={18} color="var(--accent-blue)" />
              <span>QR ஸ்கேன் / போட்டியாளர் தேடல்</span>
            </h2>
            <span className="badge-blue-pill">படிநிலை 1</span>
          </div>

          {/* Clean Input Form */}
          <form onSubmit={handleManualScanSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="பதிவு எண் உள்ளிடவும் (எ.கா: PK27-SIL-0101)..."
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              disabled={!!activeSession && activeSession.status === 'active' && !allJudgesFinished}
              className="input-clean font-tamil"
              style={{ flex: 1, fontFamily: 'var(--font-mono)' }}
            />
            <button
              type="submit"
              className="btn-case-dark font-tamil"
              style={{ width: 'auto', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-sm)' }}
              disabled={!scanInput.trim() || (!!activeSession && activeSession.status === 'active' && !allJudgesFinished)}
            >
              <Search size={16} />
              <span>தேடு</span>
            </button>
          </form>

          {/* Camera Scanner Container */}
          <div style={{
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-md)',
            border: '1.5px dashed var(--border-subtle)',
            padding: '1.5rem 1rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.65rem'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'var(--accent-blue-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-blue)'
            }}>
              <QrCode size={26} />
            </div>
            <div>
              <div className="font-tamil" style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                நேரடி கேமரா ஸ்கேனர்
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                போட்டியாளரின் QR அடையாள அட்டையை கேமராவில் காட்டவும்
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsCameraActive(!isCameraActive)}
              className="btn-case-light font-tamil"
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.95rem' }}
            >
              <Camera size={14} />
              <span>{isCameraActive ? 'கேமராவை நிறுத்து' : 'கேமரா வழியே ஸ்கேன் செய்'}</span>
            </button>
          </div>

          {/* Quick Roster Selector */}
          <div>
            <div style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              marginBottom: '0.5rem',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>பதிவு செய்யப்பட்ட போட்டியாளர்கள் பட்டியல்:</span>
              <span className="badge-gray-pill">{filteredParticipants.length} பேர்</span>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem',
              maxHeight: '260px',
              overflowY: 'auto'
            }}>
              {filteredParticipants.map(p => {
                const isCurrent = currentParticipant?.participantId === p.participantId;
                return (
                  <div
                    key={p.participantId}
                    onClick={() => {
                      if (!activeSession || allJudgesFinished) {
                        handleSelectParticipant(p);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      background: isCurrent ? 'var(--accent-blue-light)' : '#ffffff',
                      border: isCurrent ? '1.5px solid var(--accent-blue)' : '1px solid var(--border-subtle)',
                      cursor: activeSession && !allJudgesFinished ? 'not-allowed' : 'pointer',
                      opacity: activeSession && !allJudgesFinished && !isCurrent ? 0.45 : 1,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <img
                      src={p.photoUrl}
                      alt={p.participantNameTa}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="font-tamil" style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.participantNameTa}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.4rem' }}>
                        <span className="font-mono" style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>{p.registrationId}</span>
                        <span>•</span>
                        <span>{p.clubOrDistrict}</span>
                      </div>
                    </div>
                    {isCurrent && (
                      <CheckCircle size={18} color="var(--accent-blue)" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {scanError && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#dc2626',
              fontSize: '0.85rem'
            }}>
              <AlertCircle size={16} />
              <span>{scanError}</span>
            </div>
          )}
        </div>

        {/* Right Column: Participant Verification & Consensus Monitor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Identity Verification Card */}
          <div className="card-clean">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 className="font-tamil" style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserCheck size={18} color="var(--accent-emerald)" />
                <span>போட்டியாளர் அடையாள சரிபார்ப்பு</span>
              </h2>
              {currentParticipant && (
                <span className="badge-verified-pill">
                  <Check size={12} strokeWidth={3} />
                  <span>சரிபார்க்கப்பட்டது</span>
                </span>
              )}
            </div>

            {currentParticipant ? (
              <div style={{ textAlign: 'center' }}>
                {/* Avatar with Verified Badge */}
                <div className="profile-avatar-container">
                  <img
                    src={currentParticipant.photoUrl}
                    alt={currentParticipant.participantNameTa}
                    className="profile-avatar-img"
                  />
                  <div className="avatar-badge-verified">
                    <Check size={14} strokeWidth={3} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                  <span className="badge-verified-pill font-mono">{currentParticipant.registrationId}</span>
                  <span className="badge-gray-pill">{currentParticipant.ageCategory}</span>
                </div>

                <h3 className="font-tamil" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
                  {currentParticipant.participantNameTa}
                </h3>

                <div style={{
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  border: '1px solid var(--border-subtle)',
                  textAlign: 'left',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem'
                }}>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    <strong>போட்டி:</strong> {currentParticipant.competitionNameTa}
                  </div>
                  <div style={{ color: 'var(--accent-blue)', fontWeight: 600, marginTop: '0.2rem' }}>
                    <strong>அகாடமி / மாவட்டம்:</strong> {currentParticipant.clubOrDistrict}
                  </div>
                </div>

                {/* Start Session Button */}
                {!activeSession && (
                  <button
                    onClick={handleStartSession}
                    className="btn-case-dark font-tamil"
                  >
                    <Play size={18} />
                    <span>மதிப்பீட்டு அமர்வைத் தொடங்கு</span>
                  </button>
                )}
              </div>
            ) : (
              <div style={{
                padding: '2.5rem 1rem',
                textAlign: 'center',
                color: 'var(--text-muted)',
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius-md)',
                border: '1.5px dashed var(--border-subtle)'
              }}>
                <QrCode size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                <div className="font-tamil" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  போட்டியாளர் தேர்ந்தெடுக்கப்படவில்லை
                </div>
                <div style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>
                  இடதுபுறப் பட்டியலில் தேர்ந்தெடுக்கவும் அல்லது QR குறியீட்டை ஸ்கேன் செய்யவும்.
                </div>
              </div>
            )}
          </div>

          {/* Active Session & 3 Judges Consensus Checklist */}
          {activeSession && (
            <div className="card-clean" style={{ border: '1.5px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div className="font-tamil" style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  நடுவர் குழு நேரலை நிறைவு நிலை
                </div>
                <span className={allJudgesFinished ? 'badge-verified-pill' : 'badge-blue-pill'}>
                  {allJudgesFinished ? 'மதிப்பீடு நிறைவுற்றது' : 'நடைபெறுகிறது'}
                </span>
              </div>

              {/* 3 Judges Checklist */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {(['judge1', 'judge2', 'judge3'] as const).map((jKey, idx) => {
                  const status = activeSession.judgeStatuses[jKey];
                  const judgeScore = activeSession.scores[jKey];
                  const isDone = status === 'finished';

                  return (
                    <div key={jKey} className="step-checklist-item" style={{ marginBottom: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className={`step-status-circle ${isDone ? 'completed' : 'pending'}`}>
                          {isDone && <Check size={14} strokeWidth={3} />}
                        </div>
                        <div>
                          <div className="font-tamil" style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                            நடுவர் {idx + 1}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: isDone ? '#059669' : 'var(--text-muted)' }}>
                            {isDone ? 'மதிப்பீடு நிறைவுற்று பூட்டப்பட்டது' : 'மதிப்பீடு செய்து கொண்டிருக்கிறார்...'}
                          </div>
                        </div>
                      </div>

                      <div className="font-display" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {judgeScore.judgeTotal} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ 25</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Grand Total Indicator */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1rem',
                border: '1px solid var(--border-subtle)'
              }}>
                <span className="font-tamil" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  ஒட்டுமொத்த கூட்டு மதிப்பெண்:
                </span>
                <span className="font-display" style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent-blue)' }}>
                  {activeSession.grandTotal} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ 75</span>
                </span>
              </div>

              {/* Advance Button */}
              <button
                onClick={handleAdvanceToNext}
                disabled={!allJudgesFinished}
                className="btn-case-dark font-tamil"
              >
                {allJudgesFinished ? (
                  <>
                    <ArrowRight size={18} />
                    <span>அடுத்த போட்டியாளருக்குச் செல்</span>
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    <span>3 நடுவர்களும் முடிக்கும் வரை பூட்டப்பட்டுள்ளது</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
