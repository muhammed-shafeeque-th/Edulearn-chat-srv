import { BaseException } from './base-exception';
import { ErrorCode } from './error-codes';

export class NotAuthorizedException extends BaseException {
  errorCode = '_EXCEPTION';
  constructor(message?: string) {
    super(
      ErrorCode.PERMISSION_DENIED,
      message || "You don't have permission to perform this operation.",
      'NOT_AUTHORIZED',
    );
  }
}

export class ClientServiceException extends BaseException {
  constructor(message?: string) {
    super(
      ErrorCode.FAILED_PRECONDITION,
      message || `Something went wrong while executing the client request`,
      'CLIENT_SERVICE_EXCEPTION',
    );
  }
}
export class BadRequestException extends BaseException {
  constructor(message?: string) {
    super(
      ErrorCode.INVALID_ARGUMENT,
      message || `Invalid request parameters`,
      'INVALID_REQUEST_ARGUMENTS',
    );
  }
}

export class TimeoutException extends BaseException {
  constructor(message?: string) {
    super(
      ErrorCode.DEADLINE_EXCEEDED,
      message || `Timeout exception`,
      'REQUEST_TIMEOUT',
    );
  }
}
