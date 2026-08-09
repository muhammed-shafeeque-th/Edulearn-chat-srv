import { Message } from '@/domain/entities/message.entity';
import GetMessagesDto from 'src/modules/chat/grpc/dtos/get-messages.dto';

export abstract class IGetChatMessagesUseCase {
  /**
   * Retrieves paginated messages for a chat if the user is a participant.
   * @param dto - Data transfer object containing chatId, pagination, and user information.
   * @returns An object with message DTOs and total count.
   */
  abstract execute(
    dto: GetMessagesDto,
  ): Promise<{ messages: Message[]; total: number }>;
}
