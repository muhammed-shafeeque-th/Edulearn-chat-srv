import { BaseEvent } from './base.event';

export interface MessageDeletedEvent extends BaseEvent {
  chatId: string;
  messageId: string;
  deletedBy: string;
  deleteForEveryone: boolean;
}

export interface ChatCreatedEvent extends BaseEvent {
  chatId: string;

  studentId: string;
  instructorId: string;

  createdAt: number;
  updatedAt: number;
  lastMessageId?: string;

  // viewer-specific
  isPinned: boolean;
  isArchived: boolean;
  mutedUntil?: number;
}
