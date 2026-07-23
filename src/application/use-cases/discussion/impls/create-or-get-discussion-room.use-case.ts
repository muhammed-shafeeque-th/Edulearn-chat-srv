import { Injectable } from '@nestjs/common';
import { v4 as uuidV4 } from 'uuid';

import { IDiscussionRoomRepository } from 'src/domain/repositories/discussion-room.repository';
import { DiscussionRoom } from 'src/domain/entities/discussion.entity';
import { DiscussionRoomDto } from '../../../dtos/discussion-room.dto';
import { ILoggerService } from 'src/application/ports/logger.service';
import { CreateDiscussionRoomRequest } from 'src/infrastructure/grpc/generated/chat_service';
import { DiscussionService } from 'src/application/services/discussion.service';
import { BadRequestException } from 'src/shared/exceptions/infra.exceptions';
import { NotAuthorizedException } from 'src/shared/exceptions/infra.exceptions';
import { ICreateOrGetDiscussionRoomUseCase } from '../interfaces/create-or-get-discussion-room.interface';
import { ICourseClient } from 'src/infrastructure/grpc/clients/course/course-client.interface';

@Injectable()
export class CreateOrGetDiscussionRoomUseCase implements ICreateOrGetDiscussionRoomUseCase {
  constructor(
    private readonly _logger: ILoggerService,
    private readonly _roomRepository: IDiscussionRoomRepository,
    private readonly _courseClient: ICourseClient,

    private readonly _discussionService: DiscussionService,
  ) {}

  async execute(
    command: CreateDiscussionRoomRequest,
  ): Promise<DiscussionRoomDto> {
    const { courseId, userId, userRole } = command;

    console.log('Discussion get Command: ' + JSON.stringify(command, null, 2));
    const role = userRole as 'student' | 'instructor';

    if (!courseId?.trim() || (!userId?.trim() && !role?.trim())) {
      throw new BadRequestException('courseId, userId and role are required');
    }

    // Idempotent =return existing room if found
    const existingRoom = await this._roomRepository.findByCourseId(courseId);
    if (existingRoom) {
      this._logger.debug(
        `Returning existingRoom discussion room for course ${courseId}`,
      );
      if (
        !this._discussionService.canAccessDiscussion(existingRoom.id, userId)
      ) {
        throw new NotAuthorizedException(
          "You don't have access to the discussion",
        );
      }

      return DiscussionRoomDto.fromDomain(existingRoom);
    }

    const course = await this._courseClient.getCourse(courseId);
    if (!course) {
      throw new NotAuthorizedException('Course not found');
    }
    if (course.instructorId !== userId) {
      const isEnrolled = await this._courseClient.checkCourseEnrollment(
        courseId,
        userId,
      );
      if (!isEnrolled) {
        throw new NotAuthorizedException('You are not enrolled in this course');
      }
    }
    // else {
    //   const course = await this._courseClient.getCourse(courseId);
    //   // validate course instructor ownership
    //   if (!course || course.instructorId !== userId) {
    //     throw new UnauthorizedException(
    //       'You are not authorized to create a discussion for this course',
    //     );
    //   }
    //   roomInstructorId = course.instructorId;
    // }

    const room = new DiscussionRoom({
      id: uuidV4(),
      courseId,
      instructorId: course.instructorId,
    });

    const saved = await this._roomRepository.save(room);
    this._logger.log(
      `Created discussion room ${saved.id} for course ${courseId}`,
    );
    return DiscussionRoomDto.fromDomain(saved);
  }
}
