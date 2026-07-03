import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatUserState } from 'src/domain/entities/chat-user-state.entity';
import { IChatUserStateRepository } from 'src/domain/repositories/chat-user.repository';
import { ChatUserStateDocument } from '../schemas/chat-user-state.schema';

@Injectable()
export class MongoDbChatUserStateRepository
  implements IChatUserStateRepository
{
  constructor(
    @InjectModel(ChatUserStateDocument.name)
    private readonly stateModel: Model<ChatUserStateDocument>,
  ) {}

  async getOrCreate(chatId: string, userId: string): Promise<ChatUserState> {
    const doc = await this.stateModel.findOneAndUpdate(
      { chatId, userId },
      { $setOnInsert: { pinned: false, archived: false, mutedUntil: null } },
      { upsert: true, new: true },
    );

    return ChatUserState.fromPrimitives({
      chatId: doc.chatId,
      userId: doc.userId,
      pinned: doc.pinned,
      archived: doc.archived,
      mutedUntil: doc.mutedUntil ?? null,
      //   createdAt: doc.createdAt,
      //   updatedAt: doc.updatedAt,
    });
  }

  async save(state: ChatUserState): Promise<void> {
    const props = state.toProps();
    await this.stateModel.updateOne(
      { chatId: props.chatId, userId: props.userId },
      {
        $set: {
          pinned: !!props.pinned,
          archived: !!props.archived,
          mutedUntil: props.mutedUntil ?? null,
        },
      },
      { upsert: true },
    );
  }

  async findManyByUser(userId: string, chatIds: string[]) {
    if (!chatIds.length) return new Map<string, ChatUserState>();

    const docs = await this.stateModel
      .find({ userId, chatId: { $in: chatIds } })
      .lean();

    const map = new Map<string, ChatUserState>();
    for (const doc of docs) {
      map.set(
        doc.chatId,
        ChatUserState.fromPrimitives({
          chatId: doc.chatId,
          userId: doc.userId,
          pinned: doc.pinned,
          archived: doc.archived,
          mutedUntil: doc.mutedUntil ?? null,
          // createdAt: doc.createdAt,
          // updatedAt: doc.updatedAt,
        }),
      );
    }

    return map;
  }
}
