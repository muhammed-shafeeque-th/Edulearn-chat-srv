import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap, finalize } from 'rxjs';
import { LoggingService } from '../observability/logging/logging.service';
import { MetricsService } from '../observability/metrics/metrics.service';

@Injectable()
export class WsLoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: LoggingService,
    private readonly metrics: MetricsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Use websocket context
    const wsContext = context.switchToWs();
    const client = wsContext.getClient();
    const data = wsContext.getData();
    const handler = context.getHandler();
    const method = handler?.name || 'unknown';

    this.logger.debug(`WebSocket event '${method}' received`, {
      ctx: WsLoggingInterceptor.name,
      payload: data,
      clientId: client?.id,
    });

    const endRequest = this.metrics.measureRequestDuration(method);
    this.metrics.incrementRequestCounter(method);
    const start = Date.now();
    let status = 'success';

    return next.handle().pipe(
      tap({
        error: (error) => {
          status = 'error';
          this.logger.error(
            `WebSocket event '${method}' failed: ${error?.message}`,
            {
              error,
              ctx: WsLoggingInterceptor.name,
              clientId: client?.id,
            },
          );
          this.metrics.incrementErrorCounter(method);
        },
      }),
      finalize(() => {
        const duration = (Date.now() - start) / 1000; // seconds
        endRequest();
        this.logger.debug(
          `WebSocket event '${method}' completed with status ${status} in ${duration}s`,
          { ctx: WsLoggingInterceptor.name, clientId: client?.id },
        );
      }),
    );
  }
}
