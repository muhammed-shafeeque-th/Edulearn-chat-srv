import { IsUUID } from 'class-validator';
import { CreateChatRequest } from 'src/infrastructure/grpc/generated/chat_service';

export default class CreateChatDto implements CreateChatRequest {
  @IsUUID(undefined, { message: '`studentId` must be type UUID' })
  userId: string;
  @IsUUID(undefined, { message: '`enrollmentId` must be type UUID' })
  enrollmentId: string;
}
