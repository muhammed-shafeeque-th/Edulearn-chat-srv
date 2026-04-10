import { Message } from '../entities/message.entity';

export abstract class MessageRepository {
  abstract findById(id: string): Promise<Message | null>;
  abstract findByConversationId(
    conversationId: string,
    page: number,
    limit: number,
  ): Promise<{ messages: Message[]; total: number }>;
  abstract save(message: Message): Promise<Message>;
  abstract update(message: Message): Promise<Message>;
  abstract delete(id: string): Promise<void>;
  abstract markAsRead(messageIds: string[], userId: string): Promise<void>;
  abstract getUnreadCount(
    conversationId: string,
    userId: string,
  ): Promise<number>;
}
