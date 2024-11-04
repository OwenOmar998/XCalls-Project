import { Invitation, Inviter } from 'sip.js';

export interface LogDetail {
  logId: string;
  id: string;
  number: string;
  callDirection?: 'outbound' | 'inbound';
  startTime: string;
  answerTime?: string;
  rejectTime?: string;
  endTime?: string;
  reasonText: string;
}
export interface LogItem {
  number: string;
  displayName: string;
  lastActivity: string;
  pinned: boolean;
  logId: string;
}

export interface Line {
  id: string;
  number: string;
  displayName: string;
  logId: string;
  sipSession: Inviter | Invitation | null;
  callDirection?: 'outbound' | 'inbound';
  startTime: string;
  answerTime?: string;
  rejectTime?: string;
  endTime?: string;
  status?: LineStatus;
}
export enum LineStatus {
  Ended = 'Ended',
  Ringing = 'Ringing ...',
  Trying = 'Trying ...',
  InProgress = 'In Progress',
  Rejected = 'Rejected',
  Cancelled = 'Cancelled',
}
