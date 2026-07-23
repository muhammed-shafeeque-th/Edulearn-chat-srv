import EditMessageDto from 'src/modules/chat/grpc/dtos/edit-message.dto';
import { MessageDto } from '../../../dtos/message.dto';

export abstract class IEditMessageUseCase {
  /**
   * Executes the use case to edit an existing message.
   * @param command EditMessageDto - The data needed to edit the message
   * @returns Promise<MessageDto>
   * @throws DomainException if message not found, not sender, or content invalid
   */
  abstract execute(command: EditMessageDto): Promise<MessageDto>;
}
