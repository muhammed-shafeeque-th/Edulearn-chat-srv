import { IsUUID } from 'class-validator';
import { ListStudentChatsRequest } from 'src/infrastructure/grpc/generated/chat_service';
import PaginationDto from './pagination.dto';

export default class GetUserChatsDto implements ListStudentChatsRequest {
  @IsUUID(undefined, { message: '`studentId` must be type UUID' })
  studentId: string;

  pagination: PaginationDto;
}
