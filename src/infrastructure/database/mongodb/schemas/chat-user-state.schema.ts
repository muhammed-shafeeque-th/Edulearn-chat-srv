import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'chat_user_state' })
export class ChatUserStateDocument extends Document {
  @Prop({ required: true, index: true })
  chatId: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ type: Boolean, default: false })
  pinned: boolean;

  @Prop({ type: Boolean, default: false })
  archived: boolean;

  @Prop({ type: Date, default: null })
  mutedUntil?: Date | null;
}

export const ChatUserStateSchema = SchemaFactory.createForClass(
  ChatUserStateDocument,
);

ChatUserStateSchema.index({ chatId: 1, userId: 1 }, { unique: true });
ChatUserStateSchema.index({ userId: 1, pinned: 1 });
