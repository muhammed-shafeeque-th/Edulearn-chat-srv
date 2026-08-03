import { Module } from '@nestjs/common';

import { ChatGatewayModule } from './gateways/chat-gateway.module';
import { ChatGrpcModule } from './grpc/grpc.module';
import { ChatKafkaModule } from './kafka/kafka-handler.module';

@Module({
  imports: [ChatGrpcModule, ChatGatewayModule, ChatKafkaModule],
})
export class ChatModule {}
