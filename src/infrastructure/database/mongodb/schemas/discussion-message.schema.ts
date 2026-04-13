import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'discussion_messages' })
export class DiscussionMessageDocument extends Document {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true, index: true })
  roomId: string;

  @Prop({ required: true, index: true })
  senderId: string;

  @Prop({ required: true, enum: ['student', 'instructor'] })
  senderRole: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  sequence: number;

  @Prop({ required: true })
  idempotencyKey: string;

  @Prop({ type: Date, default: null })
  editedAt?: Date;

  @Prop({ type: Date, default: null })
  deletedAt?: Date;

  @Prop() createdAt: Date;
  @Prop() updatedAt: Date;
}

export const DiscussionMessageSchema = SchemaFactory.createForClass(
  DiscussionMessageDocument,
);

DiscussionMessageSchema.index({ roomId: 1, sequence: -1 });
DiscussionMessageSchema.index(
  { roomId: 1, idempotencyKey: 1 },
  { unique: true },
);
