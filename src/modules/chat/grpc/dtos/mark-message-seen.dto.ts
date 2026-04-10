import { MarkMessagesReadRequest } from 'src/infrastructure/grpc/generated/chat_service';

export default class MarkMessageSeenDto implements MarkMessagesReadRequest {
  userId: string;
  chatId: string;
}
