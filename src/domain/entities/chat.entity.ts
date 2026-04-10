export interface ChatProps {
  id: string;
  studentId: string;
  instructorId: string;
  lastMessageId?: string;
  lastMessageSequence?: number;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
}

export class Chat {
  private readonly _id: string;
  private readonly _studentId: string;
  private readonly _instructorId: string;

  private readonly _isActive: boolean;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  private readonly _lastMessageId?: string;
  private readonly _lastMessageSequence: number;

  constructor(props: ChatProps) {
    if (!props.id?.trim()) throw new Error('Chat ID is required.');
    if (!props.studentId?.trim()) throw new Error('Student ID is required.');
    if (!props.instructorId?.trim())
      throw new Error('Instructor ID is required.');
    if (props.studentId === props.instructorId)
      throw new Error('Student and instructor cannot be the same user.');

    this._id = props.id.trim();
    this._studentId = props.studentId.trim();
    this._instructorId = props.instructorId.trim();

    this._lastMessageId = props.lastMessageId;
    this._lastMessageSequence = props.lastMessageSequence ?? 0;

    this._isActive = props.isActive ?? true;
    this._createdAt = props.createdAt ? new Date(props.createdAt) : new Date();
    this._updatedAt = props.updatedAt ? new Date(props.updatedAt) : new Date();
  }

  get id() {
    return this._id;
  }
  get studentId() {
    return this._studentId;
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
  get isActive() {
    return this._isActive;
  }

  isParticipant(userId: string): boolean {
    return userId === this._studentId || userId === this._instructorId;
  }

  otherParticipant(userId: string): string {
    if (!this.isParticipant(userId))
      throw new Error('User is not in this chat');
    return userId === this._studentId ? this._instructorId : this._studentId;
  }

  withLastMessage(messageId: string, sequence: number): Chat {
    return new Chat({
      ...this.toProps(),
      lastMessageId: messageId,
      lastMessageSequence: sequence,
      updatedAt: new Date(),
    });
  }

  static fromPrimitives(props: ChatProps): Chat {
    return new Chat(props);
  }

  toProps(): ChatProps {
    return {
      id: this._id,
      studentId: this._studentId,
      instructorId: this._instructorId,
      lastMessageId: this._lastMessageId,
      lastMessageSequence: this._lastMessageSequence,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      isActive: this._isActive,
    };
  }
}
