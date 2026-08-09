import { Injectable } from '@nestjs/common';
import { IChatRepository } from 'src/domain/repositories/chat.repository';
import { ILoggerService } from 'src/application/ports/logger.service';
import DeleteChatDto from 'src/modules/chat/grpc/dtos/delete-chat.dto';
import { IChatUserStateRepository } from 'src/domain/repositories/chat-user.repository';
import { ChatNotFoundException } from 'src/domain/exceptions/chat.exceptions';
import {
  BadRequestException,
  NotAuthorizedException,
} from 'src/shared/exceptions/infra.exceptions';
import { IDeleteChatUseCase } from '../interfaces/delete-chat.interface';
import { Chat } from '@/domain/entities/chat.entity';
import { ChatUserState } from '@/domain/entities/chat-user-state.entity';

@Injectable()
export class DeleteChatUseCase implements IDeleteChatUseCase {
  constructor(
    private readonly _logger: ILoggerService,
    private readonly _chatRepository: IChatRepository,
    private readonly _stateRepo: IChatUserStateRepository,
  ) {}

  /**
   * Deletes a chat for a given user.
   * @param dto Data containing the chatId and userId for deletion
   * @returns The deleted Chat entity as DTO
   */
  async execute(
    dto: DeleteChatDto,
  ): Promise<{ chat: Chat; state: ChatUserState }> {
    const { chatId, userId } = dto;

    // Validate input
    if (!chatId || !userId) {
      this._logger.warn('Chat ID and User ID are required');
      throw new BadRequestException('Chat ID and User Id must be provided');
    }

    // Find the chat
    const chat = await this._chatRepository.findById(chatId);

    if (!chat) {
      this._logger.warn(`Chat with ID ${chatId} not found`);
      throw new ChatNotFoundException('Chat not found');
    }

    if (!chat.isParticipant(userId)) {
      this._logger.warn(
        `User ${userId} does not have permission to delete chat ${chatId}`,
      );
      throw new NotAuthorizedException('Permission denied to delete this chat');
    }

    const state = await this._stateRepo.getOrCreate(chatId, userId);
    state.archive();
    await this._stateRepo.save(state);

    this._logger.log(`Chat archived chatId=${chatId} userId=${userId}`);

    this._logger.log(`Deleted chat ${chatId} by user ${userId}`);

    return { chat, state };
  }
}
