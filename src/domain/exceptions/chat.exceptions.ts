import { ErrorCode } from 'src/shared/exceptions/error-codes';
import { DomainException } from './domain.exception';

// Chat Domain Exceptions
export class ChatNotFoundException extends DomainException {
  errorCode = 'CHAT_NOT_FOUND_EXCEPTION';
  constructor(message?: string) {
    super(
      ErrorCode.NOT_FOUND,
      message || 'The requested Chat was not found.',
      'CHAT_NOT_FOUND',
    );
  }
}

export class ChatDomainException extends DomainException {
  constructor(message?: string) {
    super(
      ErrorCode.BUSINESS_RULE_VIOLATION,
      message || 'A Chat domain error occurred.',
      'CHAT_DOMAIN_EXCEPTION',
    );
  }
}
// Chat Message Domain Exceptions
export class ChatMessageNotFoundException extends DomainException {
  constructor(message?: string) {
    super(
      ErrorCode.NOT_FOUND,
      message || 'The requested message was not found.',
      'CHAT_MESSAGE_NOT_FOUND',
    );
  }
}
export class ReactionNotFoundException extends DomainException {
  constructor(message?: string) {
    super(
      ErrorCode.NOT_FOUND,
      message || 'The message reaction was not found.',
      'MESSAGE_REACTION_NOT_FOUND',
    );
  }
}
