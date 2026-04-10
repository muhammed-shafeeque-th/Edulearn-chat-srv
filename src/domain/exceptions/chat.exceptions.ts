import { status as GrpcStatus, ServiceError } from '@grpc/grpc-js';

// Define a gRPC error mapping utility function
import { DomainException } from './base.exception';

// Chat Domain Exceptions
export class ChatNotFoundException extends DomainException {
  errorCode = 'Chat_NOT_FOUND_EXCEPTION';
  constructor(message?: string) {
    super(message || 'The requested Chat was not found.');
  }
  serializeGrpcError(): ServiceError {
    return this.toGrpcError(this.message, GrpcStatus.NOT_FOUND, this.errorCode);
  }
}

export class ChatDomainException extends DomainException {
  errorCode = 'Chat_DOMAIN_EXCEPTION';
  constructor(message?: string) {
    super(message || 'A Chat domain error occurred.');
  }
  serializeGrpcError(): ServiceError {
    return this.toGrpcError(this.message, GrpcStatus.UNKNOWN, this.errorCode);
  }
}
// Chat Message Domain Exceptions
export class ChatMessageNotFoundException extends DomainException {
  errorCode = 'Chat_MESSAGE_NOT_FOUND_EXCEPTION';
  constructor(message?: string) {
    super(message || 'The requested message was not found.');
  }
  serializeGrpcError(): ServiceError {
    return this.toGrpcError(this.message, GrpcStatus.NOT_FOUND, this.errorCode);
  }
}
export class ReactionNotFoundException extends DomainException {
  errorCode = 'MESSAGE_REACTION_NOT_FOUND_EXCEPTION';
  constructor(message?: string) {
    super(message || 'The message reaction was not found.');
  }
  serializeGrpcError(): ServiceError {
    return this.toGrpcError(this.message, GrpcStatus.NOT_FOUND, this.errorCode);
  }
}
