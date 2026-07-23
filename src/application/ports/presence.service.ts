export abstract class IPresenceService {
  abstract setUserOnline(userId: string): Promise<void>;

  abstract setUserOffline(userId: string): Promise<void>;

  abstract isUserOnline(userId: string): Promise<boolean>;

  abstract getOnlineUsers(): Promise<string[]>;
}
