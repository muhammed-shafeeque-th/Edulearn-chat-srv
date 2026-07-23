export abstract class ICourseClient {
  /**
   * Checks if a user is enrolled in a given course.
   */
  abstract checkCourseEnrollment(
    courseId: string,
    userId: string,
  ): Promise<{ isEnrolled: boolean }>;

  /**
   * fetch a course.
   */
  abstract getCourse(courseId: string): Promise<{
    id: string;
    instructorId: string;
    title: string;
    status: string;
    price: number;
  }>;
}
