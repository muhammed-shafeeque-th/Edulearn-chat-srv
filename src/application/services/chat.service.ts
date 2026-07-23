import { Injectable, NotFoundException } from '@nestjs/common';
import { IChatRepository } from 'src/domain/repositories/chat.repository';

@Injectable()
export class ChatService {
  public constructor(private readonly _chatRepository: IChatRepository) {}

  public async canJoinToChat(chatId: string, userId: string) {
    const chat = await this._chatRepository.findById(chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    if (!chat.isParticipant(userId)) {
      return false;
    }

    return true;
  }
}
