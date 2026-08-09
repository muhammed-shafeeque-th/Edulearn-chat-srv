import { Chat } from '@/domain/entities/chat.entity';
import GetChatDto from 'src/modules/chat/grpc/dtos/get-chat.dto';
import { ChatUserState } from '@/domain/entities/chat-user-state.entity';

export abstract class IGetChatUseCase {
  /**
   * @param dto Data containing the chatId to get chat
   * @returns The found Chat entity as DTO
   */
  abstract execute(dto: GetChatDto): Promise<{ chat: Chat; state: ChatUserState }>;
}
