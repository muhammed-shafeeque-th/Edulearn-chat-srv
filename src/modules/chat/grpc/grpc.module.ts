import { Module } from '@nestjs/common';
import { ChatUseCaseModule } from 'src/application/use-cases/chat/chat-use-case.module';
import { ChatGrpcController } from './chat.controller';
import { DiscussionUseCaseModule } from 'src/application/use-cases/discussion/dicussion-use-case.module';

@Module({
  imports: [
    // DatabaseRepositoryModule,

    ChatUseCaseModule,
    DiscussionUseCaseModule,
  ],
  controllers: [ChatGrpcController],
})
export class ChatGrpcModule {}
