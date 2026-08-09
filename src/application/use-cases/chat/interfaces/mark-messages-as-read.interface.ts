import { ChatUserState } from '@/domain/entities/chat-user-state.entity';
import { Chat } from '@/domain/entities/chat.entity';
import MarkMessageSeenDto from 'src/modules/chat/grpc/dtos/mark-message-seen.dto';

export abstract class IMarkMessagesAsReadUseCase {
  /**
   * @param dto Input data
   * Marks all unread messages in a chat as read for a user,
   * excluding messages sent by the user themselves.
   */
  abstract execute(
    dto: MarkMessageSeenDto,
  ): Promise<{ chat: Chat; state: ChatUserState }>;
}
