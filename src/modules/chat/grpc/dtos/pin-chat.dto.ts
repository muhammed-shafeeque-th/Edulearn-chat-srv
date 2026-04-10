import { IsUUID } from 'class-validator';
import { PinChatRequest } from 'src/infrastructure/grpc/generated/chat_service';

export default class PinChatDto implements PinChatRequest {
  @IsUUID(undefined, { message: '`userId` must be type UUID' })
  chatId: string;
  userId: string;
}
