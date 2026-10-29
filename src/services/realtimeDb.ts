/**
 * realtimeDb.ts
 * ─────────────────────────────────────────────────────────────────────
 * Firebase Realtime Database implementation for live scoring & sync.
 * Matches your Singapore database (asia-southeast1).
 * ─────────────────────────────────────────────────────────────────────
 */

import {
  ref,
  get,
  set,
  onValue,
  type Unsubscribe
} from 'firebase/database';
import { rtdb } from '../firebase';
import type {
  Participant,
  JudgingSession,
  JudgeScores
} from '../types';
import {
  DEFAULT_STEPS,
  INITIAL_PARTICIPANTS,
  ARENA_ID
} from './firestore';

const arenaNode = () => ref(rtdb, `arena/${ARENA_ID}`);
const activeSessionNode = () => ref(rtdb, `arena/${ARENA_ID}/activeSession`);

function clean<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

export const initRealtimeArena = async (): Promise<void> => {
  const snap = await get(arenaNode());
  if (!snap.exists()) {
    await set(arenaNode(), {
      arenaId: ARENA_ID,
      arenaName: 'அரங்கம் 1 (முதன்மை அரங்கம்)',
      activeSession: null,
      steps: clean(DEFAULT_STEPS),
      participants: clean(INITIAL_PARTICIPANTS),
      publishedStatus: false,
      createdAt: Date.now()
    });
  }
};

export const subscribeToRTActiveSession = (
  callback: (session: JudgingSession | null) => void
): Unsubscribe => {
  return onValue(activeSessionNode(), (snap) => {
    callback(snap.val() || null);
  });
};

export const startRTJudgingSession = async (
  participant: Participant,
  arenaId: string = 'ARENA-1',
  arenaName: string = 'அரங்கம் 1 (Main Arena)',
  operatorId: string = 'OP-01'
): Promise<JudgingSession> => {
  const sessionId = 'SESS-' + Date.now();
  const emptyScores = (): JudgeScores => ({
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
      judge1: emptyScores(),
      judge2: emptyScores(),
      judge3: emptyScores()
    },
    grandTotal: 0,
    isLocked: false
  };

  await set(activeSessionNode(), clean(newSession));
  return newSession;
};
