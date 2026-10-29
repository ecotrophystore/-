export type UserRole = 'operator' | 'judge1' | 'judge2' | 'judge3' | 'led' | 'admin' | 'judge' | 'system';

export type Language = 'ta' | 'en' | 'bilingual';

export type SessionStatus = 'idle' | 'active' | 'completed' | 'cancelled';

export type JudgeStatus = 'unstarted' | 'scoring' | 'finished';

export interface Participant {
  participantId: string;
  registrationId: string;
  participantName: string;
  participantNameTa: string;
  photoUrl: string;
  competitionId: string;
  competitionName: string;
  competitionNameTa: string;
  categoryId: string;
  categoryName: string;
  categoryNameTa: string;
  ageCategory: string;
  qrIdentifier: string;
  registrationStatus: 'confirmed' | 'pending' | 'disqualified';
  clubOrDistrict: string;
}

export interface JudgingStepConfig {
  stepNumber: number;
  nameEn: string;
  nameTa: string;
  descriptionEn?: string;
  descriptionTa?: string;
  maxScore: number; // default 5
}

export interface JudgeScores {
  s1: number | null;
  s2: number | null;
  s3: number | null;
  s4: number | null;
  s5: number | null;
  judgeTotal: number;
  status: JudgeStatus;
  finishedAt?: string | null;
  lastUpdatedAt?: string;
}

export interface JudgingSession {
  sessionId: string;
  arenaId: string;
  arenaName: string;
  participantId: string;
  participant: Participant;
  competitionId: string;
  status: SessionStatus;
  startedAt: string;
  completedAt?: string | null;
  operatorId: string;
  judgeStatuses: {
    judge1: JudgeStatus;
    judge2: JudgeStatus;
    judge3: JudgeStatus;
  };
  scores: {
    judge1: JudgeScores;
    judge2: JudgeScores;
    judge3: JudgeScores;
  };
  grandTotal: number;
  isLocked: boolean;
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorRole: UserRole;
  actorName: string;
  action: string;
  sessionId: string;
  participantName: string;
  oldValue: string;
  newValue: string;
  reason: string;
}

export interface RankedResult {
  participantId: string;
  registrationId: string;
  participantName: string;
  participantNameTa: string;
  photoUrl: string;
  competitionId: string;
  competitionName: string;
  categoryId: string;
  categoryName: string;
  clubOrDistrict: string;
  grandTotal: number;
  stepTotals: [number, number, number, number, number];
  judgeTotals: [number, number, number];
  rank: number;
  isTie: boolean;
  tieResolutionNote?: string;
  sessionId: string;
  completedAt: string;
}
