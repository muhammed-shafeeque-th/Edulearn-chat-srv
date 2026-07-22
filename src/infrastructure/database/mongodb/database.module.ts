import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatDocument, ChatSchema } from './schemas/chat.schema';
import { MessageDocument, MessageSchema } from './schemas/message.schema';
import { IChatRepository } from 'src/domain/repositories/chat.repository';
import { MongoDbChatRepository } from './repositories/mongodb-chat.repository';
import { IMessageRepository } from 'src/domain/repositories/message.repository';
import { MongoDbMessageRepository } from './repositories/mongodb-message.repository';
import { AppConfigService } from 'src/infrastructure/config/config.service';
import {
  ChatUserStateDocument,
  ChatUserStateSchema,
} from './schemas/chat-user-state.schema';
import { MongoDbChatUserStateRepository } from './repositories/mongodb-chat-user-state.repository';
import { IChatUserStateRepository } from 'src/domain/repositories/chat-user.repository';
import {
  ChatCounterDocument,
  ChatCounterSchema,
} from './schemas/chat-counter.schema';
import {
  DiscussionRoomDocument,
  DiscussionRoomSchema,
} from './schemas/discussion-room.schema';
import {
  DiscussionMessageDocument,
  DiscussionMessageSchema,
} from './schemas/discussion-message.schema';
import {
  DiscussionCounterDocument,
  DiscussionCounterSchema,
} from './schemas/discussion-counter.schema';
import { IDiscussionRoomRepository } from 'src/domain/repositories/discussion-room.repository';
import { MongoDbDiscussionRoomRepository } from './repositories/mongodb-discussion-room.repository';
import { IDiscussionMessageRepository } from 'src/domain/repositories/discussion-message.repository';
import { MongoDbDiscussionMessageRepository } from './repositories/mongodb-discussion-message.repository';
import { DBHealthService } from './db-health.service';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async (configService: AppConfigService) => ({
        uri: configService.mongodbConnectionUrl,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: configService.databaseName ?? 'edulearn',
        appName: 'Edulearn',
        retryAttempts: 5,
        retryDelay: 1000,
      }),
      inject: [AppConfigService],
    }),

    MongooseModule.forFeature([
      { name: ChatDocument.name, schema: ChatSchema },
      { name: MessageDocument.name, schema: MessageSchema },
      { name: ChatUserStateDocument.name, schema: ChatUserStateSchema },
      { name: ChatCounterDocument.name, schema: ChatCounterSchema },
      { name: DiscussionRoomDocument.name, schema: DiscussionRoomSchema },
      { name: DiscussionMessageDocument.name, schema: DiscussionMessageSchema },
      { name: DiscussionCounterDocument.name, schema: DiscussionCounterSchema },
    ]),
  ],
  providers: [
    {
      provide: IChatRepository,
      useClass: MongoDbChatRepository,
    },
    {
      provide: IChatUserStateRepository,
      useClass: MongoDbChatUserStateRepository,
    },
    {
      provide: IMessageRepository,
      useClass: MongoDbMessageRepository,
    },
    {
      provide: IDiscussionRoomRepository,
      useClass: MongoDbDiscussionRoomRepository,
    },
    {
      provide: IDiscussionMessageRepository,
      useClass: MongoDbDiscussionMessageRepository,
    },
    DBHealthService,
  ],
  exports: [
    IChatRepository,
    IMessageRepository,
    IChatUserStateRepository,
    IDiscussionRoomRepository,
    IDiscussionMessageRepository,
    DBHealthService,
  ],
})
export class MongoDbDatabaseModule {}
