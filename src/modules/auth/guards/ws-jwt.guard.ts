import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { LoggingService } from 'src/infrastructure/observability/logging/logging.service';
import { AppConfigService } from 'src/infrastructure/config/config.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly logger: LoggingService,
    private readonly configService: AppConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const client = context.switchToWs().getClient();
      const token = this.extractTokenFromHandshake(client);

      if (!token) {
        throw new WsException('Access token not found');
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.jwtSecret,
      });

      this.logger.info('token payload ' + JSON.stringify(payload, null, 2));

      client.user = payload;
      return true;
    } catch (error) {
      this.logger.error('WebSocket authentication failed', error);
      throw new WsException('Unauthorized');
    }
  }

  private extractTokenFromHandshake(client: any): string | undefined {
    const token =
      client.handshake?.auth?.token ||
      client.handshake?.headers?.authorization?.split(' ')[1];
    return token;
  }
}
