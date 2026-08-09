import { Injectable } from '@nestjs/common';

import { IDiscussionMessageRepository } from 'src/domain/repositories/discussion-message.repository';
import { ILoggerService } from 'src/application/ports/logger.service';
import { IGetDiscussionMessagesUseCase } from '../interfaces/get-discussion-messages.interface';
import { DiscussionMessage } from '@/domain/entities/discussion.entity';

interface GetDiscussionMessagesCommand {
  roomId: string;
  userId: string;
  pagination?: { page: number; pageSize: number };
}

@Injectable()
export class GetDiscussionMessagesUseCase implements IGetDiscussionMessagesUseCase {
  constructor(
    private readonly _logger: ILoggerService,
    private readonly _messageRepository: IDiscussionMessageRepository,
  ) {}

  async execute(
    command: GetDiscussionMessagesCommand,
  ): Promise<{ messages: DiscussionMessage[]; total: number }> {
    const { roomId, pagination } = command;
    const page = pagination?.page ?? 1;
    const pageSize = pagination?.pageSize ?? 50;

    this._logger.debug(
      `Fetching discussion messages for room ${roomId}, page=${page}`,
    );

    const { messages, total } = await this._messageRepository.findByRoomId(
      roomId,
      page,
      pageSize,
    );

    return {
      messages,
      total,
    };
  }
}
