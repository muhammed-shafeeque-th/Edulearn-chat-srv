export abstract class IDeleteMessageUseCase {
  abstract execute(dto: {
    messageId: string;
    userId: string;
    forEveryOne: boolean;
  }): Promise<void>;
}
