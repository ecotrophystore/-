import React, { useState } from 'react';
import type {
  JudgingSession,
  Language,
  JudgingStepConfig,
  AuditLog
} from '../types';
import {
  getStoredSteps,
  saveStoredSteps,
  getStoredParticipants,
  getAuditLogs,
  adminCorrectScore,
  getCompletedSessions
} from '../services/storage';
import {
  Sliders,
  ShieldAlert,
  FileText,
  Users,
  CheckCircle,
  AlertTriangle,
  Save,
  Edit3
} from 'lucide-react';

interface AdminDashboardProps {
  activeSession: JudgingSession | null;
  language: Language;
  onSessionUpdated: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  activeSession,
  onSessionUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'steps' | 'audit' | 'participants' | 'correction'>('steps');
  const [steps, setSteps] = useState<JudgingStepConfig[]>(getStoredSteps());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(getAuditLogs());
  const [participants] = useState(getStoredParticipants());
  const completedSessions = getCompletedSessions();

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Score correction form state
  const [corrSessionId, setCorrSessionId] = useState<string>(activeSession?.sessionId || '');
  const [corrJudge, setCorrJudge] = useState<'judge1' | 'judge2' | 'judge3'>('judge1');
  const [corrStep, setCorrStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [corrNewScore, setCorrNewScore] = useState<number>(5);
  const [corrReason, setCorrReason] = useState<string>('');
  const [corrStatus, setCorrStatus] = useState<{ success: boolean; msg: string } | null>(null);

  const handleStepChange = (index: number, field: keyof JudgingStepConfig, value: any) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
  };

  const handleSaveSteps = () => {
    saveStoredSteps(steps, 'தலைமை நிர்வாகி');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    onSessionUpdated();
  };

  const handleExecuteCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    setCorrStatus(null);
    if (!corrReason.trim()) {
      setCorrStatus({ success: false, msg: 'தணிக்கை விதிமுறை: மதிப்பெண் திருத்தத்திற்கு கட்டாயக் காரணம் குறிப்பிடப்பட வேண்டும்.' });
      return;
    }

    try {
      const ok = adminCorrectScore(corrSessionId, corrJudge, corrStep, Number(corrNewScore), corrReason, 'தலைமை நிர்வாகி');
      if (ok) {
        setCorrStatus({ success: true, msg: 'அங்கீகரிக்கப்பட்ட மதிப்பெண் திருத்தம் வெற்றிகரமாக பதிவு செய்யப்பட்டு மாற்றப்பட்டது.' });
        setCorrReason('');
        setAuditLogs(getAuditLogs());
        onSessionUpdated();
      } else {
        setCorrStatus({ success: false, msg: 'தேர்ந்தெடுக்கப்பட்ட அமர்வு எண் காணப்படவில்லை.' });
      }
    } catch (err: any) {
      setCorrStatus({ success: false, msg: err.message || 'திருத்தம் செய்வதில் தோல்வி ஏற்பட்டது' });
    }
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 className="font-tamil" style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            தலைமை நிர்வாகக் கட்டுப்பாட்டு மையம்
          </h1>
          <p className="font-tamil" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            மதிப்பீட்டு படிநிலைகள் அமைப்பு, அதிகாரப்பூர்வ நடுவர் மதிப்பெண் திருத்தங்கள் மற்றும் அமைப்பின் தணிக்கைப் பதிவுகள்.
          </p>
        </div>

        {/* Tab Pills */}
        <div style={{
          display: 'flex',
          gap: '0.35rem',
          background: '#f1f5f9',
          padding: '0.25rem',
          borderRadius: 'var(--radius-full)'
        }}>
          <button
            onClick={() => setActiveTab('steps')}
            className="font-tamil"
            style={{
              padding: '0.45rem 0.95rem',
              fontSize: '0.825rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: activeTab === 'steps' ? 'var(--primary-dark)' : 'transparent',
              color: activeTab === 'steps' ? '#ffffff' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <Sliders size={14} style={{ display: 'inline', marginRight: '4px' }} />
            <span>5 படிநிலைகள்</span>
          </button>

          <button
            onClick={() => setActiveTab('correction')}
            className="font-tamil"
            style={{
              padding: '0.45rem 0.95rem',
              fontSize: '0.825rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: activeTab === 'correction' ? 'var(--primary-dark)' : 'transparent',
              color: activeTab === 'correction' ? '#ffffff' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <ShieldAlert size={14} style={{ display: 'inline', marginRight: '4px' }} />
            <span>மதிப்பெண் திருத்தம்</span>
          </button>

          <button
            onClick={() => {
              setAuditLogs(getAuditLogs());
              setActiveTab('audit');
            }}
            className="font-tamil"
            style={{
              padding: '0.45rem 0.95rem',
              fontSize: '0.825rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: activeTab === 'audit' ? 'var(--primary-dark)' : 'transparent',
              color: activeTab === 'audit' ? '#ffffff' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <FileText size={14} style={{ display: 'inline', marginRight: '4px' }} />
            <span>தணிக்கைப் பதிவு</span>
          </button>

          <button
            onClick={() => setActiveTab('participants')}
            className="font-tamil"
            style={{
              padding: '0.45rem 0.95rem',
              fontSize: '0.825rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: activeTab === 'participants' ? 'var(--primary-dark)' : 'transparent',
              color: activeTab === 'participants' ? '#ffffff' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <Users size={14} style={{ display: 'inline', marginRight: '4px' }} />
            <span>போட்டியாளர்கள்</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Step Configuration */}
      {activeTab === 'steps' && (
        <div className="card-clean" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 className="font-tamil" style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                ஐந்து மதிப்பீட்டுப் படிநிலைகள் பெயர் &amp; விளக்கம்
              </h2>
              <p className="font-tamil" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                விதி 6.4: படிநிலைகளின் இறுதி பெயர்களை போட்டி தொடங்குவதற்கு முன் மாற்றியமைக்கலாம்.
              </p>
            </div>

            <button onClick={handleSaveSteps} className="btn-case-dark font-tamil" style={{ width: 'auto', padding: '0.65rem 1.25rem' }}>
              <Save size={16} />
              <span>சேமித்து ஒத்திசை</span>
            </button>
          </div>

          {saveSuccess && (
            <div className="badge-verified-pill font-tamil" style={{ padding: '0.65rem 1rem' }}>
              <CheckCircle size={16} />
              <span>படிநிலைகள் வெற்றிகரமாக சேமிக்கப்பட்டு அனைத்து நடுவர் திரைகளிலும் ஒத்திசைக்கப்பட்டது.</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {steps.map((st, i) => (
              <div key={st.stepNumber} style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                display: 'grid',
                gridTemplateColumns: '70px 1.5fr 2fr 90px',
                gap: '1rem',
                alignItems: 'center'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
                    #{st.stepNumber}
                  </div>
                  <div className="font-tamil" style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>படிநிலை</div>
                </div>

                <div>
                  <label className="font-tamil" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem', fontWeight: 600 }}>
                    படிநிலையின் பெயர்:
                  </label>
                  <input
                    type="text"
                    value={st.nameTa}
                    onChange={(e) => handleStepChange(i, 'nameTa', e.target.value)}
                    className="input-clean font-tamil"
                    style={{ padding: '0.55rem 0.75rem', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label className="font-tamil" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem', fontWeight: 600 }}>
                    மதிப்பீட்டு விளக்கம்:
                  </label>
                  <input
                    type="text"
                    value={st.descriptionTa}
                    onChange={(e) => handleStepChange(i, 'descriptionTa', e.target.value)}
                    className="input-clean font-tamil"
                    style={{ padding: '0.55rem 0.75rem', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label className="font-tamil" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem', fontWeight: 600 }}>
                    அதிகபட்சம்:
                  </label>
                  <input
                    type="number"
                    value={st.maxScore}
                    disabled
                    className="input-clean"
                    style={{ padding: '0.55rem', textAlign: 'center', fontWeight: 800 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Audited Score Override */}
      {activeTab === 'correction' && (
        <div className="card-clean" style={{ maxWidth: '680px', margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
            <div className="review-icon-bubble" style={{ width: '44px', height: '44px', margin: 0 }}>
              <AlertTriangle size={20} color="var(--accent-blue)" />
            </div>
            <div>
              <h2 className="font-tamil" style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                அங்கீகரிக்கப்பட்ட நடுவர் மதிப்பெண் திருத்தம்
              </h2>
              <p className="font-tamil" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                விதி 3.1: எந்த ஒரு நிர்வாகியும் இரகசியமாக மதிப்பெண்களை மாற்ற முடியாது. அனைத்து திருத்தங்களுக்கும் கட்டாய காரணம் குறிப்பிடப்பட வேண்டும்.
              </p>
            </div>
          </div>

          <form onSubmit={handleExecuteCorrection} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="font-tamil" style={{ fontSize: '0.825rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                அமர்வு / போட்டியாளர் தேர்வு:
              </label>
              <select
                value={corrSessionId}
                onChange={(e) => setCorrSessionId(e.target.value)}
                className="input-clean font-tamil"
              >
                {activeSession && (
                  <option value={activeSession.sessionId}>
                    [நேரலை] {activeSession.participant.participantNameTa} ({activeSession.participant.registrationId}) - கூட்டு மதிப்பெண்: {activeSession.grandTotal}/75
                  </option>
                )}
                {completedSessions.map(cs => (
                  <option key={cs.sessionId} value={cs.sessionId}>
                    [முடிந்தது] {cs.participant.participantNameTa} ({cs.participant.registrationId}) - கூட்டு மதிப்பெண்: {cs.grandTotal}/75
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              <div>
                <label className="font-tamil" style={{ fontSize: '0.825rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                  நடுவர் தேர்வு:
                </label>
                <select
                  value={corrJudge}
                  onChange={(e) => setCorrJudge(e.target.value as any)}
                  className="input-clean font-tamil"
                >
                  <option value="judge1">நடுவர் 1</option>
                  <option value="judge2">நடுவர் 2</option>
                  <option value="judge3">நடுவர் 3</option>
                </select>
              </div>

              <div>
                <label className="font-tamil" style={{ fontSize: '0.825rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                  படிநிலை (1-5):
                </label>
                <select
                  value={corrStep}
                  onChange={(e) => setCorrStep(Number(e.target.value) as any)}
                  className="input-clean font-tamil"
                >
                  {[1, 2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>படிநிலை {n}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-tamil" style={{ fontSize: '0.825rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                  புதிய மதிப்பெண் (0-5):
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={corrNewScore}
                  onChange={(e) => setCorrNewScore(Number(e.target.value))}
                  className="input-clean"
                  style={{ fontWeight: 800 }}
                />
              </div>
            </div>

            <div>
              <label className="font-tamil" style={{ fontSize: '0.825rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                * திருத்தத்திற்கான கட்டாயக் காரணம் (தணிக்கைக்காக):
              </label>
              <textarea
                required
                rows={3}
                placeholder="எ.கா: நடுவர் குழு மேல்முறையீட்டு முடிவு, காணொளி மறுஆய்வு அல்லது நடுவரின் உள்ளீட்டுப் பிழை திருத்தப்பட்டது..."
                value={corrReason}
                onChange={(e) => setCorrReason(e.target.value)}
                className="input-clean font-tamil"
              />
            </div>

            {corrStatus && (
              <div className={corrStatus.success ? 'badge-verified-pill font-tamil' : 'badge-gray-pill font-tamil'} style={{ padding: '0.75rem', width: '100%', justifyContent: 'center' }}>
                {corrStatus.msg}
              </div>
            )}

            <button type="submit" className="btn-case-dark font-tamil">
              <Edit3 size={16} />
              <span>தணிக்கை செய்து மதிப்பெண்ணை மாற்று</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Immutable Audit Trail */}
      {activeTab === 'audit' && (
        <div className="card-clean">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 className="font-tamil" style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              அமைப்பின் தணிக்கைப் பதிவுகள் (Audit Logs)
            </h2>
            <span className="badge-gray-pill font-tamil">{auditLogs.length} பதிவுகள்</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th className="font-tamil" style={{ padding: '0.65rem' }}>நேரம்</th>
                  <th className="font-tamil" style={{ padding: '0.65rem' }}>செயல்புரிந்தவர்</th>
                  <th className="font-tamil" style={{ padding: '0.65rem' }}>செயல்பாடு</th>
                  <th className="font-tamil" style={{ padding: '0.65rem' }}>போட்டியாளர்</th>
                  <th className="font-tamil" style={{ padding: '0.65rem' }}>மாற்றம்</th>
                  <th className="font-tamil" style={{ padding: '0.65rem' }}>காரணம்</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td className="font-mono" style={{ padding: '0.65rem', color: 'var(--text-muted)' }}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td style={{ padding: '0.65rem' }}>
                      <span className="badge-gray-pill font-tamil">{log.actorName}</span>
                    </td>
                    <td className="font-tamil" style={{ padding: '0.65rem', fontWeight: 600 }}>{log.action}</td>
                    <td className="font-tamil" style={{ padding: '0.65rem' }}>{log.participantName}</td>
                    <td style={{ padding: '0.65rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
                      {log.oldValue} → {log.newValue}
                    </td>
                    <td className="font-tamil" style={{ padding: '0.65rem', color: 'var(--text-secondary)' }}>
                      {log.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Participant Roster */}
      {activeTab === 'participants' && (
        <div className="card-clean">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 className="font-tamil" style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              பதிவு செய்யப்பட்ட போட்டியாளர்கள் விவரம்
            </h2>
            <span className="badge-gray-pill font-tamil">{participants.length} போட்டியாளர்கள்</span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem'
          }}>
            {participants.map(p => (
              <div key={p.participantId} style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'center'
              }}>
                <img
                  src={p.photoUrl}
                  alt={p.participantNameTa}
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.2rem' }}>
                    <span className="badge-verified-pill font-mono" style={{ fontSize: '0.65rem' }}>{p.registrationId}</span>
                    <span className="badge-gray-pill font-tamil" style={{ fontSize: '0.65rem' }}>{p.ageCategory}</span>
                  </div>
                  <div className="font-tamil" style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.participantNameTa}
                  </div>
                  <div className="font-tamil" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {p.clubOrDistrict}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
