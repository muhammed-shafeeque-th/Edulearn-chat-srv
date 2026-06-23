import { DomainException } from './domain.exception';
import { ErrorCode } from 'src/shared/exceptions/error-codes';

// Chat Domain Exceptions
export class DiscussionRoomNotFoundException extends DomainException {
  errorCode = '_EXCEPTION';
  constructor(message?: string) {
    super(
      ErrorCode.NOT_FOUND,
      message || 'The requested Discussion room  not found.',
      'DISCUSSION_NOT_FOUND',
    );
  }
}

export class DiscussionDomainException extends DomainException {
  errorCode = 'DISCUSSION_DOMAIN_EXCEPTION';
  constructor(message?: string) {
    super(
      ErrorCode.BUSINESS_RULE_VIOLATION,
      message || 'A Discussion domain error occurred.',
      'DISCUSSION_DOMAIN_EXCEPTION',
    );
  }
}
