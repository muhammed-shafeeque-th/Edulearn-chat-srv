import { Module } from '@nestjs/common';

// import { MessageDomainService } from 'src/application/domain/services/message.domain.service';

import { SendMessageUseCase } from './send-message.use-case';
import { GetChatMessagesUseCase } from './get-chat-messages.use-case';
import { MarkMessagesAsReadUseCase } from './mark-messages-as-read.use-case';
import { CreateChatUseCase } from './create-chat.use-case';
import { EditMessageUseCase } from './edit-message.use-case';
import { DeleteMessageUseCase } from './delete-message.use-case';
import { ReactMessageUseCase } from './add-reaction.use-case';

import { MongoDbDatabaseModule } from 'src/infrastructure/database/mongodb/database.module';
import { DeleteChatUseCase } from './delete-chat.use-case';
import { GetChatUseCase } from './get-chat.use-case';
import { ListStudentChatsUseCase } from './list-student-chats.use-case';
import { PinChatUseCase } from './pin-chat.use-case';
import { UnPinChatUseCase } from './unpin-chat.use-case';
import { RemoveReactionUseCase } from './remove-reaction.use-case';
import { GrpcClientsModule } from 'src/infrastructure/grpc/clients/grpc-clients.module';
import { KafkaModule } from 'src/infrastructure/kafka/kafka.module';
import { ListInstructorChatsUseCase } from './list-instructor-chats.use-case';
import { GetOnlineUsersUseCase } from './get-online-users.use-case';
import { PresenceService } from 'src/infrastructure/redis/presence.service';
import { ISendMessageUseCase } from '../interfaces/send-message.interface';
import { IGetOnlineUsersUseCase } from '../interfaces/get-online-users.interface';
import { IGetChatMessagesUseCase } from '../interfaces/get-chat-messages.interface';
import { IGetChatUseCase } from '../interfaces/get-chat.interface';
import { IListStudentChatsUseCase } from '../interfaces/list-student-chats.interface';
import { IListInstructorChatsUseCase } from '../interfaces/list-instructor-chats.interface';
import { IMarkMessagesAsReadUseCase } from '../interfaces/mark-messages-as-read.interface';
import { ICreateChatUseCase } from '../interfaces/create-chat.interface';
import { IDeleteChatUseCase } from '../interfaces/delete-chat.interface';
import { IPinChatUseCase } from '../interfaces/pin-chat.interface';
import { IUnPinChatUseCase } from '../interfaces/unpin-chat.use-case';
import { IRemoveReactionUseCase } from '../interfaces/remove-reaction.interface';
import { IEditMessageUseCase } from '../interfaces/edit-message.interface';
import { IDeleteMessageUseCase } from '../interfaces/delete-message.interface';
import { IReactMessageUseCase } from '../interfaces/add-reaction.interface';

@Module({
  imports: [MongoDbDatabaseModule, KafkaModule, GrpcClientsModule],
  providers: [
    // MessageDomainService,
    PresenceService,
    // Chat use cases
    { provide: ISendMessageUseCase, useClass: SendMessageUseCase },
    { provide: IGetOnlineUsersUseCase, useClass: GetOnlineUsersUseCase },
    { provide: IGetChatMessagesUseCase, useClass: GetChatMessagesUseCase },
    { provide: IGetChatUseCase, useClass: GetChatUseCase },
    { provide: IListStudentChatsUseCase, useClass: ListStudentChatsUseCase },
    {
      provide: IListInstructorChatsUseCase,
      useClass: ListInstructorChatsUseCase,
    },
    {
      provide: IMarkMessagesAsReadUseCase,
      useClass: MarkMessagesAsReadUseCase,
    },
    { provide: ICreateChatUseCase, useClass: CreateChatUseCase },
    { provide: IDeleteChatUseCase, useClass: DeleteChatUseCase },
    { provide: IPinChatUseCase, useClass: PinChatUseCase },
    { provide: IUnPinChatUseCase, useClass: UnPinChatUseCase },
    { provide: IRemoveReactionUseCase, useClass: RemoveReactionUseCase },
    { provide: IEditMessageUseCase, useClass: EditMessageUseCase },
    { provide: IDeleteMessageUseCase, useClass: DeleteMessageUseCase },
    { provide: IReactMessageUseCase, useClass: ReactMessageUseCase },
  ],
  exports: [
    ISendMessageUseCase,
    IGetOnlineUsersUseCase,
    IGetChatMessagesUseCase,
    IGetChatUseCase,
    IListStudentChatsUseCase,
    IListInstructorChatsUseCase,
    IMarkMessagesAsReadUseCase,
    ICreateChatUseCase,
    IDeleteChatUseCase,
    IPinChatUseCase,
    IUnPinChatUseCase,
    IRemoveReactionUseCase,
    IEditMessageUseCase,
    IDeleteMessageUseCase,
    IReactMessageUseCase,
  ],
})
export class ChatUseCaseModule {}
