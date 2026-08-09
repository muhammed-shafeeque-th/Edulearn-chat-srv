import { Injectable } from '@nestjs/common';
import { IChatRepository } from 'src/domain/repositories/chat.repository';
import GetChatDto from 'src/modules/chat/grpc/dtos/get-chat.dto';
import { ILoggerService } from 'src/application/ports/logger.service';
import { IChatUserStateRepository } from 'src/domain/repositories/chat-user.repository';
import { ChatNotFoundException } from 'src/domain/exceptions/chat.exceptions';
import { BadRequestException } from 'src/shared/exceptions/infra.exceptions';
import { IGetChatUseCase } from '../interfaces/get-chat.interface';
import { Chat } from '@/domain/entities/chat.entity';
import { ChatUserState } from '@/domain/entities/chat-user-state.entity';

@Injectable()
export class GetChatUseCase implements IGetChatUseCase {
  constructor(
    private readonly _logger: ILoggerService,
    private readonly _chatRepository: IChatRepository,
    private readonly _stateRepo: IChatUserStateRepository,
  ) {}

  /**
   * @param dto Data containing the chatId to get chat
   * @returns The found Chat entity as DTO
   */
  async execute(dto: GetChatDto): Promise<{ chat: Chat; state: ChatUserState }> {
    const { chatId, userId } = dto;

    // Validate input
    if (!chatId) {
      this._logger.warn('Chat ID is required');
      throw new BadRequestException('Chat ID must be provided');
    }

    // Find chat by ID
    const chat = await this._chatRepository.findById(chatId);

    if (!chat) {
      this._logger.warn(`Chat with ID ${chatId} not found`);
      throw new ChatNotFoundException('Chat not found');
    }
    const state = await this._stateRepo.getOrCreate(chatId, userId);

    // Convert domain model to DTO and return
    this._logger.log(`Fetched chat ${chatId}`);
    return { chat, state };
  }
}
