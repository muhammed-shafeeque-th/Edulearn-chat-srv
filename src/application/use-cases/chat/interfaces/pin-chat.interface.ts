import { ChatUserState } from '@/domain/entities/chat-user-state.entity';
import { Chat } from '@/domain/entities/chat.entity';
import PinChatDto from 'src/modules/chat/grpc/dtos/pin-chat.dto';

export abstract class IPinChatUseCase {
  /**
   * Pins a chat for a given user.
   * @param dto Data containing chatId and userId
   * @returns The updated Chat entity as DTO
   */
  abstract execute(
    dto: PinChatDto,
  ): Promise<{ chat: Chat; state: ChatUserState }>;
}
