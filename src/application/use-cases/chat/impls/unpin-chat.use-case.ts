import { Injectable } from '@nestjs/common';
import { IChatRepository } from 'src/domain/repositories/chat.repository';
import { ILoggerService } from 'src/application/ports/logger.service';
import UnPinChatDto from 'src/modules/chat/grpc/dtos/unpin-chat.dto';
import { IChatUserStateRepository } from 'src/domain/repositories/chat-user.repository';
import { ChatNotFoundException } from 'src/domain/exceptions/chat.exceptions';
import {
  BadRequestException,
  NotAuthorizedException,
} from 'src/shared/exceptions/infra.exceptions';
import { IUnPinChatUseCase } from '../interfaces/unpin-chat.use-case';
import { Chat } from '@/domain/entities/chat.entity';
import { ChatUserState } from '@/domain/entities/chat-user-state.entity';

@Injectable()
export class UnPinChatUseCase implements IUnPinChatUseCase {
  constructor(
    private readonly _logger: ILoggerService,
    private readonly _chatRepository: IChatRepository,
    private readonly _stateRepo: IChatUserStateRepository,
  ) {}

  /**
   * Unpins a chat for a given user.
   * @param dto Data containing chatId and userId
   * @returns The updated Chat entity as DTO
   */
  async execute(
    dto: UnPinChatDto,
  ): Promise<{ chat: Chat; state: ChatUserState }> {
    const { chatId, userId } = dto;

    // Input validation
    if (!chatId || !userId) {
      this._logger.warn('User ID and Chat ID are required');
      throw new BadRequestException('chatId and userId required');
    }

    // Retrieve chat by ID
    const chat = await this._chatRepository.findById(chatId);

    if (!chat) {
      this._logger.warn(`Chat with ID ${chatId} not found`);
      throw new ChatNotFoundException('Chat not found');
    }

    // Check if user is a participant
    if (!chat.isParticipant(userId)) {
      this._logger.warn(
        `User ${userId} is not a participant of chat ${chatId}`,
      );
      throw new NotAuthorizedException(
        'User is not a participant in this chat',
      );
    }

    // Unpin the chat for the user, only if the user has it pinned
    const state = await this._stateRepo.getOrCreate(chatId, userId);

    state.unpin();
    await this._stateRepo.save(state);

    this._logger.log(`Unpinned chat ${chatId} for user ${userId}`);

    return { chat, state };
  }
}
