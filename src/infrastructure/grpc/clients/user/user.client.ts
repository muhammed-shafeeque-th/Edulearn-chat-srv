import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { LoggingService } from 'src/infrastructure/observability/logging/logging.service';
import { GRPC_USER_CLIENT_TOKEN } from './constants';
import { UserServiceClient } from '../../generated/user_service';
import { ClientServiceException } from 'src/domain/exceptions/domain.exception';
import { IsStudentOfInstructorResponse } from '../../generated/user/types/instructor_student';

@Injectable()
export class UserClient implements OnModuleDestroy, OnModuleInit {
  private userService!: UserServiceClient;

  constructor(
    @Inject(GRPC_USER_CLIENT_TOKEN) private readonly client: ClientGrpc,
    private readonly logger: LoggingService,
  ) {}

  onModuleInit(): void {
    this.userService = this.client.getService<UserServiceClient>('UserService');
    this.logger.info('User gRPC client initialized');
  }

  onModuleDestroy(): void {
    this.logger.info('User gRPC client destroyed');
  }

  /**
   * Checks if a student is associated with an instructor.
   * @param studentId The ID of the student.
   * @param instructorId The ID of the instructor.
   * @returns An object indicating whether the user is a student of the instructor.
   */
  async isStudentOfInstructor(
    studentId: string,
    instructorId: string,
  ): Promise<{ isStudent: boolean }> {
    try {
      const response: IsStudentOfInstructorResponse = await new Promise(
        (resolve, reject) => {
          this.userService
            .isStudentOfInstructor({ instructorId, studentId })
            .subscribe({
              next: (res: IsStudentOfInstructorResponse) => resolve(res),
              error: (error: any) => reject(error),
            });
        },
      );

      if (response.error) {
        this.logger.error(
          `User service error in isStudentOfInstructor: ${response.error.message}`,
          { error: response.error },
        );
        throw new ClientServiceException(response.error.message);
      }

      this.logger.debug(
        `Checked student (${studentId}) vs instructor (${instructorId}) via gRPC: isStudent=${response.success.isStudent}`,
      );

      return { isStudent: response.success.isStudent };
    } catch (error) {
      this.logger.error(
        `Failed to check isStudentOfInstructor: ${(error as Error).message}`,
        { error },
      );
      throw error;
    }
  }
}
