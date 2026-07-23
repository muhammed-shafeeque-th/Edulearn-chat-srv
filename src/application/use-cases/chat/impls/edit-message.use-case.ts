import { Injectable } from '@nestjs/common';

import { IMessageRepository } from 'src/domain/repositories/message.repository';
import { IChatRepository } from 'src/domain/repositories/chat.repository';
import EditMessageDto from 'src/modules/chat/grpc/dtos/edit-message.dto';
import { MessageDto } from 'src/application/dtos/message.dto';
import { ILoggerService } from 'src/application/ports/logger.service';
import { IChatEventBusPort } from 'src/application/ports/chat-event-bus.port';
import { CHAT_TOPICS } from 'src/infrastructure/kafka/chat-topics';
import {
  ChatMessageNotFoundException,
  ChatNotFoundException,
} from 'src/domain/exceptions/chat.exceptions';
import {
  BadRequestException,
  NotAuthorizedException,
} from 'src/shared/exceptions/infra.exceptions';
import { IEditMessageUseCase } from '../interfaces/edit-message.interface';

@Injectable()
export class EditMessageUseCase implements IEditMessageUseCase {
  constructor(
    private readonly _logger: ILoggerService,
    private readonly _messageRepository: IMessageRepository,
    private readonly _chatRepository: IChatRepository,
    private readonly _eventBus: IChatEventBusPort,
  ) {}

  /**
   * Executes the use case to edit an existing message.
   * @param command EditMessageDto - The data needed to edit the message
   * @returns Promise<MessageDto>
   * @throws DomainException if message not found, not sender, or content invalid
   */
  async execute(command: EditMessageDto): Promise<MessageDto> {
    const { messageId, userId, content, chatId } = command;

    if (!chatId || !messageId || !userId || !content?.trim()) {
      throw new BadRequestException(
        'chatId, messageId, userId, content required',
      );
    }

    if (!content || content.trim().length === 0) {
      this._logger.warn('Attempted to edit message with empty content');
      throw new BadRequestException('Message content cannot be empty');
    }

    const chat = await this._chatRepository.findById(chatId);
    if (!chat) throw new ChatNotFoundException('Chat not found');
    if (!chat.isParticipant(userId))
      throw new NotAuthorizedException('Forbidden');

    const message = await this._messageRepository.findById(messageId);
    if (!message) {
      this._logger.warn(`Message (${messageId}) not found`);
      throw new ChatMessageNotFoundException('Message not found');
    }

    if (message.deletedAt)
      throw new BadRequestException('Cannot edit deleted message');

    if (message.senderId !== userId) {
      this._logger.warn(
        `User (${userId}) tried to edit message (${messageId}) they do not own`,
      );
      throw new NotAuthorizedException('You can only edit your own messages');
    }

    // Defensive: check that the message belongs to the chat
    if (message.chatId !== chatId) {
      this._logger.warn(
        `ChatId mismatch for edit: (${chatId}) vs (${message.chatId})`,
      );
      throw new NotAuthorizedException('Message does not belong to the chat');
    }

    const edited = message.editContent(content);

    const updatedMessage = await this._messageRepository.update(edited);

    await this._eventBus.publish({
      topic: CHAT_TOPICS.MESSAGE_EDITED,
      payload: {
        chatId,
        messageId,
        content: edited.content,
        editedAt: new Date(edited.editedAt).toISOString(),
      },
    });

    return MessageDto.fromDomain(updatedMessage);
  }
}
