import { DiscussionRoom } from 'src/domain/entities/discussion.entity';

export class DiscussionRoomDto {
  constructor(
    readonly id: string,
    readonly courseId: string,
    readonly instructorId: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static fromDomain(room: DiscussionRoom): DiscussionRoomDto {
    return new DiscussionRoomDto(
      room.id,
      room.courseId,
      room.instructorId,
      room.createdAt,
      room.updatedAt,
    );
  }

  toGrpcResponse() {
    return {
      id: this.id,
      courseId: this.courseId,
      instructorId: this.instructorId,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
