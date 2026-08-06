import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: NestConfigService) {}

  // Service config
  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV', 'development');
  }

  get serviceName(): string {
    return this.configService.get<string>('SERVICE_NAME', 'UserService');
  }
  get allowedOrigins(): string {
    return this.configService.get<string>('ALLOWED_ORIGINS', '*');
  }
  get serviceVersion(): string {
    return this.configService.get<string>('SERVICE_VERSION', '1.0.0');
  }

  // Client Grpc service ports
  get courseGrpcUrl(): string {
    return this.configService.get<string>(
      'COURSE_SERVICE_GRPC',
      'course_svc:50053',
    );
  }

  get userGrpcUrl(): string {
    return this.configService.get<string>(
      'USER_SERVICE_GRPC',
      'user_svc:50052',
    );
  }

  get httpPort(): number {
    return this.configService.get<number>('HTTP_PORT', 3000);
  }

  get grpcPort(): number {
    return this.configService.get<number>('GRPC_PORT', 50053);
  }

  // DB config

  get mongodbConnectionUrl(): string {
    return this.configService.get<string>(
      'MONGODB_CONNECTION_URL',
      'postgresql://postgres:password@localhost:5432/user_service',
    );
  }
  get databaseUrl(): string {
    return this.configService.get<string>(
      'DATABASE_URL',
      'postgresql://postgres:password@localhost:5432/user_service',
    );
  }
  get databaseHost(): string {
    return this.configService.get<string>('DATABASE_HOST', 'localhost');
  }
  get databasePort(): string {
    return this.configService.get<string>('DATABASE_PORT', '5432');
  }
  get databaseUsername(): string {
    return this.configService.get<string>('DATABASE_USERNAME', 'postgres');
  }
  get databasePassword(): string {
    return this.configService.get<string>('DATABASE_PASSWORD', 'password');
  }
  get databaseName(): string {
    return this.configService.get<string>('DATABASE_NAME', 'user_service');
  }

  get databaseMaxConnections(): number {
    return this.configService.get<number>('DATABASE_MAX_CONNECTIONS', 50);
  }

  get databaseMinConnections(): number {
    return this.configService.get<number>('DATABASE_MIN_CONNECTIONS', 10);
  }

  // Redis config

  get redisUrl(): string {
    return this.configService.get<string>(
      'REDIS_URL',
      'redis://localhost:6379/0',
    );
  }

  get redisMaxConnections(): number {
    return this.configService.get<number>('REDIS_MAX_CONNECTIONS', 100);
  }

  get redisMinConnections(): number {
    return this.configService.get<number>('REDIS_MIN_CONNECTIONS', 10);
  }

  get redisTtlDefault(): number {
    return this.configService.get<number>('REDIS_TTL_DEFAULT', 86400);
  }
  get redisKeyPrefix(): string {
    return this.configService.get<string>('REDIS_KEY_PREFIX', 'edulearn:user:');
  }

  get redisDb(): number {
    return this.configService.get<number>('REDIS_DB', 2);
  }
  get redisHost(): string {
    return this.configService.get<string>('REDIS_HOST', 'localhost');
  }
  get redisPort(): number {
    return this.configService.get<number>('REDIS_PORT', 6379);
  }

  // Kafka config

  get kafkaBrokers(): string[] {
    return this.configService
      .get<string>('KAFKA_BROKERS', 'localhost:9092')
      .split(',');
  }

  get kafkaClientId(): string {
    return this.configService.get<string>('KAFKA_CLIENT_ID', 'chat-service');
  }

  get kafkaConsumerGroup(): string {
    return this.configService.get<string>(
      'KAFKA_CONSUMER_GROUP',
      'chat-service-group',
    );
  }

  get kafkaMaxPollRecords(): number {
    return this.configService.get<number>('KAFKA_MAX_POLL_RECORDS', 100);
  }

  get kafkaFetchMaxBytes(): number {
    return this.configService.get<number>('KAFKA_FETCH_MAX_BYTES', 5242880);
  }

  // JWT config
  get jwtSecret(): string {
    return this.configService.get<string>(
      'JWT_ACCESS_TOKEN_SECRET',
      'your-secret-key',
    );
  }

  get jwtExpiresIn(): string {
    return this.configService.get<string>('JWT_TOKEN_EXPIRY', '1h');
  }

  // Observability config

  get tracingSamplingRatio(): number {
    return this.configService.get<number>('TRACING_SAMPLING_RATIO', 0.1);
  }

  get logLevel(): string {
    return this.configService.get<string>('LOG_LEVEL', 'info');
  }

  get collectorUrl(): string {
    return this.configService.get<string>('OTLP_ENDPOINT', 'info');
  }
}
