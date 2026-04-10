import { Chat } from 'src/domain/entities/chat.entity';
import { Message } from 'src/domain/entities/message.entity';

// Utility type for available event names
export type ChatEvent =
  | 'message:new'
  | 'messages:read'
  | 'message:edited'
  | 'message:deleted'
  | 'message:reaction'
  | 'typing:start'
  | 'typing:stop'
  | 'user:online'
  | 'user:offline'
  | 'chat:created'
  | 'group:created'
  | 'error'
  | 'connect'
  | 'disconnect';

export interface NewMessagePayload {
  message: Message;
}
export interface MessageStatusPayload {
  messageId: string;
  chatId: string;
}
export interface MessageEditedPayload {
  messageId: string;
  content: string;
  chatId: string;
  editedAt: Date;
}
export interface MessageDeletedPayload {
  messageId: string;
  chatId: string;
  deleteForEveryone: boolean;
}
export interface MessageReactionPayload {
  messageId: string;
  chatId: string;
  reaction: {
    userId: string;
    emoji: string;
    timestamp: Date;
  };
}
export interface TypingPayload {
  userId: string;
  chatId: string;
  timestamp: Date;
}
export interface UserOnlinePayload {
  userId: string;
  timestamp: Date;
}
export interface ChatCreatedPayload {
  chat: Chat;
}
export interface GroupCreatedPayload {
  group: any;
}

export interface EventPayloads {
  'message:new': NewMessagePayload;
  'messages:read': MessageStatusPayload;
  'message:edited': MessageEditedPayload;
  'message:deleted': MessageDeletedPayload;
  'message:reaction': MessageReactionPayload;
  'typing:start': TypingPayload;
  'typing:stop': TypingPayload;
  'user:online': UserOnlinePayload;
  'user:offline': UserOnlinePayload;
  'chat:created': ChatCreatedPayload;
  'group:created': GroupCreatedPayload;
  error: { message: string };
  connect: void;
  disconnect: void;
}

// Typed event emitter for Gateway
export interface EventEmitter {
  emit<E extends keyof EventPayloads>(
    event: E,
    payload: EventPayloads[E],
  ): void;
}

export interface JoinChatPayload {
  chatId: string;
}
export interface SendMessagePayload {
  chatId: string;
  content: string;
  type: Message['type'];
  receiverId?: string;
  metadata?: Partial<Message>;
}
export interface TypingEmitPayload {
  chatId: string;
}
export interface MarkDeliveredPayload {
  messageId: string;
}
export interface MarkReadPayload {
  chatId: string;
  messageId?: string;
}
export interface AddReactionPayload {
  messageId: string;
  chatId: string;
  emoji: string;
}
export interface RemoveReactionPayload {
  reactionId: string;
}
export interface EditMessagePayload {
  messageId: string;
  chatId: string;
  content: string;
}
export interface DeleteMessagePayload {
  messageId: string;
  chatId: string;
  deleteForEveryone?: boolean;
}
