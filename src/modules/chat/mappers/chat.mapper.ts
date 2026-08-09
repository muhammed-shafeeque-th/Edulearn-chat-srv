import { Chat } from '@domain/entities/chat.entity';
import { ChatUserState } from '@domain/entities/chat-user-state.entity';

export class ChatResponseMapper {
  static toGrpcResponse(chat: Chat, state: ChatUserState) {
    return {
      id: chat.id,
      studentId: chat.studentId,
      instructorId: chat.instructorId,
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString(),
      lastMessageId: chat.lastMessageId ?? '',

      isPinned: !!state.pinned,
      isArchived: !!state.archived,
      isMuted: !!state.mutedUntil && state.mutedUntil.getTime() > Date.now(),
    };
  }
  static toWsPayload(chat: Chat, state: ChatUserState) {
    return {
      id: chat.id,
      studentId: chat.studentId,
      instructorId: chat.instructorId,
      createdAt: chat.createdAt.getTime(),
      updatedAt: chat.updatedAt.getTime(),
      lastMessageId: chat.lastMessageId ?? '',

      isPinned: !!state.pinned,
      isArchived: !!state.archived,
      isMuted: !!state.mutedUntil && state.mutedUntil.getTime() > Date.now(),
      mutedUntil: state.mutedUntil ? state.mutedUntil.getTime() : 0,
    };
  }
}
