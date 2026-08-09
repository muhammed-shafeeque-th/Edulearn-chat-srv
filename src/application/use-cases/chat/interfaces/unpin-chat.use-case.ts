import { ChatUserState } from '@/domain/entities/chat-user-state.entity';
import UnPinChatDto from 'src/modules/chat/grpc/dtos/unpin-chat.dto';
import { Chat } from '@/domain/entities/chat.entity';

export abstract class IUnPinChatUseCase {
  /**
   * Unpins a chat for a given user.
   * @param dto Data containing chatId and userId
   * @returns The updated Chat entity as DTO
   */
  abstract execute(dto: UnPinChatDto): Promise<{ chat: Chat; state: ChatUserState }>;
}
