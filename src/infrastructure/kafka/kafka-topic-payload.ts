import { CHAT_TOPICS, ChatTopic } from './chat-topics';
import {
  ChatCreatedKafkaEvent,
  DiscussionMessageSentKafkaEvent,
  MessageDeletedKafkaEvent,
  MessageEditedKafkaEvent,
  MessageSentKafkaEvent,
  MessagesReadKafkaEvent,
  ReactionAddedKafkaEvent,
  ReactionRemovedKafkaEvent,
} from './chat-kafka.events';

export type TopicPayloads =
  | { topic: typeof CHAT_TOPICS.CHAT_CREATED; payload: ChatCreatedKafkaEvent }
  | { topic: typeof CHAT_TOPICS.MESSAGE_SENT; payload: MessageSentKafkaEvent }
  | {
      topic: typeof CHAT_TOPICS.MESSAGE_EDITED;
      payload: MessageEditedKafkaEvent;
    }
  | { topic: typeof CHAT_TOPICS.MESSAGE_READ; payload: MessagesReadKafkaEvent }
  | {
      topic: typeof CHAT_TOPICS.MESSAGE_DELETED;
      payload: MessageDeletedKafkaEvent;
    }
  | {
      topic: typeof CHAT_TOPICS.REACTION_ADDED;
      payload: ReactionAddedKafkaEvent;
    }
  | {
      topic: typeof CHAT_TOPICS.REACTION_REMOVED;
      payload: ReactionRemovedKafkaEvent;
    }
  | {
      topic: typeof CHAT_TOPICS.DISCUSSION_MESSAGE_SENT;
      payload: DiscussionMessageSentKafkaEvent;
    };

export type { ChatTopic };
