import { DiscussionRoom } from 'src/domain/entities/discussion.entity';

export class DiscussionRoomMapper {
  static toGrpcResponse(room: DiscussionRoom) {
    return {
      id: room.id,
      courseId: room.courseId,
      instructorId: room.instructorId,
      createdAt: room.createdAt.toISOString(),
      updatedAt: room.updatedAt.toISOString(),
    };
  }
}
