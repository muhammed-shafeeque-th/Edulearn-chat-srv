import { Injectable } from '@nestjs/common';
import { ILoggerService } from 'src/application/ports/logger.service';
import { PresenceService } from 'src/infrastructure/redis/presence.service';
import { IGetOnlineUsersUseCase } from '../interfaces/get-online-users.interface';

@Injectable()
export class GetOnlineUsersUseCase implements IGetOnlineUsersUseCase {
  constructor(
    private readonly _logger: ILoggerService,
    private readonly presenceService: PresenceService,
  ) {}

  /**
   * Fetches the list of currently online user IDs.
   * @returns Array of user IDs who are considered online.
   */
  async execute(): Promise<{ users: string[] }> {
    this._logger.info('Fetching online users', {
      ctx: GetOnlineUsersUseCase.name,
    });

    const onlineUsers = await this.presenceService.getOnlineUsers();

    this._logger.info(`Online users fetched: ${onlineUsers.length} users`);

    return { users: onlineUsers };
  }
}
