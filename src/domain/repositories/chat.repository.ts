import { Chat } from '../entities/chat.entity';

export abstract class ChatRepository {
  /**
   * Finds a chat by its ID.
   * @param id Chat ID
   * @returns Chat entity or null
   */
  abstract findById(id: string): Promise<Chat | null>;
  /**
   * Finds a chat by exact match of student and instructor.
   * @param studentId Student's user ID
   * @param instructorId Instructor's user ID
   * @returns The Chat or null
   */
  abstract findByParticipants(
    studentId: string,
    instructorId: string,
  ): Promise<Chat | null>;
  /**
   * Finds all chats for a user (paginated).
   * @param studentId Student's ID
   * @param page Page number (1-based)
   * @param limit Number per page
   */
  abstract listByStudent(
    studentId: string,
    page: number,
    limit: number,
  ): Promise<{ chats: Chat[]; total: number }>;
  /**
   * Finds all chats for an instructor (paginated).
   * @param instructorId Instructor's ID
   * @param page Page number (1-based)
   * @param limit Number per page
   */
  abstract listByInstructor(
    instructorId: string,
    page: number,
    limit: number,
  ): Promise<{ chats: Chat[]; total: number }>;
  /**
   * Creates a new chat or updates an existing one if it already exists.
   * @param chat Chat entity
   * @returns The saved Chat
   */
  abstract save(chat: Chat): Promise<Chat>;
  /**
   * Updates a chat by its entity.
   * @param chat Chat entity
   * @returns The updated Chat
   */
  abstract update(chat: Chat): Promise<Chat>;
  /**
   * Deletes a chat by ID.
   * @param id Chat ID
   */
  abstract delete(id: string): Promise<void>;
}
