import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { IDiscussionMessageRepository } from 'src/domain/repositories/discussion-message.repository';
import { DiscussionMessage } from 'src/domain/entities/discussion.entity';
import { DiscussionMessageDocument } from '../schemas/discussion-message.schema';
import { DiscussionCounterDocument } from '../schemas/discussion-counter.schema';

@Injectable()
export class MongoDbDiscussionMessageRepository implements IDiscussionMessageRepository {
  private readonly logger = new Logger(MongoDbDiscussionMessageRepository.name);

  constructor(
    @InjectModel(DiscussionMessageDocument.name)
    private readonly messageModel: Model<DiscussionMessageDocument>,
    @InjectModel(DiscussionCounterDocument.name)
    private readonly counterModel: Model<DiscussionCounterDocument>,
  ) {}

  async findById(id: string): Promise<DiscussionMessage | null> {
    if (!id) return null;
    const doc = await this.messageModel.findById(id).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async nextSequence(roomId: string): Promise<number> {
    const updated = await this.counterModel.findOneAndUpdate(
      { _id: roomId },
      { $inc: { sequence: 1 } },
      { upsert: true, new: true },
    );
    return updated.sequence;
  }

  async findByRoomId(
    roomId: string,
    page: number,
    pageSize: number,
  ): Promise<{ messages: DiscussionMessage[]; total: number }> {
    if (!roomId || !page || !pageSize) {
      return { messages: [], total: 0 };
    }

    const skip = Math.max(page - 1, 0) * pageSize;

    const query: FilterQuery<DiscussionMessageDocument> = {
      roomId,
      deletedAt: null,
    };

    const [docs, total] = await Promise.all([
      this.messageModel
        .find(query)
        .sort({ sequence: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      this.messageModel.countDocuments(query),
    ]);

    return {
      messages: docs.map((d) => this.toDomain(d)),
      total,
    };
  }

  async findByIdempotencyKey(
    roomId: string,
    key: string,
  ): Promise<DiscussionMessage | null> {
    const doc = await this.messageModel
      .findOne({ roomId, idempotencyKey: key })
      .lean();
    return doc
      ? DiscussionMessage.fromPrimitives({
          ...doc,
          senderRole: doc.senderRole as 'student' | 'instructor',
          id: doc._id,
        })
      : null;
  }

  async save(message: DiscussionMessage): Promise<DiscussionMessage> {
    const doc = new this.messageModel(this.toDocument(message));
    const savedDoc = await doc.save();
    this.logger.log(`Saved discussion message ${savedDoc._id}`);
    return this.toDomain(savedDoc);
  }

  async update(message: DiscussionMessage): Promise<DiscussionMessage> {
    const updatedDoc = await this.messageModel
      .findByIdAndUpdate(message.id, this.toDocument(message), { new: true })
      .exec();
    if (!updatedDoc) {
      throw new Error(`Discussion message with id ${message.id} not found.`);
    }
    return this.toDomain(updatedDoc);
  }

  async delete(id: string): Promise<void> {
    if (!id) return;
    await this.messageModel.findByIdAndDelete(id).exec();
  }

  private toDomain(doc: DiscussionMessageDocument): DiscussionMessage {
    return DiscussionMessage.fromPrimitives({
      id: doc._id,
      roomId: doc.roomId,
      senderId: doc.senderId,
      senderRole: doc.senderRole as 'student' | 'instructor',
      content: doc.content,
      sequence: doc.sequence,
      idempotencyKey: doc.idempotencyKey,
      timestamp: doc.createdAt,
      editedAt: doc.editedAt,
      deletedAt: doc.deletedAt,
    });
  }

  private toDocument(
    message: DiscussionMessage,
  ): Partial<DiscussionMessageDocument> {
    return {
      _id: message.id,
      roomId: message.roomId,
      senderId: message.senderId,
      senderRole: message.senderRole,
      content: message.content,
      sequence: message.sequence,
      idempotencyKey: message.idempotencyKey,
      editedAt: message.editedAt,
      deletedAt: message.deletedAt,
    };
  }
}
