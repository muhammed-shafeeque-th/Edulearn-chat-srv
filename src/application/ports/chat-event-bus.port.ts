import { TopicPayloads } from 'src/infrastructure/kafka/kafka-topic-payload';

export type ChatEvent =
  | { type: 'chat.created'; payload: any }
  | { type: 'message.created'; payload: any }
  | { type: 'message.edited'; payload: any }
  | { type: 'message.deleted'; payload: any }
  | { type: 'messages.read'; payload: any };

export abstract class IChatEventBusPort {
  abstract publish(event: TopicPayloads): Promise<void>;
}
