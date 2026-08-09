import { Message } from 'src/domain/entities/message.entity';
import { MessageData } from 'src/infrastructure/grpc/generated/chat_service';

export class MessageMapper {
  static toGrpcResponse(message: Message): MessageData {
    return {
      id: message.id,
      chatId: message.chatId,
      senderId: message.senderId,
      content: message.content,
      sequence: message.sequence,
      createdAt: message.metadata.toISOString(),
      updatedAt: message.editedAt
        ? message.editedAt.toISOString()
        : message.metadata.toISOString(),
      reactions:
        message.reactions?.map((m) => ({
          emoji: m.emoji,
          id: m.id,
          timestamp: m.timestamp?.getDate(),
          userId: m.userId,
        })) || [],
    };
  }
  static toWsPayload(message: Message) {
    return {
      id: message.id,
      chatId: message.chatId,
      senderId: message.senderId,
      content: message.content,
      sequence: message.sequence,
      createdAt: message.timestamp.getTime(),
      updatedAt: message.editedAt
        ? message.editedAt.getTime()
        : message.timestamp.getTime(),
      reactions: message.reactions ?? [],
      readBy: message.readBy,
      editedAt: message.editedAt,
    };
  }
}
