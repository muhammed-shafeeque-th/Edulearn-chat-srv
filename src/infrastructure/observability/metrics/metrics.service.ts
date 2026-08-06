import { Injectable } from '@nestjs/common';
import { CounterMetric, GaugeMetric, HistogramMetric } from '@edulearn/core';
import { MetricsService } from '@edulearn/nest';
import { IMetricService } from 'src/application/ports/metric.service';

@Injectable()
export class MetricService implements IMetricService {
  private gRPCRequestDurationSeconds: HistogramMetric;
  private databaseQueryCounter: CounterMetric;
  private currentRequestCount: GaugeMetric;
  private dbRequestDurationSeconds: HistogramMetric;
  private grpcRequestsTotal: CounterMetric;
  private grpcErrorsTotal: CounterMetric;

  public constructor(private readonly _metric: MetricsService) {
    this.gRPCRequestDurationSeconds = _metric.histogram({
      name: 'course_service_grpc_request_duration_seconds',
      help: 'Latency of gRPC requests in seconds',
      labelNames: ['method', 'status_code'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10], // More granular buckets
    });

    this.databaseQueryCounter = _metric.counter({
      name: 'database_queries_total',
      help: 'Total number of database queries in User Service',
      labelNames: ['operation'],
    });

    this.currentRequestCount = _metric.gauge({
      name: 'number_of_current_processing_requests_by_server',
      help: 'Current size of the request served by server',
    });

    this.dbRequestDurationSeconds = _metric.histogram({
      name: 'DB_request_duration_seconds',
      help: 'Duration of Database requests in seconds',
      labelNames: ['method', 'operation'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    });

    this.grpcRequestsTotal = _metric.counter({
      name: 'grpc_requests_total',
      help: 'Total number of gRPC requests',
      labelNames: ['method', 'status_code'],
    });

    this.grpcErrorsTotal = _metric.counter({
      name: 'grpc_errors_total',
      help: 'Total number of gRPC errors',
      labelNames: ['method', 'status_code'],
    });
  }
  // Use the pre-defined metric instances directly
  public measureDBOperationDuration(
    method: string,
    operation?: 'INSERT' | 'DELETE' | 'SELECT' | 'UPDATE',
  ): () => void {
    const end = this.dbRequestDurationSeconds.startTimer({ method, operation });
    return () => {
      end();
    };
  }
  public measureRequestDuration(method: string): () => void {
    const end = this.gRPCRequestDurationSeconds.startTimer({ method });
    return (status_code?: string) => {
      end({ status_code }); // Ensure status code is a string label
    };
  }

  public incrementRequestCounter(method: string, statusCode?: number): void {
    this.grpcRequestsTotal.inc({
      method,
      status_code: statusCode?.toString() || 'known',
    });
  }
  public incrementDBRequestCounter(
    operation?: 'INSERT' | 'DELETE' | 'SELECT' | 'UPDATE',
  ): void {
    this.databaseQueryCounter.inc({ operation });
  }

  public incrementErrorCounter(method: string, statusCode?: number): void {
    this.grpcErrorsTotal.inc({
      method,
      status_code: statusCode?.toString() || 'unknown',
    });
  }
}
