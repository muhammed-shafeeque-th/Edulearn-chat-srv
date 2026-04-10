import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  MessageType,
  MessageStatus,
} from '../../../../domain/entities/message.entity';

// You may want to define this interface or import it if defined elsewhere
export interface MessageReaction {
  id: string;
  emoji: string;
  userId: string;
  timestamp: Date;
}

@Schema({ timestamps: true })
export class MessageDocument extends Document {
  @Prop({ required: true })
  _id: string;

  @Prop({ type: String, required: true, index: true })
  conversationId: string;

  @Prop({ type: String, required: true, index: true })
  senderId: string;

  @Prop({ type: String, required: false })
  receiverId?: string; // Optional for group chat consistency

  @Prop({ type: String, required: true })
  content: string;

  @Prop({
    type: String,
    enum: Object.values(MessageType),
    default: MessageType.TEXT,
    required: true,
  })
  type: MessageType;

  @Prop({ type: Date, default: Date.now, index: true })
  timestamp: Date;

  @Prop({
    type: String,
    enum: Object.values(MessageStatus),
    default: MessageStatus.SENT,
    required: true,
  })
  status: MessageStatus;

  @Prop({ type: String })
  fileUrl?: string;

  @Prop({ type: String })
  fileName?: string;

  @Prop({ type: Number })
  fileSize?: number;

  @Prop({ type: String })
  replyTo?: string;

  @Prop({ type: [Object], default: [] })
  reactions?: MessageReaction[];

  @Prop({ type: Date })
  editedAt?: Date;

  @Prop({ type: [String], default: [] })
  readBy: string[];

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ type: Date })
  deletedAt?: Date;
}

export const MessageSchema = SchemaFactory.createForClass(MessageDocument);

// Add indexes for better query performance
MessageSchema.index({ conversationId: 1, timestamp: -1 });
MessageSchema.index({ senderId: 1 });
MessageSchema.index({ readBy: 1 });
