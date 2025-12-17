import {
  Message,
  MessageReaction as MessageReactionDomain,
} from 'src/domain/entities/message.entity';
import {
  MessageReaction,
  MessageResponse,
} from 'src/infrastructure/grpc/generated/chat_service';

export class MessageReactionDto {
  userId: string;
  emoji: string;
  id: string;
  timestamp: Date | string;

  static fromDomain(reaction: MessageReactionDomain): MessageReactionDto {
    const dto = new MessageReactionDto();
    dto.emoji = reaction.emoji;
    dto.emoji = reaction.emoji;
    dto.id = reaction.id;
    dto.timestamp = reaction.timestamp;
    dto.userId = reaction.userId;
    return dto;
  }

  toGrpResponse(): MessageReaction {
    return {
      emoji: this.emoji,
      id: this.id,
      timestamp: new Date(this.timestamp).getTime(),
      userId: this.userId,
    };
  }
}

export class MessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: string;
  timestamp: Date | string;
  status: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  replyTo?: string;
  reactions?: MessageReactionDto[];
  editedAt?: Date | string;
  readBy?: string[];
  metadata?: Record<string, any>;

  static fromDomain(message: Message): MessageDto {
    const dto = new MessageDto();
    dto.id = message.id;
    dto.content = message.content;
    dto.conversationId = message.conversationId;
    dto.editedAt = message.editedAt;
    dto.fileName = message.fileName;
    dto.fileSize = message.fileSize;
    dto.fileUrl = message.fileUrl;
    dto.metadata = message.metadata;
    dto.reactions = message.reactions.map(MessageReactionDto.fromDomain);
    dto.readBy = message.readBy;
    dto.receiverId = message.receiverId;
    dto.replyTo = message.replyTo;

    return dto;
  }

  public toGrpcResponse(): MessageResponse {
    return {
      content: this.content,
      conversationId: this.conversationId,
      createdAt: new Date(this.timestamp).getTime(),
      id: this.id,
      reactions: this.reactions.map((reaction) => reaction.toGrpResponse()),
      senderId: this.senderId,
      status: this.status,
      updatedAt: new Date(this.editedAt).getTime(),
      fileName: this.fileName,
      fileSize: this.fileSize.toFixed(),
      fileUrl: this.fileUrl,
      receiverId: this.receiverId,
      replayTo: this.replyTo,
      type: this.type,
    };
  }
}
