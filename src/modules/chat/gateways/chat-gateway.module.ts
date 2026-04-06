import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { RedisModule } from 'src/infrastructure/redis/redis.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { PresenceService } from 'src/infrastructure/redis/presence.repository';
import { ChatServiceModule } from 'src/application/services/chat-service.module';

@Module({
  imports: [AuthModule, RedisModule, ChatServiceModule],
  providers: [ChatGateway, PresenceService],
  exports: [ChatGateway],
})
export class ChatGatewayModule {}
