export enum MessageType {
  TEXT = 'text',
  VOICE = 'voice',
  FILE = 'file',
  IMAGE = 'image',
}

export interface MessageReaction {
  id: string;
  userId: string;
  emoji: string;
  timestamp: Date;
}

export interface MessageProps {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  sequence: number; // ordering
  idempotencyKey: string; // idempotency
  type?: MessageType;
  timestamp?: Date;
  editedAt?: Date;
  deletedAt?: Date;
  readBy?: string[];
  reactions?: MessageReaction[];
  metadata?: Record<string, any>;
}

export class Message {
  private readonly _props: MessageProps;
  private readonly _readBy: Set<string>;

  constructor(props: MessageProps) {
    if (!props.id?.trim()) throw new Error('Message id required');
    if (!props.chatId?.trim()) throw new Error('chatId required');
    if (!props.senderId?.trim()) throw new Error('senderId required');
    if (!props.content?.trim()) throw new Error('content required');
    if (!props.idempotencyKey?.trim())
      throw new Error('idempotencyKey required');
    if (!Number.isInteger(props.sequence) || props.sequence <= 0)
      throw new Error('sequence must be positive integer');

    this._props = {
      id: props.id,
      chatId: props.chatId,
      senderId: props.senderId,
      content: props.content,
      sequence: props.sequence,
      idempotencyKey: props.idempotencyKey,
      type: props.type ?? MessageType.TEXT,
      timestamp: props.timestamp ? new Date(props.timestamp) : new Date(),
      reactions: props.reactions
        ? props.reactions.map((r) => ({
            ...r,
            timestamp: new Date(r.timestamp),
          }))
        : [],
      readBy: props.readBy ? [...props.readBy] : [],
      editedAt: props.editedAt ? new Date(props.editedAt) : undefined,
      deletedAt: props.deletedAt ? new Date(props.deletedAt) : undefined,
      metadata: props.metadata ? { ...props.metadata } : undefined,
    };
    this._readBy = new Set(this._props.readBy ?? []);
  }

  get id() {
    return this._props.id;
  }
  get chatId() {
    return this._props.chatId;
  }
  get senderId() {
    return this._props.senderId;
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
  get type() {
    return this._props.type!;
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
  get reactions() {
    // Always return a fresh array
    return this._props.reactions
      ? this._props.reactions.map((r) => ({ ...r }))
      : [];
  }
  get readBy() {
    return Array.from(this._readBy);
  }
  get metadata() {
    return this._props.metadata ? { ...this._props.metadata } : undefined;
  }

  isReadBy(userId: string) {
    return this._readBy.has(userId);
  }

  markAsRead(userId: string): Message {
    if (this._readBy.has(userId)) return this;
    // Use toProps to ensure serialization doesn't nest _props
    const props = this.toProps();
    return new Message({
      ...props,
      readBy: [...(props.readBy ?? []), userId],
    });
  }

  editContent(newContent: string): Message {
    if (!newContent?.trim()) throw new Error('content required');
    const props = this.toProps();
    return new Message({
      ...props,
      content: newContent,
      editedAt: new Date(),
    });
  }

  addReaction(reaction: MessageReaction): Message {
    const props = this.toProps();
    return new Message({
      ...props,
      reactions: [
        ...(props.reactions ?? []),
        { ...reaction, timestamp: new Date(reaction.timestamp) },
      ],
    });
  }

  softDelete(): Message {
    const props = this.toProps();
    return new Message({ ...props, deletedAt: new Date() });
  }

  static fromPrimitives(props: MessageProps): Message {
    return new Message({ ...props });
  }

  toProps(): MessageProps {
    return {
      id: this._props.id,
      chatId: this._props.chatId,
      senderId: this._props.senderId,
      content: this._props.content,
      sequence: this._props.sequence,
      idempotencyKey: this._props.idempotencyKey,
      type: this._props.type,
      timestamp: this._props.timestamp
        ? new Date(this._props.timestamp)
        : undefined,
      editedAt: this._props.editedAt
        ? new Date(this._props.editedAt)
        : undefined,
      deletedAt: this._props.deletedAt
        ? new Date(this._props.deletedAt)
        : undefined,
      readBy: this.readBy, // Use getter for readBy (Set to array)
      reactions: this.reactions, // Use getter for reactions (array copy)
      metadata: this.metadata ? { ...this.metadata } : undefined,
    };
  }
}
