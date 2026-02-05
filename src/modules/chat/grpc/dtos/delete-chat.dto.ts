import { IsUUID } from 'class-validator';
import { DeleteChatRequest } from 'src/infrastructure/grpc/generated/chat_service';

export default class DeleteChatDto implements DeleteChatRequest {
  @IsUUID(undefined, { message: '`userId` must be type UUID' })
  chatId: string;
  userId: string;
}
