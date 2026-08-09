import { Injectable } from '@nestjs/common';
import { IChatRepository } from 'src/domain/repositories/chat.repository';
import ListStudentChatsDto from 'src/modules/chat/grpc/dtos/list-student-chats.dto';
import { IChatUserStateRepository } from 'src/domain/repositories/chat-user.repository';
import { BadRequestException } from 'src/shared/exceptions/infra.exceptions';
import { IListStudentChatsUseCase } from '../interfaces/list-student-chats.interface';
import { Chat } from '@/domain/entities/chat.entity';
import { ChatUserState } from '@/domain/entities/chat-user-state.entity';

@Injectable()
export class ListStudentChatsUseCase implements IListStudentChatsUseCase {
  constructor(
    private readonly _chatRepository: IChatRepository,
    private readonly _stateRepo: IChatUserStateRepository,
  ) {}

  async execute(
    query: ListStudentChatsDto,
  ): Promise<{ chats: { chat: Chat; state: ChatUserState }[]; total: number }> {
    const { studentId, pagination } = query;

    if (!studentId) {
      throw new BadRequestException('StudentId is required');
    }

    const { page = 1, pageSize = 20 } = pagination;

    const { chats, total } = await this._chatRepository.listByStudent(
      studentId,
      page,
      pageSize,
    );

    const chatIds = chats.map((c) => c.id);
    const statesMap = await this._stateRepo.findManyByUser(studentId, chatIds);

    // ensure state always exists
    const res = await Promise.all(
      chats.map(async (chat) => {
        const state =
          statesMap.get(chat.id) ??
          (await this._stateRepo.getOrCreate(chat.id, studentId));
        return { chat, state };
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
