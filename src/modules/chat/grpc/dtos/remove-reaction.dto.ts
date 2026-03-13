import { IsUUID } from 'class-validator';
import { RemoveReactionRequest } from 'src/infrastructure/grpc/generated/chat_service';

export default class RemoveReactionDto implements RemoveReactionRequest {
  @IsUUID(undefined, { message: '`userId` must be type UUID' })
  messageId: string;
  userId: string;
  reactionId: string;
}
