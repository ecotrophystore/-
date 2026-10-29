import { useState, useEffect } from 'react';
import type { UserRole, Language, JudgingSession, Participant } from './types';
import {
  getActiveSession,
  subscribeToSync,
  startJudgingSession
} from './services/storage';
import { Navbar } from './components/Navbar';
import { OperatorDashboard } from './components/OperatorDashboard';
import { JudgeScoring } from './components/JudgeScoring';
import { LEDScoreboard } from './components/LEDScoreboard';
import { AdminDashboard } from './components/AdminDashboard';
import { RankingsView } from './components/RankingsView';
import { QRBadgesModal } from './components/QRBadgesModal';
import { LanConnectModal } from './components/LanConnectModal';
import { Trophy, Shield } from 'lucide-react';

const getInitialParams = () => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    const viewParam = params.get('view');
    const role: UserRole = (roleParam && ['operator', 'judge1', 'judge2', 'judge3', 'led', 'admin'].includes(roleParam))
      ? (roleParam as UserRole)
      : 'operator';
    const view: 'screen' | 'rankings' = viewParam === 'rankings' ? 'rankings' : 'screen';
    return { role, view };
  }
  return { role: 'operator' as UserRole, view: 'screen' as const };
};

export function App() {
  const initialParams = getInitialParams();
  const [currentRole, setCurrentRole] = useState<UserRole>(initialParams.role);
  const [activeView, setActiveView] = useState<'screen' | 'rankings'>(initialParams.view);
  const [language, setLanguage] = useState<Language>('ta');
  const [activeSession, setActiveSession] = useState<JudgingSession | null>(getActiveSession());
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isLanModalOpen, setIsLanModalOpen] = useState(false);
  const [arenaName] = useState('அரங்கம் 1 (முதன்மை அரங்கம்)');

  const refreshState = () => {
    setActiveSession(getActiveSession());
  };

  useEffect(() => {
    refreshState();

    // Subscribes to LocalStorage, LAN WebSocket, AND Firebase Realtime Database
    const unsubscribe = subscribeToSync(() => {
      refreshState();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSimulateScan = (participant: Participant) => {
    try {
      startJudgingSession(participant, 'ARENA-1', arenaName, 'ஆபரேட்டர் 1');
      setCurrentRole('operator');
      setActiveView('screen');
      refreshState();
    } catch (err) {
      console.error(err);
    }
  };

  const roleNameMap: Record<UserRole, string> = {
    operator: 'ஆபரேட்டர்',
    judge1: 'நடுவர் 1',
    judge2: 'நடுவர் 2',
    judge3: 'நடுவர் 3',
    led: 'LED பலகை',
    admin: 'நிர்வாகம்',
    judge: 'நடுவர்',
    system: 'கணினி'
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        onSelectRole={(role) => {
          setCurrentRole(role);
          setActiveView('screen');
        }}
        language={language}
        onToggleLanguage={setLanguage}
        onOpenQRModal={() => setIsQRModalOpen(true)}
        onOpenLanModal={() => setIsLanModalOpen(true)}
        arenaName={arenaName}
      />

      {/* Sub-Header Navigation: Screen View vs Leaderboard */}
      <div className="no-print" style={{
        background: '#ffffff',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0.45rem 1.25rem'
      }}>
        <div style={{
          maxWidth: '1360px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              onClick={() => setActiveView('screen')}
              className="font-tamil"
              style={{
                padding: '0.4rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-full)',
                background: activeView === 'screen' ? 'var(--primary-dark)' : 'transparent',
                color: activeView === 'screen' ? '#ffffff' : 'var(--text-secondary)',
                border: activeView === 'screen' ? 'none' : '1px solid var(--border-subtle)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Shield size={14} />
              <span>
                திரை: {roleNameMap[currentRole] || currentRole}
              </span>
            </button>

            <button
              onClick={() => setActiveView('rankings')}
              className="font-tamil"
              style={{
                padding: '0.4rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-full)',
                background: activeView === 'rankings' ? 'var(--primary-dark)' : 'transparent',
                color: activeView === 'rankings' ? '#ffffff' : 'var(--text-secondary)',
                border: activeView === 'rankings' ? 'none' : '1px solid var(--border-subtle)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Trophy size={14} />
              <span>நேரலை தரவரிசைப் பலகை</span>
            </button>
          </div>

          {/* Quick Active Competitor Ticker */}
          {activeSession ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.825rem',
              color: 'var(--text-secondary)'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
              <span className="font-tamil">தற்போது களத்தில்:</span>
              <strong className="font-tamil" style={{ color: 'var(--text-primary)' }}>
                {activeSession.participant.participantNameTa}
              </strong>
              <span className="badge-verified-pill font-mono" style={{ fontSize: '0.7rem' }}>
                {activeSession.participant.registrationId}
              </span>
              <span className="badge-blue-pill font-display" style={{ fontWeight: 800 }}>
                {activeSession.grandTotal} / 75
              </span>
            </div>
          ) : (
            <div className="font-tamil" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              அரங்கம் தயார் நிலை • அடுத்த QR ஸ்கேனுக்காக காத்திருக்கிறது
            </div>
          )}
        </div>
      </div>

      {/* Main Content View Switcher */}
      <main style={{ flex: 1, padding: currentRole === 'led' && activeView === 'screen' ? '0' : '1.5rem 1rem' }}>
        {activeView === 'rankings' ? (
          <RankingsView language={language} />
        ) : (
          <>
            {currentRole === 'operator' && (
              <OperatorDashboard
                activeSession={activeSession}
                language={language}
                onSessionUpdated={refreshState}
                onOpenQRModal={() => setIsQRModalOpen(true)}
              />
            )}

            {currentRole === 'judge1' && (
              <JudgeScoring
                judgeKey="judge1"
                activeSession={activeSession}
                language={language}
                onSessionUpdated={refreshState}
              />
            )}

            {currentRole === 'judge2' && (
              <JudgeScoring
                judgeKey="judge2"
                activeSession={activeSession}
                language={language}
                onSessionUpdated={refreshState}
              />
            )}

            {currentRole === 'judge3' && (
              <JudgeScoring
                judgeKey="judge3"
                activeSession={activeSession}
                language={language}
                onSessionUpdated={refreshState}
              />
            )}

            {currentRole === 'led' && (
              <LEDScoreboard
                activeSession={activeSession}
                language={language}
              />
            )}

            {currentRole === 'admin' && (
              <AdminDashboard
                activeSession={activeSession}
                language={language}
                onSessionUpdated={refreshState}
              />
            )}
          </>
        )}
      </main>

      {/* Modal for QR Badges Generator & Scanner Simulator */}
      <QRBadgesModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        language={language}
        onSimulateScan={handleSimulateScan}
      />

      {/* Modal for LAN Cross-PC & LED Screen Setup */}
      <LanConnectModal
        isOpen={isLanModalOpen}
        onClose={() => setIsLanModalOpen(false)}
      />

      {/* Clean Footer */}
      <footer className="no-print" style={{
        marginTop: 'auto',
        background: '#ffffff',
        borderTop: '1px solid var(--border-subtle)',
        padding: '1.25rem',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.35rem'
        }}>
          <div className="font-tamil" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            <span>போர்க்கலைத் திருவிழா 2027</span>
            <span>•</span>
            <span>9–10 ஜனவரி 2027</span>
          </div>
          <div className="font-tamil" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            ஒரு QR ஸ்கேன் • 3 நடுவர்கள் • 5 படிநிலைகள் • 75 மதிப்பெண்கள் • 1 நேரலை LED பலகை
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
