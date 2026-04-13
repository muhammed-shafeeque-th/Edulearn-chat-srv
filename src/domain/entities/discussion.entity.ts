export interface DiscussionRoomProps {
  id: string;
  courseId: string;
  instructorId: string;
  lastMessageId?: string;
  lastMessageSequence?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class DiscussionRoom {
  private readonly _id: string;
  private readonly _courseId: string;
  private readonly _instructorId: string;

  private readonly _lastMessageId?: string;
  private readonly _lastMessageSequence: number;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(props: DiscussionRoomProps) {
    if (!props.id?.trim()) throw new Error('Discussion room ID is required.');
    if (!props.courseId?.trim()) throw new Error('Course ID is required.');
    if (!props.instructorId?.trim())
      throw new Error('Instructor ID is required.');

    this._id = props.id.trim();
    this._courseId = props.courseId.trim();
    this._instructorId = props.instructorId.trim();
    this._lastMessageId = props.lastMessageId;
    this._lastMessageSequence = props.lastMessageSequence ?? 0;
    this._createdAt = props.createdAt ? new Date(props.createdAt) : new Date();
    this._updatedAt = props.updatedAt ? new Date(props.updatedAt) : new Date();
  }

  get id() {
    return this._id;
  }
  get courseId() {
    return this._courseId;
  }
  get instructorId() {
    return this._instructorId;
  }
  get lastMessageId() {
    return this._lastMessageId;
  }
  get lastMessageSequence() {
    return this._lastMessageSequence;
  }
  get createdAt() {
    return this._createdAt;
  }
  get updatedAt() {
    return this._updatedAt;
  }

  withLastMessage(messageId: string, sequence: number): DiscussionRoom {
    return new DiscussionRoom({
      ...this.toProps(),
      lastMessageId: messageId,
      lastMessageSequence: sequence,
      updatedAt: new Date(),
    });
  }

  static fromPrimitives(props: DiscussionRoomProps): DiscussionRoom {
    return new DiscussionRoom(props);
  }

  toProps(): DiscussionRoomProps {
    return {
      id: this._id,
      courseId: this._courseId,
      instructorId: this._instructorId,
      lastMessageId: this._lastMessageId,
      lastMessageSequence: this._lastMessageSequence,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}

// ─── DiscussionMessage ────────────────────────────────────────

export type SenderRole = 'student' | 'instructor';

export interface DiscussionMessageProps {
  id: string;
  roomId: string;
  senderId: string;
  senderRole: SenderRole;
  content: string;
  sequence: number;
  idempotencyKey: string;
  timestamp?: Date;
  editedAt?: Date;
  deletedAt?: Date;
}

export class DiscussionMessage {
  private readonly _props: DiscussionMessageProps;

  constructor(props: DiscussionMessageProps) {
    if (!props.id?.trim()) throw new Error('Message id required');
    if (!props.roomId?.trim()) throw new Error('roomId required');
    if (!props.senderId?.trim()) throw new Error('senderId required');
    if (!props.senderRole) throw new Error('senderRole required');
    if (!props.content?.trim()) throw new Error('content required');
    if (!props.idempotencyKey?.trim())
      throw new Error('idempotencyKey required');
    if (!Number.isInteger(props.sequence) || props.sequence <= 0)
      throw new Error('sequence must be positive integer');

    this._props = {
      id: props.id,
      roomId: props.roomId,
      senderId: props.senderId,
      senderRole: props.senderRole,
      content: props.content,
      sequence: props.sequence,
      idempotencyKey: props.idempotencyKey,
      timestamp: props.timestamp ? new Date(props.timestamp) : new Date(),
      editedAt: props.editedAt ? new Date(props.editedAt) : undefined,
      deletedAt: props.deletedAt ? new Date(props.deletedAt) : undefined,
    };
  }

  get id() {
    return this._props.id;
  }
  get roomId() {
    return this._props.roomId;
  }
  get senderId() {
    return this._props.senderId;
  }
  get senderRole() {
    return this._props.senderRole;
  }
  get content() {
    return this._props.content;
  }
  get sequence() {
    return this._props.sequence;
  }
  get idempotencyKey() {
    return this._props.idempotencyKey;
  }
  get timestamp() {
    return this._props.timestamp!;
  }
  get editedAt() {
    return this._props.editedAt;
  }
  get deletedAt() {
    return this._props.deletedAt;
  }

  editContent(newContent: string): DiscussionMessage {
    if (!newContent?.trim()) throw new Error('content required');
    return new DiscussionMessage({
      ...this.toProps(),
      content: newContent,
      editedAt: new Date(),
    });
  }

  softDelete(): DiscussionMessage {
    return new DiscussionMessage({ ...this.toProps(), deletedAt: new Date() });
  }

  static fromPrimitives(props: DiscussionMessageProps): DiscussionMessage {
    return new DiscussionMessage({ ...props });
  }

  toProps(): DiscussionMessageProps {
    return {
      id: this._props.id,
      roomId: this._props.roomId,
      senderId: this._props.senderId,
      senderRole: this._props.senderRole,
      content: this._props.content,
      sequence: this._props.sequence,
      idempotencyKey: this._props.idempotencyKey,
      timestamp: this._props.timestamp
        ? new Date(this._props.timestamp)
        : undefined,
      editedAt: this._props.editedAt
        ? new Date(this._props.editedAt)
        : undefined,
      deletedAt: this._props.deletedAt
        ? new Date(this._props.deletedAt)
        : undefined,
    };
  }
}
