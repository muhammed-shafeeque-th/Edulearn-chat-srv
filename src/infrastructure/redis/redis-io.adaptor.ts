import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplication } from '@nestjs/common';
import { createAdapter } from '@socket.io/redis-adapter';
import { RedisService } from './redis.service';
import { ServerOptions } from 'socket.io';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  constructor(private app: INestApplication) {
    super(app);
  }

  async connectToRedis() {
    const redisService = this.app.get(RedisService);
    const pubClient = redisService.client;
    const subClient = redisService.client.duplicate();
    await subClient.connect();

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, {
      ...options,
      cors: { origin: '*', methods: ['GET', 'POST'] },
    });

    server.adapter(this.adapterConstructor);
    return server;
  }
}
