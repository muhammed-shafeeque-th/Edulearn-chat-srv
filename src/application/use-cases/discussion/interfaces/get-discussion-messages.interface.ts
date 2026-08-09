import { DiscussionMessage } from '@/domain/entities/discussion.entity';

interface GetDiscussionMessagesCommand {
  roomId: string;
  userId: string;
  pagination?: { page: number; pageSize: number };
}

export abstract class IGetDiscussionMessagesUseCase {
  abstract execute(
    command: GetDiscussionMessagesCommand,
  ): Promise<{ messages: DiscussionMessage[]; total: number }>;
}
