import { Injectable, NotFoundException } from '@nestjs/common';
import { DiscussionRoomRepository } from 'src/domain/repositories/discussion-room.repository';
import { CourseClient } from 'src/infrastructure/grpc/clients/course/course.client';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { LoggingService } from 'src/infrastructure/observability/logging/logging.service';

@Injectable()
export class DiscussionService {
  constructor(
    private readonly roomRepository: DiscussionRoomRepository,
    private readonly courseClient: CourseClient,
    private readonly redisService: RedisService,
    private readonly logger: LoggingService,
  ) {}

  async canAccessDiscussion(roomId: string, userId: string): Promise<boolean> {
    const room = await this.roomRepository.findById(roomId);
    if (!room) {
      throw new NotFoundException(`Discussion room ${roomId} not found`);
    }

    const { courseId } = room;
    const cacheKey = `discussion_auth:${courseId}:${userId}`;

    // Check Redis Cache
    const cachedAuth = await this.redisService.get<boolean>(cacheKey);
    if (cachedAuth !== null) {
      this.logger.debug(
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
        const enrollment = await this.courseClient.checkCourseEnrollment(
          courseId,
          userId,
        );
        isAuthorized = enrollment.isEnrolled;
      }
    } catch (error) {
      this.logger.error(
        `Failed to verify discussion auth via gRPC for user ${userId}`,
        { error },
      );
      // Fail secure
      return false;
    }

    // Cache the result for 1 hour (3600 seconds)
    await this.redisService.set(cacheKey, isAuthorized, 3600);

    this.logger.debug(
      `Cached discussion auth for user ${userId} in course ${courseId}: ${isAuthorized}`,
    );
    return isAuthorized;
  }
}
