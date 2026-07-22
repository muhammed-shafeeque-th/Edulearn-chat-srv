import { ChatDto } from '../../../dtos/chat.dto';
import GetChatDto from 'src/modules/chat/grpc/dtos/get-chat.dto';

export abstract class IGetChatUseCase {
  /**
   * @param dto Data containing the chatId to get chat
   * @returns The found Chat entity as DTO
   */
  abstract execute(dto: GetChatDto): Promise<ChatDto>;
}
