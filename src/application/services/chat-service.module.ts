import { Module } from '@nestjs/common';
import { MongoDbDatabaseModule } from 'src/infrastructure/database/mongodb/database.module';

import { GrpcClientsModule } from 'src/infrastructure/grpc/clients/grpc-clients.module';
import { KafkaModule } from 'src/infrastructure/kafka/kafka.module';
import { ChatService } from './chat.service';
import { DiscussionService } from './discussion.service';
import { RedisModule } from 'src/infrastructure/redis/redis.module';

@Module({
  imports: [MongoDbDatabaseModule, KafkaModule, GrpcClientsModule, RedisModule],
  providers: [
    // MessageDomainService,
    ChatService,
    DiscussionService,
  ],
  exports: [ChatService, DiscussionService],
})
export class ChatServiceModule {}
