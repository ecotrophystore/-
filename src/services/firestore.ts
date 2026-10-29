/**
 * firestore.ts
 * ─────────────────────────────────────────────────────────────────────
 * Firestore-backed replacement for storage.ts.
 *
 * Data model (all under project "mathiparan-d8c1c"):
 *
 *   /arena/{arenaId}                    ← one doc per judging arena
 *     .activeSession  : JudgingSession | null
 *     .steps          : JudgingStepConfig[]
 *     .participants   : Participant[]
 *     .publishedStatus: boolean
 *
 *   /arena/{arenaId}/completedSessions/{sessionId}  ← completed results
 *
 *   /arena/{arenaId}/auditLogs/{logId}  ← immutable audit trail
 *
 * Cross-device sync: onSnapshot listeners on the arena doc + collection.
 * ─────────────────────────────────────────────────────────────────────
 */

import {
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteField,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  type Unsubscribe
} from 'firebase/firestore';
import { db } from '../firebase';
import type {
  Participant,
  JudgingStepConfig,
  JudgingSession,
  AuditLog,
  RankedResult,
  JudgeScores
} from '../types';

// ─── Constants ───────────────────────────────────────────────────────
export const ARENA_ID = 'ARENA-1';
const arenaRef = () => doc(db, 'arena', ARENA_ID);
const completedRef = () => collection(db, 'arena', ARENA_ID, 'completedSessions');
const auditRef = () => collection(db, 'arena', ARENA_ID, 'auditLogs');

// ─── Default Data ────────────────────────────────────────────────────
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

// ─── Helper: strip undefined fields (Firestore rejects them) ─────────
function clean<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

// ─── Arena Initialization ────────────────────────────────────────────
/**
 * Ensures the arena doc exists in Firestore.
 * Call once on app load.
 */
export const initArena = async (): Promise<void> => {
  const ref = arenaRef();
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      arenaId: ARENA_ID,
      arenaName: 'அரங்கம் 1 (முதன்மை அரங்கம்)',
      activeSession: null,
      steps: clean(DEFAULT_STEPS),
      participants: clean(INITIAL_PARTICIPANTS),
      publishedStatus: false,
      createdAt: serverTimestamp()
    });
  }
};

// ─── Participants ─────────────────────────────────────────────────────
export const getStoredParticipants = async (): Promise<Participant[]> => {
  const snap = await getDoc(arenaRef());
  if (!snap.exists()) return INITIAL_PARTICIPANTS;
  return (snap.data().participants as Participant[]) || INITIAL_PARTICIPANTS;
};

export const saveStoredParticipants = async (participants: Participant[]): Promise<void> => {
  await updateDoc(arenaRef(), { participants: clean(participants) });
};

// ─── Judging Steps ────────────────────────────────────────────────────
export const getStoredSteps = async (): Promise<JudgingStepConfig[]> => {
  const snap = await getDoc(arenaRef());
  if (!snap.exists()) return DEFAULT_STEPS;
  return (snap.data().steps as JudgingStepConfig[]) || DEFAULT_STEPS;
};

export const saveStoredSteps = async (
  steps: JudgingStepConfig[],
  actorName: string = 'Admin'
): Promise<void> => {
  await updateDoc(arenaRef(), { steps: clean(steps) });
  await addAuditLog({
    actorRole: 'admin',
    actorName,
    action: 'UPDATE_STEP_CONFIG',
    sessionId: 'GLOBAL',
    participantName: 'N/A',
    oldValue: '',
    newValue: JSON.stringify(steps.map(s => s.nameEn)),
    reason: 'Admin adjusted judging step names/descriptions'
  });
};

// ─── Active Session ───────────────────────────────────────────────────
export const getActiveSession = async (): Promise<JudgingSession | null> => {
  const snap = await getDoc(arenaRef());
  if (!snap.exists()) return null;
  return (snap.data().activeSession as JudgingSession) || null;
};

// ─── Completed Sessions ───────────────────────────────────────────────
export const getCompletedSessions = async (): Promise<JudgingSession[]> => {
  const q = query(completedRef(), orderBy('completedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as JudgingSession);
};

// ─── Audit Logs ───────────────────────────────────────────────────────
export const getAuditLogs = async (): Promise<AuditLog[]> => {
  const q = query(auditRef(), orderBy('timestamp', 'desc'), limit(200));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as AuditLog);
};

export const addAuditLog = async (logData: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> => {
  const newLog: AuditLog = {
    ...logData,
    id: 'LOG-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString()
  };
  await addDoc(auditRef(), clean(newLog));
};

// ─── Score helpers ────────────────────────────────────────────────────
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

export const calculateJudgeTotal = (s: JudgeScores): number =>
  (s.s1 ?? 0) + (s.s2 ?? 0) + (s.s3 ?? 0) + (s.s4 ?? 0) + (s.s5 ?? 0);

export const calculateGrandTotal = (session: JudgingSession): number =>
  session.scores.judge1.judgeTotal +
  session.scores.judge2.judgeTotal +
  session.scores.judge3.judgeTotal;

// ─── Start Judging Session ────────────────────────────────────────────
export const startJudgingSession = async (
  participant: Participant,
  arenaId: string = 'ARENA-1',
  arenaName: string = 'அரங்கம் 1 (Main Arena)',
  operatorId: string = 'OP-01'
): Promise<JudgingSession> => {
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
    judgeStatuses: { judge1: 'scoring', judge2: 'scoring', judge3: 'scoring' },
    scores: {
      judge1: createEmptyJudgeScores(),
      judge2: createEmptyJudgeScores(),
      judge3: createEmptyJudgeScores()
    },
    grandTotal: 0,
    isLocked: false
  };

  await updateDoc(arenaRef(), { activeSession: clean(newSession) });

  await addAuditLog({
    actorRole: 'operator',
    actorName: 'QR Operator',
    action: 'START_SESSION',
    sessionId,
    participantName: participant.participantName,
    oldValue: 'IDLE',
    newValue: `ACTIVE (${participant.registrationId})`,
    reason: 'Operator verified QR code and launched live scoring'
  });

  return newSession;
};

// ─── Update a single step score ───────────────────────────────────────
export const updateJudgeStepScore = async (
  judgeKey: 'judge1' | 'judge2' | 'judge3',
  stepIndex: 1 | 2 | 3 | 4 | 5,
  score: number | null
): Promise<JudgingSession | null> => {
  const session = await getActiveSession();
  if (!session || session.status !== 'active') return null;

  if (session.judgeStatuses[judgeKey] === 'finished') {
    console.warn(`Judge ${judgeKey} has already finalized scores.`);
    return session;
  }

  if (score !== null && (score < 0 || score > 5 || !Number.isInteger(score))) {
    throw new Error('Invalid score: must be an integer between 0 and 5');
  }

  const stepKey = `s${stepIndex}` as keyof Pick<JudgeScores, 's1' | 's2' | 's3' | 's4' | 's5'>;
  session.scores[judgeKey][stepKey] = score;
  session.scores[judgeKey].judgeTotal = calculateJudgeTotal(session.scores[judgeKey]);
  session.scores[judgeKey].lastUpdatedAt = new Date().toISOString();
  session.grandTotal = calculateGrandTotal(session);

  await updateDoc(arenaRef(), { activeSession: clean(session) });
  return session;
};

// ─── Finish judge evaluation ──────────────────────────────────────────
export const finishJudgeEvaluation = async (
  judgeKey: 'judge1' | 'judge2' | 'judge3'
): Promise<{ success: boolean; error?: string; session?: JudgingSession }> => {
  const session = await getActiveSession();
  if (!session || session.status !== 'active') {
    return { success: false, error: 'No active judging session found.' };
  }

  const scores = session.scores[judgeKey];
  if (scores.s1 === null || scores.s2 === null || scores.s3 === null || scores.s4 === null || scores.s5 === null) {
    return {
      success: false,
      error: 'All 5 steps must be scored before finishing.'
    };
  }

  session.judgeStatuses[judgeKey] = 'finished';
  scores.status = 'finished';
  scores.finishedAt = new Date().toISOString();

  const allFinished =
    session.judgeStatuses.judge1 === 'finished' &&
    session.judgeStatuses.judge2 === 'finished' &&
    session.judgeStatuses.judge3 === 'finished';

  if (allFinished) {
    session.status = 'completed';
    session.completedAt = new Date().toISOString();
    session.isLocked = true;

    // Archive into completedSessions sub-collection
    await setDoc(doc(completedRef(), session.sessionId), clean(session));

    await addAuditLog({
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

  await updateDoc(arenaRef(), { activeSession: clean(session) });
  return { success: true, session };
};

// ─── Admin score override ─────────────────────────────────────────────
export const adminCorrectScore = async (
  sessionId: string,
  judgeKey: 'judge1' | 'judge2' | 'judge3',
  stepIndex: 1 | 2 | 3 | 4 | 5,
  newScore: number,
  reason: string,
  adminName: string = 'Super Admin'
): Promise<boolean> => {
  if (!reason.trim()) {
    throw new Error('Authorized score modifications require a documented reason.');
  }

  const stepKey = `s${stepIndex}` as keyof Pick<JudgeScores, 's1' | 's2' | 's3' | 's4' | 's5'>;

  // Try active session first
  let session = await getActiveSession();
  let isFromActive = session?.sessionId === sessionId;

  if (!isFromActive) {
    const snap = await getDoc(doc(completedRef(), sessionId));
    if (!snap.exists()) return false;
    session = snap.data() as JudgingSession;
  }

  if (!session) return false;

  const oldScore = session.scores[judgeKey][stepKey];
  session.scores[judgeKey][stepKey] = newScore;
  session.scores[judgeKey].judgeTotal = calculateJudgeTotal(session.scores[judgeKey]);
  session.grandTotal = calculateGrandTotal(session);

  if (isFromActive) {
    await updateDoc(arenaRef(), { activeSession: clean(session) });
  } else {
    await setDoc(doc(completedRef(), sessionId), clean(session));
  }

  await addAuditLog({
    actorRole: 'admin',
    actorName: adminName,
    action: 'ADMIN_SCORE_OVERRIDE',
    sessionId,
    participantName: session.participant.participantName,
    oldValue: `${judgeKey.toUpperCase()} Step ${stepIndex}: ${oldScore ?? '—'}`,
    newValue: `${judgeKey.toUpperCase()} Step ${stepIndex}: ${newScore}`,
    reason
  });

  return true;
};

// ─── Advance to next participant ──────────────────────────────────────
export const advanceToNextParticipant = async (
  operatorName: string = 'Operator'
): Promise<boolean> => {
  const session = await getActiveSession();
  if (!session) return true;

  if (session.status === 'active' && !session.isLocked) {
    const allFinished =
      session.judgeStatuses.judge1 === 'finished' &&
      session.judgeStatuses.judge2 === 'finished' &&
      session.judgeStatuses.judge3 === 'finished';

    if (!allFinished) {
      throw new Error('Cannot advance until all three judges have finished scoring.');
    }
  }

  // Ensure archived in completedSessions
  if (session.status === 'completed') {
    const existing = await getDoc(doc(completedRef(), session.sessionId));
    if (!existing.exists()) {
      await setDoc(doc(completedRef(), session.sessionId), clean(session));
    }
  }

  // Clear active session field
  await updateDoc(arenaRef(), { activeSession: null });

  await addAuditLog({
    actorRole: 'operator',
    actorName: operatorName,
    action: 'SESSION_CLEARED_FOR_NEXT',
    sessionId: session.sessionId,
    participantName: session.participant.participantName,
    oldValue: session.status,
    newValue: 'IDLE',
    reason: 'Operator unlocked arena for next competitor scan'
  });

  return true;
};

// ─── Rankings ─────────────────────────────────────────────────────────
export const getRankings = async (
  competitionId?: string,
  categoryId?: string
): Promise<RankedResult[]> => {
  const allCompleted = await getCompletedSessions();
  let list = allCompleted.filter(s => s.status === 'completed' && s.isLocked);

  if (competitionId && competitionId !== 'ALL') {
    list = list.filter(s => s.participant.competitionId === competitionId);
  }
  if (categoryId && categoryId !== 'ALL') {
    list = list.filter(s => s.participant.categoryId === categoryId);
  }

  list.sort((a, b) => b.grandTotal - a.grandTotal);

  const results: RankedResult[] = [];
  let currentRank = 1;

  for (let i = 0; i < list.length; i++) {
    const s = list[i];
    const prev = list[i - 1];
    const next = list[i + 1];

    const isTie =
      (prev && prev.grandTotal === s.grandTotal) ||
      (next && next.grandTotal === s.grandTotal);

    if (i > 0 && s.grandTotal < list[i - 1].grandTotal) currentRank = i + 1;

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

// ─── Real-time Subscriptions ──────────────────────────────────────────

/**
 * Subscribe to live active session changes via Firestore onSnapshot.
 * Returns an unsubscribe function.
 */
export const subscribeToActiveSession = (
  callback: (session: JudgingSession | null) => void
): Unsubscribe => {
  return onSnapshot(arenaRef(), (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    const data = snap.data();
    callback((data.activeSession as JudgingSession) || null);
  });
};

/**
 * Subscribe to live completed sessions collection via Firestore onSnapshot.
 * Returns an unsubscribe function.
 */
export const subscribeToCompletedSessions = (
  callback: (sessions: JudgingSession[]) => void
): Unsubscribe => {
  const q = query(completedRef(), orderBy('completedAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => d.data() as JudgingSession));
  });
};

/**
 * Subscribe to judging steps changes.
 */
export const subscribeToSteps = (
  callback: (steps: JudgingStepConfig[]) => void
): Unsubscribe => {
  return onSnapshot(arenaRef(), (snap) => {
    if (!snap.exists()) { callback(DEFAULT_STEPS); return; }
    callback((snap.data().steps as JudgingStepConfig[]) || DEFAULT_STEPS);
  });
};

/**
 * Subscribe to participants list changes.
 */
export const subscribeToParticipants = (
  callback: (participants: Participant[]) => void
): Unsubscribe => {
  return onSnapshot(arenaRef(), (snap) => {
    if (!snap.exists()) { callback(INITIAL_PARTICIPANTS); return; }
    callback((snap.data().participants as Participant[]) || INITIAL_PARTICIPANTS);
  });
};

// Re-export Timestamp for any component that needs it
export { Timestamp };
// Suppress unused import warning for deleteField (may be used externally)
export { deleteField };
