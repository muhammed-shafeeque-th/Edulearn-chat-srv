import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { IChatRepository } from 'src/domain/repositories/chat.repository';
import { Chat } from 'src/domain/entities/chat.entity';
import { ChatDocument } from '../schemas/chat.schema';
import { ILoggerService } from 'src/application/ports/logger.service';

@Injectable()
export class MongoDbChatRepository implements IChatRepository {
  constructor(
    private readonly logger: ILoggerService,
    @InjectModel(ChatDocument.name)
    private readonly chatModel: Model<ChatDocument>,
  ) {}

  async findById(id: string): Promise<Chat | null> {
    if (!id) {
      this.logger.warn('findById called with empty id');
      return null;
    }

    const doc = await this.chatModel.findById(id).exec();
    if (!doc) {
      this.logger.debug(`No chat found with id: ${id}`);
    }
    return doc ? this.toDomain(doc) : null;
  }

  async findByParticipants(
    studentId: string,
    instructorId: string,
  ): Promise<Chat | null> {
    if (!studentId || !instructorId) {
      this.logger.warn(
        'findByParticipants called without studentId or instructorId',
      );
      return null;
    }

    const doc = await this.chatModel
      .findOne({ studentId, instructorId })
      .lean();
    if (!doc) {
      this.logger.debug(
        `No chat found for studentId=${studentId}, instructorId=${instructorId}`,
      );
    }
    return doc ? this.toDomain(doc) : null;
  }

  async listByStudent(
    studentId: string,
    page: number,
    limit: number,
  ): Promise<{ chats: Chat[]; total: number }> {
    if (!studentId || !page || !limit) {
      this.logger.warn('listByStudent called with invalid arguments');
      return { chats: [], total: 0 };
    }

    const query: FilterQuery<ChatDocument> = {
      isActive: true,
      studentId,
    };

    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      this.chatModel
        .find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.chatModel.countDocuments(query).exec(),
    ]);
    const chats = docs.map((doc) => this.toDomain(doc));
    this.logger.log(
      `Student ${studentId} has ${chats.length} chats (total: ${total})`,
    );
    return { chats, total };
  }

  async listByInstructor(
    instructorId: string,
    page: number,
    limit: number,
  ): Promise<{ chats: Chat[]; total: number }> {
    if (!instructorId || !page || !limit) {
      this.logger.warn('listByInstructor called with invalid arguments');
      return { chats: [], total: 0 };
    }

    const query: FilterQuery<ChatDocument> = {
      isActive: true,
      instructorId,
    };

    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      this.chatModel
        .find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.chatModel.countDocuments(query).exec(),
    ]);
    const chats = docs.map((doc) => this.toDomain(doc));
    this.logger.log(
      `Instructor ${instructorId} has ${chats.length} chats (total: ${total})`,
    );
    return { chats, total };
  }

  async save(chat: Chat): Promise<Chat> {
    const docData = this.toDocument(chat);

    // Upsert: create new or update existing chat with same _id
    const savedDoc = await this.chatModel
      .findOneAndUpdate(
        { _id: docData._id },
        { $set: docData },
        { new: true, upsert: true },
      )
      .exec();

    this.logger.log(
      `Chat with ID ${docData._id} has been saved${savedDoc?.isNew ? ' (created)' : ' (updated)'}`,
    );
    return this.toDomain(savedDoc);
  }

  async update(chat: Chat): Promise<Chat> {
    const doc = await this.chatModel
      .findByIdAndUpdate(chat.id, this.toDocument(chat), {
        new: true,
        upsert: false,
      })
      .exec();

    if (!doc) {
      this.logger.warn(`Update failed: Chat with id ${chat.id} not found.`);
      throw new Error(`Chat with id ${chat.id} not found.`);
    }
    this.logger.log(`Updated chat with ID ${chat.id}`);
    return this.toDomain(doc);
  }

  async delete(id: string): Promise<void> {
    if (!id) {
      this.logger.warn('delete called with empty id');
      return;
    }
    const result = await this.chatModel.findByIdAndDelete(id).exec();
    if (result) {
      this.logger.log(`Deleted chat with ID ${id}`);
    } else {
      this.logger.warn(`Delete called but no chat found with ID ${id}`);
    }
  }

  /**
   * Returns count of active chats.
   */
  async countActive(): Promise<number> {
    const count = await this.chatModel
      .countDocuments({ isActive: true })
      .exec();
    this.logger.log(`Active chats count: ${count}`);
    return count;
  }

  async getRecentActive(limit: number = 10): Promise<Chat[]> {
    const docs = await this.chatModel
      .find({ isActive: true })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .exec();
    this.logger.log(`Fetched ${docs.length} recent active chats`);
    return docs.map((doc) => this.toDomain(doc));
  }

  private toDomain(doc: ChatDocument): Chat {
    return Chat.fromPrimitives({
      id: doc._id,
      studentId: doc.studentId,
      instructorId: doc.instructorId,
      lastMessageId: doc.lastMessageId ?? undefined,
      lastMessageSequence: doc.lastMessageSequence ?? 0,
      isActive: doc.isActive ?? true,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toDocument(chat: Chat): Partial<ChatDocument> {
    const props = chat.toProps();
    return {
      _id: props.id,
      studentId: props.studentId,
      instructorId: props.instructorId,
      lastMessageId: props.lastMessageId ?? undefined,
      lastMessageSequence: props.lastMessageSequence ?? 0,
      isActive: props.isActive ?? true,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
