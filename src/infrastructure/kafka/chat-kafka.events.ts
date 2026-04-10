export interface BaseKafkaEvent {
  eventId: string;
  occurredAt: string; // ISO
  version: number;
}

export interface ChatCreatedKafkaEvent {
  chatId: string;
  studentId: string;
  instructorId: string;
  chat: any;
}

export interface MessageSentKafkaEvent {
  chatId: string;
  message: any; // Message dto payload for WS
}

export interface MessageEditedKafkaEvent {
  chatId: string;
  messageId: string;
  content: string;
  editedAt: string;
}

export interface MessageDeletedKafkaEvent {
  chatId: string;
  messageId: string;
  deleteForEveryone: boolean;
  deletedBy: string;
}

export interface MessagesReadKafkaEvent {
  chatId: string;
  userId: string;
  messageId?: string;
}

export interface ReactionAddedKafkaEvent {
  chatId: string;
  messageId: string;
  reaction: {
    id: string;
    userId: string;
    emoji: string;
    timestamp: number;
  };
}

export interface ReactionRemovedKafkaEvent {
  chatId: string;
  messageId: string;
  reactionId: string;
  removedBy: string;
}

export interface DiscussionMessageSentKafkaEvent {
  roomId: string;
  courseId: string;
  message: any;
}
