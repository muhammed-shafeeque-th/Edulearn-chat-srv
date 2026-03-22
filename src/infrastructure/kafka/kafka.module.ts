import { Module } from '@nestjs/common';
import { KafkaProducerImpl } from './kafka-producer.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KAFKA_CLIENT } from './constants';
import { ChatEventBusPort } from 'src/application/ports/chat-event-bus.port';
import { AppConfigService } from '../config/config.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: KAFKA_CLIENT,
        useFactory: (config: AppConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: config.kafkaClientId || 'payment-service',
              brokers: config.kafkaBrokers,
            },
            producer: {
              maxInFlightRequests: 1,
              idempotent: true,
              retry: {
                retries: 5,
              },
            },
          },
        }),
        inject: [AppConfigService],
      },
    ]),
  ],
  providers: [{ provide: ChatEventBusPort, useClass: KafkaProducerImpl }],
  exports: [ChatEventBusPort, ClientsModule],
})
export class KafkaModule {}
