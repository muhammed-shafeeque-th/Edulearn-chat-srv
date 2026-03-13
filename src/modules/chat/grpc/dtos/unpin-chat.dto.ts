import { IsUUID } from 'class-validator';
import { UnPinChatRequest } from 'src/infrastructure/grpc/generated/chat_service';

export default class UnPinChatDto implements UnPinChatRequest {
  @IsUUID(undefined, { message: '`userId` must be type UUID' })
  chatId: string;
  userId: string;
}
