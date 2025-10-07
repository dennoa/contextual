import { Module } from '@nestjs/common';
import { DbClient } from './db-client';
import { DbClientController } from './db-client.controller';

@Module({
  providers: [DbClient],
  controllers: [DbClientController],
})
export class DbClientModule {}
