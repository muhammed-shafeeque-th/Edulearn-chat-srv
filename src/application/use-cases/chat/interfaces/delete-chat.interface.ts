import { ChatDto } from '../../../dtos/chat.dto';
import DeleteChatDto from 'src/modules/chat/grpc/dtos/delete-chat.dto';

export abstract class IDeleteChatUseCase {
  /**
   * Deletes a chat for a given user.
   * @param dto Data containing the chatId and userId for deletion
   * @returns The deleted Chat entity as DTO
   */
  abstract execute(dto: DeleteChatDto): Promise<ChatDto>;
}
