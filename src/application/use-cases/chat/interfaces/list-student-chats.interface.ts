import ListStudentChatsDto from 'src/modules/chat/grpc/dtos/list-student-chats.dto';
import { ChatUserState } from '@/domain/entities/chat-user-state.entity';
import { Chat } from '@/domain/entities/chat.entity';

export abstract class IListStudentChatsUseCase {
  abstract execute(
    query: ListStudentChatsDto,
  ): Promise<{ chats: { chat: Chat; state: ChatUserState }[]; total: number }>;
}
