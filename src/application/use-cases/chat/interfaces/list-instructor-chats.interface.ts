import ListInstructorChatsDto from 'src/modules/chat/grpc/dtos/list-instructor-chats.dto';
import { ChatDto } from '../../../dtos/chat.dto';

export abstract class IListInstructorChatsUseCase {
  abstract execute(
    query: ListInstructorChatsDto,
  ): Promise<{ chats: ChatDto[]; total: number }>;
}
