import { IsUUID } from 'class-validator';
import { SendMessageRequest } from 'src/infrastructure/grpc/generated/chat_service';

export default class SendMessageCommand implements SendMessageRequest {
  @IsUUID(undefined, { message: '`chatId` must be type UUID' })
  chatId: string;
  @IsUUID(undefined, { message: '`senderId` must be type UUID' })
  senderId: string;
  content: string;
  idempotencyKey: string;
}
