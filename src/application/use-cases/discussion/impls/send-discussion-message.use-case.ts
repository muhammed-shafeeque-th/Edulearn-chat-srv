import { Injectable } from '@nestjs/common';
import { v4 as uuidV4 } from 'uuid';

import { IDiscussionMessageRepository } from 'src/domain/repositories/discussion-message.repository';
import { IDiscussionRoomRepository } from 'src/domain/repositories/discussion-room.repository';
import {
  DiscussionMessage,
  SenderRole,
} from 'src/domain/entities/discussion.entity';
import { ILoggerService } from 'src/application/ports/logger.service';
import { IChatEventBusPort } from '../../../ports/chat-event-bus.port';
import { CHAT_TOPICS } from 'src/infrastructure/kafka/chat-topics';
import { DiscussionService } from '../../../services/discussion.service';
import {
  BadRequestException,
  NotAuthorizedException,
} from 'src/shared/exceptions/infra.exceptions';
import { DiscussionRoomNotFoundException } from 'src/domain/exceptions/discussion.exceptions';
import { ISendDiscussionMessageUseCase } from '../interfaces/send-discussion-message.interface';
import { DiscussionMessageMapper } from '@/modules/chat/mappers/discussion-message.mapper';

interface SendDiscussionMessageCommand {
  roomId: string;
  senderId: string;
  senderRole: string;
  content: string;
  idempotencyKey: string;
}

@Injectable()
export class SendDiscussionMessageUseCase implements ISendDiscussionMessageUseCase {
  constructor(
    private readonly _logger: ILoggerService,
    private readonly _messageRepository: IDiscussionMessageRepository,
    private readonly _roomRepository: IDiscussionRoomRepository,
    private readonly _chatEventBus: IChatEventBusPort,
    private readonly _discussionService: DiscussionService,
  ) {}

  async execute(
    command: SendDiscussionMessageCommand,
  ): Promise<DiscussionMessage> {
    const { roomId, senderId, content, idempotencyKey } = command;

    if (!roomId || !senderId || !content?.trim() || !idempotencyKey?.trim()) {
      throw new BadRequestException(
        'roomId, senderId, content, idempotencyKey required',
      );
    }

    // Validate room exists
    const room = await this._roomRepository.findById(roomId);
    if (!room) {
      this._logger.warn(`Discussion room (${roomId}) not found`);
      throw new DiscussionRoomNotFoundException('Discussion room not found');
    }

    const canAccess = await this._discussionService.canAccessDiscussion(
      roomId,
      senderId,
    );
    if (!canAccess) {
      this._logger.warn(
        `User ${senderId} forbidden from sending message to room ${roomId}`,
      );
      throw new NotAuthorizedException(
        'You do not have permission to send messages in this discussion',
      );
    }

    // Idempotency: safe retry
    const existing = await this._messageRepository.findByIdempotencyKey(
      roomId,
      idempotencyKey,
    );
    if (existing) return existing;

    // Generate sequence
    const sequence = await this._messageRepository.nextSequence(roomId);

    const inferredRole =
      room.instructorId === senderId ? 'instructor' : 'student';

    const message = new DiscussionMessage({
      id: uuidV4(),
      roomId,
      senderId,
      senderRole: inferredRole as SenderRole,
      content,
      sequence,
      idempotencyKey,
      timestamp: new Date(),
    });

    // Save message
    await this._messageRepository.save(message);

    // Update room's last message
    await this._roomRepository.save(
      room.withLastMessage(message.id, message.sequence),
    );


    // Publish Kafka event => WS consumer emits discussion:message:new
    await this._chatEventBus.publish({
      topic: CHAT_TOPICS.DISCUSSION_MESSAGE_SENT,
      payload: {
        roomId,
        courseId: room.courseId,
        message: DiscussionMessageMapper.toWsPayload(message) ?? message,
      } as any,
    });

    this._logger.debug(
      `Discussion message saved roomId=${roomId} seq=${sequence}`,
    );
    return message;
  }
}
