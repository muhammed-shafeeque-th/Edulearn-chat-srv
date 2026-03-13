export const CHAT_TOPICS = {
  CHAT_CREATED: 'chat.chat.created',
  CHAT_PINNED: 'chat.chat.pinned',
  CHAT_UNPINNED: 'chat.chat.unpinned',
  CHAT_DELETED: 'chat.chat.deleted',

  MESSAGE_SENT: 'chat.message.sent',
  MESSAGE_EDITED: 'chat.message.edited',
  MESSAGE_DELETED: 'chat.message.deleted',
  MESSAGE_READ: 'chat.message.read',

  REACTION_ADDED: 'chat.message.reaction.added',
  REACTION_REMOVED: 'chat.message.reaction.removed',

  // Discussion
  DISCUSSION_MESSAGE_SENT: 'chat.discussion.message.sent',
} as const;

export type ChatTopic = (typeof CHAT_TOPICS)[keyof typeof CHAT_TOPICS];
