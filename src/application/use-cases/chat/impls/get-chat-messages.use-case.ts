import { Injectable } from '@nestjs/common';
import { IMessageRepository } from 'src/domain/repositories/message.repository';
import { IChatRepository } from 'src/domain/repositories/chat.repository';
import { MessageDto } from 'src/application/dtos/message.dto';
import GetMessagesDto from 'src/modules/chat/grpc/dtos/get-messages.dto';
import { ChatNotFoundException } from 'src/domain/exceptions/chat.exceptions';
import {
  BadRequestException,
  NotAuthorizedException,
} from 'src/shared/exceptions/infra.exceptions';
import { IGetChatMessagesUseCase } from '../interfaces/get-chat-messages.interface';

@Injectable()
export class GetChatMessagesUseCase implements IGetChatMessagesUseCase {
  constructor(
    private readonly _messageRepository: IMessageRepository,
    private readonly _chatRepository: IChatRepository,
  ) {}

  async execute(
    dto: GetMessagesDto,
  ): Promise<{ messages: MessageDto[]; total: number }> {
    const { chatId, pagination, userId } = dto;

    if (!chatId || !userId) {
      throw new BadRequestException('Chat ID and User ID are required');
    }

    // Verify chat exists and user is a participant
    const chat = await this._chatRepository.findById(chatId);
    if (!chat) {
      throw new ChatNotFoundException('Chat not found');
    }

    if (!chat.isParticipant(userId)) {
      throw new NotAuthorizedException(
        'User is not a participant in this chat',
      );
    }

    // Extract pagination with defaults
    const page = pagination?.page ?? 1;
    const limit = pagination?.pageSize ?? 20;

    const { messages, total } = await this._messageRepository.findByChatId(
      chatId,
      page,
      limit,
    );

    return {
      messages: messages.map((m) => MessageDto.fromDomain(m)),
      total,
    };
  }
}
