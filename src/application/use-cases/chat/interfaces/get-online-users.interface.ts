export abstract class IGetOnlineUsersUseCase {
  /**
   * Fetches the list of currently online user IDs.
   * @returns Array of user IDs who are considered online.
   */
  abstract execute(): Promise<{ users: string[] }>;
}
