import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ConversationType } from '../../../../domain/entities/conversation.entity';

/**
 * ConversationDocument - MongoDB/Mongoose schema for Conversation aggregate.
 * Reflects the Conversation entity in the domain model including group,
 * direct, and per-user status features.
 */
@Schema({ timestamps: true, collection: 'conversations' })
export class ConversationDocument extends Document {
  // Primary key - align with id in aggregate
  @Prop({ required: true })
  _id: string;

  // Type: 'DIRECT', 'GROUP', etc.
  @Prop({
    type: String,
    enum: Object.values(ConversationType),
    required: true,
    index: true,
  })
  type: ConversationType;

  // All participant user IDs - required for direct, group
  @Prop({ type: [String], required: true, index: true })
  participantIds: string[];

  // Last (most recent) message ID
  @Prop({ type: String, default: null })
  lastMessageId?: string;

  // Default to active conversation
  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  // Group-specific: Optional name, description, avatar (for groups/channels)
  @Prop({ type: String, default: null })
  name?: string;

  @Prop({ type: String, default: null })
  description?: string;

  @Prop({ type: String, default: null })
  avatar?: string;

  // Group-specific: Admin user IDs for group controls
  @Prop({ type: [String], default: [] })
  adminIds: string[];

  @Prop({ type: [String], default: [] })
  archivedBy: string[]; // userIds who have archived

  // // Global muted-until timestamp (DEPRECATED for per-user status, but persisted for backward compatibility)
  // @Prop({ type: Date, default: null })
  // mutedUntil?: Date | null;

  // Per-user status fields for pin/mute
  @Prop({ type: [String], default: [] })
  pinnedBy: string[]; // userIds who have pinned

  @Prop({ type: [String], default: [] })
  mutedBy: string[]; // userIds who have muted

  @Prop({
    type: Map,
    of: Date,
    default: {},
  })
  userMutedUntil: Record<string, Date>; // userId -> mutedUntil

  // Timestamps (via @Schema timestamps)
  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const ConversationSchema =
  SchemaFactory.createForClass(ConversationDocument);

// Indexes for frequently queried fields and efficient filtering
ConversationSchema.index({ participantIds: 1 });
ConversationSchema.index({ type: 1, updatedAt: -1 });
ConversationSchema.index({ participantIds: 1, updatedAt: -1 });
ConversationSchema.index({ adminIds: 1 });
ConversationSchema.index({ pinnedBy: 1 });
ConversationSchema.index({ mutedBy: 1 });
