import { MessageDto } from '../../../dtos/message.dto';
import RemoveReactionDto from 'src/modules/chat/grpc/dtos/remove-reaction.dto';

export abstract class IRemoveReactionUseCase {
  abstract execute(command: RemoveReactionDto): Promise<MessageDto>;
}
