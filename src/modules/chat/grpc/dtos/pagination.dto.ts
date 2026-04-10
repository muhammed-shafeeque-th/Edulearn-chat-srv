import { IsNumber } from 'class-validator';
import { PaginationRequest } from 'src/infrastructure/grpc/generated/chat_service';

export default class PaginationDto implements PaginationRequest {
  @IsNumber()
  page: number;

  @IsNumber()
  pageSize: number;
}
