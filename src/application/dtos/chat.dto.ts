import { Chat } from '../../domain/entities/chat.entity';
import { ChatUserState } from '../../domain/entities/chat-user-state.entity';
import { ChatData } from 'src/infrastructure/grpc/generated/chat_service';

export class ChatDto {
  constructor(
    readonly id: string,
    readonly studentId: string,
    readonly instructorId: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
    readonly lastMessageId?: string,
    readonly pinned?: boolean,
    readonly archived?: boolean,
    readonly mutedUntil?: Date | null,
  ) {}

  static fromDomain(chat: Chat, state: ChatUserState): ChatDto {
    return new ChatDto(
      chat.id,
      chat.studentId,
      chat.instructorId,
      chat.createdAt,
      chat.updatedAt,
      chat.lastMessageId,
      state.pinned,
      state.archived,
      state.mutedUntil,
    );
  }

  toGrpcResponse(): ChatData {
    return {
      id: this.id,
      studentId: this.studentId,
      instructorId: this.instructorId,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      lastMessageId: this.lastMessageId ?? '',

      isPinned: !!this.pinned,
      isArchived: !!this.archived,
      isMuted: !!this.mutedUntil && this.mutedUntil.getTime() > Date.now(),
    };
  }
  toWsPayload() {
    return {
      id: this.id,
      studentId: this.studentId,
      instructorId: this.instructorId,
      createdAt: this.createdAt.getTime(),
      updatedAt: this.updatedAt.getTime(),
      lastMessageId: this.lastMessageId ?? '',

      isPinned: !!this.pinned,
      isArchived: !!this.archived,
      isMuted: !!this.mutedUntil && this.mutedUntil.getTime() > Date.now(),
      mutedUntil: this.mutedUntil ? this.mutedUntil.getTime() : 0,
    };
  }
}
