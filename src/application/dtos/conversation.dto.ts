import {
  Conversation,
  ConversationType,
} from 'src/domain/entities/conversation.entity';
import { MessageReaction as MessageReactionDomain } from 'src/domain/entities/message.entity';
import {
  ConversationResponse,
  MessageReaction,
} from 'src/infrastructure/grpc/generated/chat_service';

export class MessageReactionDto {
  id: string;
  userId: string;
  emoji: string;
  timestamp: Date;

  static fromDomain(reaction: MessageReactionDomain): MessageReactionDto {
    const dto = new MessageReactionDto();
    dto.emoji = reaction.emoji;
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

export class ConversationDto {
  userId?: string;
  id: string;
  type: ConversationType;
  participantIds: string[];
  createdAt?: Date;
  updatedAt?: Date;
  lastMessageId?: string;
  isActive?: boolean;
  name?: string;
  description?: string;
  avatar?: string;
  adminIds?: string[];
  isPinned?: boolean;
  isMuted?: boolean;
  isArchived?: boolean;
  mutedUntil?: Date;

  /**
   * Creates a ConversationDto from a Conversation domain object, plus per-user info.
   * @param conversation The Conversation domain entity.
   * @param userId The user for whom to compute "isPinned", "isMuted", etc.
   */
  static fromDomain(
    conversation: Conversation,
    userId: string,
  ): ConversationDto {
    const dto = new ConversationDto();
    dto.id = conversation.id;
    dto.userId = userId;
    dto.type = conversation.type;
    dto.participantIds = conversation.participantIds;
    dto.createdAt = conversation.createdAt;
    dto.updatedAt = conversation.updatedAt;
    dto.lastMessageId = conversation.lastMessageId;
    dto.isActive = conversation.isActive;
    dto.name = conversation.name;
    dto.description = conversation.description;
    dto.avatar = conversation.avatar;
    dto.adminIds = conversation.adminIds;
    dto.isPinned = conversation.isPinnedBy(userId);
    dto.isMuted = conversation.isMutedBy(userId);
    dto.isArchived = conversation.isArchivedBy(userId);
    dto.mutedUntil = conversation.muteUntilForUser(userId);

    return dto;
  }

  public toGrpcResponse(): ConversationResponse {
    return {
      createdAt: new Date(this.createdAt).getTime(),
      id: this.id,
      isArchived: this.isArchived,
      isMuted: this.isMuted,
      isPinned: this.isPinned,
      mutedUntil: new Date(this.mutedUntil).getTime(),
      participants: this.participantIds,
      studentId: this.adminIds[0],
      type: this.type,
      updatedAt: new Date(this.updatedAt).getTime(),
    };
  }
}
