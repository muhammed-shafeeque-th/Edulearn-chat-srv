import { IsOptional, IsString, IsUUID } from 'class-validator';
import { DeleteMessageRequest } from 'src/infrastructure/grpc/generated/chat_service';

export default class DeleteMessageDto implements DeleteMessageRequest {
  @IsUUID(undefined, { message: '`userId` must be type UUID' })
  chatId: string;
  messageId: string;
  userId: string;
  forEveryOne: boolean;
}
