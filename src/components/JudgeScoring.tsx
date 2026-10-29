import React, { useState } from 'react';
import type {
  JudgingSession,
  Language,
  JudgingStepConfig
} from '../types';
import {
  getStoredSteps,
  updateJudgeStepScore,
  finishJudgeEvaluation
} from '../services/storage';
import {
  Award,
  AlertCircle,
  Lock,
  Check,
  ShieldCheck,
  FileCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface JudgeScoringProps {
  judgeKey: 'judge1' | 'judge2' | 'judge3';
  activeSession: JudgingSession | null;
  language: Language;
  onSessionUpdated: () => void;
}

export const JudgeScoring: React.FC<JudgeScoringProps> = ({
  judgeKey,
  activeSession,
  onSessionUpdated
}) => {
  const steps: JudgingStepConfig[] = getStoredSteps();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expandedStep, setExpandedStep] = useState<number>(1);

  const judgeIndex = judgeKey === 'judge1' ? 1 : judgeKey === 'judge2' ? 2 : 3;
  const judgeTitleTa = `நடுவர் ${judgeIndex}`;

  if (!activeSession || activeSession.status !== 'active') {
    return (
      <div className="mobile-view-wrapper">
        <div className="review-notice-card" style={{ marginTop: '2rem' }}>
          <div className="review-icon-bubble">
            <Award size={32} color="var(--accent-blue)" />
          </div>
          <h2 className="font-tamil" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
            {judgeTitleTa} - மதிப்பீட்டு அமர்வுக்காக காத்திருக்கிறது
          </h2>
          <p className="font-tamil" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            ஸ்கேனர் ஆபரேட்டர் அடுத்த போட்டியாளரின் QR குறியீட்டை சரிபார்த்து அமர்வை தொடங்கியவுடன் மதிப்பீட்டு படிவம் இங்கு தானாக தோன்றும்.
          </p>
          <div className="badge-blue-pill font-tamil" style={{ padding: '0.4rem 1rem' }}>
            அரங்கம் 1 • நேரலை தயார் நிலை
          </div>
        </div>
      </div>
    );
  }

  const participant = activeSession.participant;
  const currentScores = activeSession.scores[judgeKey];
  const isFinished = activeSession.judgeStatuses[judgeKey] === 'finished';

  const scoreValues: [number | null, number | null, number | null, number | null, number | null] = [
    currentScores.s1,
    currentScores.s2,
    currentScores.s3,
    currentScores.s4,
    currentScores.s5
  ];

  const answeredCount = scoreValues.filter(s => s !== null).length;
  const isAllAnswered = answeredCount === 5;

  const handleScoreSelect = (stepIndex: 1 | 2 | 3 | 4 | 5, value: number) => {
    if (isFinished) return;
    setErrorMessage(null);
    try {
      updateJudgeStepScore(judgeKey, stepIndex, value);
      onSessionUpdated();
      if (stepIndex < 5 && scoreValues[stepIndex as 1 | 2 | 3 | 4] === null) {
        setExpandedStep(stepIndex + 1);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'மதிப்பெண் பதிவில் பிழை ஏற்பட்டது');
    }
  };

  const handleOpenFinishConfirm = () => {
    setErrorMessage(null);
    if (!isAllAnswered) {
      setErrorMessage('அனைத்து 5 படிநிலைகளுக்கும் கட்டாயம் மதிப்பெண் வழங்கப்பட வேண்டும். விடுபட்ட படிநிலைகள் இருக்கக்கூடாது.');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmFinish = () => {
    try {
      const res = finishJudgeEvaluation(judgeKey);
      if (!res.success) {
        setErrorMessage(res.error || 'மதிப்பீட்டை முடிப்பதில் பிழை ஏற்பட்டது');
      } else {
        setShowConfirmModal(false);
        onSessionUpdated();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'மதிப்பீட்டை பூட்டுவதில் பிழை ஏற்பட்டது');
    }
  };

  return (
    <div className="mobile-view-wrapper">
      {/* If finished, show CaseKarao "Under Review / Completed" style screen */}
      {isFinished ? (
        <div className="review-notice-card" style={{ marginTop: '1.5rem' }}>
          <div className="review-icon-bubble" style={{ background: 'var(--accent-emerald-light)', borderColor: 'var(--accent-emerald-border)' }}>
            <FileCheck size={32} color="var(--accent-emerald)" />
          </div>

          <h2 className="font-tamil" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            மதிப்பீடு நிறைவுற்றது &amp; பூட்டப்பட்டது
          </h2>

          <p className="font-tamil" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            போட்டியாளர் <strong>{participant.participantNameTa}</strong> அவர்களுக்கு நீங்கள் வழங்கிய மதிப்பெண்கள் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டு அதிகாரப்பூர்வ LED பலகையில் இணைக்கப்பட்டுள்ளது.
          </p>

          {/* Score Summary Box */}
          <div style={{
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            border: '1px solid var(--border-subtle)',
            textAlign: 'left'
          }}>
            <div className="font-tamil" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              வழங்கப்பட்ட மதிப்பெண்கள் விவரம்
            </div>
            {steps.map((st, i) => (
              <div key={st.stepNumber} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.4rem 0',
                fontSize: '0.875rem',
                borderBottom: i < 4 ? '1px solid var(--border-subtle)' : 'none'
              }}>
                <span className="font-tamil" style={{ color: 'var(--text-secondary)' }}>
                  {st.stepNumber}. {st.nameTa}
                </span>
                <span className="font-display" style={{ fontWeight: 800, color: 'var(--accent-blue)' }}>
                  {scoreValues[i]} / 5
                </span>
              </div>
            ))}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '0.75rem',
              marginTop: '0.5rem',
              borderTop: '2px solid var(--border-subtle)',
              fontWeight: 800,
              fontSize: '1.05rem'
            }}>
              <span className="font-tamil">மொத்த மதிப்பெண்:</span>
              <span className="font-display" style={{ color: 'var(--text-primary)', fontSize: '1.35rem' }}>
                {currentScores.judgeTotal} / 25
              </span>
            </div>
          </div>

          <div className="badge-verified-pill font-tamil" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            <ShieldCheck size={16} />
            <span>அதிகாரப்பூர்வமாக பூட்டப்பட்டது</span>
          </div>
        </div>
      ) : (
        /* Active Scoring Interface */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Top Bar with Judge Title & Live Badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--accent-blue-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-blue)'
              }}>
                <Award size={18} />
              </div>
              <h1 className="font-tamil" style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                {judgeTitleTa} மதிப்பீட்டு பலகை
              </h1>
            </div>

            <div className="badge-blue-pill font-tamil">
              {answeredCount}/5 பூர்த்தி
            </div>
          </div>

          {/* Participant Profile Card */}
          <div className="card-clean" style={{ textAlign: 'center', padding: '1.5rem 1.25rem' }}>
            <div className="profile-avatar-container">
              <img
                src={participant.photoUrl}
                alt={participant.participantNameTa}
                className="profile-avatar-img"
              />
              <div className="avatar-badge-verified">
                <Check size={14} strokeWidth={3} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
              <span className="badge-verified-pill font-mono">{participant.registrationId}</span>
              <span className="badge-gray-pill font-tamil">{participant.ageCategory}</span>
            </div>

            <h2 className="font-tamil" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
              {participant.participantNameTa}
            </h2>
            <div className="font-tamil" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {participant.competitionNameTa}
            </div>
            <div className="font-tamil" style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', fontWeight: 600, marginTop: '0.25rem' }}>
              {participant.clubOrDistrict}
            </div>
          </div>

          {/* Running Total Card */}
          <div className="card-clean-sm" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)',
            border: '1px solid var(--accent-blue-border)'
          }}>
            <div>
              <div className="font-tamil" style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', fontWeight: 700 }}>
                உங்கள் தற்போதைய கூட்டு மதிப்பெண்
              </div>
              <div className="font-tamil" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                அதிகபட்சம்: 25 மதிப்பெண்கள்
              </div>
            </div>

            <div className="font-display" style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              {currentScores.judgeTotal} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ 25</span>
            </div>
          </div>

          {/* Error Message if any */}
          {errorMessage && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#dc2626',
              fontSize: '0.85rem'
            }}>
              <AlertCircle size={16} />
              <span className="font-tamil">{errorMessage}</span>
            </div>
          )}

          {/* 5 Steps Checklist */}
          <div>
            <div className="font-tamil" style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              marginBottom: '0.65rem'
            }}>
              மதிப்பீட்டு படிநிலைகள் (5 நிலைகள்)
            </div>

            {steps.map((step, idx) => {
              const stepIndex = (idx + 1) as 1 | 2 | 3 | 4 | 5;
              const score = scoreValues[idx];
              const isScored = score !== null;
              const isExpanded = expandedStep === step.stepNumber;

              return (
                <div
                  key={step.stepNumber}
                  style={{
                    background: '#ffffff',
                    border: isExpanded ? '1.5px solid var(--accent-blue)' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '0.75rem',
                    boxShadow: isExpanded ? '0 4px 14px rgba(37, 99, 235, 0.08)' : 'var(--shadow-card)',
                    overflow: 'hidden',
                    transition: 'all 0.18s ease'
                  }}
                >
                  {/* Step Header */}
                  <div
                    onClick={() => setExpandedStep(isExpanded ? 0 : step.stepNumber)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem 1.15rem',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div className={`step-status-circle ${isScored ? 'completed' : 'pending'}`}>
                        {isScored && <Check size={14} strokeWidth={3} />}
                      </div>

                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          படிநிலை {step.stepNumber}
                        </div>
                        <div className="font-tamil" style={{
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          color: 'var(--text-primary)'
                        }}>
                          {step.nameTa}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span className="font-display" style={{
                        fontSize: '1.2rem',
                        fontWeight: 800,
                        color: isScored ? 'var(--accent-blue)' : 'var(--text-light)'
                      }}>
                        {isScored ? `${score}/5` : '—'}
                      </span>
                      {isExpanded ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                    </div>
                  </div>

                  {/* Expanded Step Body with CaseKarao Pill Selector */}
                  {isExpanded && (
                    <div style={{
                      padding: '0.75rem 1.15rem 1.15rem',
                      borderTop: '1px solid #f1f5f9',
                      background: '#fafbfc'
                    }}>
                      <p className="font-tamil" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                        {step.descriptionTa}
                      </p>

                      {/* Pill Buttons [ 0 ] [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ] */}
                      <div className="pill-selector-group">
                        {[0, 1, 2, 3, 4, 5].map((val) => {
                          const isSelected = score === val;
                          const isZero = val === 0;

                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => handleScoreSelect(stepIndex, val)}
                              className={`pill-btn ${isSelected ? (isZero ? 'zero-active' : 'active') : ''}`}
                            >
                              <span>{val}</span>
                              <span style={{ fontSize: '0.6rem', fontWeight: 500, opacity: 0.8 }}>
                                {isZero ? 'பூஜ்ஜியம்' : 'மதிப்பெண்'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Solid Black Submit Button */}
          <div style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            <button
              onClick={handleOpenFinishConfirm}
              className="btn-case-dark font-tamil"
              disabled={!isAllAnswered}
            >
              <Lock size={18} />
              <span>மதிப்பீட்டை முடித்து பூட்டு (இறுதி சமர்ப்பிப்பு)</span>
            </button>
            {!isAllAnswered && (
              <p className="font-tamil" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
                5 படிநிலைகளும் மதிப்பிடப்பட வேண்டும் ({5 - answeredCount} விடுபட்டுள்ளது)
              </p>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-backdrop-clean">
          <div className="modal-content-clean">
            <div className="review-icon-bubble">
              <Lock size={28} color="var(--accent-blue)" />
            </div>

            <h3 className="font-tamil" style={{ fontSize: '1.35rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
              மதிப்பீட்டை இறுதி செய்கிறீர்களா?
            </h3>

            <p className="font-tamil" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              போட்டியாளர் <strong>{participant.participantNameTa}</strong> அவர்களுக்கு நீங்கள் வழங்கிய மதிப்பெண்கள் நிரந்தரமாக பூட்டப்படும். இதனை நீங்கள் பின்னர் திருத்த இயலாது.
            </p>

            <div style={{
              background: 'var(--bg-input)',
              borderRadius: 'var(--radius-sm)',
              padding: '1rem',
              marginBottom: '1.25rem',
              border: '1px solid var(--border-subtle)'
            }}>
              {steps.map((st, i) => (
                <div key={st.stepNumber} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.35rem 0',
                  fontSize: '0.85rem',
                  borderBottom: i < 4 ? '1px solid var(--border-subtle)' : 'none'
                }}>
                  <span className="font-tamil" style={{ color: 'var(--text-secondary)' }}>{st.stepNumber}. {st.nameTa}:</span>
                  <strong className="font-display" style={{ color: 'var(--accent-blue)' }}>{scoreValues[i]} / 5</strong>
                </div>
              ))}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '0.65rem',
                marginTop: '0.35rem',
                borderTop: '2px solid var(--border-subtle)',
                fontWeight: 800,
                fontSize: '1rem'
              }}>
                <span className="font-tamil">மொத்த மதிப்பெண்:</span>
                <span className="font-display" style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                  {currentScores.judgeTotal} / 25
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="btn-case-light font-tamil"
                style={{ flex: 1 }}
              >
                மீண்டும் சரிபார்
              </button>
              <button
                type="button"
                onClick={handleConfirmFinish}
                className="btn-case-dark font-tamil"
                style={{ flex: 1 }}
              >
                <Lock size={16} />
                <span>உறுதி செய்து பூட்டு</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
