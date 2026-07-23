import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { IDiscussionRoomRepository } from 'src/domain/repositories/discussion-room.repository';
import { DiscussionRoom } from 'src/domain/entities/discussion.entity';
import { DiscussionRoomDocument } from '../schemas/discussion-room.schema';
import { ILoggerService } from 'src/application/ports/logger.service';

@Injectable()
export class MongoDbDiscussionRoomRepository
  implements IDiscussionRoomRepository
{
  constructor(
    private readonly logger: ILoggerService,
    @InjectModel(DiscussionRoomDocument.name)
    private readonly roomModel: Model<DiscussionRoomDocument>,
  ) {}

  async findById(id: string): Promise<DiscussionRoom | null> {
    if (!id) return null;
    const doc = await this.roomModel.findById(id).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findByCourseId(courseId: string): Promise<DiscussionRoom | null> {
    if (!courseId) return null;
    const doc = await this.roomModel.findOne({ courseId }).lean();
    return doc ? this.toDomain(doc) : null;
  }

  async save(room: DiscussionRoom): Promise<DiscussionRoom> {
    const docData = this.toDocument(room);
    const savedDoc = await this.roomModel
      .findOneAndUpdate(
        { _id: docData._id },
        { $set: docData },
        { new: true, upsert: true },
      )
      .exec();

    this.logger.log(`Discussion room saved: ${docData._id}`);
    return this.toDomain(savedDoc);
  }

  async update(room: DiscussionRoom): Promise<DiscussionRoom> {
    const doc = await this.roomModel
      .findByIdAndUpdate(room.id, this.toDocument(room), {
        new: true,
        upsert: false,
      })
      .exec();

    if (!doc) {
      throw new Error(`Discussion room with id ${room.id} not found.`);
    }
    return this.toDomain(doc);
  }

  private toDomain(doc: DiscussionRoomDocument): DiscussionRoom {
    return DiscussionRoom.fromPrimitives({
      id: doc._id,
      courseId: doc.courseId,
      instructorId: doc.instructorId,
      lastMessageId: doc.lastMessageId ?? undefined,
      lastMessageSequence: doc.lastMessageSequence ?? 0,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toDocument(room: DiscussionRoom): Partial<DiscussionRoomDocument> {
    const props = room.toProps();
    return {
      _id: props.id,
      courseId: props.courseId,
      instructorId: props.instructorId,
      lastMessageId: props.lastMessageId ?? undefined,
      lastMessageSequence: props.lastMessageSequence ?? 0,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
