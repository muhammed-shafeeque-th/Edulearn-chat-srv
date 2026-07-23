import { Module } from '@nestjs/common';

import { MongoDbDatabaseModule } from 'src/infrastructure/database/mongodb/database.module';
import { KafkaModule } from 'src/infrastructure/kafka/kafka.module';
import { PresenceService } from 'src/infrastructure/redis/presence.service';

// Discussion use cases
import { CreateOrGetDiscussionRoomUseCase } from './create-or-get-discussion-room.use-case';
import { SendDiscussionMessageUseCase } from './send-discussion-message.use-case';
import { GetDiscussionMessagesUseCase } from './get-discussion-messages.use-case';
import { GrpcClientsModule } from 'src/infrastructure/grpc/clients/grpc-clients.module';
import { ChatServiceModule } from 'src/application/services/chat-service.module';
import { ICreateOrGetDiscussionRoomUseCase } from '../interfaces/create-or-get-discussion-room.interface';
import { ISendDiscussionMessageUseCase } from '../interfaces/send-discussion-message.interface';
import { IGetDiscussionMessagesUseCase } from '../interfaces/get-discussion-messages.interface';

@Module({
  imports: [
    MongoDbDatabaseModule,
    KafkaModule,
    GrpcClientsModule,
    ChatServiceModule,
  ],
  providers: [
    // MessageDomainService,
    PresenceService,

    {
      provide: ICreateOrGetDiscussionRoomUseCase,
      useClass: CreateOrGetDiscussionRoomUseCase,
    },
    {
      provide: ISendDiscussionMessageUseCase,
      useClass: SendDiscussionMessageUseCase,
    },
    {
      provide: IGetDiscussionMessagesUseCase,
      useClass: GetDiscussionMessagesUseCase,
    },
  ],
  exports: [
    ICreateOrGetDiscussionRoomUseCase,
    ISendDiscussionMessageUseCase,
    IGetDiscussionMessagesUseCase,
  ],
})
export class DiscussionUseCaseModule {}
