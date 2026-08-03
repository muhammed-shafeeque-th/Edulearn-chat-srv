import { IsUUID, IsIn } from 'class-validator';

export default class CreateChatDto {
  @IsUUID(undefined, { message: '`studentId` must be type UUID' })
  studentId: string;

  @IsUUID(undefined, { message: '`instructorId` must be type UUID' })
  instructorId: string;

  @IsIn(['student', 'instructor'], {
    message: '`role` must be student or instructor',
  })
  role: 'student' | 'instructor';
}
