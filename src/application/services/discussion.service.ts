import { Injectable } from '@nestjs/common';
import { IDiscussionRoomRepository } from 'src/domain/repositories/discussion-room.repository';
import { DiscussionRoomNotFoundException } from 'src/domain/exceptions/discussion.exceptions';
import { ILoggerService } from '../ports/logger.service';
import { ICacheService } from '../ports/cache.service';
import { ICourseClient } from 'src/infrastructure/grpc/clients/course/course-client.interface';

@Injectable()
export class DiscussionService {
  constructor(
    private readonly _roomRepository: IDiscussionRoomRepository,
    private readonly _courseClient: ICourseClient,
    private readonly _redisService: ICacheService,
    private readonly _logger: ILoggerService,
  ) {}

  async canAccessDiscussion(roomId: string, userId: string): Promise<boolean> {
    const room = await this._roomRepository.findById(roomId);
    if (!room) {
      throw new DiscussionRoomNotFoundException(
        `Discussion room ${roomId} not found`,
      );
    }

    const { courseId } = room;
    const cacheKey = `discussion_auth:${courseId}:${userId}`;

    // Check Redis Cache
    const cachedAuth = await this._redisService.get<boolean>(cacheKey);
    if (cachedAuth !== null) {
      this._logger.debug(
        `Cache hit for discussion auth ${userId} in ${courseId}: ${cachedAuth}`,
      );
      return cachedAuth;
    }

    let isAuthorized = false;

    // Fallback to gRPC
    try {
      if (room.instructorId === userId) {
        isAuthorized = true;
      } else {
        const enrollment = await this._courseClient.checkCourseEnrollment(
          courseId,
          userId,
        );
        isAuthorized = enrollment.isEnrolled;
      }
    } catch (error) {
      this._logger.error(
        `Failed to verify discussion auth via gRPC for user ${userId}`,
        { error },
      );
      // Fail secure
      return false;
    }

    // Cache the result for 1 hour (3600 seconds)
    await this._redisService.set(cacheKey, isAuthorized, 3600);

    this._logger.debug(
      `Cached discussion auth for user ${userId} in course ${courseId}: ${isAuthorized}`,
    );
    return isAuthorized;
  }
}
