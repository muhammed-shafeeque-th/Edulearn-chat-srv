import { Injectable } from '@nestjs/common';
import { IChatRepository } from 'src/domain/repositories/chat.repository';
import { IChatUserStateRepository } from 'src/domain/repositories/chat-user.repository';
import { ChatNotFoundException } from 'src/domain/exceptions/chat.exceptions';
import { NotAuthorizedException } from 'src/shared/exceptions/infra.exceptions';
import { IMuteChatUseCase } from '../interfaces/mute-chat.interface';

@Injectable()
export class MuteChatUseCase implements IMuteChatUseCase {
  constructor(
    private readonly _chatRepo: IChatRepository,
    private readonly _stateRepo: IChatUserStateRepository,
  ) {}

  async execute(chatId: string, userId: string, durationSeconds?: number) {
    const chat = await this._chatRepo.findById(chatId);
    if (!chat) throw new ChatNotFoundException('Chat not found');
    if (!chat.isParticipant(userId))
      throw new NotAuthorizedException('Forbidden');

    const state = await this._stateRepo.getOrCreate(chatId, userId);

    const until =
      durationSeconds && durationSeconds > 0
        ? new Date(Date.now() + durationSeconds * 1000)
        : undefined;

    state.mute(until);
    await this._stateRepo.save(state);
    return state;
  }
}
