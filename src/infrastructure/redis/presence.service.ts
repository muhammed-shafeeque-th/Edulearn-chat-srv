import { Injectable } from '@nestjs/common';
import { IPresenceService } from 'src/application/ports/presence.service';
import { ICacheService } from 'src/application/ports/cache.service';

@Injectable()
export class PresenceService implements IPresenceService {
  private readonly ONLINE_KEY = 'user:online';

  constructor(private readonly cache: ICacheService) {}

  async setUserOnline(userId: string): Promise<void> {
    await this.cache.hSet(this.ONLINE_KEY, userId, Date.now().toString());
  }

  async setUserOffline(userId: string): Promise<void> {
    await this.cache.hDel(this.ONLINE_KEY, userId);
  }

  async isUserOnline(userId: string): Promise<boolean> {
    const lastSeen = await this.cache.hGet(this.ONLINE_KEY, userId);
    if (!lastSeen) return false;
    const now = Date.now();
    return now - parseInt(lastSeen, 10) < 30000;
  }

  async getOnlineUsers(): Promise<string[]> {
    const onlineUsers = await this.cache.hGetAll(this.ONLINE_KEY);
    const now = Date.now();

    return Object.entries(onlineUsers)
      .filter(([, lastSeen]) => now - parseInt(lastSeen, 10) < 30000)
      .map(([userId]) => userId);
  }
}
