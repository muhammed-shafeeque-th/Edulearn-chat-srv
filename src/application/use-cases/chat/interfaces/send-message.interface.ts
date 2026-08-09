import SendMessageCommand from 'src/modules/chat/grpc/dtos/send-message.dto';
import { Message } from '@/domain/entities/message.entity';

export abstract class ISendMessageUseCase {
  /**
   * Executes the use case to send a message. Validates the sender,
   *
   * @param command SendMessageCommand - The data for sending the message
   * @returns Promise<MessageDto>
   * @throws DomainException if the chat does not exist or user not participant
   */
  abstract execute(command: SendMessageCommand): Promise<Message>;
}
