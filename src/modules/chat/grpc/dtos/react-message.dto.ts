import { IsUUID } from 'class-validator';
import { AddReactionRequest } from 'src/infrastructure/grpc/generated/chat_service';

export default class ReactMessageDto implements AddReactionRequest {
  @IsUUID(undefined, { message: '`messageId` must be type UUID' })
  messageId: string;
  @IsUUID(undefined, { message: '`userId` must be type UUID' })
  userId: string;
  emoji: string;
}
