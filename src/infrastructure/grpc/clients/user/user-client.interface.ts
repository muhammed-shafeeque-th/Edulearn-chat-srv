export abstract class IUserClient {
  /**
   * Checks if a student is associated with an instructor.
   * @param studentId The ID of the student.
   * @param instructorId The ID of the instructor.
   * @returns An object indicating whether the user is a student of the instructor.
   */
  abstract isStudentOfInstructor(
    studentId: string,
    instructorId: string,
  ): Promise<{ isStudent: boolean }>;
}
