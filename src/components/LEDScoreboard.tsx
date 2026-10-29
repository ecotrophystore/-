import React, { useState, useEffect } from 'react';
import type { JudgingSession, Language } from '../types';
import { getStoredSteps, getNetworkSyncStatus, subscribeToNetworkStatus } from '../services/storage';
import {
  Tv,
  Maximize2,
  Minimize2,
  Shield,
  Clock,
  Wifi
} from 'lucide-react';

interface LEDScoreboardProps {
  activeSession: JudgingSession | null;
  language: Language;
}

export const LEDScoreboard: React.FC<LEDScoreboardProps> = ({
  activeSession
}) => {
  const steps = getStoredSteps();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [networkStatus, setNetworkStatus] = useState(getNetworkSyncStatus());

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    const unsubNet = subscribeToNetworkStatus(setNetworkStatus);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      unsubNet();
    };
  }, []);

  const participant = activeSession?.participant;
  const isSessionActive = !!activeSession && activeSession.status === 'active';
  const allJudgesFinished = activeSession
    ? activeSession.judgeStatuses.judge1 === 'finished' &&
      activeSession.judgeStatuses.judge2 === 'finished' &&
      activeSession.judgeStatuses.judge3 === 'finished'
    : false;

  const getStepRowData = (stepIndex: 1 | 2 | 3 | 4 | 5) => {
    if (!activeSession) return { j1: null, j2: null, j3: null, stepTotal: 0 };
    const stepKey = `s${stepIndex}` as const;
    const j1 = activeSession.scores.judge1[stepKey];
    const j2 = activeSession.scores.judge2[stepKey];
    const j3 = activeSession.scores.judge3[stepKey];
    const stepTotal = (j1 ?? 0) + (j2 ?? 0) + (j3 ?? 0);
    return { j1, j2, j3, stepTotal };
  };

  return (
    <div className="led-scoreboard-container">
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1.5rem',
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(251, 191, 36, 0.3)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '1rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'var(--accent-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 0 20px rgba(37, 99, 235, 0.4)'
          }}>
            <Shield size={28} />
          </div>
          <div>
            <h1 className="font-tamil" style={{
              fontSize: 'clamp(1.3rem, 2.5vw, 2.1rem)',
              fontWeight: 900,
              color: '#ffffff',
              margin: 0
            }}>
              போர்க்கலைத் திருவிழா 2027 — நேரலை நடுவர் மதிப்பீட்டுப் பலகை
            </h1>
            <div className="font-tamil" style={{
              fontSize: 'clamp(0.8rem, 1.2vw, 0.95rem)',
              color: '#fbbf24',
              fontWeight: 700
            }}>
              அதிகாரப்பூர்வ நேரலை LED பலகை • அரங்கம் 1 (முதன்மை அரங்கம்)
            </div>
          </div>
        </div>

        {/* Right Status Badge & Fullscreen Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* LAN Connection Status Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            background: networkStatus.connected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: networkStatus.connected ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
            fontSize: '0.78rem',
            color: networkStatus.connected ? '#6ee7b7' : '#fca5a5'
          }}>
            <Wifi size={13} color={networkStatus.connected ? '#10b981' : '#ef4444'} />
            <span className="font-tamil" style={{ fontWeight: 700 }}>
              {networkStatus.connected ? `LAN நேரலை (${networkStatus.clientCount} இணைப்புகள்)` : 'LAN இணைப்பு காத்திருக்கிறது'}
            </span>
          </div>

          {isSessionActive && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-full)',
              background: allJudgesFinished ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              border: allJudgesFinished ? '1px solid #10b981' : '1px solid #ef4444'
            }}>
              <span className="live-dot" style={{
                backgroundColor: allJudgesFinished ? '#10b981' : '#ef4444',
                boxShadow: allJudgesFinished ? '0 0 10px #10b981' : '0 0 10px #ef4444'
              }}></span>
              <span className="font-tamil" style={{
                fontWeight: 800,
                fontSize: '0.9rem',
                color: allJudgesFinished ? '#6ee7b7' : '#fca5a5'
              }}>
                {allJudgesFinished ? 'உறுதி செய்யப்பட்ட இறுதி மதிப்பெண்' : 'மதிப்பீடு நேரலை (தற்காலிகம்)'}
              </span>
            </div>
          )}

          <button
            onClick={toggleFullscreen}
            className="btn-case-light no-print font-tamil"
            style={{ padding: '0.55rem 0.95rem', background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.2)' }}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            <span style={{ fontSize: '0.85rem' }}>{isFullscreen ? 'திரையை சுருக்கு' : '16:9 திரை முறைமை'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Competitor Panel, Center Scoring Matrix, Right Grand Total HUD */}
      {participant && isSessionActive ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 320px) 1fr minmax(260px, 300px)',
          gap: '1.25rem',
          flex: 1
        }}>
          {/* Left: Participant Showcase Card */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.85)',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)'
          }}>
            <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
              <img
                src={participant.photoUrl}
                alt={participant.participantNameTa}
                style={{
                  width: '180px',
                  height: '180px',
                  borderRadius: '16px',
                  objectFit: 'cover',
                  border: '3px solid #2563eb',
                  boxShadow: '0 0 24px rgba(37, 99, 235, 0.4)'
                }}
              />
              <div style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                background: '#0f172a',
                color: '#ffffff',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 800,
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                {participant.registrationId}
              </div>
            </div>

            <h2 className="font-tamil" style={{
              fontSize: 'clamp(1.4rem, 2vw, 1.85rem)',
              fontWeight: 900,
              color: '#ffffff',
              marginBottom: '0.25rem'
            }}>
              {participant.participantNameTa}
            </h2>

            <div style={{
              width: '100%',
              padding: '0.75rem',
              background: 'rgba(0, 0, 0, 0.35)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              marginTop: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem',
              textAlign: 'left'
            }}>
              <div className="font-tamil" style={{ fontSize: '0.85rem', color: '#fbbf24' }}>
                <strong>போட்டி:</strong> {participant.competitionNameTa}
              </div>
              <div className="font-tamil" style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                <strong>பிரிவு:</strong> {participant.categoryNameTa} ({participant.ageCategory})
              </div>
              <div className="font-tamil" style={{ fontSize: '0.8rem', color: '#67e8f9' }}>
                <strong>அகாடமி / மாவட்டம்:</strong> {participant.clubOrDistrict}
              </div>
            </div>
          </div>

          {/* Center: Live 5-Step Scoring Matrix */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.85)',
            border: '2px solid rgba(251, 191, 36, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)'
          }}>
            <table className="led-table">
              <thead>
                <tr>
                  <th className="font-tamil" style={{ textAlign: 'left', width: '40%' }}>
                    மதிப்பீட்டு படிநிலைகள்
                  </th>
                  <th className="font-tamil" style={{ textAlign: 'center', width: '15%' }}>
                    நடுவர் 1
                  </th>
                  <th className="font-tamil" style={{ textAlign: 'center', width: '15%' }}>
                    நடுவர் 2
                  </th>
                  <th className="font-tamil" style={{ textAlign: 'center', width: '15%' }}>
                    நடுவர் 3
                  </th>
                  <th className="font-tamil" style={{ textAlign: 'center', width: '15%', color: '#f97316' }}>
                    மொத்தம் (15)
                  </th>
                </tr>
              </thead>
              <tbody>
                {steps.map((st, i) => {
                  const sIdx = (i + 1) as 1 | 2 | 3 | 4 | 5;
                  const row = getStepRowData(sIdx);

                  return (
                    <tr key={st.stepNumber}>
                      <td>
                        <div className="font-tamil" style={{ fontWeight: 700, fontSize: '1.05rem', color: '#ffffff' }}>
                          <span style={{ color: '#fbbf24', marginRight: '0.5rem' }}>{st.stepNumber}.</span>
                          {st.nameTa}
                        </div>
                      </td>

                      <td className={`led-score-cell ${row.j1 !== null ? 'active-val' : 'empty-val'}`}>
                        {row.j1 !== null ? row.j1 : '—'}
                      </td>

                      <td className={`led-score-cell ${row.j2 !== null ? 'active-val' : 'empty-val'}`}>
                        {row.j2 !== null ? row.j2 : '—'}
                      </td>

                      <td className={`led-score-cell ${row.j3 !== null ? 'active-val' : 'empty-val'}`}>
                        {row.j3 !== null ? row.j3 : '—'}
                      </td>

                      <td className="led-step-total-cell font-display">
                        {row.stepTotal} <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>/15</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              <tfoot>
                <tr style={{ background: 'rgba(251, 191, 36, 0.08)' }}>
                  <td className="font-tamil" style={{
                    fontWeight: 800,
                    color: '#fbbf24',
                    fontSize: '1.1rem'
                  }}>
                    நடுவர் மொத்த மதிப்பெண் (25)
                  </td>
                  <td className="led-score-cell" style={{ color: '#fbbf24', fontSize: '1.8rem' }}>
                    {activeSession.scores.judge1.judgeTotal}
                  </td>
                  <td className="led-score-cell" style={{ color: '#fbbf24', fontSize: '1.8rem' }}>
                    {activeSession.scores.judge2.judgeTotal}
                  </td>
                  <td className="led-score-cell" style={{ color: '#fbbf24', fontSize: '1.8rem' }}>
                    {activeSession.scores.judge3.judgeTotal}
                  </td>
                  <td className="led-step-total-cell font-display" style={{ color: '#fbbf24', fontSize: '2rem' }}>
                    {activeSession.grandTotal}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Right: Grand Total HUD */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div className="grand-total-hud" style={{ flex: 1 }}>
              <div className="font-tamil" style={{
                fontSize: '1.05rem',
                fontWeight: 800,
                color: '#fbbf24',
                marginBottom: '0.5rem',
                textAlign: 'center'
              }}>
                ஒட்டுமொத்த கூட்டு மதிப்பெண்
              </div>

              <div className="grand-total-number">
                {activeSession.grandTotal}
              </div>

              <div className="font-tamil" style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#94a3b8',
                marginTop: '0.25rem'
              }}>
                75-க்கு
              </div>

              <div style={{
                marginTop: '1.25rem',
                padding: '0.65rem 1.25rem',
                borderRadius: 'var(--radius-full)',
                background: allJudgesFinished
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(5, 150, 105, 0.3) 100%)'
                  : 'linear-gradient(135deg, rgba(37, 99, 235, 0.3) 0%, rgba(29, 78, 216, 0.3) 100%)',
                border: allJudgesFinished ? '1px solid #10b981' : '1px solid #3b82f6',
                textAlign: 'center'
              }}>
                <div className="font-tamil" style={{
                  fontSize: '0.95rem',
                  fontWeight: 900,
                  color: allJudgesFinished ? '#6ee7b7' : '#93c5fd'
                }}>
                  {allJudgesFinished ? 'முடிவு உறுதி செய்யப்பட்டது' : 'மதிப்பீடு நேரலை • தற்காலிகம்'}
                </div>
              </div>
            </div>

            {/* Judges Sync State Indicator */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem'
            }}>
              <div className="font-tamil" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>
                நடுவர் நிறைவு நிலை
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                {(['judge1', 'judge2', 'judge3'] as const).map((jk, idx) => {
                  const isDone = activeSession.judgeStatuses[jk] === 'finished';
                  return (
                    <div
                      key={jk}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        background: isDone ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        border: isDone ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                        textAlign: 'center'
                      }}
                    >
                      <div className="font-tamil" style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        நடுவர் {idx + 1}
                      </div>
                      <div className="font-tamil" style={{ fontSize: '0.8rem', fontWeight: 800, color: isDone ? '#6ee7b7' : '#f97316' }}>
                        {isDone ? 'முடிந்தது' : 'மதிப்பிடுகிறது'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Standby / Idle Arena Screen */
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          background: 'rgba(15, 23, 42, 0.65)',
          borderRadius: 'var(--radius-lg)',
          border: '2px dashed rgba(251, 191, 36, 0.25)',
          padding: '3rem 2rem'
        }}>
          <div style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            background: 'var(--accent-blue-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid rgba(37, 99, 235, 0.4)',
            marginBottom: '1.5rem',
            color: 'var(--accent-blue)'
          }}>
            <Tv size={44} />
          </div>

          <h2 className="font-tamil" style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
            fontWeight: 900,
            color: '#ffffff',
            marginBottom: '0.5rem'
          }}>
            அடுத்த போட்டியாளரின் வருகைக்காக காத்திருக்கிறது
          </h2>

          <p className="font-tamil" style={{
            fontSize: '1.15rem',
            color: '#fbbf24',
            maxWidth: '680px',
            lineHeight: 1.6
          }}>
            ஆபரேட்டர் அடுத்த போட்டியாளரின் QR குறியீட்டை ஸ்கேன் செய்தவுடன் 3 நடுவர்களின் மதிப்பெண்கள் இங்கு நேரலையாக தோன்றும்.
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            marginTop: '2rem',
            padding: '0.65rem 1.25rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <Clock size={18} color="#f97316" />
            <span className="font-tamil" style={{ fontSize: '0.95rem', color: '#cbd5e1' }}>
              அரங்கம் 1 • நேரடி மதிப்பீடு தயார் நிலை
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
