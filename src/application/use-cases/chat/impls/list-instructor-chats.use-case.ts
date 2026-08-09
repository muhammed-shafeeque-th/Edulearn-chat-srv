import { Injectable } from '@nestjs/common';
import { IChatRepository } from 'src/domain/repositories/chat.repository';
import ListInstructorChatsDto from 'src/modules/chat/grpc/dtos/list-instructor-chats.dto';
import { IChatUserStateRepository } from 'src/domain/repositories/chat-user.repository';
import { BadRequestException } from 'src/shared/exceptions/infra.exceptions';
import { IListInstructorChatsUseCase } from '../interfaces/list-instructor-chats.interface';
import { Chat } from '@/domain/entities/chat.entity';
import { ChatUserState } from '@/domain/entities/chat-user-state.entity';

@Injectable()
export class ListInstructorChatsUseCase implements IListInstructorChatsUseCase {
  constructor(
    private readonly _chatRepository: IChatRepository,
    private readonly _stateRepo: IChatUserStateRepository,
  ) {}

  async execute(
    query: ListInstructorChatsDto,
  ): Promise<{ chats: { chat: Chat; state: ChatUserState }[]; total: number }> {
    const { instructorId, pagination } = query;

    if (!instructorId) {
      throw new BadRequestException('UserId is required');
    }

    const { page = 1, pageSize = 20 } = pagination;

    const { chats, total } = await this._chatRepository.listByInstructor(
      instructorId,
      page,
      pageSize,
    );

    const chatIds = chats.map((c) => c.id);
    const statesMap = await this._stateRepo.findManyByUser(
      instructorId,
      chatIds,
    );

    // ensure state always exists
    const res = await Promise.all(
      chats.map(async (chat) => {
        const state =
          statesMap.get(chat.id) ??
          (await this._stateRepo.getOrCreate(chat.id, instructorId));
        return {chat, state};
      }),
    );

    // apply archived filter
    const visible = res.filter((c) => !c.state.archived);

    // pinned first
    visible.sort((a, b) => {
      const ap = a.state.pinned ? 1 : 0;
      const bp = b.state.pinned ? 1 : 0;
      if (ap !== bp) return bp - ap;
      return b.chat.updatedAt.getTime() - a.chat.updatedAt.getTime();
    });

    return { chats: visible, total };
  }
}
