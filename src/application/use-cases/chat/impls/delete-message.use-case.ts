import { Injectable } from '@nestjs/common';
import { IMessageRepository } from 'src/domain/repositories/message.repository';
import { IChatRepository } from 'src/domain/repositories/chat.repository';
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
import { IDeleteMessageUseCase } from '../interfaces/delete-message.interface';

@Injectable()
export class DeleteMessageUseCase implements IDeleteMessageUseCase {
  constructor(
    private readonly _logger: ILoggerService,
    private readonly _messageRepo: IMessageRepository,
    private readonly _chatRepo: IChatRepository,
    private readonly _eventBus: IChatEventBusPort,
  ) {}

  async execute(dto: {
    messageId: string;
    userId: string;
    forEveryOne: boolean;
  }): Promise<void> {
    const { messageId, userId, forEveryOne } = dto;

    if (!messageId || !userId)
      throw new BadRequestException('messageId & userId required');

    const message = await this._messageRepo.findById(messageId);
    if (!message) throw new ChatMessageNotFoundException('Message not found');

    const chat = await this._chatRepo.findById(message.chatId);
    if (!chat) throw new ChatNotFoundException('Chat not found');

    if (!chat.isParticipant(userId))
      throw new NotAuthorizedException('Forbidden');

    if (forEveryOne) {
      // direct chat: only sender can delete for everyone
      if (message.senderId !== userId) {
        throw new NotAuthorizedException('Only sender can delete for everyone');
      }

      const deleted = message.softDelete();
      await this._messageRepo.update(deleted);

      await this._eventBus.publish({
        topic: CHAT_TOPICS.MESSAGE_DELETED,
        payload: {
          chatId: message.chatId,
          messageId,
          deleteForEveryone: forEveryOne,
          deletedBy: userId,
        },
      });
      return;
    }

    // Soft delete for sender only (UX)
    if (message.senderId !== userId) {
      throw new NotAuthorizedException('You can only delete your own messages');
    }

    // const updated = message.editContent('Message deleted');
    const finalMessage = message.constructor['fromPrimitives']({
      ...message.toProps(),
      metadata: {
        ...(message.metadata ?? {}),
        deletedForSenderOnly: true,
        deletedAt: new Date(),
      },
    });

    await this._messageRepo.update(finalMessage);
  }
}
