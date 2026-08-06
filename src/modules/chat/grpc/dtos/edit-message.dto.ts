import { IsUUID } from 'class-validator';
import { EditMessageRequest } from 'src/infrastructure/grpc/generated/chat_service';

export default class EditMessageDto implements EditMessageRequest {
  @IsUUID(undefined, { message: '`userId` must be type UUID' })
  chatId: string;
  messageId: string;
  userId: string;
  content: string;
}
