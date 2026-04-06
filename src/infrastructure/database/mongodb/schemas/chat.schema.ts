import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'chats' })
export class ChatDocument extends Document {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true, index: true })
  studentId: string;

  @Prop({ required: true, index: true })
  instructorId: string;

  @Prop({ type: String, default: null })
  lastMessageId?: string;

  @Prop({ type: Number, default: 0 })
  lastMessageSequence: number;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop() createdAt: Date;
  @Prop() updatedAt: Date;
}

export const ChatSchema = SchemaFactory.createForClass(ChatDocument);

ChatSchema.index({ studentId: 1, instructorId: 1 }, { unique: true });
ChatSchema.index({ studentId: 1, updatedAt: -1 });
ChatSchema.index({ instructorId: 1, updatedAt: -1 });
