import { Injectable } from '@nestjs/common';
import { v4 as uuidV4 } from 'uuid';

import { IMessageRepository } from 'src/domain/repositories/message.repository';
import { IChatRepository } from 'src/domain/repositories/chat.repository';
import SendMessageCommand from 'src/modules/chat/grpc/dtos/send-message.dto';
import { Message } from 'src/domain/entities/message.entity';
import { ILoggerService } from 'src/application/ports/logger.service';
import { IChatEventBusPort } from 'src/application/ports/chat-event-bus.port';
import { CHAT_TOPICS } from 'src/infrastructure/kafka/chat-topics';
import { ChatNotFoundException } from 'src/domain/exceptions/chat.exceptions';
import {
  BadRequestException,
  NotAuthorizedException,
} from 'src/shared/exceptions/infra.exceptions';
import { ISendMessageUseCase } from '../interfaces/send-message.interface';
import { MessageMapper } from '@/modules/chat/mappers/message.mapper';

@Injectable()
export class SendMessageUseCase implements ISendMessageUseCase {
  constructor(
    private readonly _logger: ILoggerService,
    private readonly _messageRepository: IMessageRepository,
    private readonly _chatRepository: IChatRepository,
    private readonly _chatEventBus: IChatEventBusPort,
  ) {}

  async execute(command: SendMessageCommand): Promise<Message> {
    const { chatId, senderId, content, idempotencyKey } = command;

    this._logger.info(
      'Received request for send Message: ' + JSON.stringify(command),
    );

    if (!chatId || !senderId || !content?.trim() || !idempotencyKey?.trim()) {
      throw new BadRequestException(
        'chatId, senderId, content, idempotencyKey required',
      );
    }
    // Validate and fetch chat
    const chat = await this._chatRepository.findById(chatId);
    if (!chat) {
      this._logger.warn(`Chat (${chatId}) not found`);
      throw new ChatNotFoundException('Chat not found');
    }
    if (!chat.isParticipant(senderId))
      throw new NotAuthorizedException('Forbidden');

    // idempotency: safe retry
    const existing = await this._messageRepository.findByIdempotencyKey(
      chatId,
      idempotencyKey,
    );
    if (existing) return existing;

    // ordering for messages
    const sequence = await this._messageRepository.nextSequence(chatId);

    const message = new Message({
      id: uuidV4(),
      chatId,
      senderId,
      content,
      sequence,
      idempotencyKey,
      timestamp: new Date(),
      readBy: [senderId], // sender has read their message
    });

    // Save message first (durable)
    await this._messageRepository.save(message);

    // Update chat lastMessage (best-effort — acceptable without tx)
    await this._chatRepository.save(
      chat.withLastMessage(message.id, message.sequence),
    );

    // Publish Kafka event => WS consumer emits message:new
    await this._chatEventBus.publish({
      topic: CHAT_TOPICS.MESSAGE_SENT,
      payload: {
        chatId,
        message: MessageMapper.toWsPayload(message) ?? message,
      } as any,
    });

    this._logger.debug(`Message saved chatId=${chatId} seq=${sequence}`);
    return message;
  }
}
