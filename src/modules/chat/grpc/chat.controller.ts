import { Controller, UseFilters, UseInterceptors } from '@nestjs/common';

import { ISendMessageUseCase } from 'src/application/use-cases/chat/interfaces/send-message.interface';
import { IGetChatMessagesUseCase } from 'src/application/use-cases/chat/interfaces/get-chat-messages.interface';
import { ICreateChatUseCase } from 'src/application/use-cases/chat/interfaces/create-chat.interface';
import { IEditMessageUseCase } from 'src/application/use-cases/chat/interfaces/edit-message.interface';
import { IDeleteMessageUseCase } from 'src/application/use-cases/chat/interfaces/delete-message.interface';
import { IReactMessageUseCase } from 'src/application/use-cases/chat/interfaces/add-reaction.interface';
import { GrpcMethod } from '@nestjs/microservices';
import {
  AddReactionRequest,
  ChatResponse,
  CreateChatRequest,
  // DeleteChatRequest,
  DeleteMessageRequest,
  EditMessageRequest,
  Empty,
  GetChatRequest,
  GetMessagesRequest,
  GetMessagesResponse,
  ListStudentChatsRequest,
  ChatsListResponse,
  MarkMessagesReadRequest,
  MessageResponse,
  PinChatRequest,
  RemoveReactionRequest,
  SendMessageRequest,
  UnPinChatRequest,
  ListInstructorChatsRequest,
  OnlineUsersResponse,
  SendDiscussionMessageRequest,
  CreateDiscussionRoomRequest,
  GetDiscussionMessagesRequest,
} from 'src/infrastructure/grpc/generated/chat_service';
import { IGetChatUseCase } from 'src/application/use-cases/chat/interfaces/get-chat.interface';
import { IDeleteChatUseCase } from 'src/application/use-cases/chat/interfaces/delete-chat.interface';
import { IUnPinChatUseCase } from 'src/application/use-cases/chat/interfaces/unpin-chat.use-case';
import { IPinChatUseCase } from 'src/application/use-cases/chat/interfaces/pin-chat.interface';
import { IRemoveReactionUseCase } from 'src/application/use-cases/chat/interfaces/remove-reaction.interface';
import { IListStudentChatsUseCase } from 'src/application/use-cases/chat/interfaces/list-student-chats.interface';
import { IMarkMessagesAsReadUseCase } from 'src/application/use-cases/chat/interfaces/mark-messages-as-read.interface';
import { GrpcInterceptor } from 'src/infrastructure/interceptors/grpc.interceptor';
import { IListInstructorChatsUseCase } from 'src/application/use-cases/chat/interfaces/list-instructor-chats.interface';
import { IGetOnlineUsersUseCase } from 'src/application/use-cases/chat/interfaces/get-online-users.interface';

// Discussion use cases
import { ICreateOrGetDiscussionRoomUseCase } from 'src/application/use-cases/discussion/interfaces/create-or-get-discussion-room.interface';
import { ISendDiscussionMessageUseCase } from 'src/application/use-cases/discussion/interfaces/send-discussion-message.interface';
import { IGetDiscussionMessagesUseCase } from 'src/application/use-cases/discussion/interfaces/get-discussion-messages.interface';
import { ILoggerService } from 'src/application/ports/logger.service';
import { ChatResponseMapper } from '../mappers/chat.mapper';
import { MessageMapper } from '../mappers/message.mapper';
import { DiscussionMessageMapper } from '../mappers/discussion-message.mapper';
import { DiscussionRoomMapper } from '../mappers/discussion-room.mapper';
import { GrpcExceptionFilter } from '@/infrastructure/filters/grpc-exception.filter';

@Controller()
@UseFilters(GrpcExceptionFilter)
@UseInterceptors(GrpcInterceptor)
export class ChatGrpcController {
  constructor(
    private readonly logger: ILoggerService,

    private readonly createChatUseCase: ICreateChatUseCase,
    private readonly getChatUseCase: IGetChatUseCase,
    private readonly deleteChatUseCase: IDeleteChatUseCase,
    private readonly listInstructorChatsUseCase: IListInstructorChatsUseCase,
    private readonly listStudentChatsUseCase: IListStudentChatsUseCase,

    private readonly sendMessageUseCase: ISendMessageUseCase,
    private readonly getChatMessagesUseCase: IGetChatMessagesUseCase,
    private readonly markMessagesReadUseCase: IMarkMessagesAsReadUseCase,

    private readonly editMessageUseCase: IEditMessageUseCase,
    private readonly deleteMessageUseCase: IDeleteMessageUseCase,

    private readonly reactMessageUseCase: IReactMessageUseCase,
    private readonly removeReactionUseCase: IRemoveReactionUseCase,

    private readonly pinChatUseCase: IPinChatUseCase,
    private readonly unPinChatUseCase: IUnPinChatUseCase,

    private readonly getOnlineUsersUseCase: IGetOnlineUsersUseCase,

    // Discussion use cases
    private readonly createOrGetDiscussionRoomUseCase: ICreateOrGetDiscussionRoomUseCase,
    private readonly sendDiscussionMessageUseCase: ISendDiscussionMessageUseCase,
    private readonly getDiscussionMessagesUseCase: IGetDiscussionMessagesUseCase,
    // private readonly archiveChatUseCase: ArchiveChatUseCase,
    // private readonly unArchiveChatUseCase: UnArchiveChatUseCase,
    // private readonly muteChatUseCase: MuteChatUseCase,
    // private readonly unMuteChatUseCase: UnMuteChatUseCase,
  ) {}

  @GrpcMethod('ChatService', 'CreateChat')
  async createChat(data: CreateChatRequest): Promise<ChatResponse> {
    this.logger.info('Handling `CreateChat` request ', {
      ctx: ChatGrpcController.name,
    });

    const result = await this.createChatUseCase.execute({
      studentId: data.studentId,
      instructorId: data.instructorId,
      role: data.role as 'student' | 'instructor',
    } as any);

    this.logger.info('CreateChat request has been successfully completed');

    return {
      chat: ChatResponseMapper.toGrpcResponse(result.chat, result.state),
    };
  }
  @GrpcMethod('ChatService', 'GetChat')
  async getChat(data: GetChatRequest): Promise<ChatResponse> {
    this.logger.info('Handling `GetChat` request ', {
      ctx: ChatGrpcController.name,
    });

    const result = await this.getChatUseCase.execute(data);

    this.logger.info('GetChat request has been successfully completed');

    return {
      chat: ChatResponseMapper.toGrpcResponse(result.chat, result.state),
    };
  }
  // @GrpcMethod('ChatService', 'DeleteChat')
  // async deleteChat(data: DeleteChatRequest): Promise<Empty> {
  //     this.logger.info('Handling `DeleteChat` request ', {
  //       ctx: ChatGrpcController.name,
  //     });

  //     await this.deleteChatUseCase.execute(data);

  //     this.logger.info('DeleteChat request has been successfully completed');

  //     return {};
  //   } catch (error) {
  //     this.logger.error('Error processing gRPC request `DeleteChat`', {
  //       error,
  //     });
  //     throw error;
  //   }
  // }

  @GrpcMethod('ChatService', 'ListInstructorChats')
  async listInstructorsChats(
    data: ListInstructorChatsRequest,
  ): Promise<ChatsListResponse> {
    this.logger.info('Handling `ListInstructorChats` request ', {
      ctx: ChatGrpcController.name,
    });

    const { total, chats } =
      await this.listInstructorChatsUseCase.execute(data);

    this.logger.info(
      'ListInstructorChats request has been successfully completed',
    );

    return {
      chats: {
        chats: chats.map((c) =>
          ChatResponseMapper.toGrpcResponse(c.chat, c.state),
        ),
        total,
      },
    };
  }
  @GrpcMethod('ChatService', 'ListStudentChats')
  async listStudentChats(
    data: ListStudentChatsRequest,
  ): Promise<ChatsListResponse> {
    this.logger.info('Handling `ListStudentChats` request ', {
      ctx: ChatGrpcController.name,
    });

    const { total, chats } = await this.listStudentChatsUseCase.execute(data);

    this.logger.info(
      'ListStudentChats request has been successfully completed',
    );

    return {
      chats: {
        chats: chats.map((c) =>
          ChatResponseMapper.toGrpcResponse(c.chat, c.state),
        ),
        total,
      },
    };
  }

  @GrpcMethod('ChatService', 'PinChat')
  async pinChats(data: PinChatRequest): Promise<ChatResponse> {
    this.logger.info('Handling `PinChat` request ', {
      ctx: ChatGrpcController.name,
    });

    const result = await this.pinChatUseCase.execute(data);

    this.logger.info('PinChat request has been successfully completed');

    return {
      chat: ChatResponseMapper.toGrpcResponse(result.chat, result.state),
    };
  }
  @GrpcMethod('ChatService', 'UnPinChat')
  async unPinChats(data: UnPinChatRequest): Promise<ChatResponse> {
    this.logger.info('Handling `UnPinChat` request ', {
      ctx: ChatGrpcController.name,
    });

    const result = await this.unPinChatUseCase.execute(data);

    this.logger.info('UnPinChat request has been successfully completed');

    return {
      chat: ChatResponseMapper.toGrpcResponse(result.chat, result.state),
    };
  }
  @GrpcMethod('ChatService', 'GetOnlineUsers')
  async getOnlineUsers(): Promise<OnlineUsersResponse> {
    this.logger.info('Handling `GetOnlineUsers` request ', {
      ctx: ChatGrpcController.name,
    });

    const result = await this.getOnlineUsersUseCase.execute();

    this.logger.info('GetOnlineUsers request has been successfully completed');

    return { success: result };
  }

  // @GrpcMethod('ChatService', 'ArchiveChat')
  // async archiveChats(data: ArchiveChatRequest): Promise<ChatResponse> {
  //     this.logger.info('Handling `ArchiveChat` request ', {
  //       ctx: ChatGrpcController.name,
  //     });

  //     const { total, chats } = await this.archiveChatUseCase.execute({
  //       userId: data.userId,
  //     });

  //     this.logger.info('ArchiveChat request has been successfully completed');

  //     return {
  //       chats,
  //       total,
  //     };
  //   } catch (error) {
  //     this.logger.error('Error processing gRPC request `ArchiveChat`', {
  //       error,
  //     });
  //     throw error;
  //   }
  // }
  // @GrpcMethod('ChatService', 'UnArchiveChat')
  // async unArchiveChats(data: UnArchiveChatRequest): Promise<ChatResponse> {
  //     this.logger.info('Handling `UnArchiveChat` request ', {
  //       ctx: ChatGrpcController.name,
  //     });

  //     const { total, chats } = await this.unArchiveChatUseCase.execute({
  //       userId: data.userId,
  //     });

  //     this.logger.info('UnArchiveChat request has been successfully completed');

  //     return {
  //       chats,
  //       total,
  //     };
  //   } catch (error) {
  //     this.logger.error('Error processing gRPC request `UnArchiveChat`', {
  //       error,
  //     });
  //     throw error;
  //   }
  // }

  //             Messaging

  @GrpcMethod('ChatService', 'GetMessages')
  async getMessages(data: GetMessagesRequest): Promise<GetMessagesResponse> {
    this.logger.info('Handling `GetMessages` request ', {
      ctx: ChatGrpcController.name,
    });

    const { messages, total } = await this.getChatMessagesUseCase.execute(data);

    this.logger.info('GetMessages request has been successfully completed');

    return {
      messages: {
        messages: messages.map((msg) => MessageMapper.toGrpcResponse(msg)),
        total,
      },
    };
  }

  @GrpcMethod('ChatService', 'MarkMessagesRead')
  async markMessageSeen(data: MarkMessagesReadRequest): Promise<ChatResponse> {
    this.logger.info('Handling `MarkMessageRead` request ', {
      ctx: ChatGrpcController.name,
    });

    const result = await this.markMessagesReadUseCase.execute(data);

    this.logger.info('MarkMessageRead request has been successfully completed');

    return {
      chat: ChatResponseMapper.toGrpcResponse(result.chat, result.state),
    };
  }

  @GrpcMethod('ChatService', 'SendMessage')
  async sendMessage(data: SendMessageRequest): Promise<MessageResponse> {
    this.logger.info('Handling `SendMessage` request ', {
      ctx: ChatGrpcController.name,
    });

    const result = await this.sendMessageUseCase.execute(data);

    this.logger.info('SendMessage request has been successfully completed');

    return { message: MessageMapper.toGrpcResponse(result) };
  }

  @GrpcMethod('ChatService', 'EditMessage')
  async editMessage(data: EditMessageRequest): Promise<MessageResponse> {
    this.logger.info('Handling `EditMessage` request ', {
      ctx: ChatGrpcController.name,
    });

    const result = await this.editMessageUseCase.execute(data);

    this.logger.info('EditMessage request has been successfully completed');

    return { message: MessageMapper.toGrpcResponse(result) };
  }
  @GrpcMethod('ChatService', 'DeleteMessage')
  async deleteMessage(data: DeleteMessageRequest): Promise<Empty> {
    this.logger.info('Handling `DeleteMessage` request ', {
      ctx: ChatGrpcController.name,
    });

    await this.deleteMessageUseCase.execute(data);

    this.logger.info('DeleteMessage request has been successfully completed');

    return {};
  }

  //            Reactions

  @GrpcMethod('ChatService', 'AddReaction')
  async addReaction(data: AddReactionRequest): Promise<MessageResponse> {
    this.logger.info('Handling `AddReaction` request ', {
      ctx: ChatGrpcController.name,
    });

    const result = await this.reactMessageUseCase.execute(data);

    this.logger.info('AddReaction request has been successfully completed');

    return { message: MessageMapper.toGrpcResponse(result) };
  }
  @GrpcMethod('ChatService', 'RemoveReaction')
  async removeReaction(data: RemoveReactionRequest): Promise<MessageResponse> {
    this.logger.info('Handling `RemoveReaction` request ', {
      ctx: ChatGrpcController.name,
    });

    const result = await this.removeReactionUseCase.execute(data);

    this.logger.info('RemoveReaction request has been successfully completed');

    return { message: MessageMapper.toGrpcResponse(result) };
  }

  // async getUnreadCount(chatId: string, userId: string) {
  //   this.logger.debug(
  //     `Getting unread count for chat ${chatId}`,
  //   );
  //   return this.messageRepository.getUnreadCount(chatId, userId);
  // }

  //  Discussion

  @GrpcMethod('ChatService', 'CreateOrGetDiscussionRoom')
  async createOrGetDiscussionRoom(data: CreateDiscussionRoomRequest) {
    this.logger.info('Handling `CreateOrGetDiscussionRoom` request', {
      ctx: ChatGrpcController.name,
    });

    const result = await this.createOrGetDiscussionRoomUseCase.execute(data);

    return { room: DiscussionRoomMapper.toGrpcResponse(result) };
  }

  @GrpcMethod('ChatService', 'SendDiscussionMessage')
  async sendDiscussionMessage(data: SendDiscussionMessageRequest) {
    this.logger.info('Handling `SendDiscussionMessage` request', {
      ctx: ChatGrpcController.name,
    });

    const result = await this.sendDiscussionMessageUseCase.execute({
      roomId: data.roomId,
      senderId: data.senderId,
      senderRole: data.senderRole,
      content: data.content,
      idempotencyKey: data.idempotencyKey,
    });

    return { message: DiscussionMessageMapper.toGrpcResponse(result) };
  }

  @GrpcMethod('ChatService', 'GetDiscussionMessages')
  async getDiscussionMessages(data: GetDiscussionMessagesRequest) {
    this.logger.info('Handling `GetDiscussionMessages` request', {
      ctx: ChatGrpcController.name,
    });

    const result = await this.getDiscussionMessagesUseCase.execute({
      roomId: data.roomId,
      userId: data.userId,
      pagination: data.pagination,
    });

    return {
      messages: {
        messages: result.messages.map((m) =>
          DiscussionMessageMapper.toGrpcResponse(m),
        ),
        total: result.total,
      },
    };
  }
}
