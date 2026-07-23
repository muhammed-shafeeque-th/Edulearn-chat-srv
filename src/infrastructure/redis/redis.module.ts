import { Module, Global } from '@nestjs/common';
import { AppConfigService } from '../config/config.service';
import { ICacheService } from 'src/application/ports/cache.service';
import { CacheModule } from '@edulearn/nest';
import { RedisClientImpl } from './redis.service';

@Global()
@Module({
  imports: [
    CacheModule.forRootAsync({
      inject: [AppConfigService],

      useFactory: (config: AppConfigService) => ({
        db: config.redisDb,
        keyPrefix: config.redisKeyPrefix,
        maxRetriesPerRequest: 5,
        lazyConnect: true,
        host: config.redisHost,
        port: config.redisPort,
      }),
    }),
  ],
  providers: [{ provide: ICacheService, useClass: RedisClientImpl }],
  exports: [ICacheService],
})
export class RedisModule {}
