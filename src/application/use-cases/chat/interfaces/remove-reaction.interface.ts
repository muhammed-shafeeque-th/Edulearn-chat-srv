import { Message } from '@/domain/entities/message.entity';
import RemoveReactionDto from 'src/modules/chat/grpc/dtos/remove-reaction.dto';

export abstract class IRemoveReactionUseCase {
  abstract execute(command: RemoveReactionDto): Promise<Message>;
}
