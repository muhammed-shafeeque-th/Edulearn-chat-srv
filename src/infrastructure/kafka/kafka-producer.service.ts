import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { randomUUID } from 'crypto';

import { LoggingService } from 'src/infrastructure/observability/logging/logging.service';
import { KAFKA_CLIENT } from './constants';
import { ChatEventBusPort } from 'src/application/ports/chat-event-bus.port';
import { TopicPayloads } from './kafka-topic-payload';

@Injectable()
export class KafkaProducerImpl
  implements ChatEventBusPort, OnModuleInit, OnModuleDestroy
{
  constructor(
    @Inject(KAFKA_CLIENT) private readonly kafkaClient: ClientKafka,
    private readonly logger: LoggingService,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
    this.logger.info(`Kafka client connected`, { ctx: KafkaProducerImpl.name });
  }

  async onModuleDestroy() {
    await this.kafkaClient.close();
    this.logger.info(`Kafka client disconnected`, {
      ctx: KafkaProducerImpl.name,
    });
  }

  async publish(event: TopicPayloads): Promise<void> {
    const { topic } = event;

    const enrichedPayload = {
      version: 1,
      eventId: randomUUID(),
      occurredAt: new Date().toISOString(),
      ...event.payload,
    };

    try {
      await lastValueFrom(this.kafkaClient.emit(topic, enrichedPayload));
      this.logger.debug(`Kafka publish ok`, {
        ctx: KafkaProducerImpl.name,
        topic,
        chatId: (enrichedPayload as any).chatId,
      });
    } catch (error: any) {
      this.logger.error(`Kafka publish failed`, {
        ctx: KafkaProducerImpl.name,
        topic,
        error,
      });
      throw error;
    }
  }
}
