import { ChatUserState } from 'src/domain/entities/chat-user-state.entity';

export abstract class IMuteChatUseCase {
  abstract execute(
    chatId: string,
    userId: string,
    durationSeconds?: number,
  ): Promise<ChatUserState>;
}
