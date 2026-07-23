import { DiscussionRoomDto } from 'src/application/dtos/discussion-room.dto';
import { CreateDiscussionRoomRequest } from 'src/infrastructure/grpc/generated/chat_service';

export abstract class ICreateOrGetDiscussionRoomUseCase {
  abstract execute(
    command: CreateDiscussionRoomRequest,
  ): Promise<DiscussionRoomDto>;
}
