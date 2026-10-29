import type {
  Participant,
  JudgingStepConfig,
  JudgingSession,
  AuditLog,
  RankedResult,
  JudgeScores
} from '../types';
import { rtdb } from '../firebase';
import { ref as fbRef, set as fbSet, onValue as fbOnValue } from 'firebase/database';

const SYNC_CHANNEL_NAME = 'porkkalai_thiruvizha_2027_sync';
const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel(SYNC_CHANNEL_NAME)
  : null;

// Initial 5 Judging Steps
export const DEFAULT_STEPS: JudgingStepConfig[] = [
  {
    stepNumber: 1,
    nameTa: 'மெய்வழக்கு & நின்றுகாட்டுதல்',
    nameEn: 'மெய்வழக்கு & நின்றுகாட்டுதல்',
    descriptionTa: 'சரியான கால் நிலைப்பாடு, தற்காப்பு நின்றுகாட்டுதல் மற்றும் உடல் நிலைத்தன்மை',
    descriptionEn: 'சரியான கால் நிலைப்பாடு, தற்காப்பு நின்றுகாட்டுதல் மற்றும் உடல் நிலைத்தன்மை',
    maxScore: 5
  },
  {
    stepNumber: 2,
    nameTa: 'வீச்சு வேகம் & லாவகம்',
    nameEn: 'வீச்சு வேகம் & லாவகம்',
    descriptionTa: 'வீச்சுகளின் வேகம், தொடர்ச்சி மற்றும் லாவகமான அசைவுகள்',
    descriptionEn: 'வீச்சுகளின் வேகம், தொடர்ச்சி மற்றும் லாவகமான அசைவுகள்',
    maxScore: 5
  },
  {
    stepNumber: 3,
    nameTa: 'தாளக்கட்டு & தாளலய நேர்த்தி',
    nameEn: 'தாளக்கட்டு & தாளலய நேர்த்தி',
    descriptionTa: 'காலடி வரிசை தாளலய ஒருங்கிணைப்பு மற்றும் நடை வேகம்',
    descriptionEn: 'காலடி வரிசை தாளலய ஒருங்கிணைப்பு மற்றும் நடை வேகம்',
    maxScore: 5
  },
  {
    stepNumber: 4,
    nameTa: 'ஆயுதக் கட்டுப்பாடு & இலக்கு',
    nameEn: 'ஆயுதக் கட்டுப்பாடு & இலக்கு',
    descriptionTa: 'ஆயுதத்தை கையாளுதல், பிடி நேர்த்தி மற்றும் துல்லியமான திசை திருப்பல்',
    descriptionEn: 'ஆயுதத்தை கையாளுதல், பிடி நேர்த்தி மற்றும் துல்லியமான திசை திருப்பல்',
    maxScore: 5
  },
  {
    stepNumber: 5,
    nameTa: 'வீர நடை & வீர வெளிப்பாடு',
    nameEn: 'வீர நடை & வீர வெளிப்பாடு',
    descriptionTa: 'போர்க்கலைக்குரிய கம்பீரம், கண் பார்வை மற்றும் ஒட்டுமொத்த வெளிப்பாடு',
    descriptionEn: 'போர்க்கலைக்குரிய கம்பீரம், கண் பார்வை மற்றும் ஒட்டுமொத்த வெளிப்பாடு',
    maxScore: 5
  }
];

// Initial Realistic Participants for Testing
export const INITIAL_PARTICIPANTS: Participant[] = [
  {
    participantId: 'PART-001',
    registrationId: 'PK27-SIL-0101',
    participantName: 'கபிலன் முருகன்',
    participantNameTa: 'கபிலன் முருகன்',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    competitionId: 'COMP-SIL-01',
    competitionName: 'நெடுங்கம்பு வீச்சு (தனிநபர்)',
    competitionNameTa: 'நெடுங்கம்பு வீச்சு (தனிநபர்)',
    categoryId: 'CAT-SENIOR-M',
    categoryName: 'மூத்தோர் பிரிவு (ஆண்கள்)',
    categoryNameTa: 'மூத்தோர் பிரிவு (ஆண்கள்)',
    ageCategory: '18-25 வயது',
    qrIdentifier: 'PK27-SIL-0101-SECURE',
    registrationStatus: 'confirmed',
    clubOrDistrict: 'மதுரை சிலம்பக் கழகம்'
  },
  {
    participantId: 'PART-002',
    registrationId: 'PK27-SIL-0102',
    participantName: 'தமிழ்ச்செல்வி ஆறுமுகம்',
    participantNameTa: 'தமிழ்ச்செல்வி ஆறுமுகம்',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    competitionId: 'COMP-SIL-01',
    competitionName: 'நெடுங்கம்பு வீச்சு (தனிநபர்)',
    competitionNameTa: 'நெடுங்கம்பு வீச்சு (தனிநபர்)',
    categoryId: 'CAT-SENIOR-W',
    categoryName: 'மூத்தோர் பிரிவு (பெண்கள்)',
    categoryNameTa: 'மூத்தோர் பிரிவு (பெண்கள்)',
    ageCategory: '18-25 வயது',
    qrIdentifier: 'PK27-SIL-0102-SECURE',
    registrationStatus: 'confirmed',
    clubOrDistrict: 'தஞ்சாவூர் வீரகலை மன்றம்'
  },
  {
    participantId: 'PART-003',
    registrationId: 'PK27-SUR-0201',
    participantName: 'செந்தில் வேலன்',
    participantNameTa: 'செந்தில் வேலன்',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    competitionId: 'COMP-SUR-02',
    competitionName: 'சுருள்வாள் வீச்சு',
    competitionNameTa: 'சுருள்வாள் வீச்சு',
    categoryId: 'CAT-SENIOR-M',
    categoryName: 'மூத்தோர் பிரிவு (ஆண்கள்)',
    categoryNameTa: 'மூத்தோர் பிரிவு (ஆண்கள்)',
    ageCategory: '18-25 வயது',
    qrIdentifier: 'PK27-SUR-0201-SECURE',
    registrationStatus: 'confirmed',
    clubOrDistrict: 'திருநெல்வேலி போர்க்கலை சங்கம்'
  },
  {
    participantId: 'PART-004',
    registrationId: 'PK27-MNK-0301',
    participantName: 'மதன் குமார்',
    participantNameTa: 'மதன் குமார்',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    competitionId: 'COMP-MNK-03',
    competitionName: 'மான் கொம்பு / மடுவு வீச்சு',
    competitionNameTa: 'மான் கொம்பு / மடுவு வீச்சு',
    categoryId: 'CAT-SENIOR-M',
    categoryName: 'மூத்தோர் பிரிவு (ஆண்கள்)',
    categoryNameTa: 'மூத்தோர் பிரிவு (ஆண்கள்)',
    ageCategory: '18-25 வயது',
    qrIdentifier: 'PK27-MNK-0301-SECURE',
    registrationStatus: 'confirmed',
    clubOrDistrict: 'கோயம்புத்தூர் தற்காப்புக் கலை அறக்கட்டளை'
  },
  {
    participantId: 'PART-005',
    registrationId: 'PK27-SIL-0103',
    participantName: 'அனிதா பாண்டியன்',
    participantNameTa: 'அனிதா பாண்டியன்',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    competitionId: 'COMP-SIL-01',
    competitionName: 'நெடுங்கம்பு வீச்சு (தனிநபர்)',
    competitionNameTa: 'நெடுங்கம்பு வீச்சு (தனிநபர்)',
    categoryId: 'CAT-SENIOR-W',
    categoryName: 'மூத்தோர் பிரிவு (பெண்கள்)',
    categoryNameTa: 'மூத்தோர் பிரிவு (பெண்கள்)',
    ageCategory: '18-25 வயது',
    qrIdentifier: 'PK27-SIL-0103-SECURE',
    registrationStatus: 'confirmed',
    clubOrDistrict: 'சென்னை வளரி கழகம்'
  },
  {
    participantId: 'PART-006',
    registrationId: 'PK27-VAL-0401',
    participantName: 'இளங்கோ கரிகாலன்',
    participantNameTa: 'இளங்கோ கரிகாலன்',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    competitionId: 'COMP-VAL-04',
    competitionName: 'வாள் மற்றும் பரிசை வீச்சு',
    competitionNameTa: 'வாள் மற்றும் பரிசை வீச்சு',
    categoryId: 'CAT-SENIOR-M',
    categoryName: 'மூத்தோர் பிரிவு (ஆண்கள்)',
    categoryNameTa: 'மூத்தோர் பிரிவு (ஆண்கள்)',
    ageCategory: '18-25 வயது',
    qrIdentifier: 'PK27-VAL-0401-SECURE',
    registrationStatus: 'confirmed',
    clubOrDistrict: 'காஞ்சிபுரம் சிலம்பக் கழகம்'
  }
];

export const STORAGE_KEYS = {
  PARTICIPANTS: 'pk27_participants',
  STEPS: 'pk27_judging_steps',
  ACTIVE_SESSION: 'pk27_active_session',
  COMPLETED_SESSIONS: 'pk27_completed_sessions',
  AUDIT_LOGS: 'pk27_audit_logs',
  ARENA_ID: 'pk27_selected_arena',
  LANGUAGE: 'pk27_language',
  PUBLISHED_STATUS: 'pk27_published_status'
};

// Storage helper functions
export const getStoredParticipants = (): Participant[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(INITIAL_PARTICIPANTS));
    return INITIAL_PARTICIPANTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_PARTICIPANTS;
  }
};

export const getStoredSteps = (): JudgingStepConfig[] => {
  const data = localStorage.getItem(STORAGE_KEYS.STEPS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.STEPS, JSON.stringify(DEFAULT_STEPS));
    return DEFAULT_STEPS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_STEPS;
  }
};

export const saveStoredSteps = (steps: JudgingStepConfig[], actorName: string = 'Admin') => {
  const oldSteps = getStoredSteps();
  localStorage.setItem(STORAGE_KEYS.STEPS, JSON.stringify(steps));
  addAuditLog({
    actorRole: 'admin',
    actorName,
    action: 'UPDATE_STEP_CONFIG',
    sessionId: 'GLOBAL',
    participantName: 'N/A',
    oldValue: JSON.stringify(oldSteps.map(s => s.nameEn)),
    newValue: JSON.stringify(steps.map(s => s.nameEn)),
    reason: 'Admin adjusted judging step names/descriptions'
  });
  notifyStateChange('STEPS_UPDATED', steps);
};

export const createEmptyJudgeScores = (): JudgeScores => ({
  s1: null,
  s2: null,
  s3: null,
  s4: null,
  s5: null,
  judgeTotal: 0,
  status: 'scoring',
  finishedAt: null,
  lastUpdatedAt: new Date().toISOString()
});

export const getActiveSession = (): JudgingSession | null => {
  const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const getCompletedSessions = (): JudgingSession[] => {
  const data = localStorage.getItem(STORAGE_KEYS.COMPLETED_SESSIONS);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const getAuditLogs = (): AuditLog[] => {
  const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const addAuditLog = (logData: Omit<AuditLog, 'id' | 'timestamp'>) => {
  const logs = getAuditLogs();
  const newLog: AuditLog = {
    ...logData,
    id: 'LOG-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString()
  };
  logs.unshift(newLog);
  // Keep last 200 logs
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 200)));
  notifyStateChange('AUDIT_UPDATED', newLog);
};

// Start a new judging session for a participant
export const startJudgingSession = (
  participant: Participant,
  arenaId: string = 'ARENA-1',
  arenaName: string = 'அரங்கம் 1 (Main Arena)',
  operatorId: string = 'OP-01'
): JudgingSession => {
  const sessionId = 'SESS-' + Date.now();
  const newSession: JudgingSession = {
    sessionId,
    arenaId,
    arenaName,
    participantId: participant.participantId,
    participant,
    competitionId: participant.competitionId,
    status: 'active',
    startedAt: new Date().toISOString(),
    operatorId,
    judgeStatuses: {
      judge1: 'scoring',
      judge2: 'scoring',
      judge3: 'scoring'
    },
    scores: {
      judge1: createEmptyJudgeScores(),
      judge2: createEmptyJudgeScores(),
      judge3: createEmptyJudgeScores()
    },
    grandTotal: 0,
    isLocked: false
  };

  localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(newSession));
  addAuditLog({
    actorRole: 'operator',
    actorName: 'QR Operator',
    action: 'START_SESSION',
    sessionId,
    participantName: participant.participantName,
    oldValue: 'IDLE',
    newValue: `ACTIVE (${participant.registrationId})`,
    reason: 'Operator verified QR code and launched live scoring'
  });

  notifyStateChange('SESSION_STARTED', newSession);
  return newSession;
};

// Calculate judge total safely (ignoring null)
export const calculateJudgeTotal = (s: JudgeScores): number => {
  const v1 = s.s1 ?? 0;
  const v2 = s.s2 ?? 0;
  const v3 = s.s3 ?? 0;
  const v4 = s.s4 ?? 0;
  const v5 = s.s5 ?? 0;
  return v1 + v2 + v3 + v4 + v5;
};

// Calculate grand total from session
export const calculateGrandTotal = (session: JudgingSession): number => {
  return session.scores.judge1.judgeTotal +
    session.scores.judge2.judgeTotal +
    session.scores.judge3.judgeTotal;
};

// Update an individual step score for a specific judge
export const updateJudgeStepScore = (
  judgeKey: 'judge1' | 'judge2' | 'judge3',
  stepIndex: 1 | 2 | 3 | 4 | 5,
  score: number | null
): JudgingSession | null => {
  const session = getActiveSession();
  if (!session || session.status !== 'active') return null;

  // Cannot modify if judge is already finished
  if (session.judgeStatuses[judgeKey] === 'finished') {
    console.warn(`Judge ${judgeKey} has already finalized scores and cannot edit.`);
    return session;
  }

  // Validate score bounds [0, 5] if not null
  if (score !== null && (score < 0 || score > 5 || !Number.isInteger(score))) {
    throw new Error('Invalid score: must be an integer between 0 and 5');
  }

  const stepKey = `s${stepIndex}` as keyof Pick<JudgeScores, 's1' | 's2' | 's3' | 's4' | 's5'>;
  const judgeScoreObj = session.scores[judgeKey];
  judgeScoreObj[stepKey] = score;
  judgeScoreObj.judgeTotal = calculateJudgeTotal(judgeScoreObj);
  judgeScoreObj.lastUpdatedAt = new Date().toISOString();

  session.grandTotal = calculateGrandTotal(session);

  localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
  notifyStateChange('SCORE_UPDATED', { session, judgeKey, stepIndex, score });
  return session;
};

// Finish evaluation for a single judge
export const finishJudgeEvaluation = (
  judgeKey: 'judge1' | 'judge2' | 'judge3'
): { success: boolean; error?: string; session?: JudgingSession } => {
  const session = getActiveSession();
  if (!session || session.status !== 'active') {
    return { success: false, error: 'No active judging session found.' };
  }

  const scores = session.scores[judgeKey];
  // Verify all 5 steps are filled (not null)
  if (scores.s1 === null || scores.s2 === null || scores.s3 === null || scores.s4 === null || scores.s5 === null) {
    return {
      success: false,
      error: 'All 5 steps must be scored before finishing. An unanswered step cannot be submitted.'
    };
  }

  session.judgeStatuses[judgeKey] = 'finished';
  scores.status = 'finished';
  scores.finishedAt = new Date().toISOString();

  // Check if all 3 judges have now finished
  const allFinished =
    session.judgeStatuses.judge1 === 'finished' &&
    session.judgeStatuses.judge2 === 'finished' &&
    session.judgeStatuses.judge3 === 'finished';

  if (allFinished) {
    session.status = 'completed';
    session.completedAt = new Date().toISOString();
    session.isLocked = true;

    // Archive into completed sessions
    const completed = getCompletedSessions();
    // avoid duplicates
    const filtered = completed.filter(s => s.sessionId !== session.sessionId);
    filtered.unshift(session);
    localStorage.setItem(STORAGE_KEYS.COMPLETED_SESSIONS, JSON.stringify(filtered));

    addAuditLog({
      actorRole: 'judge',
      actorName: 'Consensus Completion',
      action: 'SESSION_COMPLETED',
      sessionId: session.sessionId,
      participantName: session.participant.participantName,
      oldValue: 'IN_PROGRESS',
      newValue: `COMPLETED (Grand Total: ${session.grandTotal}/75)`,
      reason: 'All 3 judges submitted final locked marks'
    });
  }

  localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
  notifyStateChange('JUDGE_FINISHED', { session, judgeKey, allFinished });
  return { success: true, session };
};

// Admin authorized score correction
export const adminCorrectScore = (
  sessionId: string,
  judgeKey: 'judge1' | 'judge2' | 'judge3',
  stepIndex: 1 | 2 | 3 | 4 | 5,
  newScore: number,
  reason: string,
  adminName: string = 'Super Admin'
): boolean => {
  if (!reason.trim()) {
    throw new Error('Authorized score modifications require a documented reason for audit compliance.');
  }

  let session = getActiveSession();
  let isFromActive = true;

  if (!session || session.sessionId !== sessionId) {
    const completed = getCompletedSessions();
    session = completed.find(s => s.sessionId === sessionId) || null;
    isFromActive = false;
  }

  if (!session) return false;

  const stepKey = `s${stepIndex}` as keyof Pick<JudgeScores, 's1' | 's2' | 's3' | 's4' | 's5'>;
  const oldScore = session.scores[judgeKey][stepKey];

  session.scores[judgeKey][stepKey] = newScore;
  session.scores[judgeKey].judgeTotal = calculateJudgeTotal(session.scores[judgeKey]);
  session.grandTotal = calculateGrandTotal(session);

  if (isFromActive) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
  } else {
    const completed = getCompletedSessions();
    const updated = completed.map(s => s.sessionId === sessionId ? session! : s);
    localStorage.setItem(STORAGE_KEYS.COMPLETED_SESSIONS, JSON.stringify(updated));
  }

  addAuditLog({
    actorRole: 'admin',
    actorName: adminName,
    action: 'ADMIN_SCORE_OVERRIDE',
    sessionId,
    participantName: session.participant.participantName,
    oldValue: `${judgeKey.toUpperCase()} Step ${stepIndex}: ${oldScore ?? '—'}`,
    newValue: `${judgeKey.toUpperCase()} Step ${stepIndex}: ${newScore}`,
    reason
  });

  notifyStateChange('SCORE_OVERRIDE', { session, judgeKey, stepIndex, newScore });
  return true;
};

// Clear active session to allow next scan (only after completion or cancel)
export const advanceToNextParticipant = (operatorName: string = 'Operator'): boolean => {
  const session = getActiveSession();
  if (!session) return true;

  if (session.status === 'active' && !session.isLocked) {
    const allFinished =
      session.judgeStatuses.judge1 === 'finished' &&
      session.judgeStatuses.judge2 === 'finished' &&
      session.judgeStatuses.judge3 === 'finished';

    if (!allFinished) {
      throw new Error('Cannot advance to next participant until all three judges have finished scoring.');
    }
  }

  // Ensure it is archived
  if (session.status === 'completed') {
    const completed = getCompletedSessions();
    if (!completed.some(s => s.sessionId === session.sessionId)) {
      completed.unshift(session);
      localStorage.setItem(STORAGE_KEYS.COMPLETED_SESSIONS, JSON.stringify(completed));
    }
  }

  localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
  addAuditLog({
    actorRole: 'operator',
    actorName: operatorName,
    action: 'SESSION_CLEARED_FOR_NEXT',
    sessionId: session.sessionId,
    participantName: session.participant.participantName,
    oldValue: session.status,
    newValue: 'IDLE',
    reason: 'Operator unlocked arena for next competitor scan'
  });

  notifyStateChange('SESSION_CLEARED', null);
  return true;
};

// Get calculated rankings from all completed sessions
export const getRankings = (
  competitionId?: string,
  categoryId?: string
): RankedResult[] => {
  const completed = getCompletedSessions();
  let list = completed.filter(s => s.status === 'completed' && s.isLocked);

  if (competitionId && competitionId !== 'ALL') {
    list = list.filter(s => s.participant.competitionId === competitionId);
  }
  if (categoryId && categoryId !== 'ALL') {
    list = list.filter(s => s.participant.categoryId === categoryId);
  }

  // Sort descending by grand total
  list.sort((a, b) => b.grandTotal - a.grandTotal);

  // Build ranking items and detect ties
  const results: RankedResult[] = [];
  let currentRank = 1;

  for (let i = 0; i < list.length; i++) {
    const s = list[i];
    const prev = list[i - 1];
    const next = list[i + 1];

    const isTie = (prev && prev.grandTotal === s.grandTotal) ||
                  (next && next.grandTotal === s.grandTotal);

    if (i > 0 && s.grandTotal < list[i - 1].grandTotal) {
      currentRank = i + 1;
    }

    const stepTotals: [number, number, number, number, number] = [
      (s.scores.judge1.s1 ?? 0) + (s.scores.judge2.s1 ?? 0) + (s.scores.judge3.s1 ?? 0),
      (s.scores.judge1.s2 ?? 0) + (s.scores.judge2.s2 ?? 0) + (s.scores.judge3.s2 ?? 0),
      (s.scores.judge1.s3 ?? 0) + (s.scores.judge2.s3 ?? 0) + (s.scores.judge3.s3 ?? 0),
      (s.scores.judge1.s4 ?? 0) + (s.scores.judge2.s4 ?? 0) + (s.scores.judge3.s4 ?? 0),
      (s.scores.judge1.s5 ?? 0) + (s.scores.judge2.s5 ?? 0) + (s.scores.judge3.s5 ?? 0)
    ];

    results.push({
      participantId: s.participant.participantId,
      registrationId: s.participant.registrationId,
      participantName: s.participant.participantName,
      participantNameTa: s.participant.participantNameTa,
      photoUrl: s.participant.photoUrl,
      competitionId: s.participant.competitionId,
      competitionName: s.participant.competitionName,
      categoryId: s.participant.categoryId,
      categoryName: s.participant.categoryName,
      clubOrDistrict: s.participant.clubOrDistrict,
      grandTotal: s.grandTotal,
      stepTotals,
      judgeTotals: [
        s.scores.judge1.judgeTotal,
        s.scores.judge2.judgeTotal,
        s.scores.judge3.judgeTotal
      ],
      rank: currentRank,
      isTie: !!isTie,
      sessionId: s.sessionId,
      completedAt: s.completedAt || s.startedAt
    });
  }

  return results;
};

// LAN WebSocket Client Synchronization
let wsClient: WebSocket | null = null;
let isWsConnected = false;
let currentClientCount = 1;
const networkStatusListeners = new Set<(status: { connected: boolean; clientCount: number }) => void>();

export const getNetworkSyncStatus = () => ({
  connected: isWsConnected,
  clientCount: currentClientCount
});

export const subscribeToNetworkStatus = (listener: (status: { connected: boolean; clientCount: number }) => void) => {
  networkStatusListeners.add(listener);
  listener(getNetworkSyncStatus());
  return () => {
    networkStatusListeners.delete(listener);
  };
};

const notifyNetworkStatus = () => {
  const status = getNetworkSyncStatus();
  networkStatusListeners.forEach(listener => {
    try {
      listener(status);
    } catch (e) {
      console.warn('Network status listener error:', e);
    }
  });
};

const initWebSocketSync = () => {
  if (typeof window === 'undefined') return;

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws-sync`;

  try {
    wsClient = new WebSocket(wsUrl);

    wsClient.onopen = () => {
      isWsConnected = true;
      notifyNetworkStatus();

      // If we have an active local session, push it to server cache so other devices get it immediately
      const localActive = getActiveSession();
      const localCompleted = getCompletedSessions();
      if (localActive) {
        wsClient?.send(JSON.stringify({
          type: 'STATE_PUSH',
          payload: {
            activeSession: localActive,
            completedSessions: localCompleted
          }
        }));
      } else {
        // Request state in case another PC already initialized a session
        wsClient?.send(JSON.stringify({ type: 'REQUEST_STATE', payload: null }));
      }
    };

    wsClient.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const { type, payload } = msg;

        if (type === 'CLIENT_COUNT') {
          currentClientCount = payload?.clientCount || 1;
          notifyNetworkStatus();
          return;
        }

        if (type === 'FULL_STATE_INIT') {
          currentClientCount = payload?.clientCount || 1;
          notifyNetworkStatus();

          let hasChanges = false;
          if (payload?.activeSession) {
            localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(payload.activeSession));
            hasChanges = true;
          }
          if (payload?.completedSessions && payload.completedSessions.length > 0) {
            localStorage.setItem(STORAGE_KEYS.COMPLETED_SESSIONS, JSON.stringify(payload.completedSessions));
            hasChanges = true;
          }
          if (payload?.steps && payload.steps.length > 0) {
            localStorage.setItem(STORAGE_KEYS.STEPS, JSON.stringify(payload.steps));
            hasChanges = true;
          }
          if (payload?.participants && payload.participants.length > 0) {
            localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(payload.participants));
            hasChanges = true;
          }

          if (hasChanges) {
            window.dispatchEvent(new CustomEvent('porkkalai_state_change', { detail: { type: 'FULL_STATE_INIT', payload } }));
          }
          return;
        }

        // Handle live score/session events from other PCs
        if (type === 'SESSION_STARTED') {
          localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(payload));
        } else if (type === 'SCORE_UPDATED') {
          const session = payload?.session || payload;
          localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
        } else if (type === 'JUDGE_FINISHED') {
          const session = payload?.session || payload;
          localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
          if (payload?.allFinished && session) {
            const completed = getCompletedSessions();
            const filtered = completed.filter(s => s.sessionId !== session.sessionId);
            filtered.unshift(session);
            localStorage.setItem(STORAGE_KEYS.COMPLETED_SESSIONS, JSON.stringify(filtered));
          }
        } else if (type === 'SCORE_OVERRIDE') {
          const session = payload?.session;
          if (session) {
            localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
          }
        } else if (type === 'SESSION_CLEARED') {
          localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
        } else if (type === 'STEPS_UPDATED') {
          localStorage.setItem(STORAGE_KEYS.STEPS, JSON.stringify(payload));
        }

        // Trigger local UI reactivity
        window.dispatchEvent(new CustomEvent('porkkalai_state_change', { detail: msg }));
      } catch (e) {
        console.error('Error handling WebSocket message in client:', e);
      }
    };

    wsClient.onclose = () => {
      isWsConnected = false;
      notifyNetworkStatus();
      // Reconnect after 2.5 seconds
      setTimeout(initWebSocketSync, 2500);
    };

    wsClient.onerror = () => {
      // wsClient.onclose will fire after onerror
    };
  } catch (err) {
    console.warn('Could not initialize WebSocket LAN sync:', err);
    setTimeout(initWebSocketSync, 3000);
  }
};

// Initialize WebSocket in browser
if (typeof window !== 'undefined') {
  initWebSocketSync();
}

// Firebase Realtime Database Sync
let isFirebaseIncoming = false;

const initFirebaseRealtimeSync = () => {
  if (typeof window === 'undefined') return;
  try {
    const sessionDbRef = fbRef(rtdb, 'arena/activeSession');
    fbOnValue(sessionDbRef, (snapshot) => {
      const data = snapshot.val();
      const current = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
      const incomingStr = data ? JSON.stringify(data) : null;
      if (incomingStr !== current) {
        isFirebaseIncoming = true;
        if (incomingStr) {
          localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, incomingStr);
        } else {
          localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
        }
        window.dispatchEvent(new CustomEvent('porkkalai_state_change', {
          detail: { type: 'FIREBASE_SYNC', payload: data }
        }));
        isFirebaseIncoming = false;
      }
    });
  } catch (err) {
    console.warn('Firebase Realtime sync error:', err);
  }
};

if (typeof window !== 'undefined') {
  initFirebaseRealtimeSync();
}

// Cross-tab, Cross-PC, and Firebase Cloud notification system
export const notifyStateChange = (type: string, payload: any) => {
  const message = { type, payload, timestamp: Date.now() };

  // 1. Send over WebSocket to other PCs on the local network
  if (wsClient && wsClient.readyState === WebSocket.OPEN) {
    try {
      wsClient.send(JSON.stringify(message));
    } catch (e) {
      console.warn('WebSocket send error:', e);
    }
  }

  // 2. Send over BroadcastChannel to tabs on the same PC
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(message);
    } catch (e) {
      console.warn('BroadcastChannel post error:', e);
    }
  }

  // 3. Dispatch local window custom event for same-tab reactivity
  window.dispatchEvent(new CustomEvent('porkkalai_state_change', { detail: message }));

  // 4. Send to Firebase Realtime Database cloud
  if (!isFirebaseIncoming) {
    try {
      if (type === 'SESSION_STARTED' || type === 'SCORE_UPDATED' || type === 'JUDGE_FINISHED' || type === 'SCORE_OVERRIDE') {
        const session = getActiveSession();
        if (session) {
          fbSet(fbRef(rtdb, 'arena/activeSession'), session);
        }
      } else if (type === 'SESSION_CLEARED') {
        fbSet(fbRef(rtdb, 'arena/activeSession'), null);
      }
    } catch (fbErr) {
      console.warn('Firebase RTDB write error:', fbErr);
    }
  }
};

// Subscribe to state changes across tabs/windows/PCs
export const subscribeToSync = (callback: (event: { type: string; payload: any }) => void) => {
  const handleMessage = (e: MessageEvent) => {
    callback(e.data);
  };
  const handleCustomEvent = (e: Event) => {
    const custom = e as CustomEvent;
    callback(custom.detail);
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleMessage);
  }
  window.addEventListener('porkkalai_state_change', handleCustomEvent);
  window.addEventListener('storage', () => {
    callback({ type: 'STORAGE_SYNC', payload: null });
  });

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleMessage);
    }
    window.removeEventListener('porkkalai_state_change', handleCustomEvent);
  };
};
