import { ChatUserState } from '@/domain/entities/chat-user-state.entity';
import { Chat } from '@/domain/entities/chat.entity';
import ListInstructorChatsDto from 'src/modules/chat/grpc/dtos/list-instructor-chats.dto';

export abstract class IListInstructorChatsUseCase {
  abstract execute(
    query: ListInstructorChatsDto,
  ): Promise<{ chats: { chat: Chat; state: ChatUserState }[]; total: number }>;
}
