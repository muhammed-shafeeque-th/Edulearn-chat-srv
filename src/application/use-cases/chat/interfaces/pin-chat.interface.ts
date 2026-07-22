import { ChatDto } from '../../../dtos/chat.dto';
import PinChatDto from 'src/modules/chat/grpc/dtos/pin-chat.dto';

export abstract class IPinChatUseCase {
  /**
   * Pins a chat for a given user.
   * @param dto Data containing chatId and userId
   * @returns The updated Chat entity as DTO
   */
  abstract execute(dto: PinChatDto): Promise<ChatDto>;
}
