import { IsUUID } from 'class-validator';
import { ListInstructorChatsRequest } from 'src/infrastructure/grpc/generated/chat_service';
import PaginationDto from './pagination.dto';

export default class ListInstructorChatsDto
  implements ListInstructorChatsRequest
{
  @IsUUID(undefined, { message: '`instructorId` must be type UUID' })
  instructorId: string;

  pagination: PaginationDto;
}
