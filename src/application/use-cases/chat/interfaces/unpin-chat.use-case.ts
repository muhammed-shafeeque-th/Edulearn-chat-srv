import { ChatDto } from '../../../dtos/chat.dto';
import UnPinChatDto from 'src/modules/chat/grpc/dtos/unpin-chat.dto';

export abstract class IUnPinChatUseCase {
  /**
   * Unpins a chat for a given user.
   * @param dto Data containing chatId and userId
   * @returns The updated Chat entity as DTO
   */
  abstract execute(dto: UnPinChatDto): Promise<ChatDto>;
}
