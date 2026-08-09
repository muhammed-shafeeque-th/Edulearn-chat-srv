import { Injectable } from '@nestjs/common';

import { IMessageRepository } from 'src/domain/repositories/message.repository';
import { IChatRepository } from 'src/domain/repositories/chat.repository';
import ReactMessageDto from 'src/modules/chat/grpc/dtos/react-message.dto';
import { ILoggerService } from 'src/application/ports/logger.service';
import { v4 as uuidV4 } from 'uuid';
import { IChatEventBusPort } from 'src/application/ports/chat-event-bus.port';
import { Message } from 'src/domain/entities/message.entity';
import { CHAT_TOPICS } from 'src/infrastructure/kafka/chat-topics';
import {
  ChatMessageNotFoundException,
  ChatNotFoundException,
} from 'src/domain/exceptions/chat.exceptions';
import {
  BadRequestException,
  NotAuthorizedException,
} from 'src/shared/exceptions/infra.exceptions';
import { IReactMessageUseCase } from '../interfaces/add-reaction.interface';

@Injectable()
export class ReactMessageUseCase implements IReactMessageUseCase {
  constructor(
    private readonly _messageRepository: IMessageRepository,
    private readonly _chatRepository: IChatRepository,
    private readonly _eventBus: IChatEventBusPort,
    private readonly _logger: ILoggerService,
  ) {}

  async execute(command: ReactMessageDto): Promise<Message> {
    const { messageId, userId, emoji } = command;

    if (!messageId || !userId || !emoji?.trim()) {
      throw new BadRequestException('messageId userId emoji required');
    }
    this._logger.info(
      `Reacting to message: messageId=${messageId}, userId=${userId}, emoji=${emoji}`,
      { ctx: ReactMessageUseCase.name },
    );

    const message = await this._messageRepository.findById(messageId);
    if (!message) {
      this._logger.warn(
        `Message (${messageId}) not found when attempting to react`,
      );
      throw new ChatMessageNotFoundException('Message not found');
    }

    const chat = await this._chatRepository.findById(message.chatId);
    if (!chat) {
      this._logger.warn(
        `Chat (${message.chatId}) not found when attempting to react`,
      );
      throw new ChatNotFoundException('Chat not found');
    }
    if (!chat.isParticipant(userId)) {
      this._logger.warn(
        `User (${userId}) is not a participant of chat (${message.chatId})`,
      );
      throw new NotAuthorizedException(
        'You are not a participant in this chat',
      );
    }
    const reactions = message.reactions ?? [];
    const idx = reactions.findIndex((r) => r.userId === userId);

    let reaction;
    if (idx === -1) {
      reaction = { id: uuidV4(), userId, emoji, timestamp: new Date() };
      reactions.push(reaction);
    } else {
      reaction = { ...reactions[idx], emoji, timestamp: new Date() };
      reactions[idx] = reaction;
    }

    const updatedMessage = Message.fromPrimitives({
      ...message.toProps(),
      reactions,
    });

    await this._eventBus.publish({
      topic: CHAT_TOPICS.REACTION_ADDED,
      payload: {
        chatId: message.chatId,
        messageId: message.id,
        reaction,
      },
    });

    await this._messageRepository.update(updatedMessage);

    this._logger.info(
      `Reaction updated for message ${messageId} in chat ${message.chatId}`,
    );
    return updatedMessage;
  }
}
