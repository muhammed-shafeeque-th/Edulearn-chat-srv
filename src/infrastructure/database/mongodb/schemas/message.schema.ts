import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  MessageReaction,
  MessageType,
} from 'src/domain/entities/message.entity';

@Schema({ timestamps: true, collection: 'messages' })
export class MessageDocument extends Document {
  @Prop({ required: true })
  declare _id: string;

  @Prop({ required: true, index: true })
  chatId: string;

  @Prop({ required: true, index: true })
  senderId: string;

  @Prop({ required: true })
  content: string;

  @Prop({
    type: String,
    enum: Object.values(MessageType),
    default: MessageType.TEXT,
  })
  type: MessageType;

  @Prop({ required: true, index: true })
  sequence: number;

  @Prop({ required: true })
  idempotencyKey: string;

  @Prop({ type: [Object], default: [] })
  reactions: MessageReaction[];

  @Prop({ type: [String], default: [] })
  readBy: string[];

  @Prop({ type: Date })
  editedAt?: Date;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const MessageSchema = SchemaFactory.createForClass(MessageDocument);

MessageSchema.index({ chatId: 1, sequence: -1 });
MessageSchema.index({ chatId: 1, idempotencyKey: 1 }, { unique: true });
