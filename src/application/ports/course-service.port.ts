export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'DROPPED';
export interface EnrollmentInfo {
  enrollmentId: string;
  userId: string;
  status: EnrollmentStatus;
  instructorId: string;
  enrolledAt: string;
}

export interface CourseServicePort {
  getEnrollment(
    enrollmentId: string,
    requesterId: string,
  ): Promise<EnrollmentInfo>;
}
