export class DomainException extends Error {
  errorCode: string;
  constructor(message: string) {
    super(message);
    this.name = 'DomainException';
  }
}
