import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import path from 'path';
import { getProtoPath, PROTO_ROOT_DIR } from '@edulearn/core';

import { GRPC_COURSE_CLIENT_TOKEN } from './course/constants';
import { CourseClient } from './course/course.client';
import { RedisModule } from 'src/infrastructure/redis/redis.module';
import { AppConfigService } from 'src/infrastructure/config/config.service';
import { GRPC_USER_CLIENT_TOKEN } from './user/constants';
import { UserClient } from './user/user.client';
import { ICourseClient } from './course/course-client.interface';
import { IUserClient } from './user/user-client.interface';

@Module({
  imports: [
    RedisModule,
    ClientsModule.registerAsync({
      clients: [
        {
          name: GRPC_USER_CLIENT_TOKEN,
          useFactory: (config: AppConfigService) => ({
            transport: Transport.GRPC,
            options: {
              package: 'user_service',
              url: config.userGrpcUrl,
              protoPath: [path.join(getProtoPath('user'))],
              loader: {
                includeDirs: [path.join(PROTO_ROOT_DIR, 'user')],
              },
            },
          }),
          inject: [AppConfigService],
        },
        {
          name: GRPC_COURSE_CLIENT_TOKEN,
          useFactory: (config: AppConfigService) => ({
            transport: Transport.GRPC,
            options: {
              package: 'course_service',
              url: config.courseGrpcUrl,
              protoPath: [path.join(getProtoPath('course'))],
              loader: {
                includeDirs: [path.join(PROTO_ROOT_DIR, 'course')],
              },
            },
          }),
          inject: [AppConfigService],
        },
      ],
    }),
  ],
  providers: [
    { provide: ICourseClient, useClass: CourseClient },
    { provide: IUserClient, useClass: UserClient },
  ],
  exports: [ICourseClient, IUserClient],
})
export class GrpcClientsModule {}
