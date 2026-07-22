import ListStudentChatsDto from 'src/modules/chat/grpc/dtos/list-student-chats.dto';
import { ChatDto } from '../../../dtos/chat.dto';

export abstract class IListStudentChatsUseCase {
  abstract execute(
    query: ListStudentChatsDto,
  ): Promise<{ chats: ChatDto[]; total: number }>;
}
