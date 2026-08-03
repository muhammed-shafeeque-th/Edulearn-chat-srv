import { DiscussionMessage } from '../entities/discussion.entity';

export abstract class IDiscussionMessageRepository {
  abstract findById(id: string): Promise<DiscussionMessage | null>;
  abstract findByRoomId(
    roomId: string,
    page: number,
    limit: number,
  ): Promise<{ messages: DiscussionMessage[]; total: number }>;
  abstract save(message: DiscussionMessage): Promise<DiscussionMessage>;
  abstract update(message: DiscussionMessage): Promise<DiscussionMessage>;
  abstract findByIdempotencyKey(
    roomId: string,
    key: string,
  ): Promise<DiscussionMessage | null>;
  abstract nextSequence(roomId: string): Promise<number>;
  abstract delete(id: string): Promise<void>;
}
