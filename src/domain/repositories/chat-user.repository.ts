import { ChatUserState } from '../entities/chat-user-state.entity';

export abstract class IChatUserStateRepository {
  abstract getOrCreate(chatId: string, userId: string): Promise<ChatUserState>;
  abstract save(state: ChatUserState): Promise<void>;
  abstract findManyByUser(
    userId: string,
    chatIds: string[],
  ): Promise<Map<string, ChatUserState>>;
}
