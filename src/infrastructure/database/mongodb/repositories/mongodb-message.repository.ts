import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { IMessageRepository } from 'src/domain/repositories/message.repository';
import { Message, MessageType } from 'src/domain/entities/message.entity';
import { MessageDocument } from '../schemas/message.schema';
import { ChatCounterDocument } from '../schemas/chat-counter.schema';

@Injectable()
export class MongoDbMessageRepository implements IMessageRepository {
  private readonly logger = new Logger(MongoDbMessageRepository.name);

  constructor(
    @InjectModel(MessageDocument.name)
    private readonly messageModel: Model<MessageDocument>,
    @InjectModel(ChatCounterDocument.name)
    private readonly counterModel: Model<ChatCounterDocument>,
  ) {}

  async findById(id: string): Promise<Message | null> {
    if (!id) {
      this.logger.warn('findById called with empty id');
      return null;
    }
    const doc = await this.messageModel.findById(id).exec();
    if (!doc) {
      this.logger.verbose(`No message found with id: ${id}`);
      return null;
    }
    return this.toDomain(doc);
  }

  async nextSequence(chatId: string): Promise<number> {
    const updated = await this.counterModel.findOneAndUpdate(
      { _id: chatId },
      { $inc: { seq: 1 } },
      { upsert: true, new: true },
    );
    return updated.seq;
  }

  async findByChatId(
    chatId: string,
    page: number,
    pageSize: number,
  ): Promise<{ messages: Message[]; total: number }> {
    if (!chatId || !page || !pageSize) {
      this.logger.warn('findByChatId called with invalid arguments');
      return { messages: [], total: 0 };
    }
    const skip = Math.max(page - 1, 0) * pageSize;

    const query: FilterQuery<MessageDocument> = {
      chatId,
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
    chatId: string,
    key: string,
  ): Promise<Message | null> {
    const doc = await this.messageModel
      .findOne({ chatId, idempotencyKey: key })
      .lean();
    return doc ? Message.fromPrimitives({ ...doc, id: doc._id }) : null;
  }

  async save(message: Message): Promise<Message> {
    try {
      const doc = new this.messageModel(this.toDocument(message));
      const savedDoc = await doc.save();
      this.logger.log(`Saved new message with ID ${savedDoc._id}`);
      return this.toDomain(savedDoc);
    } catch (err: any) {
      this.logger.error(
        `Failed to save message with ID ${message.id}: ${err.message}`, err, 
      );
      throw err;
    }
  }

  async update(message: Message): Promise<Message> {
    const updatedDoc = await this.messageModel
      .findByIdAndUpdate(message.id, this.toDocument(message), { new: true })
      .exec();
    if (!updatedDoc) {
      this.logger.warn(
        `Update failed: Message with id ${message.id} not found.`,
      );
      throw new Error(`Message with id ${message.id} not found.`);
    }
    this.logger.log(`Updated message with ID ${message.id}`);
    return this.toDomain(updatedDoc);
  }

  async delete(id: string): Promise<void> {
    if (!id) {
      this.logger.warn('delete called with empty id');
      return;
    }
    const result = await this.messageModel.findByIdAndDelete(id).exec();
    if (result) {
      this.logger.log(`Deleted message with ID ${id}`);
    } else {
      this.logger.warn(`Delete called but no message found with ID ${id}`);
    }
  }

  async markAsRead(chatId: string, userId: string): Promise<void> {
    // Mark all messages not sent by user and not already read by user
    await this.messageModel.updateMany(
      {
        chatId,
        senderId: { $ne: userId },
        readBy: { $ne: userId },
        deletedAt: null,
      },
      {
        $addToSet: { readBy: userId },
      },
    );
  }

  async getUnreadCount(chatId: string, userId: string): Promise<number> {
    if (!chatId || !userId) {
      this.logger.warn('getUnreadCount called with invalid arguments');
      return 0;
    }
    const unreadCount = await this.messageModel
      .countDocuments({
        chatId,
        senderId: { $ne: userId },
        readBy: { $ne: userId },
      })
      .exec();
    this.logger.log(
      `User ${userId} has ${unreadCount} unread messages in chat ${chatId}`,
    );
    return unreadCount;
  }

  /**
   * Converts a MessageDocument to a Message domain entity.
   */
  private toDomain(doc: MessageDocument): Message {
    // Adjust for your Message entity constructor signature
    return Message.fromPrimitives({
      id: doc._id,
      chatId: doc.chatId,
      senderId: doc.senderId,
      idempotencyKey: doc.idempotencyKey,
      sequence: doc.sequence,
      deletedAt: doc.deletedAt,
      metadata: doc.metadata,
      content: doc.content,
      type: doc.type as MessageType,
      reactions: doc.reactions,
      editedAt: doc.editedAt,
      readBy: doc.readBy ?? [],
    });
  }

  /**
   * Converts a Message domain entity to a partial MessageDocument for persistence.
   */
  private toDocument(message: Message): Partial<MessageDocument> {
    return {
      _id: message.id,
      chatId: message.chatId,
      senderId: message.senderId,
      content: message.content,
      type: message.type,
      sequence: message.sequence,
      idempotencyKey: message.idempotencyKey,
      reactions: message.reactions,
      readBy: message.readBy,
      editedAt: message.editedAt,
      deletedAt: message.deletedAt,
      metadata: message.metadata,
    };
  }
}
