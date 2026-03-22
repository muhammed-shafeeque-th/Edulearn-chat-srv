import { status as GrpcStatus, ServiceError } from '@grpc/grpc-js';

// Define a gRPC error mapping utility function
import { DomainException } from './base.exception';

// Chat Domain Exceptions
export class DiscussionRoomNotFoundException extends DomainException {
  errorCode = 'DISCUSSION_NOT_FOUND_EXCEPTION';
  constructor(message?: string) {
    super(message || 'The requested Discussion room  not found.');
  }
  serializeGrpcError(): ServiceError {
    return this.toGrpcError(this.message, GrpcStatus.NOT_FOUND, this.errorCode);
  }
}

export class DiscussionDomainException extends DomainException {
  errorCode = 'DISCUSSION_DOMAIN_EXCEPTION';
  constructor(message?: string) {
    super(message || 'A Discussion domain error occurred.');
  }
  serializeGrpcError(): ServiceError {
    return this.toGrpcError(this.message, GrpcStatus.UNKNOWN, this.errorCode);
  }
}
