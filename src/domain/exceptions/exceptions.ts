import { status as GrpcStatus, ServiceError } from '@grpc/grpc-js';

// Define a gRPC error mapping utility function
import { DomainException } from './base.exception';

// Chat Domain Exceptions
export class NotAuthorizedException extends DomainException {
  errorCode = 'NOT_AUTHORIZED_EXCEPTION';
  constructor(message?: string) {
    super(message || "You don't have permission to perform this operation.");
  }
  serializeGrpcError(): ServiceError {
    return this.toGrpcError(
      this.message,
      GrpcStatus.PERMISSION_DENIED,
      this.errorCode,
    );
  }
}

export class BadRequestException extends DomainException {
  errorCode = 'BAD_REQUEST_EXCEPTION';
  constructor(message?: string) {
    super(message ?? `Invalid request parameters.`);
  }
  serializeGrpcError(): ServiceError {
    return this.toGrpcError(
      this.message,
      GrpcStatus.INVALID_ARGUMENT,
      this.errorCode,
    );
  }
}
