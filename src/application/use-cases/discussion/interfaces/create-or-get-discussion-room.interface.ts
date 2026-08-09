import { DiscussionRoom } from '@/domain/entities/discussion.entity';
import { CreateDiscussionRoomRequest } from 'src/infrastructure/grpc/generated/chat_service';

export abstract class ICreateOrGetDiscussionRoomUseCase {
  abstract execute(
    command: CreateDiscussionRoomRequest,
  ): Promise<DiscussionRoom>;
}
