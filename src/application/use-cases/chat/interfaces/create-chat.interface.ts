import { ChatUserState } from '@/domain/entities/chat-user-state.entity';
import { Chat } from '@/domain/entities/chat.entity';
import CreateChatDto from 'src/modules/chat/grpc/dtos/create-chat.dto';

export abstract class ICreateChatUseCase {
  abstract execute(
    command: CreateChatDto,
  ): Promise<{ chat: Chat; state: ChatUserState }>;
}
