import { Conversation } from '../entities/conversation.entity';

export abstract class ConversationRepository {
  abstract findById(id: string): Promise<Conversation | null>;
  abstract findByParticipants(
    participantIds: string[],
  ): Promise<Conversation | null>;
  abstract findByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ conversations: Conversation[]; total: number }>;
  abstract save(conversation: Conversation): Promise<Conversation>;
  abstract update(conversation: Conversation): Promise<Conversation>;
  abstract delete(id: string): Promise<void>;
}
