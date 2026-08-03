import { IsUUID } from 'class-validator';
import { GetChatRequest } from 'src/infrastructure/grpc/generated/chat_service';

export default class GetChatDto implements GetChatRequest {
  @IsUUID(undefined, { message: '`userId` must be type UUID' })
  chatId: string;

  userId: string;
}
