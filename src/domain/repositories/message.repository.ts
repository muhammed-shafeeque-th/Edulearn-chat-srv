import { Message } from '../entities/message.entity';

export abstract class IMessageRepository {
  abstract findById(id: string): Promise<Message | null>;
  abstract findByChatId(
    chatId: string,
    page: number,
    limit: number,
  ): Promise<{ messages: Message[]; total: number }>;
  abstract save(message: Message): Promise<Message>;
  abstract update(message: Message): Promise<Message>;
  abstract findByIdempotencyKey(
    chatId: string,
    key: string,
  ): Promise<Message | null>;
  abstract nextSequence(chatId: string): Promise<number>;
  abstract delete(id: string): Promise<void>;
  abstract markAsRead(chatId: string, userId: string): Promise<void>;
  abstract getUnreadCount(chatId: string, userId: string): Promise<number>;
}
