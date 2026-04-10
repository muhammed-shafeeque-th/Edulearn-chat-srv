import { DiscussionMessage } from 'src/domain/entities/discussion.entity';

export class DiscussionMessageDto {
  constructor(
    readonly id: string,
    readonly roomId: string,
    readonly senderId: string,
    readonly senderRole: string,
    readonly content: string,
    readonly sequence: number,
    readonly createdAt: Date,
    readonly editedAt?: Date,
  ) {}

  static fromDomain(message: DiscussionMessage): DiscussionMessageDto {
    return new DiscussionMessageDto(
      message.id,
      message.roomId,
      message.senderId,
      message.senderRole,
      message.content,
      message.sequence,
      message.timestamp,
      message.editedAt,
    );
  }

  toGrpcResponse() {
    return {
      id: this.id,
      roomId: this.roomId,
      senderId: this.senderId,
      senderRole: this.senderRole,
      content: this.content,
      sequence: this.sequence,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.editedAt
        ? this.editedAt.toISOString()
        : this.createdAt.toISOString(),
    };
  }

  toWsPayload() {
    return {
      id: this.id,
      roomId: this.roomId,
      senderId: this.senderId,
      senderRole: this.senderRole,
      content: this.content,
      sequence: this.sequence,
      createdAt: this.createdAt.getTime(),
      updatedAt: this.editedAt
        ? this.editedAt.getTime()
        : this.createdAt.getTime(),
    };
  }
}
