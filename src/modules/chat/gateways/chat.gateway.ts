import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  BaseWsExceptionFilter,
  WsException,
} from '@nestjs/websockets';
import {
  UsePipes,
  ValidationPipe,
  Injectable,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { Server, Socket } from 'socket.io';

import { WsJwtGuard } from '../../auth/guards/ws-jwt.guard';
import { LoggingService } from 'src/infrastructure/observability/logging/logging.service';
import { PresenceService } from 'src/infrastructure/redis/presence.repository';
import { JoinChatPayload, TypingEmitPayload } from './types';
import { WsLoggingInterceptor } from 'src/infrastructure/interceptors/ws-logging.interceptor';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from 'src/infrastructure/config/config.service';
import { ChatService } from '../../../application/services/chat.service';
import { DiscussionService } from '../../../application/services/discussion.service';

export interface WsAuthUser {
  userId: string;
  email: string;
  username: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthenticatedSocket extends Socket {
  user: WsAuthUser;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
    ],
    credentials: true,
  },
  namespace: '/chat',
})
@UseFilters(new BaseWsExceptionFilter())
@UseInterceptors(WsLoggingInterceptor)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  readonly server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly logger: LoggingService,
    private readonly configService: AppConfigService,
    private readonly presenceService: PresenceService,
    private readonly chatService: ChatService,
    private readonly discussionService: DiscussionService,
  ) {}

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      // Manually trigger guard
      const isValid = new WsJwtGuard(
        this.jwtService,
        this.logger,
        this.configService,
      ).canActivate({
        switchToWs: () => ({ getClient: () => client }),
      } as any);

      if (!isValid) {
        client.disconnect();
        return;
      }
      const userId = client.user.userId;

      this.logger.log(`User ${userId} connected`);
      // Join user to their personal room
      await client.join(`user:${userId}`);

      // Set user as online
      await this.presenceService.setUserOnline(userId);

      // Notify other users
      client.broadcast.emit('user:online', { userId, timestamp: new Date() });
      this.logger.log(`User ${userId} connected to chat`);
    } catch (error) {
      this.logger.error(
        `Error handling connection${client && (client as any).user?.userId ? ` for user ${(client as any).user.userId}` : ''}`,
        { error },
      );
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: AuthenticatedSocket): Promise<void> {
    try {
      const userId = client.user?.userId;
      if (!userId) return;

      // Set user as offline
      await this.presenceService.setUserOffline(userId);

      // Notify other users
      client.broadcast.emit('user:offline', { userId, timestamp: new Date() });
      this.logger.log(`User ${userId} disconnected from chat`);
    } catch (error) {
      this.logger.error(
        `Error handling disconnection${client && (client as any).user?.userId ? ` for user ${(client as any).user.userId}` : ''}`,
        { error },
      );
    }
  }

  //  CLIENT EVENT HANDLERS

  @SubscribeMessage('join:chat')
  async handleJoinChat(
    @MessageBody() data: JoinChatPayload,
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    try {
      const { chatId } = data;
      const userId = client.user?.userId;
      if (!userId) throw new WsException('Unauthorized');

      if (!this.chatService.canJoinToChat(chatId, userId)) {
        throw new WsException('Forbidden: not a participant of this chat');
      }
      this.logger.debug(`User ${userId} joining chat ${chatId}`);

      // Join chat room
      await client.join(`chat:${chatId}`);
      client.emit('chat:joined', { chatId });
    } catch (error) {
      this.logger.error('Error joining chat', { error });
      client.emit('error', { message: 'Failed to join chat' });
    }
  }

  @SubscribeMessage('leave:chat')
  async handleLeaveChat(
    @MessageBody() data: JoinChatPayload,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const { chatId } = data;
      const userId = client.user?.userId;
      if (!userId) throw new WsException('Unauthorized');
      this.logger.debug(`User ${userId} leaving chat ${chatId}`);

      // Leave chat room
      await client.leave(`chat:${chatId}`);

      client.emit('chat:left', { chatId });
    } catch (error) {
      this.logger.error('Error leaving chat', { error });
      client.emit('error', { message: 'Failed to leave chat' });
    }
  }

  @SubscribeMessage('typing:start')
  @UsePipes(new ValidationPipe({ transform: true }))
  async handleTypingStart(
    @MessageBody() data: TypingEmitPayload,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const { chatId } = data;
      const userId = client.user.userId;
      if (!userId) return;

      this.logger.debug(`User ${userId} started typing in chat ${chatId}`);

      // Broadcast to chat with user info so UI can display name
      client.to(`chat:${chatId}`).emit('typing:start', {
        chatId,
        userId,
        firstName: client.user.firstName ?? '',
        lastName: client.user.lastName ?? '',
      });
    } catch (error) {
      this.logger.error('Error handling typing start', { error });
    }
  }

  @SubscribeMessage('typing:stop')
  @UsePipes(new ValidationPipe({ transform: true }))
  async handleTypingStop(
    @MessageBody() data: TypingEmitPayload,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const { chatId } = data;
      const userId = client.user.userId;

      this.logger.debug(`User ${userId} stopped typing in chat ${chatId}`);

      client.to(`chat:${chatId}`).emit('typing:stop', {
        chatId,
        userId,
      });
    } catch (error) {
      this.logger.error('Error handling typing stop', { error });
    }
  }

  //  Discussion Room Handlers

  @SubscribeMessage('join:discussion')
  async handleJoinDiscussion(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    try {
      const { roomId } = data;
      const userId = client.user?.userId;
      if (!userId) throw new WsException('Unauthorized');

      const canAccess = await this.discussionService.canAccessDiscussion(
        roomId,
        userId,
      );
      if (!canAccess) {
        throw new WsException(
          'Forbidden: You are not authorized to access this discussion',
        );
      }

      this.logger.debug(`User ${userId} joining discussion room ${roomId}`);
      await client.join(`discussion:${roomId}`);
      client.emit('discussion:joined', { roomId });
    } catch (error) {
      this.logger.error('Error joining discussion', { error });
      client.emit('error', { message: 'Failed to join discussion' });
    }
  }

  @SubscribeMessage('leave:discussion')
  async handleLeaveDiscussion(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    try {
      const { roomId } = data;
      const userId = client.user?.userId;
      if (!userId) throw new WsException('Unauthorized');

      this.logger.debug(`User ${userId} leaving discussion room ${roomId}`);
      await client.leave(`discussion:${roomId}`);
      client.emit('discussion:left', { roomId });
    } catch (error) {
      this.logger.error('Error leaving discussion', { error });
      client.emit('error', { message: 'Failed to leave discussion' });
    }
  }

  //  Emit Helpers

  emitToChat(chatId: string, event: string, payload: unknown) {
    this.server.to(`chat:${chatId}`).emit(event, payload);
  }

  emitToDiscussion(roomId: string, event: string, payload: unknown) {
    this.server.to(`discussion:${roomId}`).emit(event, payload);
  }

  emitToUser(userId: string, event: string, payload: unknown) {
    this.server.to(`user:${userId}`).emit(event, payload);
  }

  /**
   * Method to get online users; can be used by other services/providers
   */
  async getOnlineUsers(): Promise<string[]> {
    return this.presenceService.getOnlineUsers();
  }
}
