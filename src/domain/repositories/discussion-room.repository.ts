import { DiscussionRoom } from '../entities/discussion.entity';

export abstract class DiscussionRoomRepository {
  abstract findById(id: string): Promise<DiscussionRoom | null>;
  abstract findByCourseId(courseId: string): Promise<DiscussionRoom | null>;
  abstract save(room: DiscussionRoom): Promise<DiscussionRoom>;
  abstract update(room: DiscussionRoom): Promise<DiscussionRoom>;
}
