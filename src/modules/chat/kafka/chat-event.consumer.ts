import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ChatGateway } from '../gateways/chat.gateway';
import {
  MessageSentKafkaEvent,
  MessageEditedKafkaEvent,
  MessageDeletedKafkaEvent,
  MessagesReadKafkaEvent,
  ReactionAddedKafkaEvent,
  ReactionRemovedKafkaEvent,
  ChatCreatedKafkaEvent,
  DiscussionMessageSentKafkaEvent,
} from 'src/infrastructure/kafka/chat-kafka.events';
import { CHAT_TOPICS } from 'src/infrastructure/kafka/chat-topics';
import { ILoggerService } from 'src/application/ports/logger.service';

@Controller()
export class ChatEventsConsumer {
  constructor(
    private readonly ws: ChatGateway,
    private readonly logger: ILoggerService,
  ) {}

  @EventPattern(CHAT_TOPICS.MESSAGE_SENT)
  async onMessageSent(@Payload() event: MessageSentKafkaEvent) {
    this.logger.log('Kafka MESSAGE_SENT received' + JSON.stringify(event));

    this.ws.emitToChat(event.chatId, 'message:new', {
      message: event.message,
    });
  }

  @EventPattern(CHAT_TOPICS.MESSAGE_EDITED)
  async onMessageEdited(@Payload() event: MessageEditedKafkaEvent) {
    this.ws.emitToChat(event.chatId, 'message:edited', {
      messageId: event.messageId,
      chatId: event.chatId,
      content: event.content,
      editedAt: new Date(event.editedAt),
    });
  }

  @EventPattern(CHAT_TOPICS.MESSAGE_DELETED)
  async onMessageDeleted(@Payload() event: MessageDeletedKafkaEvent) {
    this.ws.emitToChat(event.chatId, 'message:deleted', {
      messageId: event.messageId,
      chatId: event.chatId,
      deleteForEveryone: event.deleteForEveryone,
    });
  }

  @EventPattern(CHAT_TOPICS.MESSAGE_READ)
  async onMessagesRead(@Payload() event: MessagesReadKafkaEvent) {
    // WS frontend expects message status update format
    if (event.messageId) {
      this.ws.emitToChat(event.chatId, 'messages:read', {
        messageId: event.messageId,
        chatId: event.chatId,
        status: 'read',
      });
    }
  }

  @EventPattern(CHAT_TOPICS.REACTION_ADDED)
  async onReactionAdded(@Payload() event: ReactionAddedKafkaEvent) {
    this.ws.emitToChat(event.chatId, 'message:reaction', {
      messageId: event.messageId,
      chatId: event.chatId,
      reaction: {
        userId: event.reaction.userId,
        emoji: event.reaction.emoji,
        timestamp: new Date(event.reaction.timestamp),
      },
    });
  }

  @EventPattern(CHAT_TOPICS.REACTION_REMOVED)
  async onReactionRemoved(@Payload() event: ReactionRemovedKafkaEvent) {
    this.ws.emitToChat(event.chatId, 'message:reaction:removed', {
      messageId: event.messageId,
      chatId: event.chatId,
      reactionId: event.reactionId,
      removedBy: event.removedBy,
    });
  }

  @EventPattern(CHAT_TOPICS.CHAT_CREATED)
  async onChatCreated(@Payload() event: ChatCreatedKafkaEvent) {
    console.log(`Kafka topic ${CHAT_TOPICS.MESSAGE_SENT} message: ${event}`);
    this.ws.emitToUser(event.studentId, 'chat:created', { chat: event.chat });
    this.ws.emitToUser(event.instructorId, 'chat:created', {
      chat: event.chat,
    });
  }

  // ─── Discussion ──────────────────────────────────────────────

  @EventPattern(CHAT_TOPICS.DISCUSSION_MESSAGE_SENT)
  async onDiscussionMessageSent(
    @Payload() event: DiscussionMessageSentKafkaEvent,
  ) {
    this.logger.log(
      'Kafka DISCUSSION_MESSAGE_SENT received for room ' + event.roomId,
    );
    this.ws.emitToDiscussion(event.roomId, 'discussion:message:new', {
      message: event.message,
    });
  }
}
