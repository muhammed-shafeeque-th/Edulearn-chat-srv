import { Module } from '@nestjs/common';
import { ChatGatewayModule } from '../gateways/chat-gateway.module';
import { ChatEventsConsumer } from './chat-event.consumer';

@Module({
  imports: [
    ChatGatewayModule,

    // GrpcInfrastructureModule,
  ],
  controllers: [ChatEventsConsumer],
})
export class ChatKafkaModule {}
