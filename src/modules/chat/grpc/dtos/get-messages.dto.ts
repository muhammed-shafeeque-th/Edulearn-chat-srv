import { IsUUID } from 'class-validator';
import { GetMessagesRequest } from 'src/infrastructure/grpc/generated/chat_service';
import PaginationDto from './pagination.dto';

export default class GetMessagesDto implements GetMessagesRequest {
  @IsUUID(undefined, { message: '`userId` must be type UUID' })
  chatId: string;
  userId: string;
  pagination: PaginationDto;
}
