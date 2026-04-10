import { Injectable } from '@nestjs/common';
import { ChatRepository } from '../../../domain/repositories/chat.repository';
import ListStudentChatsDto from 'src/modules/chat/grpc/dtos/list-student-chats.dto';
import { ChatDto } from '../../dtos/chat.dto';
import { ChatUserStateRepository } from 'src/domain/repositories/chat-user.repository';
import { BadRequestException } from 'src/shared/exceptions/infra.exceptions';

@Injectable()
export class ListStudentChatsUseCase {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly stateRepo: ChatUserStateRepository,
  ) {}

  async execute(
    query: ListStudentChatsDto,
  ): Promise<{ chats: ChatDto[]; total: number }> {
    const { studentId, pagination } = query;

    if (!studentId) {
      throw new BadRequestException('StudentId is required');
    }

    const { page = 1, pageSize = 20 } = pagination;

    const { chats, total } = await this.chatRepository.listByStudent(
      studentId,
      page,
      pageSize,
    );

    const chatIds = chats.map((c) => c.id);
    const statesMap = await this.stateRepo.findManyByUser(studentId, chatIds);

    // ensure state always exists
    const dtos = await Promise.all(
      chats.map(async (chat) => {
        const state =
          statesMap.get(chat.id) ??
          (await this.stateRepo.getOrCreate(chat.id, studentId));
        return ChatDto.fromDomain(chat, state);
      }),
    );

    // apply archived filter
    const visible = dtos.filter((c) => !c.archived);

    // pinned first
    visible.sort((a, b) => {
      const ap = a.pinned ? 1 : 0;
      const bp = b.pinned ? 1 : 0;
      if (ap !== bp) return bp - ap;
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });

    return { chats: visible, total };
  }
}
