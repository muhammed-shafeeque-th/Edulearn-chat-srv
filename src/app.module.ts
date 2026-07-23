import { Module } from '@nestjs/common';
import { ChatModule } from './modules/chat/chat.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { ConfigModule } from './infrastructure/config/config.module';
import { AppLoggerModule } from './infrastructure/observability/logging/logging.module';
import { AppMetricsModule } from './infrastructure/observability/metrics/metrics.module';
import { AppHealthModule } from './infrastructure/health/health.module';

@Module({
  imports: [
    ConfigModule,

    AppLoggerModule,
    AppMetricsModule,

    RedisModule,
    ChatModule,

    AppHealthModule,
  ],
})
export class AppModule {}
