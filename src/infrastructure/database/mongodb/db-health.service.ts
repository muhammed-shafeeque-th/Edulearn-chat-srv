import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class DBHealthService {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  async ping(): Promise<boolean> {
    try {
      const admin = this.connection.db.admin();
      await admin.ping();
      return true;
    } catch {
      return false;
    }
  }
}
