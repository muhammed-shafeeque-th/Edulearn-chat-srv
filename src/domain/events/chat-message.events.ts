import { BaseEvent } from './base.event';

export interface MessageSentEvent extends BaseEvent {
  chatId: string;
  message: {
    id: string;
    chatId: string;
    senderId: string;
    content: string;
    createdAt: number;
    updatedAt: number;
    sequence: number;
    reactions: Array<{
      id: string;
      userId: string;
      emoji: string;
      timestamp: number;
    }>;
  };
}

export interface MessageEditedEvent extends BaseEvent {
  chatId: string;
  messageId: string;
  content: string;
  editedAt: string; // ISO
}

export interface MessageDeletedEvent extends BaseEvent {
  chatId: string;
  messageId: string;
  deletedBy: string;
  deleteForEveryone: boolean;
}

export interface MessagesReadEvent extends BaseEvent {
  chatId: string;
  userId: string;
  messageId?: string; // optional
}

export interface ReactionAddedEvent extends BaseEvent {
  chatId: string;
  messageId: string;
  reaction: {
    id: string;
    userId: string;
    emoji: string;
    timestamp: number;
  };
}
