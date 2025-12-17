export enum MessageType {
  TEXT = 'text',
  VOICE = 'voice',
  FILE = 'file',
  IMAGE = 'image',
}

export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  SEEN = 'seen',
  DELIVERED = 'delivered',
  READ = 'read',
}

export interface MessageReaction {
  id: string;
  userId: string;
  emoji: string;
  timestamp: Date;
}

export interface MessageProps {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId?: string;
  content: string;
  type?: MessageType;
  timestamp?: Date;
  status?: MessageStatus;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  replyTo?: string;
  reactions?: MessageReaction[];
  editedAt?: Date;
  readBy?: string[];
  metadata?: Record<string, any>;
}

export class Message {
  // ----- Private Properties -----
  private readonly _id: string;
  private readonly _conversationId: string;
  private readonly _senderId: string;
  private readonly _receiverId?: string;
  private _content: string;
  private readonly _type: MessageType;
  private readonly _timestamp: Date;
  private _status: MessageStatus;
  private readonly _fileUrl?: string;
  private readonly _fileName?: string;
  private readonly _fileSize?: number;
  private readonly _replyTo?: string;
  private readonly _reactions: MessageReaction[];
  private readonly _metadata?: Record<string, any>;
  private _editedAt?: Date;
  private readonly _readBy: Set<string>;

  constructor(props: MessageProps) {
    if (!props.id?.trim()) {
      throw new Error('Message ID is required.');
    }
    if (!props.conversationId?.trim()) {
      throw new Error('Conversation ID is required.');
    }
    if (!props.senderId?.trim()) {
      throw new Error('Sender ID is required.');
    }
    if (!props.content?.trim?.() && !props.fileUrl) {
      throw new Error('Message content or fileUrl must be provided.');
    }
    if (!Object.values(MessageType).includes(props.type)) {
      throw new Error('Invalid message type.');
    }

    this._id = props.id.trim();
    this._conversationId = props.conversationId.trim();
    this._senderId = props.senderId.trim();
    this._receiverId = props.receiverId?.trim?.() || '';
    this._content = props.content ?? '';
    this._type = props.type;
    this._timestamp =
      props.timestamp instanceof Date
        ? props.timestamp
        : props.timestamp
          ? new Date(props.timestamp)
          : new Date();
    this._status = props.status ?? MessageStatus.SENT;
    this._fileUrl = props.fileUrl;
    this._fileName = props.fileName;
    this._fileSize = props.fileSize;
    this._replyTo = props.replyTo;
    this._reactions = props.reactions ? [...props.reactions] : [];
    this._editedAt = props.editedAt ? new Date(props.editedAt) : undefined;
    this._readBy = new Set(props.readBy ?? []);
    this._metadata = props.metadata ? { ...props.metadata } : undefined;
  }

  // ----- Accessor Properties -----
  get id(): string {
    return this._id;
  }
  get conversationId(): string {
    return this._conversationId;
  }
  get senderId(): string {
    return this._senderId;
  }
  get receiverId(): string {
    return this._receiverId;
  }
  get content(): string {
    return this._content;
  }
  get type(): MessageType {
    return this._type;
  }
  get timestamp(): Date {
    return this._timestamp;
  }
  get status(): MessageStatus {
    return this._status;
  }
  get fileUrl(): string | undefined {
    return this._fileUrl;
  }
  get fileName(): string | undefined {
    return this._fileName;
  }
  get fileSize(): number | undefined {
    return this._fileSize;
  }
  get replyTo(): string | undefined {
    return this._replyTo;
  }
  get reactions(): MessageReaction[] {
    return [...this._reactions];
  }
  get editedAt(): Date | undefined {
    return this._editedAt;
  }
  get readBy(): string[] {
    return Array.from(this._readBy);
  }
  get metadata(): Record<string, any> | undefined {
    return this._metadata ? { ...this._metadata } : undefined;
  }

  // ----- Public Methods -----
  isReadBy(userId: string): boolean {
    return this._readBy.has(userId);
  }

  markAsRead(userId: string): Message {
    if (this._readBy.has(userId)) return this;
    const next = new Message({
      ...this.toProps(),
      readBy: [...this._readBy, userId],
      status: MessageStatus.READ,
    });
    return next;
  }

  editContent(newContent: string): Message {
    if (newContent === this._content) return this;
    return new Message({
      ...this.toProps(),
      content: newContent,
      editedAt: new Date(),
    });
  }

  addReaction(reaction: MessageReaction): Message {
    return new Message({
      ...this.toProps(),
      reactions: [...this._reactions, reaction],
    });
  }

  /**
   * Load/rehydrate a wishlist item from persistence/primitives.
   */
  static fromPrimitives(props: MessageProps): Message {
    return new Message(props);
  }

  // For repository/transport serialization
  toProps(): MessageProps {
    return {
      id: this._id,
      conversationId: this._conversationId,
      senderId: this._senderId,
      receiverId: this._receiverId,
      content: this._content,
      type: this._type,
      timestamp: this._timestamp,
      status: this._status,
      fileUrl: this._fileUrl,
      fileName: this._fileName,
      fileSize: this._fileSize,
      replyTo: this._replyTo,
      reactions: [...this._reactions],
      editedAt: this._editedAt,
      readBy: Array.from(this._readBy),
      metadata: this._metadata ? { ...this._metadata } : undefined,
    };
  }
}
