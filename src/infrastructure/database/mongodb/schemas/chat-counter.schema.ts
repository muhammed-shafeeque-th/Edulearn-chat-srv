import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'chat_counters' })
export class ChatCounterDocument extends Document {
  @Prop({ required: true })
  _id: string; // chatId

  @Prop({ type: Number, default: 0 })
  seq: number;
}

export const ChatCounterSchema =
  SchemaFactory.createForClass(ChatCounterDocument);
