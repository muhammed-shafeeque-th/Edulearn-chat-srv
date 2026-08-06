import { Global, Module } from '@nestjs/common';
import { MetricService } from './metrics.service';
import { IMetricService } from 'src/application/ports/metric.service';
import { MetricsModule } from '@edulearn/nest';
import { AppConfigService } from '@infrastructure/config/config.service';

@Global()
@Module({
  imports: [
    MetricsModule.forRootAsync({
      inject: [AppConfigService],

      useFactory: (config: AppConfigService) => ({
        namespace: 'chat_service',

        port: config.httpPort,
        defaultLabels: {
          service: config.serviceName,
        },
      }),
    }),
  ],
  providers: [{ provide: IMetricService, useClass: MetricService }],
  exports: [IMetricService],
})
export class AppMetricsModule {}
