import { DiscussionMessageDto } from '../../../dtos/discussion-message.dto';

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
  ): Promise<DiscussionMessageDto>;
}
