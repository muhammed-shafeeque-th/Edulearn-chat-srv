import { Injectable } from '@nestjs/common';
import { IMessageRepository } from 'src/domain/repositories/message.repository';
import { IChatRepository } from 'src/domain/repositories/chat.repository';
import { ILoggerService } from 'src/application/ports/logger.service';
import { MessageDto } from 'src/application/dtos/message.dto';
import RemoveReactionDto from 'src/modules/chat/grpc/dtos/remove-reaction.dto';
import { IChatEventBusPort } from 'src/application/ports/chat-event-bus.port';
import { CHAT_TOPICS } from 'src/infrastructure/kafka/chat-topics';
import {
  ChatMessageNotFoundException,
  ChatNotFoundException,
  ReactionNotFoundException,
} from 'src/domain/exceptions/chat.exceptions';
import {
  BadRequestException,
  NotAuthorizedException,
} from 'src/shared/exceptions/infra.exceptions';
import { IRemoveReactionUseCase } from '../interfaces/remove-reaction.interface';

@Injectable()
export class RemoveReactionUseCase implements IRemoveReactionUseCase {
  constructor(
    private readonly _messageRepository: IMessageRepository,
    private readonly _chatRepository: IChatRepository,
    private readonly _eventBus: IChatEventBusPort,
    private readonly _logger: ILoggerService,
  ) {}

  async execute(command: RemoveReactionDto): Promise<MessageDto> {
    const { messageId, userId, reactionId } = command;

    if (!messageId || !userId || !reactionId) {
      throw new BadRequestException('messageId userId reactionId required');
    }
    this._logger.info(
      `Attempting to remove reaction: messageId=${messageId}, userId=${userId}, reactionId=${reactionId}`,
      { ctx: RemoveReactionUseCase.name },
    );

    const message = await this._messageRepository.findById(messageId);
    if (!message) throw new ChatMessageNotFoundException('Message not found');

    const chat = await this._chatRepository.findById(message.chatId);
    if (!chat) throw new ChatNotFoundException('Chat not found');

    if (!chat.isParticipant(userId))
      throw new NotAuthorizedException('Forbidden');

    const reactions = message.reactions ?? [];
    const next = reactions.filter((r) => r.id !== reactionId);

    if (next.length === reactions.length)
      throw new ReactionNotFoundException('Reaction not found');

    const updated = message.constructor['fromPrimitives']({
      ...message.toProps(),
      reactions: next,
    });

    await this._messageRepository.update(updated);

    await this._eventBus.publish({
      topic: CHAT_TOPICS.REACTION_REMOVED,
      payload: {
        chatId: message.chatId,
        messageId,
        reactionId,
        removedBy: userId,
      },
    });

    this._logger.info(
      `Reaction${reactionId ? ` (${reactionId})` : ''} removed for message ${messageId} in chat ${message.chatId}`,
    );
    return MessageDto.fromDomain(updated);
  }
}
