import { DiscussionMessage } from '@/domain/entities/discussion.entity';

interface SendDiscussionMessageCommand {
  roomId: string;
  senderId: string;
  senderRole: string;
  content: string;
  idempotencyKey: string;
}

export abstract class ISendDiscussionMessageUseCase {
  abstract execute(
    command: SendDiscussionMessageCommand,
  ): Promise<DiscussionMessage>;
}
