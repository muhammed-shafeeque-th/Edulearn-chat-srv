import { DiscussionMessage } from 'src/domain/entities/discussion.entity';

export class DiscussionMessageMapper {
  static toGrpcResponse(message: DiscussionMessage) {
    return {
      id: message.id,
      roomId: message.roomId,
      senderId: message.senderId,
      senderRole: message.senderRole,
      content: message.content,
      sequence: message.sequence,
      createdAt: message.timestamp.toISOString(),
      updatedAt: message.editedAt
        ? message.editedAt.toISOString()
        : message.timestamp.toISOString(),
    };
  }
  static toWsPayload(message: DiscussionMessage) {
    return {
      id: message.id,
      roomId: message.roomId,
      senderId: message.senderId,
      senderRole: message.senderRole,
      content: message.content,
      sequence: message.sequence,
      createdAt: message.timestamp.getTime(),
      updatedAt: message.editedAt
        ? message.editedAt.getTime()
        : message.timestamp.getTime(),
    };
  }
}
