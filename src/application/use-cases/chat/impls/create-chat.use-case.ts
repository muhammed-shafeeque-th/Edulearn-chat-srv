import { Injectable } from '@nestjs/common';
import { v4 as uuidV4 } from 'uuid';

import { IChatRepository } from 'src/domain/repositories/chat.repository';
import { Chat } from 'src/domain/entities/chat.entity';
import { ILoggerService } from 'src/application/ports/logger.service';
import { IChatEventBusPort } from 'src/application/ports/chat-event-bus.port';
import { CHAT_TOPICS } from 'src/infrastructure/kafka/chat-topics';
import { IChatUserStateRepository } from 'src/domain/repositories/chat-user.repository';
import CreateChatDto from 'src/modules/chat/grpc/dtos/create-chat.dto';
import { BadRequestException } from 'src/shared/exceptions/infra.exceptions';
import { ICreateChatUseCase } from '../interfaces/create-chat.interface';
import { IUserClient } from 'src/infrastructure/grpc/clients/user/user-client.interface';
import { ChatUserState } from '@/domain/entities/chat-user-state.entity';
import { ChatResponseMapper } from '@/modules/chat/mappers/chat.mapper';
import { DomainException } from '@/domain/exceptions/domain.exception';

@Injectable()
export class CreateChatUseCase implements ICreateChatUseCase {
  constructor(
    private readonly _logger: ILoggerService,
    private readonly _chatRepository: IChatRepository,
    private readonly _chatEventBus: IChatEventBusPort,
    private readonly _stateRepo: IChatUserStateRepository,
    private readonly _userClient: IUserClient,
  ) {}

  async execute(
    command: CreateChatDto,
  ): Promise<{ chat: Chat; state: ChatUserState }> {
    const { studentId, instructorId, role } = command;

    this._logger.info(
      `CreateChat: studentId=${studentId}, instructorId=${instructorId}, role=${role}`,
    );

    if (!studentId?.trim() || !instructorId?.trim()) {
      throw new BadRequestException('studentId and instructorId are required');
    }
    if (studentId === instructorId) {
      throw new BadRequestException('Cannot create a chat with yourself');
    }

    // Check for existing chat between the two users
    const existingChat = await this._chatRepository.findByParticipants(
      studentId,
      instructorId,
    );

    if (existingChat) {
      this._logger.info(
        `Returning existing chat ${existingChat.id} for studentId=${studentId}, instructorId=${instructorId}`,
      );
      const state = await this._stateRepo.getOrCreate(
        existingChat.id,
        role === 'student' ? studentId : instructorId,
      );
      return { chat: existingChat, state };
    }

    // Validate relationship via user service
    try {
      const { isStudent } = await this._userClient.isStudentOfInstructor(
        studentId,
        instructorId,
      );
      if (!isStudent) {
        throw new BadRequestException(
          'Cannot create chat: user is not a student of this instructor',
        );
      }
    } catch (error) {
      if (error instanceof DomainException) throw error;
      this._logger.error('Failed to validate student-instructor relationship', {
        error,
      });
      throw new BadRequestException(
        'Failed to validate student-instructor relationship',
      );
    }

    // Create new chat
    const chatId = uuidV4();
    const chat = new Chat({
      id: chatId,
      studentId,
      instructorId,
    });

    const savedChat = await this._chatRepository.save(chat);

    // Create user state for the requesting user
    const requesterId = role === 'student' ? studentId : instructorId;
    const state = await this._stateRepo.getOrCreate(savedChat.id, requesterId);

    // Publish Kafka event => WS consumer emits chat:created to both users
    await this._chatEventBus.publish({
      topic: CHAT_TOPICS.CHAT_CREATED,
      payload: {
        chatId: savedChat.id,
        studentId: savedChat.studentId,
        instructorId: savedChat.instructorId,
        chat: ChatResponseMapper.toWsPayload(savedChat, state),
      } as any,
    });

    this._logger.debug(
      `Chat ${chatId} created for ${studentId} <-> ${instructorId}`,
    );
    return { chat: savedChat, state };
  }
}
