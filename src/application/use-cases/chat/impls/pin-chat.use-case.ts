import { Injectable } from '@nestjs/common';
import { IChatRepository } from 'src/domain/repositories/chat.repository';
import { ILoggerService } from 'src/application/ports/logger.service';
import PinChatDto from 'src/modules/chat/grpc/dtos/pin-chat.dto';
import { IChatUserStateRepository } from 'src/domain/repositories/chat-user.repository';
import { ChatNotFoundException } from 'src/domain/exceptions/chat.exceptions';
import {
  BadRequestException,
  NotAuthorizedException,
} from 'src/shared/exceptions/infra.exceptions';
import { IPinChatUseCase } from '../interfaces/pin-chat.interface';
import { ChatUserState } from '@/domain/entities/chat-user-state.entity';
import { Chat } from '@/domain/entities/chat.entity';

@Injectable()
export class PinChatUseCase implements IPinChatUseCase {
  constructor(
    private readonly _logger: ILoggerService,
    private readonly _chatRepository: IChatRepository,
    private readonly stateRepository: IChatUserStateRepository,
  ) {}

  /**
   * Pins a chat for a given user.
   * @param dto Data containing chatId and userId
   * @returns The updated Chat entity as DTO
   */
  async execute(
    dto: PinChatDto,
  ): Promise<{ chat: Chat; state: ChatUserState }> {
    const { chatId, userId } = dto;

    // Validate input
    if (!chatId || !userId) {
      this._logger.warn('Chat ID and User Id are required');
      throw new BadRequestException('Chat ID nad user ID must be provided');
    }

    // Find chat by ID
    const chat = await this._chatRepository.findById(chatId);

    if (!chat) {
      this._logger.warn(`Chat with ID ${chatId} not found`);
      throw new ChatNotFoundException(`Chat not found with id ${chatId}`);
    }

    // Validate if user is a participant
    if (!chat.isParticipant(userId)) {
      this._logger.warn(
        `User ${userId} is not a participant of chat ${chatId}`,
      );
      throw new NotAuthorizedException(
        'User is not a participant in this chat',
      );
    }

    const state = await this.stateRepository.getOrCreate(chatId, userId);
    state.pin();
    await this.stateRepository.save(state);

    this._logger.debug(`Pinned chat ${chatId} for user ${userId}`);
    return { chat, state };
  }
}
