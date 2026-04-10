import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  BadRequestException,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { LoggingService } from 'src/infrastructure/observability/logging/logging.service';
import { GRPC_COURSE_CLIENT_TOKEN } from './constants';
import {
  CourseServiceClient,
  EnrollmentServiceClient,
} from 'src/infrastructure/grpc/generated/course_service';
import { ClientServiceException } from 'src/domain/exceptions/domain.exception';
import { CheckEnrollmentResponse } from '../../generated/course/types/enrollment';
import { CourseResponse } from '../../generated/course/types/course';
import { RedisService } from 'src/infrastructure/redis/redis.service';

@Injectable()
export class CourseClient implements OnModuleDestroy, OnModuleInit {
  private enrollmentService!: EnrollmentServiceClient;
  private courseService!: CourseServiceClient;

  constructor(
    @Inject(GRPC_COURSE_CLIENT_TOKEN) private readonly client: ClientGrpc,
    private readonly logger: LoggingService,
    private readonly redisService: RedisService,
  ) {}

  onModuleInit(): void {
    this.enrollmentService =
      this.client.getService<EnrollmentServiceClient>('EnrollmentService');
    this.courseService =
      this.client.getService<CourseServiceClient>('CourseService');
    this.logger.info('Course gRPC client initialized');
  }

  onModuleDestroy(): void {
    this.logger.info('Course gRPC client destroyed');
  }

  /**
   * Checks if a user is enrolled in a given course.
   * Validates input, calls gRPC, and throws descriptive errors if invalid or any error occurs.
   */
  async checkCourseEnrollment(
    courseId: string,
    userId: string,
  ): Promise<{ isEnrolled: boolean }> {
    // Input validation
    if (typeof courseId !== 'string' || !courseId.trim()) {
      this.logger.warn('Invalid courseId provided to checkCourseEnrollment', {
        courseId,
      });
      throw new BadRequestException('Invalid or missing courseId');
    }
    if (typeof userId !== 'string' || !userId.trim()) {
      this.logger.warn('Invalid userId provided to checkCourseEnrollment', {
        userId,
      });
      throw new BadRequestException('Invalid or missing userId');
    }

    try {
      // Use observable and handle error, do not perform unnecessary manual promise/conversion
      const response: CheckEnrollmentResponse = await new Promise(
        (resolve, reject) => {
          const observable = this.enrollmentService.checkCourseEnrollment({
            courseId,
            userId,
          });
          const subscription = observable.subscribe({
            next: (res: CheckEnrollmentResponse) => {
              // Handle application-level errors sent inside response
              if (res.error) {
                this.logger.warn(
                  'Received error from enrollmentService.checkCourseEnrollment',
                  { error: res.error },
                );
                return reject(
                  new ClientServiceException(
                    res.error.message || 'Unknown error from course service',
                  ),
                );
              }
              this.logger.debug(
                `Checked enrollment for userId=${userId} in courseId=${courseId}:`,
              );
              resolve(res);
            },
            error: (error: any) => {
              this.logger.error(
                `Failed to check course enrollment for userId=${userId}, courseId=${courseId}: ${error?.message ?? error}`,
                { error },
              );
              reject(
                new ClientServiceException(
                  error?.details ||
                    error?.message ||
                    'Error while checking course enrollment',
                ),
              );
            },
            complete: () => {
              subscription.unsubscribe();
            },
          });
        },
      );

      // Defensive: Ensure the response shape is as expected
      const { enrolled } = response;

      return {
        isEnrolled: enrolled,
      };
    } catch (err: any) {
      this.logger.error('Error in checkCourseEnrollment', {
        error: err,
        userId,
      });
      throw err;
    }
  }
  /**
   * fetch a course.
   */
  async getCourse(courseId: string): Promise<{
    id: string;
    instructorId: string;
    title: string;
    status: string;
    price: number;
  }> {
    const CACHE_TTL = 10 * 60;
    const cacheKey = `course_info:${courseId}`;

    const cacheResult = await this.redisService.get(cacheKey);
    if (cacheResult) {
      return {
        id: cacheResult.id,
        instructorId: cacheResult.instructorId,
        price: cacheResult.price,
        status: cacheResult.status,
        title: cacheResult.title,
      };
    }
    // Input validation
    if (typeof courseId !== 'string' || !courseId.trim()) {
      this.logger.warn('Invalid courseId provided to checkCourseEnrollment', {
        courseId,
      });
      throw new BadRequestException('Invalid or missing courseId');
    }

    try {
      // Use observable and handle error, do not perform unnecessary manual promise/conversion
      const response: CourseResponse['course'] = await new Promise(
        (resolve, reject) => {
          const observable = this.courseService.getCourse({
            courseId,
          });
          const subscription = observable.subscribe({
            next: (res: CourseResponse) => {
              // Handle application-level errors sent inside response
              if (res.error) {
                this.logger.warn('Received error from course.getCourse', {
                  error: res.error,
                });
                return reject(
                  new ClientServiceException(
                    res.error.message || 'Unknown error from course service',
                  ),
                );
              }
              this.logger.debug(`Fetched course for  courseId=${courseId}:`);
              resolve(res.course);
            },
            error: (error: any) => {
              this.logger.error(
                `Failed to fetch course  for courseId=${courseId}: ${error?.message ?? error}`,
                { error },
              );
              reject(
                new ClientServiceException(
                  error?.details ||
                    error?.message ||
                    'Error while fetching course ',
                ),
              );
            },
            complete: () => {
              subscription.unsubscribe();
            },
          });
        },
      );

      // Defensive: Ensure the response shape is as expected
      const { id, instructorId, title, status, price } = response;

      const courseInfo = {
        id,
        instructorId,
        title,
        status,
        price,
      };
      await this.redisService.set(cacheKey, courseInfo, CACHE_TTL);

      return courseInfo;
    } catch (err: any) {
      this.logger.error('Error in getCourse', {
        error: err,
        courseId,
      });
      throw err;
    }
  }
}
