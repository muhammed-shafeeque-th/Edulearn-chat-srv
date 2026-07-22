import ReactMessageDto from 'src/modules/chat/grpc/dtos/react-message.dto';
import { MessageDto } from '../../../dtos/message.dto';

export abstract class IReactMessageUseCase {
  abstract execute(command: ReactMessageDto): Promise<MessageDto>;
}
