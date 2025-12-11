import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisService } from './redis.service';
import { createClient } from 'redis';
import { AppConfigService } from '../config/config.service';
import { REDIS_CLIENT } from './constants';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: async (config: AppConfigService) => {
        const client = createClient({
          url: config.redisUrl,
        });

        await client.connect();
        return client;
      },
      inject: [AppConfigService],
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
