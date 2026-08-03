import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import path from 'path';
import { getProtoPath, PROTO_ROOT_DIR } from '@edulearn/core';

import { AppModule } from './app.module';
import { RedisIoAdapter } from './infrastructure/redis/redis-io.adaptor';
import { ILoggerService } from './application/ports/logger.service';
import { AppConfigService } from './infrastructure/config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = app.get(ILoggerService);
  const config = app.get(AppConfigService);

  // Set Global logger
  app.useLogger(logger);

  // Enable gRPC
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'chat_service',
      protoPath: [getProtoPath('chat')],
      loader: {
        includeDirs: [path.join(PROTO_ROOT_DIR, 'chat')],
      },
      url: `0.0.0.0:${config.grpcPort}`,
    },
  });

  // Start Kafka microservice/consumer
  app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: config.kafkaClientId || 'chat-service',
        brokers: config.kafkaBrokers,
      },
      consumer: {
        groupId: config.kafkaConsumerGroup || 'chat-consumer-group',
        sessionTimeout: 30000,
        heartbeatInterval: 3000,
        maxBytesPerPartition: config.kafkaFetchMaxBytes || 1048576,
        retry: {
          retries: 5,
        },
      },
    },
  });

  // Global pipes and filters
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: config.allowedOrigins?.split(','),
    credentials: true,
  });

  // Setup WebSocket with Redis adapter
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();

  app.useWebSocketAdapter(redisIoAdapter);

  await app.startAllMicroservices();

  logger.log(`Microservices started`, { ctx: 'Bootstrap' });
  // Start HTTP server
  const port = config.httpPort || 3009;
  await app.listen(port);
  logger.log(`HTTP server listening on port ${port}`, { ctx: 'Bootstrap' });
}

bootstrap();
