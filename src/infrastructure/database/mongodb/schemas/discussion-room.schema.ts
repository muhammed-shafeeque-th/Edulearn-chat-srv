import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'discussion_rooms' })
export class DiscussionRoomDocument extends Document {
  @Prop({ required: true })
  declare _id: string;

  @Prop({ required: true, unique: true, index: true })
  courseId: string;

  @Prop({ required: true, index: true })
  instructorId: string;

  @Prop({ type: String, default: null })
  lastMessageId?: string;

  @Prop({ type: Number, default: 0 })
  lastMessageSequence: number;

  @Prop() createdAt: Date;
  @Prop() updatedAt: Date;
}

export const DiscussionRoomSchema = SchemaFactory.createForClass(
  DiscussionRoomDocument,
);

DiscussionRoomSchema.index({ courseId: 1 }, { unique: true });
