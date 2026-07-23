import MarkMessageSeenDto from 'src/modules/chat/grpc/dtos/mark-message-seen.dto';
import { ChatDto } from '../../../dtos/chat.dto';

export abstract class IMarkMessagesAsReadUseCase {
  /**
   * @param dto Input data
   * Marks all unread messages in a chat as read for a user,
   * excluding messages sent by the user themselves.
   */
  abstract execute(dto: MarkMessageSeenDto): Promise<ChatDto>;
}
