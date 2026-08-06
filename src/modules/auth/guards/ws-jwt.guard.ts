import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { ILoggerService } from 'src/application/ports/logger.service';
import { AppConfigService } from 'src/infrastructure/config/config.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly logger: ILoggerService,
    private readonly configService: AppConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const token = this.extractTokenFromHandshake(client);

    if (!token) {
      throw new WsException('Access token not found');
    }
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.jwtSecret,
      });

      // EXPIRY CHECK (HERE)
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        this.logger.warn('WS token expired', {
          userId: payload.sub,
        });

        client.disconnect(true);
        throw new WsException('Token expired');
      }

      // Attach user to socket
      client.user = {
        userId: payload.sub,
        email: payload.email,
        username: payload.username,
        role: payload.role,
      };

      return true;
    } catch (err) {
      this.logger.warn('WS JWT validation failed', { err });
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
