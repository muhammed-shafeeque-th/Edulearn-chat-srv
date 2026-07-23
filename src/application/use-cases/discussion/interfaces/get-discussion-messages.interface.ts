import { DiscussionMessageDto } from '../../../dtos/discussion-message.dto';

interface GetDiscussionMessagesCommand {
  roomId: string;
  userId: string;
  pagination?: { page: number; pageSize: number };
}

export abstract class IGetDiscussionMessagesUseCase {
  abstract execute(
    command: GetDiscussionMessagesCommand,
  ): Promise<{ messages: DiscussionMessageDto[]; total: number }>;
}
