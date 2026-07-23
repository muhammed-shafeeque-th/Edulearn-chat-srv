import { Injectable } from '@nestjs/common';
import {
  BaseHealthCheck,
  HealthCheckResult,
  HealthRegistry,
} from '@edulearn/nest';
import { DBHealthService } from '@/infrastructure/database/mongodb/db-health.service';

@Injectable()
export class DBHealthCheck extends BaseHealthCheck {
  name: string = 'database';

  constructor(
    registry: HealthRegistry,
    private readonly dbHealthService: DBHealthService,
  ) {
    super(registry);
  }

  async check(): Promise<HealthCheckResult> {
    try {
      await this.dbHealthService.ping();
      return {
        name: 'postgres',
        status: 'up',
      };
    } catch (error: any) {
      return {
        name: 'postgres',
        status: 'down',
        message: error?.message ?? 'postgres down',
      };
    }
  }
}
