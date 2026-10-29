import React, { useState } from 'react';
import type { RankedResult, Language } from '../types';
import { getRankings } from '../services/storage';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Printer,
  AlertTriangle,
  Sparkles,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';

interface RankingsViewProps {
  language: Language;
}

export const RankingsView: React.FC<RankingsViewProps> = () => {
  const [selectedCompetition, setSelectedCompetition] = useState<string>('ALL');
  const [isPublished, setIsPublished] = useState<boolean>(false);

  const rankings: RankedResult[] = getRankings(selectedCompetition);

  const hasTies = rankings.some(r => r.isTie);

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2563eb', '#10b981', '#f59e0b', '#0f172a']
    });
  };

  const handleExportCSV = () => {
    if (rankings.length === 0) return;
    const headers = ['வரிசை', 'பதிவு எண்', 'போட்டியாளர் பெயர்', 'அகாடமி / மாவட்டம்', 'படிநிலை 1', 'படிநிலை 2', 'படிநிலை 3', 'படிநிலை 4', 'படிநிலை 5', 'நடுவர் 1', 'நடுவர் 2', 'நடுவர் 3', 'கூட்டு மதிப்பெண் (/75)', 'சமநிலை கொடி'];
    const rows = rankings.map(r => [
      r.rank,
      r.registrationId,
      `"${r.participantNameTa}"`,
      `"${r.clubOrDistrict}"`,
      r.stepTotals[0],
      r.stepTotals[1],
      r.stepTotals[2],
      r.stepTotals[3],
      r.stepTotals[4],
      r.judgeTotals[0],
      r.judgeTotals[1],
      r.judgeTotals[2],
      r.grandTotal,
      r.isTie ? 'சமநிலை' : 'உறுதியானது'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Porkkalai_2027_Rankings_Tamil_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintScorecard = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 className="font-tamil" style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            வெற்றி நிலைகள் &amp; தரவரிசைப் பலகை
          </h1>
          <p className="font-tamil" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            முழுமைபெற்ற நடுவர் மதிப்பீடுகளின் அடிப்படையில் தானியங்கி தரவரிசை. சம மதிப்பெண்கள் கொடியிடப்பட்டு கண்காணிக்கப்படும்.
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select
            value={selectedCompetition}
            onChange={(e) => setSelectedCompetition(e.target.value)}
            className="font-tamil"
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-full)',
              padding: '0.55rem 0.95rem',
              fontSize: '0.825rem',
              fontWeight: 700
            }}
          >
            <option value="ALL">அனைத்துப் போட்டிகள்</option>
            <option value="COMP-SIL-01">நெடுங்கம்பு வீச்சு (தனிநபர்)</option>
            <option value="COMP-SUR-02">சுருள்வாள் வீச்சு</option>
            <option value="COMP-MNK-03">மான் கொம்பு / மடுவு வீச்சு</option>
            <option value="COMP-VAL-04">வாள் மற்றும் பரிசை வீச்சு</option>
          </select>

          <button onClick={triggerCelebration} className="btn-case-light font-tamil" style={{ padding: '0.55rem 0.95rem', fontSize: '0.825rem' }}>
            <Sparkles size={15} color="var(--accent-blue)" />
            <span>வெற்றி முழக்கம்</span>
          </button>

          <button onClick={handleExportCSV} className="btn-case-light font-tamil" style={{ padding: '0.55rem 0.95rem', fontSize: '0.825rem' }}>
            <FileSpreadsheet size={15} />
            <span>CSV கோப்பு</span>
          </button>

          <button onClick={handlePrintScorecard} className="btn-case-light font-tamil" style={{ padding: '0.55rem 0.95rem', fontSize: '0.825rem' }}>
            <Printer size={15} />
            <span>அச்சிடு</span>
          </button>

          <button
            onClick={() => setIsPublished(!isPublished)}
            className="btn-case-dark font-tamil"
            style={{ width: 'auto', padding: '0.55rem 1.25rem', fontSize: '0.825rem' }}
          >
            <CheckCircle size={15} />
            <span>{isPublished ? 'முடிவுகள் வெளியானது' : 'முடிவுகளை வெளியிடு'}</span>
          </button>
        </div>
      </div>

      {/* Tie Alert Banner if equal marks exist */}
      {hasTies && (
        <div style={{
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <AlertTriangle size={22} color="#d97706" />
          <div>
            <h4 className="font-tamil" style={{ fontSize: '0.925rem', fontWeight: 700, color: '#92400e', margin: 0 }}>
              கவனம்: சம மதிப்பெண் சமநிலை (Tie) கண்டறியப்பட்டுள்ளது!
            </h4>
            <p className="font-tamil" style={{ fontSize: '0.8rem', color: '#b45309', margin: '0.2rem 0 0' }}>
              விதி 8.3: கணினி தன்னிச்சையாக வெற்றியாளரைத் தேர்ந்தெடுக்காது. நடுவர் குழுவின் அதிகாரப்பூர்வ சமன் முறிவு விதி பதிவு செய்யப்பட வேண்டும்.
            </p>
          </div>
        </div>
      )}

      {/* Top 3 Podium Cards */}
      {rankings.length >= 1 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem'
        }}>
          {rankings.slice(0, 3).map((pod, idx) => {
            const isFirst = idx === 0;
            const isSecond = idx === 1;

            const medalTitle = isFirst ? '1-ஆம் இடம் • முதலிடம்' : isSecond ? '2-ஆம் இடம் • இரண்டாமிடம்' : '3-ஆம் இடம் • மூன்றாமிடம்';

            return (
              <div
                key={pod.participantId}
                className="card-clean"
                style={{
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '1.75rem 1.25rem',
                  position: 'relative',
                  border: isFirst ? '2px solid var(--accent-blue)' : '1px solid var(--border-subtle)'
                }}
              >
                <div className="font-tamil" style={{
                  position: 'absolute',
                  top: '-12px',
                  background: isFirst ? 'var(--primary-dark)' : '#ffffff',
                  color: isFirst ? '#ffffff' : 'var(--text-secondary)',
                  border: isFirst ? 'none' : '1px solid var(--border-subtle)',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                }}>
                  {medalTitle}
                </div>

                <div className="profile-avatar-container" style={{ marginTop: '0.5rem', marginBottom: '0.75rem' }}>
                  <img
                    src={pod.photoUrl}
                    alt={pod.participantNameTa}
                    className="profile-avatar-img"
                  />
                  {isFirst && (
                    <div className="avatar-badge-verified" style={{ background: '#f59e0b' }}>
                      <Trophy size={14} color="#ffffff" />
                    </div>
                  )}
                </div>

                <span className="badge-verified-pill font-mono" style={{ fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                  {pod.registrationId}
                </span>

                <h3 className="font-tamil" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
                  {pod.participantNameTa}
                </h3>
                <div className="font-tamil" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {pod.clubOrDistrict}
                </div>

                {/* Big Score */}
                <div style={{ marginTop: '0.85rem' }}>
                  <div className="font-display" style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                    {pod.grandTotal}
                  </div>
                  <div className="font-tamil" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    75-க்கு
                  </div>
                </div>

                {pod.isTie && (
                  <span className="badge-gray-pill font-tamil" style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: '#d97706' }}>
                    <AlertTriangle size={12} />
                    சமநிலை
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Comprehensive Ranked Table */}
      <div className="card-clean" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 className="font-tamil" style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            விரிவான போட்டி முடிவுகள்
          </h2>
          <span className="badge-gray-pill font-tamil">{rankings.length} பேர் மதிப்பீடு நிறைவு</span>
        </div>

        {rankings.length === 0 ? (
          <div style={{
            padding: '3rem 1rem',
            textAlign: 'center',
            color: 'var(--text-muted)',
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-md)'
          }}>
            <Trophy size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.3 }} />
            <div className="font-tamil" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              முடிவுகள் இன்னும் நிறைவடையவில்லை
            </div>
            <div className="font-tamil" style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>
              ஆபரேட்டர் QR ஸ்கேன் செய்து நடுவர்கள் மூவரும் முடித்த பின் இங்கு தோன்றும்.
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', textAlign: 'left' }}>
                  <th className="font-tamil" style={{ padding: '0.75rem' }}>வரிசை</th>
                  <th className="font-tamil" style={{ padding: '0.75rem' }}>போட்டியாளர்</th>
                  <th className="font-tamil" style={{ padding: '0.75rem' }}>அகாடமி / மாவட்டம்</th>
                  <th className="font-tamil" style={{ padding: '0.75rem', textAlign: 'center' }}>படிநிலைகள் மொத்தம் (15)</th>
                  <th className="font-tamil" style={{ padding: '0.75rem', textAlign: 'center' }}>நடுவர்கள் (25)</th>
                  <th className="font-tamil" style={{ padding: '0.75rem', textAlign: 'right' }}>கூட்டு மதிப்பெண்</th>
                  <th className="font-tamil" style={{ padding: '0.75rem', textAlign: 'center' }}>நிலை</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((r) => (
                  <tr key={r.participantId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <span className="font-display" style={{
                        fontSize: '1.25rem',
                        fontWeight: 900,
                        color: r.rank === 1 ? 'var(--accent-blue)' : 'var(--text-primary)'
                      }}>
                        #{r.rank}
                      </span>
                    </td>

                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <img
                          src={r.photoUrl}
                          alt={r.participantNameTa}
                          style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div className="font-tamil" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {r.participantNameTa}
                          </div>
                          <span className="badge-gray-pill font-mono" style={{ fontSize: '0.65rem' }}>
                            {r.registrationId}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="font-tamil" style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>
                      {r.clubOrDistrict}
                    </td>

                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <div className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--accent-blue)' }}>
                        [{r.stepTotals.join(', ')}]
                      </div>
                    </td>

                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <div className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        ந1: {r.judgeTotals[0]} | ந2: {r.judgeTotals[1]} | ந3: {r.judgeTotals[2]}
                      </div>
                    </td>

                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <span className="font-display" style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                        {r.grandTotal}
                      </span>
                    </td>

                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      {r.isTie ? (
                        <span className="badge-gray-pill font-tamil" style={{ color: '#d97706' }}>
                          சமநிலை
                        </span>
                      ) : (
                        <span className="badge-verified-pill font-tamil">
                          உறுதியானது
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
