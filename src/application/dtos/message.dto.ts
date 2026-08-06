import { Message } from 'src/domain/entities/message.entity';
import { MessageData } from 'src/infrastructure/grpc/generated/chat_service';

export class MessageDto {
  constructor(
    readonly id: string,
    readonly chatId: string,
    readonly senderId: string,
    readonly content: string,
    readonly sequence: number,
    readonly createdAt: Date,
    readonly editedAt?: Date,
    readonly deletedAt?: Date,
    readonly reactions?: any[],
    readonly readBy?: string[],
    readonly metadata?: Record<string, any>,
  ) {}

  static fromDomain(message: Message): MessageDto {
    return new MessageDto(
      message.id,
      message.chatId,
      message.senderId,
      message.content,
      message.sequence,
      message.timestamp,
      message.editedAt,
      message.deletedAt,
      message.reactions ?? [],
      message.readBy ?? [],
      message.metadata ?? {},
    );
  }

  toGrpcResponse(): MessageData {
    return {
      id: this.id,
      chatId: this.chatId,
      senderId: this.senderId,
      content: this.content,
      sequence: this.sequence,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.editedAt
        ? this.editedAt.toISOString()
        : this.createdAt.toISOString(),
      reactions: this.reactions ?? [],
    };
  }
  toWsPayload() {
    return {
      id: this.id,
      chatId: this.chatId,
      senderId: this.senderId,
      content: this.content,
      sequence: this.sequence,
      createdAt: this.createdAt.getTime(),
      updatedAt: this.editedAt
        ? this.editedAt.getTime()
        : this.createdAt.getTime(),
      reactions: this.reactions ?? [],
      readBy: this.readBy,
      editedAt: this.editedAt,
    };
  }
}
