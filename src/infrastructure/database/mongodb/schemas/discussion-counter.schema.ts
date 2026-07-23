import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'discussion_counters' })
export class DiscussionCounterDocument extends Document {
  @Prop({ required: true, unique: true })
  declare _id: string; // roomId

  @Prop({ required: true, default: 0 })
  sequence: number;
}

export const DiscussionCounterSchema = SchemaFactory.createForClass(
  DiscussionCounterDocument,
);
