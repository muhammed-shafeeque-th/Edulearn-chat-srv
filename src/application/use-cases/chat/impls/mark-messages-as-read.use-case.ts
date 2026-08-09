import { Injectable } from '@nestjs/common';
import { IMessageRepository } from 'src/domain/repositories/message.repository';
import { IChatRepository } from 'src/domain/repositories/chat.repository';
import MarkMessageSeenDto from 'src/modules/chat/grpc/dtos/mark-message-seen.dto';
import { ILoggerService } from 'src/application/ports/logger.service';
import { IChatEventBusPort } from 'src/application/ports/chat-event-bus.port';
import { IChatUserStateRepository } from 'src/domain/repositories/chat-user.repository';
import { CHAT_TOPICS } from 'src/infrastructure/kafka/chat-topics';
import { ChatNotFoundException } from 'src/domain/exceptions/chat.exceptions';
import {
  BadRequestException,
  NotAuthorizedException,
} from 'src/shared/exceptions/infra.exceptions';
import { IMarkMessagesAsReadUseCase } from '../interfaces/mark-messages-as-read.interface';
import { Chat } from '@/domain/entities/chat.entity';
import { ChatUserState } from '@/domain/entities/chat-user-state.entity';

@Injectable()
export class MarkMessagesAsReadUseCase implements IMarkMessagesAsReadUseCase {
  constructor(
    private readonly _logger: ILoggerService,
    private readonly _messageRepository: IMessageRepository,
    private readonly _chatRepository: IChatRepository,
    private readonly _eventBus: IChatEventBusPort,
    private readonly _stateRepo: IChatUserStateRepository,
  ) {}

  /**
   * Marks all unread messages in a chat as read for a user,
   * excluding messages sent by the user themselves.
   */
  async execute(dto: MarkMessageSeenDto): Promise<{ chat: Chat; state: ChatUserState }> {
    const { chatId, userId } = dto;

    // Validate input
    if (!chatId || !userId) {
      this._logger.warn('Missing chatId or userId in mark-as-read command');
      throw new BadRequestException('chatId and userId are required');
    }

    // Check chat existence and user participation
    const chat = await this._chatRepository.findById(chatId);
    if (!chat) {
      this._logger.warn(`Chat not found: ${chatId}`);
      throw new ChatNotFoundException('Chat not found');
    }

    if (!chat.isParticipant(userId)) {
      this._logger.warn(
        `User ${userId} is not a participant of chat ${chatId}`,
      );
      throw new NotAuthorizedException(
        'User is not a participant in this chat',
      );
    }
    await this._messageRepository.markAsRead(chatId, userId);
    const state = await this._stateRepo.getOrCreate(chatId, userId);

    await this._eventBus.publish({
      topic: CHAT_TOPICS.MESSAGE_READ,
      payload: {
        chatId,
        userId,
        messageId: null,
      },
    });

    this._logger.info('Messages marked read', {
      ctx: MarkMessagesAsReadUseCase.name,
      chatId,
      userId,
    });
    return {chat, state};
  }
}
