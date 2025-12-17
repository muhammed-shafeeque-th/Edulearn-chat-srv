export enum ConversationType {
  DIRECT = 'direct',
  GROUP = 'group',
}

// Updated props to allow tracking who pinned/muted (per-user status)
export interface ConversationProps {
  id: string;
  type: ConversationType;
  participantIds: string[];
  createdAt?: Date;
  updatedAt?: Date;
  lastMessageId?: string;
  isActive?: boolean;
  // Group-specific fields
  name?: string;
  description?: string;
  avatar?: string;
  adminIds?: string[];
  // Status/Settings (global -- deprecated for pin/mute support)
  archivedBy?: string[];
  pinnedBy?: string[]; // userIds who pinned
  mutedBy?: string[]; // userIds who muted
  userMutedUntil?: Record<string, Date>; // userId -> mutedUntil
}

export class Conversation {
  // --- Properties ---
  private readonly _id: string;
  private readonly _type: ConversationType;
  private readonly _participantIds: string[];
  private _createdAt: Date;
  private _updatedAt: Date;
  private _lastMessageId?: string;
  private _isActive: boolean;
  // Group-specific
  private readonly _name?: string;
  private readonly _description?: string;
  private readonly _avatar?: string;
  private readonly _adminIds: Set<string>;
  private _archivedBy: Set<string>;
  // New: Per-user status
  private _pinnedBy: Set<string>;
  private _mutedBy: Set<string>;
  private _userMutedUntil: Map<string, Date | undefined>;

  // --- Constructor ---
  constructor(props: ConversationProps) {
    if (!props.id?.trim()) throw new Error('Conversation ID is required.');
    if (!Object.values(ConversationType).includes(props.type))
      throw new Error('Invalid conversation type.');
    if (!props.participantIds || props.participantIds.length === 0)
      throw new Error('Conversation participants required.');

    this._id = props.id.trim();
    this._type = props.type;
    this._participantIds = [...props.participantIds];
    this._createdAt = props.createdAt ? new Date(props.createdAt) : new Date();
    this._updatedAt = props.updatedAt ? new Date(props.updatedAt) : new Date();
    this._lastMessageId = props.lastMessageId;
    this._isActive = props.isActive !== undefined ? props.isActive : true;
    // Group fields
    this._name = props.name?.trim();
    this._description = props.description?.trim();
    this._avatar = props.avatar;
    this._adminIds = new Set(props.adminIds ?? []);
    // Settings/Status (global, backward compat)
    this._archivedBy = new Set(props.archivedBy ?? []);
    // New: Per-user pin/mute tracking
    this._pinnedBy = new Set(props.pinnedBy ?? []);
    this._mutedBy = new Set(props.mutedBy ?? []);
    // User-specific mute until
    this._userMutedUntil = new Map<string, Date | undefined>();
    if (props.userMutedUntil) {
      for (const userId of Object.keys(props.userMutedUntil)) {
        const until = props.userMutedUntil[userId];
        this._userMutedUntil.set(userId, until ? new Date(until) : undefined);
      }
    }
  }

  // --- Getters ---
  get id(): string {
    return this._id;
  }
  get type(): ConversationType {
    return this._type;
  }
  get participantIds(): string[] {
    return [...this._participantIds];
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
  get lastMessageId(): string | undefined {
    return this._lastMessageId;
  }
  get isActive(): boolean {
    return this._isActive;
  }
  get name(): string | undefined {
    return this._name;
  }
  get description(): string | undefined {
    return this._description;
  }
  get avatar(): string | undefined {
    return this._avatar;
  }
  get adminIds(): string[] {
    return Array.from(this._adminIds);
  }
  get archivedBy(): Set<string> {
    return this._archivedBy;
  }

  // New: Per-user status getters
  get pinnedBy(): string[] {
    return Array.from(this._pinnedBy);
  }
  get mutedBy(): string[] {
    return Array.from(this._mutedBy);
  }
  get userMutedUntil(): Record<string, Date | undefined> {
    // For serialization
    const result: Record<string, Date | undefined> = {};
    for (const [userId, until] of this._userMutedUntil.entries()) {
      result[userId] = until;
    }
    return result;
  }

  // Utility for checking per-user state
  isPinnedBy(userId: string): boolean {
    return this._pinnedBy.has(userId);
  }
  isMutedBy(userId: string): boolean {
    return this._mutedBy.has(userId);
  }
  isArchivedBy(userId: string): boolean {
    return this._archivedBy.has(userId);
  }
  muteUntilForUser(userId: string): Date | undefined {
    return this._userMutedUntil.get(userId);
  }

  // --- Core Methods ---

  hasParticipant(userId: string): boolean {
    return this._participantIds.includes(userId);
  }

  isAdmin(userId: string): boolean {
    return this._adminIds.has(userId);
  }

  isGroup(): boolean {
    return this._type === ConversationType.GROUP;
  }

  isDirect(): boolean {
    return this._type === ConversationType.DIRECT;
  }

  getOtherParticipant(userId: string): string | null {
    if (this.isGroup()) return null;
    const others = this._participantIds.filter((id) => id !== userId);
    return others.length > 0 ? others[0] : null;
  }

  withLastMessage(messageId: string): Conversation {
    return new Conversation({
      ...this.toProps(),
      lastMessageId: messageId,
      updatedAt: new Date(),
    });
  }

  withParticipantAdded(userId: string): Conversation {
    if (this.hasParticipant(userId)) return this;
    return new Conversation({
      ...this.toProps(),
      participantIds: [...this._participantIds, userId],
      updatedAt: new Date(),
    });
  }

  withParticipantRemoved(userId: string): Conversation {
    if (!this.hasParticipant(userId)) return this;
    const isAdmin = this._adminIds.has(userId);
    const newParticipants = this._participantIds.filter((id) => id !== userId);
    const newAdmins = isAdmin
      ? Array.from(this._adminIds).filter((id) => id !== userId)
      : Array.from(this._adminIds);

    // Remove user pin/mute if they're leaving
    const newPinnedBy = Array.from(this._pinnedBy).filter(
      (id) => id !== userId,
    );
    const newMutedBy = Array.from(this._mutedBy).filter((id) => id !== userId);
    const newUserMutedUntil: Record<string, Date | undefined> = {};
    for (const [uid, until] of this._userMutedUntil.entries()) {
      if (uid !== userId) newUserMutedUntil[uid] = until;
    }

    return new Conversation({
      ...this.toProps(),
      participantIds: newParticipants,
      adminIds: newAdmins,
      pinnedBy: newPinnedBy,
      mutedBy: newMutedBy,
      userMutedUntil: newUserMutedUntil,
      updatedAt: new Date(),
    });
  }

  withAdminAdded(userId: string): Conversation {
    if (!this.hasParticipant(userId) || this.isAdmin(userId)) return this;
    return new Conversation({
      ...this.toProps(),
      adminIds: Array.from(this._adminIds).concat(userId),
      updatedAt: new Date(),
    });
  }

  // --- Per-user Pin/Unpin methods ---
  pinForUser(userId: string): Conversation {
    if (this._pinnedBy.has(userId)) return this;
    return new Conversation({
      ...this.toProps(),
      pinnedBy: Array.from(this._pinnedBy).concat(userId),
      updatedAt: new Date(),
    });
  }
  unpinForUser(userId: string): Conversation {
    if (!this._pinnedBy.has(userId)) return this;
    return new Conversation({
      ...this.toProps(),
      pinnedBy: Array.from(this._pinnedBy).filter((id) => id !== userId),
      updatedAt: new Date(),
    });
  }

  // --- Per-user Mute/Unmute methods ---
  muteForUser(userId: string, until?: Date): Conversation {
    if (
      this._mutedBy.has(userId) &&
      until?.getTime() === this._userMutedUntil.get(userId)?.getTime()
    )
      return this;
    const newMutedBy = new Set(this._mutedBy).add(userId);
    const newUserMutedUntil: Record<string, Date | undefined> = {
      ...this.userMutedUntil,
    };
    newUserMutedUntil[userId] = until;
    return new Conversation({
      ...this.toProps(),
      mutedBy: Array.from(newMutedBy),
      userMutedUntil: newUserMutedUntil,
      updatedAt: new Date(),
    });
  }
  unmuteForUser(userId: string): Conversation {
    if (!this._mutedBy.has(userId)) return this;
    // Remove from mutedBy and from userMutedUntil
    const newMutedBy = Array.from(this._mutedBy).filter((id) => id !== userId);
    const newUserMutedUntil: Record<string, Date | undefined> = {
      ...this.userMutedUntil,
    };
    delete newUserMutedUntil[userId];
    return new Conversation({
      ...this.toProps(),
      mutedBy: newMutedBy,
      userMutedUntil: newUserMutedUntil,
      updatedAt: new Date(),
    });
  }
  archiveForUser(userId: string, until?: Date): Conversation {
    if (
      this._archivedBy.has(userId) &&
      until?.getTime() === this._userMutedUntil.get(userId)?.getTime()
    )
      return this;
    const newMutedBy = new Set(this._archivedBy).add(userId);
    const newUserMutedUntil: Record<string, Date | undefined> = {
      ...this.userMutedUntil,
    };
    newUserMutedUntil[userId] = until;
    return new Conversation({
      ...this.toProps(),
      archivedBy: Array.from(newMutedBy),
      userMutedUntil: newUserMutedUntil,
      updatedAt: new Date(),
    });
  }
  unarchiveForUser(userId: string): Conversation {
    if (!this._archivedBy.has(userId)) return this;
    // Remove from archivedBy and from userMutedUntil
    const newMutedBy = Array.from(this._archivedBy).filter(
      (id) => id !== userId,
    );
    const newUserMutedUntil: Record<string, Date | undefined> = {
      ...this.userMutedUntil,
    };
    delete newUserMutedUntil[userId];
    return new Conversation({
      ...this.toProps(),
      archivedBy: newMutedBy,
      userMutedUntil: newUserMutedUntil,
      updatedAt: new Date(),
    });
  }

  /**
   * Load/rehydrate a wishlist item from persistence/primitives.
   */
  static fromPrimitives(props: ConversationProps): Conversation {
    return new Conversation(props);
  }

  // --- Utility ---
  toProps(): ConversationProps {
    // Converts private status Sets/Maps to serializable props
    const userMutedUntilObj: Record<string, Date | undefined> = {};
    for (const [userId, until] of this._userMutedUntil) {
      userMutedUntilObj[userId] = until;
    }
    return {
      id: this._id,
      type: this._type,
      participantIds: [...this._participantIds],
      name: this._name,
      description: this._description,
      avatar: this._avatar,
      adminIds: Array.from(this._adminIds),
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      lastMessageId: this._lastMessageId,
      isActive: this._isActive,
      archivedBy: Array.from(this._archivedBy),
      pinnedBy: Array.from(this._pinnedBy),
      mutedBy: Array.from(this._mutedBy),
      userMutedUntil: userMutedUntilObj,
    };
  }
}
