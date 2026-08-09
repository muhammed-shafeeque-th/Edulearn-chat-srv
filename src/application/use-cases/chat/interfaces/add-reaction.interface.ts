import { Message } from '@/domain/entities/message.entity';
import ReactMessageDto from 'src/modules/chat/grpc/dtos/react-message.dto';

export abstract class IReactMessageUseCase {
  abstract execute(command: ReactMessageDto): Promise<Message>;
}
