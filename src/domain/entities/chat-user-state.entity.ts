export interface ChatUserStateProps {
  chatId: string;
  userId: string;
  pinned?: boolean;
  archived?: boolean;
  mutedUntil?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ChatUserState {
  private _props: ChatUserStateProps;

  constructor(props: ChatUserStateProps) {
    if (!props.chatId?.trim()) throw new Error('chatId required');
    if (!props.userId?.trim()) throw new Error('userId required');

    this._props = {
      ...props,
      pinned: props.pinned ?? false,
      archived: props.archived ?? false,
      mutedUntil: props.mutedUntil ?? null,
    };
  }

  get chatId() {
    return this._props.chatId;
  }
  get userId() {
    return this._props.userId;
  }
  get pinned() {
    return !!this._props.pinned;
  }
  get archived() {
    return !!this._props.archived;
  }
  get mutedUntil() {
    return this._props.mutedUntil ?? null;
  }

  pin() {
    this._props.pinned = true;
  }
  unpin() {
    this._props.pinned = false;
  }

  archive() {
    this._props.archived = true;
  }
  unarchive() {
    this._props.archived = false;
  }

  mute(until?: Date) {
    this._props.mutedUntil = until ?? new Date(Date.now() + 3600_000);
  }
  unmute() {
    this._props.mutedUntil = null;
  }

  isMuted(): boolean {
    if (!this._props.mutedUntil) return false;
    return this._props.mutedUntil.getTime() > Date.now();
  }

  static fromPrimitives(props: ChatUserStateProps): ChatUserState {
    return new ChatUserState(props);
  }

  toProps(): ChatUserStateProps {
    return { ...this._props };
  }
}
