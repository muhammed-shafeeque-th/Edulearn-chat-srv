import { ChatDto } from 'src/application/dtos/chat.dto';
import CreateChatDto from 'src/modules/chat/grpc/dtos/create-chat.dto';

export abstract class ICreateChatUseCase {
  abstract execute(command: CreateChatDto): Promise<ChatDto>;
}
